import type { WalletInfo, ConnectedWallet, WalletState } from '../../types.js';
import type { Connector, AztecConnectorOptions } from './types.js';
import { WalletError } from '../client/types.js';

/**
 * Type definition for supported Aztec RPC methods.
 *
 * @remarks
 * Defines the type structure for JSON-RPC methods supported by the Obsidion wallet:
 * - aztec_requestAccounts: Get connected wallet accounts
 * - aztec_sendTransaction: Submit transaction to the network
 * - aztec_call: Make a read-only call to a contract
 */
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

type RpcRequest<M extends keyof RpcMethods = keyof RpcMethods> = {
  method: M;
  params: RpcMethods[M]['params'];
};

/**
 * Standard JSON-RPC 2.0 request structure.
 *
 * @property jsonrpc - Always "2.0" per JSON-RPC spec
 * @property id - Unique request identifier
 * @property method - Name of the method to invoke
 * @property params - Array of parameters for the method
 */
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params: unknown[];
}

/**
 * Standard JSON-RPC 2.0 response structure.
 *
 * @property jsonrpc - Always "2.0" per JSON-RPC spec
 * @property id - ID matching the original request
 * @property result - Method return value on success
 * @property error - Error object on failure
 */
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

/**
 * Internal message structure for communication.
 *
 * @property requestId - Unique identifier for the message
 * @property data - The JSON-RPC request or response payload
 */
interface Message {
  requestId: string;
  data: JsonRpcRequest | JsonRpcResponse;
}

/**
 * Configuration message for popup window management.
 *
 * @extends Message
 * @property event - Type of popup event:
 *   - PopupLoaded: Window is ready for communication
 *   - PopupUnload: Window is being closed
 */
interface ConfigMessage extends Message {
  event: 'PopupLoaded' | 'PopupUnload';
}

/**
 * Interface for interacting with the Obsidion wallet provider.
 *
 * Provides methods for:
 * - Making RPC requests to the wallet
 * - Managing wallet connections
 * - Retrieving account information
 *
 * @example
 * ```typescript
 * const provider: ObsidionProvider = {
 *   async request({ method: 'aztec_requestAccounts', params: [] }) {
 *     // Request accounts from wallet
 *     return ['0x...'];
 *   },
 *   // ... other methods
 * };
 * ```
 */
interface ObsidionProvider {
  request<M extends keyof RpcMethods>(request: RpcRequest<M>): Promise<RpcMethods[M]['result']>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getAccount(): Promise<string>;
}

/**
 * Handles popup window messaging for wallet communication.
 *
 * Manages:
 * - Popup window lifecycle
 * - Message routing
 * - Connection state
 * - Error handling
 *
 * @remarks
 * Uses window.postMessage for secure cross-origin communication
 * between the dApp and wallet popup window.
 */
class Communicator {
  private readonly url: URL;
  private popup: Window | null = null;
  private listeners = new Map<(_: MessageEvent) => void, { reject: (_: Error) => void }>();
  private popupCloseInterval: ReturnType<typeof setInterval> | undefined;

  constructor(params: { url: string | URL }) {
    this.url = new URL(params.url);
  }

  async postMessage(message: Message): Promise<void> {
    const popup = await this.waitForPopupLoaded();
    popup.postMessage(message, this.url.origin);
  }

  async postRequestAndWaitForResponse<M extends Message>(request: Message): Promise<M> {
    const responsePromise = this.onMessage<M>(({ requestId }) => requestId === request.requestId);
    await this.postMessage(request);
    return await responsePromise;
  }

  async onMessage<M extends Message>(predicate: (_: Partial<M>) => boolean): Promise<M> {
    return new Promise((resolve, reject) => {
      const listener = (event: MessageEvent<M>) => {
        if (event.origin !== this.url.origin) return;

        const message = event.data;
        if (predicate(message)) {
          resolve(message);
          window.removeEventListener('message', listener);
          this.listeners.delete(listener);
        }
      };

      window.addEventListener('message', listener);
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
      reject(new Error('Request rejected'));
      window.removeEventListener('message', listener);
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
      throw new Error('Failed to open popup: failed to load');
    }

    void this.onMessage<ConfigMessage>(({ event }) => event === 'PopupUnload')
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
      this.popup.postMessage({ event: 'PopupLoadedRequest' }, this.url.origin);
    }, 100);

    try {
      await this.onMessage<ConfigMessage>(({ event }) => event === 'PopupLoaded');
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
      'Obsidion Wallet',
      `width=${POPUP_WIDTH}, height=${POPUP_HEIGHT}, left=${left}, top=${top}`,
    );

    popup?.focus();
    return popup;
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

/**
 * Connector implementation for the Obsidion wallet with Aztec protocol support.
 *
 * Provides wallet connection and interaction capabilities through a popup
 * window interface. Implements the standard Connector interface while handling
 * Obsidion-specific communication patterns.
 *
 * @implements {Connector}
 *
 * @example
 * ```typescript
 * const connector = new ObsidionAztecConnector({
 *   chainId: 'aztec:testnet'
 * });
 *
 * const wallet = await connector.connect({
 *   id: 'obsidion',
 *   name: 'Obsidion Wallet',
 *   url: 'https://wallet.obsidion.xyz'
 * });
 * ```
 *
 * @remarks
 * - Uses popup windows for user interaction
 * - Implements JSON-RPC for wallet communication
 * - Handles connection state and session management
 * - Provides automatic reconnection capabilities
 */
export class ObsidionAztecConnector implements Connector {
  private provider: ObsidionProvider | null = null;
  private communicator: Communicator | null = null;
  private connected = false;
  private readonly options: AztecConnectorOptions;

