/// <reference types="chrome"/>

import { ChainType } from '../../types/chains.js';
import type { BaseProvider, ProviderCapability } from '../../types/providers.js';
import { ProviderInterface } from '../../types/providers.js';
import { BaseWalletConnector } from '../base/index.js';
import type { ConnectOptions, ConnectionResult } from '../types.js';
import { MessageType } from './types.js';
import type {
  ChromeExtensionConfig,
  ConnectParams,
  ChromeExtensionTransport as ITransport,
  TransportMessage,
  TransportResponse,
} from './types.js';

/** Chrome port type with undefined support */
type ChromePort = chrome.runtime.Port | undefined;

/**
 * Implementation of Chrome extension transport
 * Handles communication between dApp and Chrome extension
 * @implements {ITransport}
 */
class ChromeTransport implements ITransport {
  private readonly extensionId: string;
  private readonly timeout: number;
  private port: ChromePort;

  /**
   * Create a new ChromeTransport instance
   * @param config - Configuration options
   */
  constructor(config: ChromeExtensionConfig) {
    this.extensionId = config.extensionId;
    this.timeout = config.timeout ?? 30000;
  }

  /**
   * Connect to extension port
   * @throws {Error} If Chrome runtime is not available or connection fails
   */
  private async connect(): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      throw new Error('Chrome runtime not available');
    }

    try {
      this.port = chrome.runtime.connect(this.extensionId);

      this.port.onMessage.addListener((message: TransportMessage) => {
        if (this.onMessage) {
          this.onMessage(message);
        }
      });

      this.port.onDisconnect.addListener(() => {
        this.port = undefined;
      });
    } catch (error) {
      throw new Error(`Failed to connect to extension: ${(error as Error).message}`);
    }
  }

  /**
   * Send message to extension
   * @template T - Type of message data
   * @template R - Type of response data
   * @param message - Message to send
   * @returns Promise that resolves with the response
   * @throws {Error} If connection fails or request times out
   */
  async sendMessage<T = unknown, R = unknown>(message: TransportMessage<T>): Promise<TransportResponse<R>> {
    if (!this.port) {
      await this.connect();
    }

    if (!this.port) {
      throw new Error('Failed to establish connection');
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timed out after ${this.timeout}ms`));
      }, this.timeout);

      this.port?.postMessage(message);

      const handler = (response: TransportMessage & { success?: boolean; data?: R; error?: string }) => {
        if (response.success && response.data !== undefined) {
          clearTimeout(timeoutId);
          resolve({
            success: true,
            data: response.data,
          });
        } else if (response.success) {
          clearTimeout(timeoutId);
          reject(new Error('Response data is undefined'));
        } else {
          clearTimeout(timeoutId);
          resolve({
            success: false,
            error: response.error || 'Unknown error',
          });
        }
      };

      this.port?.onMessage.addListener(handler);

      // Cleanup
      setTimeout(() => {
        this.port?.onMessage.removeListener(handler);
      }, this.timeout);
    });
  }

  /** Optional message handler */
  onMessage?: (message: TransportMessage) => void;
}

/**
 * FireWallet connector implementation
 * Provides integration with the FireWallet Chrome extension
 * @extends {BaseWalletConnector}
 */
export class FireWalletConnector extends BaseWalletConnector {
  readonly id = 'firewallet';
  readonly name = 'FireWallet';
  readonly icon = 'https://firewallet.example/icon.png';
  readonly description = 'A secure and user-friendly Ethereum wallet';
  readonly supportedChains = [ChainType.ETHEREUM];
  readonly supportedProviders = [
    ProviderInterface.EIP1193,
    ProviderInterface.EIP6963,
    ProviderInterface.ETHERS,
    ProviderInterface.NATIVE,
  ];

  private readonly transport: ITransport;
  private providerCache = new Map<string, BaseProvider>();

  /**
   * Create a new FireWalletConnector instance
   * @param config - Configuration options for the Chrome extension transport
   */
  constructor(config: ChromeExtensionConfig) {
    super();
    this.transport = new ChromeTransport(config);
    this.transport.onMessage = this.handleMessage.bind(this);
  }

  /**
   * Initialize connector and detect wallet
   * @throws {Error} If initialization fails
   */
  async initialize(): Promise<void> {
    try {
      const response = await this.transport.sendMessage({ type: MessageType.GET_PROVIDER });
      if (!response.success) {
        throw new Error(response.error || 'Failed to get provider');
      }
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize: ${(error as Error).message}`);
    }
  }

  /**
   * Detect if wallet is available
   * @returns Promise that resolves to true if wallet is available
   */
  async detect(): Promise<boolean> {
    try {
      const response = await this.transport.sendMessage({ type: MessageType.GET_PROVIDER });
      return response.success;
    } catch {
      return false;
    }
  }

  /**
   * Get provider instance
   * @template T - Type of provider
   * @param interfaceType - Provider interface type
   * @param chain - Chain type
   * @returns Provider instance
   */
  getProvider<T = unknown>(
    interfaceType: ProviderInterface = ProviderInterface.EIP1193,
    chain: ChainType = ChainType.ETHEREUM,
  ): T {
    this.validateProvider(interfaceType);
    this.validateChain(chain);

    const cacheKey = `${chain}:${interfaceType}`;
    const cached = this.providerCache.get(cacheKey);
    if (cached) {
      return cached as T;
    }

    const provider = this.createProvider(interfaceType, chain);
    this.providerCache.set(cacheKey, provider);
    return provider as T;
  }

  /**
   * Get provider capabilities
   * @param interfaceType - Provider interface type
   * @returns Provider capabilities
   */
  getProviderCapabilities(interfaceType: ProviderInterface): ProviderCapability | null {
    this.validateProvider(interfaceType);
    return {
      interface: interfaceType,
      version: '1.0.0',
      methods: ['eth_requestAccounts', 'eth_accounts', 'eth_chainId'],
      events: ['accountsChanged', 'chainChanged', 'disconnect'],
    };
  }

  /**
   * Handle transport messages
   * @private
   * @param message - Received message
   */
  private handleMessage(message: TransportMessage): void {
    switch (message.type) {
      case MessageType.DISCONNECT:
        this.handleDisconnect('Disconnected by wallet');
        break;
      // Handle other message types...
    }
  }

  /**
   * Create provider instance
   * @private
   * @param interfaceType - Provider interface type
   * @param chain - Chain type
   * @returns Provider instance
   */
  private createProvider(interfaceType: ProviderInterface, chain: ChainType): BaseProvider {
    return {
      type: interfaceType,
      request: async ({ method, params }) => {
        const response = await this.transport.sendMessage({
          type: MessageType.REQUEST,
          data: { method, params, chain },
        });
        return response.data;
      },
    };
  }

  /**
   * Perform connection
   * @protected
   * @param chain - Chain to connect to
   * @param options - Connection options
   * @returns Promise that resolves with connection result
   */
  protected async performConnect(chain: ChainType, options?: ConnectOptions): Promise<ConnectionResult> {
    const params: ConnectParams = {
      chain,
      ...(options?.timeout && { timeout: options.timeout }),
    };

    const response = await this.transport.sendMessage<ConnectParams, string[]>({
      type: MessageType.CONNECT,
      data: params,
    });

    if (!response.success) {
      throw new Error(response.error || 'Connection failed');
    }

    return {
      chain,
      provider: ProviderInterface.EIP1193,
      accounts: Array.isArray(response.data) ? response.data : [],
    };
  }

  /**
   * Perform disconnection
   * @protected
   */
  protected async performDisconnect(): Promise<void> {
    const response = await this.transport.sendMessage({
      type: MessageType.DISCONNECT,
    });
    if (!response.success) {
      throw new Error(response.error || 'Disconnect failed');
    }
    this.providerCache.clear();
  }
}
