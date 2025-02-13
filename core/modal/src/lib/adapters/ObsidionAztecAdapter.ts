import type { WalletInfo, ConnectedWallet, WalletState } from '../../types.js';
import type { Adapter, AztecAdapterOptions } from './types.js';
import { WalletError } from '../client/types.js';

// Define RPC methods as function types
type RpcMethods = {
  aztec_requestAccounts: {
    params: [];
    result: string[];
  };
  aztec_sendTransaction: {
    params: [{ from: string; calls: unknown[] }];
    result: string;
  };
  aztec_call: {
    params: [{ from: string; calls: unknown[] }];
    result: string[];
  };
};

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params: unknown[];
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

// Copied and adapted from aztec-wallet-sdk
class Communicator {
  private readonly url: URL;
  private popup: Window | null = null;
  private listeners = new Map<
    (_: MessageEvent) => void,
    { reject: (_: Error) => void }
  >();
  private popupCloseInterval: ReturnType<typeof setInterval> | undefined;

  constructor(params: { url: string | URL }) {
    this.url = new URL(params.url);
  }

  async postMessage(message: Message): Promise<void> {
    const popup = await this.waitForPopupLoaded();
    popup.postMessage(message, this.url.origin);
  }

  async postRequestAndWaitForResponse<M extends Message>(request: Message): Promise<M> {
    const responsePromise = this.onMessage<M>(
      ({ requestId }) => requestId === request.requestId,
    );
    await this.postMessage(request);
    return await responsePromise;
  }

  async onMessage<M extends Message>(
    predicate: (_: Partial<M>) => boolean,
  ): Promise<M> {
    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent<M>) => {
        if (event.origin !== this.url.origin) return;

        const message = event.data;
        if (predicate(message)) {
          resolve(message);
          window.removeEventListener("message", listener);
          this.listeners.delete(listener);
        }
      };

      window.addEventListener("message", listener);
      this.listeners.set(listener, { reject });
    });
  }

  disconnect(): void {
    this.closePopup(this.popup);
    this.popup = null;

    if (this.popupCloseInterval != null) {
      clearInterval(this.popupCloseInterval);
      this.popupCloseInterval = undefined;
    }

    this.listeners.forEach(({ reject }, listener) => {
      reject(new Error("Request rejected"));
      window.removeEventListener("message", listener);
    });
    this.listeners.clear();
  }

  private closePopup(popup: Window | null): void {
    if (popup && !popup.closed) {
      popup.close();
    }
  }

  public async waitForPopupLoaded(): Promise<Window> {
    if (this.popup && !this.popup.closed) {
      this.popup.focus();
      return this.popup;
    }

    this.popup = this.openPopup(this.url);
    if (!this.popup) {
      throw new Error("Failed to open popup: failed to load");
    }

    void this.onMessage<ConfigMessage>(({ event }) => event === "PopupUnload")
      .then(() => this.disconnect())
      .catch(() => {});

    if (this.popupCloseInterval == null) {
      this.popupCloseInterval = setInterval(() => {
        if (!this.popup || this.popup.closed) {
          this.disconnect();
        }
      }, 100);
    }

    const pingInterval = setInterval(() => {
      if (!this.popup || this.popup.closed) {
        clearInterval(pingInterval);
        return;
      }
      this.popup.postMessage({ event: "PopupLoadedRequest" }, this.url.origin);
    }, 100);

    try {
      await this.onMessage<ConfigMessage>(({ event }) => event === "PopupLoaded");
    } finally {
      clearInterval(pingInterval);
    }

    return this.popup;
  }

  private openPopup(url: URL): Window | null {
    const POPUP_WIDTH = 420;
    const POPUP_HEIGHT = 540;
    const left = (window.innerWidth - POPUP_WIDTH) / 2 + window.screenX;
    const top = (window.innerHeight - POPUP_HEIGHT) / 2 + window.screenY;

    const popup = window.open(
      url,
      "Obsidion Wallet",
      `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, left=${left}, top=${top}`,
    );

    popup?.focus();
    return popup;
  }
}

interface Message {
  requestId: string;
  data: JsonRpcRequest | JsonRpcResponse;
}

interface ConfigMessage extends Message {
  event: "PopupLoaded" | "PopupUnload";
}

interface ObsidionProvider {
  request<M extends keyof RpcMethods>(request: RpcRequest<M>): Promise<RpcMethods[M]["result"]>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getAccount(): Promise<string>;
}

interface RpcRequest<M extends keyof RpcMethods> {
  method: M;
  params: RpcMethods[M]["params"];
}

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

export class ObsidionAztecAdapter implements Adapter {
  private provider: ObsidionProvider | null = null;
  private communicator: Communicator | null = null;
  private connected = false;
  private readonly options: AztecAdapterOptions;

  constructor(options: AztecAdapterOptions = {}) {
    this.options = {
      chainId: '1',
      ...options,
    };
  }

  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new WalletError('Already connected', 'adapter');
    }

    try {
      // Initialize communicator with wallet URL
      this.communicator = new Communicator({
        url: walletInfo.url || 'https://wallet.aztec.network'
      });

      // Create provider that uses communicator
      this.provider = {
        request: async <M extends keyof RpcMethods>(request: RpcRequest<M>) => {
          if (!this.communicator) {
            throw new WalletError('Not connected', 'adapter');
          }

          const response = await this.communicator.postRequestAndWaitForResponse<Message>({
            requestId: generateId(),
            data: {
              jsonrpc: '2.0',
              id: generateId(),
              method: request.method,
              params: request.params
            }
          });

          const jsonRpcResponse = response.data as JsonRpcResponse;
          if (jsonRpcResponse.error) {
            throw new WalletError(jsonRpcResponse.error.message, 'adapter');
          }
          return jsonRpcResponse.result as RpcMethods[M]["result"];
        },
        connect: async () => {
          if (!this.communicator) {
            throw new WalletError('Not connected', 'adapter');
          }
          await this.communicator.waitForPopupLoaded();
        },
        disconnect: async () => {
          if (this.communicator) {
            this.communicator.disconnect();
          }
        },
        getAccount: async () => {
          if (!this.provider) {
            throw new WalletError('Not connected', 'adapter');
          }
          const accounts = await this.provider.request<'aztec_requestAccounts'>({
            method: 'aztec_requestAccounts',
            params: []
          });
          const [firstAccount] = accounts;
          if (typeof firstAccount !== 'string') {
            throw new WalletError('No accounts found', 'adapter');
          }
          return firstAccount;
        }
      };

      // Connect and get account
      await this.provider.connect();
      const address = await this.provider.getAccount();
      this.connected = true;

      const state: WalletState = {
        chain: this.options.chainId || '1',
        address,
        sessionId: Date.now().toString()
      };

      return {
        info: walletInfo,
        state
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      throw new WalletError(error.message, 'adapter', error);
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      if (this.provider) {
        await this.provider.disconnect();
      }
      this.provider = null;
      this.communicator = null;
      this.connected = false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disconnect');
      throw new WalletError(error.message, 'adapter', error);
    }
  }

  async getProvider(): Promise<ObsidionProvider> {
    if (!this.connected || !this.provider) {
      throw new WalletError('Not connected', 'adapter');
    }
    return this.provider;
  }

  handleMessage(data: unknown): void {
    const communicator = this.communicator;
    if (!this.connected || !communicator) {
      console.warn('Received message while not connected');
      return;
    }

    // Forward message to communicator
    void communicator.postMessage({
      requestId: generateId(),
      data: data as JsonRpcRequest | JsonRpcResponse
    }).catch((err) => {
      console.error('Failed to send message to provider:', err);
    });
  }
}