  /**
   * Creates a new ObsidionAztecConnector instance.
   *
   * @param options - Configuration options for the connector
   *
   * @remarks
   * Default chainId is set to '1' if not specified in options.
   * Additional configuration can be provided through AztecConnectorOptions.
   */
  constructor(options: AztecConnectorOptions = {}) {
    this.options = {
      chainId: '1',
      ...options,
    };
  }

  /**
   * Establishes connection with the Obsidion wallet.
   *
   * @param walletInfo - Information about the wallet to connect
   * @returns Promise resolving to the connected wallet details
   * @throws {WalletError} If already connected or connection fails
   *
   * @remarks
   * Connection process:
   * 1. Opens wallet popup window
   * 2. Establishes messaging channel
   * 3. Requests wallet accounts
   * 4. Creates and stores session
   */
  async connect(walletInfo: WalletInfo): Promise<ConnectedWallet> {
    if (this.connected) {
      throw new WalletError('Already connected', 'connector');
    }

    try {
      // Initialize communicator with wallet URL
      this.communicator = new Communicator({
        url: walletInfo.url || 'https://wallet.aztec.network',
      });

      // Create provider that uses communicator
      this.provider = {
        request: async <M extends keyof RpcMethods>(request: RpcRequest<M>) => {
          if (!this.communicator) {
            throw new WalletError('Not connected', 'connector');
          }

          const response = await this.communicator.postRequestAndWaitForResponse<Message>({
            requestId: generateId(),
            data: {
              jsonrpc: '2.0',
              id: generateId(),
              method: request.method,
              params: request.params,
            },
          });

          const jsonRpcResponse = response.data as JsonRpcResponse;
          if (jsonRpcResponse.error) {
            throw new WalletError(jsonRpcResponse.error.message, 'connector');
          }
          return jsonRpcResponse.result as RpcMethods[M]['result'];
        },
        connect: async () => {
          if (!this.communicator) {
            throw new WalletError('Not connected', 'connector');
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
            throw new WalletError('Not connected', 'connector');
          }
          const accounts = await this.provider.request<'aztec_requestAccounts'>({
            method: 'aztec_requestAccounts',
            params: [],
          });
          const [firstAccount] = accounts;
          if (typeof firstAccount !== 'string') {
            throw new WalletError('No accounts found', 'connector');
          }
          return firstAccount;
        },
      };

      // Connect and get account
      await this.provider.connect();
      const address = await this.provider.getAccount();
      this.connected = true;

      const state: WalletState = {
        chain: this.options.chainId || '1',
        address,
        sessionId: Date.now().toString(),
      };

      return {
        info: walletInfo,
        state,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect');
      throw new WalletError(error.message, 'connector', error);
    }
  }

  /**
   * Attempts to resume a previous wallet connection.
   *
   * @param walletInfo - Information about the wallet to reconnect
   * @param _savedState - Previous session state (unused in Obsidion)
   * @returns Promise resolving to a fresh wallet connection
   *
   * @remarks
   * Obsidion doesn't support session restoration, so this method
   * creates a new connection instead.
   */
  async resume(walletInfo: WalletInfo, _savedState: WalletState): Promise<ConnectedWallet> {
    // Simply connect to get fresh state from the wallet
    return this.connect(walletInfo);
  }

  /**
   * Terminates the wallet connection.
   *
   * @returns Promise that resolves when disconnection is complete
   * @throws {WalletError} If disconnection fails
   *
   * @remarks
   * Cleanup process:
   * 1. Disconnects provider
   * 2. Closes popup window
   * 3. Cleans up message handlers
   * 4. Resets internal state
   */
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
      throw new WalletError(error.message, 'connector', error);
    }
  }

  /**
   * Retrieves the Obsidion wallet provider instance.
   *
   * @returns Promise resolving to the provider instance
   * @throws {WalletError} If not connected or provider unavailable
   *
   * @remarks
   * The provider gives access to wallet-specific RPC methods
   * and should only be used by trusted internal code.
   */
  async getProvider(): Promise<ObsidionProvider> {
    if (!this.connected || !this.provider) {
      throw new WalletError('Not connected', 'connector');
    }
    return this.provider;
  }

  /**
   * Processes incoming messages from the transport layer.
   *
   * @param data - Message payload from the transport
   *
   * @remarks
   * Message handling:
   * - Validates connection state
   * - Forwards messages to popup window
   * - Handles communication errors gracefully
   * - Logs warnings for disconnected state
   */
  handleMessage(data: unknown): void {
    const communicator = this.communicator;
    if (!this.connected || !communicator) {
      console.warn('Received message while not connected');
      return;
    }

    // Forward message to communicator
    void communicator
      .postMessage({
        requestId: generateId(),
        data: data as JsonRpcRequest | JsonRpcResponse,
      })
      .catch((error: Error) => {
        console.error('Failed to send message to provider:', error);
      });
  }
}
