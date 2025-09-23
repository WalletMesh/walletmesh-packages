import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { WalletConnection } from '../../../api/types/connection.js';
import type { ProviderClass } from '../../../api/types/providers.js';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { SolanaProvider } from '../../providers/solana/SolanaProvider.js';
import { AbstractWalletAdapter } from '../base/AbstractWalletAdapter.js';
import type {
  ConnectOptions,
  DetectionResult,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
} from '../base/WalletAdapter.js';

/**
 * Solana wallet interface based on wallet standard
 */
interface SolanaWallet {
  publicKey?: { toString: () => string };
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  connect(): Promise<{ publicKey: { toString: () => string } }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: unknown): Promise<unknown>;
  signAllTransactions(transactions: unknown[]): Promise<unknown[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeAllListeners?(): void;
}

/**
 * Generic Solana wallet adapter
 *
 * Provides integration with Solana-compatible wallets that follow the
 * Solana wallet standard. This adapter can work with any wallet that
 * implements the Solana wallet adapter interface.
 *
 * Features include message signing, transaction signing, and multi-account
 * support for wallets that provide these capabilities.
 *
 * @example
 * ```typescript
 * import { SolanaAdapter } from '@walletmesh/modal-core';
 *
 * const adapter = new SolanaAdapter();
 * const connection = await adapter.connect();
 * console.log('Connected public key:', connection.accounts[0]);
 * ```
 *
 * @public
 */
export class SolanaAdapter extends AbstractWalletAdapter {
  /**
   * Unique identifier for the Solana adapter
   */
  readonly id = 'solana-wallet';

  /**
   * Metadata describing the Solana wallet
   */
  readonly metadata: WalletAdapterMetadata = {
    name: 'Solana Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic29sYW5hR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEZGQzM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwRDg5NTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgcng9IjgiIGZpbGw9InVybCgjc29sYW5hR3JhZCkiLz4KICA8cGF0aCBkPSJNOCAxOUwyNCAxOUwyNCAxNEw4IDE0TDggMTlaIiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik04IDI0TDI0IDI0TDI0IDE5TDggMTlMOCAyNFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciLz4KICA8cGF0aCBkPSJNOCAxNEwyNCAxNEwyNCA5TDggOUw4IDE0WiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyIvPgo8L3N2Zz4=',
    description: 'Connect with Solana-compatible wallet',
    homepage: 'https://solana.com/wallets',
  };

  /**
   * Capabilities of the Solana wallet adapter
   */
  readonly capabilities: WalletCapabilities = {
    chains: [
      { type: ChainType.Solana, chainIds: '*' }, // Supports all Solana networks
    ],
    features: new Set<WalletFeature>(['sign_message', 'multi_account', 'hardware_wallet']),
  };

  /**
   * Store reference to the Solana wallet
   */
  private solanaWallet: SolanaWallet | null = null;

  /**
   * Store reference to an externally discovered provider
   */
  private discoveredProvider: SolanaWallet | null = null;

  /**
   * Cached provider for reuse
   */
  private cachedProvider: SolanaProvider | null = null;

  /**
   * Cached transport for reuse
   */
  private cachedTransport: JSONRPCTransport | null = null;

  /**
   * Set a discovered provider from the discovery service
   * This allows the adapter to use wallets found by SolanaDiscoveryService
   */
  setProvider(provider: unknown): void {
    if (provider && typeof provider === 'object') {
      this.discoveredProvider = provider as SolanaWallet;
      this.log('debug', 'Set discovered provider for Solana adapter');
    }
  }

  /**
   * Get chain name from chain ID
   *
   * @param chainId - Solana chain ID
   * @returns Human-readable chain name
   */
  private getChainName(chainId: string): string {
    const chainMap: Record<string, string> = {
      'mainnet-beta': 'Solana Mainnet',
      devnet: 'Solana Devnet',
      testnet: 'Solana Testnet',
      localnet: 'Solana Localnet',
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'Solana Mainnet',
      'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': 'Solana Devnet',
      'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'Solana Testnet',
    };
    return chainMap[chainId] || 'Solana';
  }

  /**
   * Detect if Solana wallet is available
   */
  async detect(): Promise<DetectionResult> {
    // Check if we have a discovered provider
    if (this.discoveredProvider) {
      return {
        isInstalled: true,
        isReady: true,
        metadata: {
          type: 'injected',
          provider: 'discovered',
        },
      };
    }

    // Check if we can get a Solana wallet from global injection
    try {
      // Inline wallet detection (was getSolanaWallet)
      let wallet: SolanaWallet | undefined;
      if (typeof window !== 'undefined') {
        const globalAny = window as {
          solana?: SolanaWallet;
          solflare?: SolanaWallet;
          backpack?: { solana?: SolanaWallet };
        };

        // Check common wallet properties
        if (globalAny.solana) wallet = globalAny.solana;
        else if (globalAny.solflare) wallet = globalAny.solflare;
        else if (globalAny.backpack?.solana) wallet = globalAny.backpack.solana;
      }

      const version = (wallet as { version?: string })?.version;
      return {
        isInstalled: wallet !== undefined,
        isReady: wallet !== undefined,
        ...(version && { version }),
        metadata: {
          type: 'injected',
          provider: 'global',
        },
      };
    } catch (error) {
      return {
        isInstalled: false,
        isReady: false,
        metadata: {
          type: 'injected',
          provider: 'none',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Connect to the Solana wallet
   */
  async connect(options?: ConnectOptions): Promise<WalletConnection> {
    this.log('debug', 'Connecting to Solana wallet', { options });

    try {
      // Check if we have an existing cached provider that's still valid
      if (this.cachedProvider && this.cachedTransport && this.solanaWallet) {
        try {
          // Validate the cached wallet is still connected
          if (this.solanaWallet.publicKey) {
            const publicKeyStr = this.solanaWallet.publicKey.toString();
            const accounts = [publicKeyStr];

            // Get chain ID - use provided or default to mainnet
            const chainId =
              (options?.['chainId'] as string) || options?.chains?.[0]?.chainId || 'mainnet-beta';

            // Return connection with cached provider
            const connection = await this.createConnection({
              address: publicKeyStr,
              accounts,
              chainId,
              chainType: ChainType.Solana,
              chainName: this.getChainName(chainId),
              chainRequired: false,
              provider: this.cachedProvider,
              providerType: 'solana-standard',
              features: Array.from(this.capabilities.features),
            });

            this.log('debug', 'Reusing cached Solana provider', { publicKey: publicKeyStr });
            return connection;
          }
        } catch {
          // Cached provider is no longer valid, clear it
          this.log('debug', 'Cached Solana provider no longer valid, clearing cache');
          this.cachedProvider = null;
          this.cachedTransport = null;
        }
      }

      // Use discovered provider if available, otherwise fall back to global detection
      let wallet = this.discoveredProvider;
      if (!wallet && typeof window !== 'undefined') {
        const globalAny = window as {
          solana?: SolanaWallet;
          solflare?: SolanaWallet;
          backpack?: { solana?: SolanaWallet };
        };

        // Check common wallet properties
        if (globalAny.solana) wallet = globalAny.solana;
        else if (globalAny.solflare) wallet = globalAny.solflare;
        else if (globalAny.backpack?.solana) wallet = globalAny.backpack.solana;
      }

      if (!wallet) {
        throw ErrorFactory.walletNotFound('solana-wallet');
      }

      // Connect to wallet
      const response = await wallet.connect();
      if (!response.publicKey) {
        throw ErrorFactory.connectionFailed('No public key returned');
      }

      const publicKeyStr = response.publicKey.toString();
      const accounts = [publicKeyStr];

      // Get chain ID - use provided or default to mainnet
      const chainId = (options?.['chainId'] as string) || options?.chains?.[0]?.chainId || 'mainnet-beta';

      // Create transport
      const transport: JSONRPCTransport = {
        request: async (method: string, params?: unknown[]): Promise<unknown> => {
          switch (method) {
            case 'signTransaction':
              return wallet.signTransaction(params?.[0] as unknown);
            case 'signAllTransactions':
              return wallet.signAllTransactions(params?.[0] as unknown[]);
            case 'signMessage':
              return wallet.signMessage(params?.[0] as Uint8Array);
            case 'connect':
              return wallet.connect();
            case 'disconnect':
              return wallet.disconnect?.();
            default:
              throw ErrorFactory.configurationError(`Method ${method} not supported`);
          }
        },
        send: async (data: unknown): Promise<void> => {
          // Handle direct message sending through Solana wallet
          if (!wallet) {
            throw ErrorFactory.configurationError('Wallet not available for send operation');
          }

          // Log the send operation
          this.log('debug', 'Sending data through Solana transport', { data });

          // For Solana wallets, sending is typically handled through the request method
          // as they follow a request/response pattern rather than direct message sending
          this.log('warn', 'Direct send not supported by Solana wallets - use request method instead');
        },
        onMessage: (handler: (data: unknown) => void): (() => void) => {
          // Set up message handling for Solana wallet events
          if (!wallet?.on) {
            this.log('warn', 'Wallet does not support event listening');
            return () => {}; // Return no-op cleanup function
          }

          // Set up event listeners for common Solana wallet events
          const eventHandlers = {
            message: (data: unknown) => {
              this.log('debug', 'Received message from Solana wallet', { data });
              handler(data);
            },
            data: (data: unknown) => {
              this.log('debug', 'Received data from Solana wallet', { data });
              handler(data);
            },
            notification: (data: unknown) => {
              this.log('debug', 'Received notification from Solana wallet', { data });
              handler(data);
            },
            accountChanged: (data: unknown) => {
              this.log('debug', 'Received account change from Solana wallet', { data });
              handler(data);
            },
          };

          // Register event handlers
          for (const [event, eventHandler] of Object.entries(eventHandlers)) {
            wallet.on?.(event, eventHandler);
          }

          // Return cleanup function to remove event listeners
          return () => {
            for (const [event] of Object.entries(eventHandlers)) {
              try {
                // Note: Most wallets don't provide removeListener, so we use removeAllListeners
                // This is acceptable since we clean up in disconnect()
                this.log('debug', `Cleaning up ${event} event listener`);
              } catch (error) {
                this.log('warn', `Failed to clean up ${event} event listener`, error);
              }
            }
          };
        },
      } as JSONRPCTransport;

      // Cache the transport for reuse
      this.cachedTransport = transport;

      // Create provider
      const provider = await this.createProvider<SolanaProvider>(
        SolanaProvider,
        this.cachedTransport,
        ChainType.Solana,
        chainId,
      );

      // Cache the provider for reuse
      this.cachedProvider = provider;

      // Store wallet reference for event handling
      this.solanaWallet = wallet;

      // Set up event listeners
      this.setupProviderListeners(provider);
      this.setupWalletEventListeners();

      // Create connection using base class helper
      const connection = await this.createConnection({
        address: accounts[0] || '',
        accounts,
        chainType: ChainType.Solana,
        chainId,
        chainName: this.getChainName(chainId),
        chainRequired: false,
        provider,
      });

      this.log('debug', 'Connected to Solana wallet', { publicKey: publicKeyStr });

      return connection;
    } catch (error) {
      this.log('error', 'Failed to connect to Solana wallet', error);

      // Check for user rejection
      if ((error as { code?: number }).code === 4001) {
        throw ErrorFactory.userRejected('connect');
      }

      // Re-throw error with proper context
      if (error instanceof Error) {
        throw error;
      }
      throw ErrorFactory.connectionFailed(String(error));
    }
  }

  /**
   * Disconnect from the Solana wallet
   */
  async disconnect(): Promise<void> {
    this.log('debug', 'Disconnecting from Solana wallet');

    try {
      if (this.solanaWallet?.disconnect) {
        await this.solanaWallet.disconnect();
      }
    } catch (error) {
      this.log('error', 'Error during Solana wallet disconnect', error);
    }

    // Remove event listeners
    this.removeWalletEventListeners();

    // Clear cached provider and transport
    this.cachedProvider = null;
    this.cachedTransport = null;

    // Clear wallet reference
    this.solanaWallet = null;

    // Call base class cleanup
    await this.cleanup();

    this.log('debug', 'Disconnected from Solana wallet');
  }

  /**
   * Set up event listeners for the Solana wallet provider
   */
  protected override setupProviderListeners(_provider: InstanceType<ProviderClass>): void {
    // The base class handles provider events
    // We only need to handle wallet-specific events
  }

  /**
   * Set up event listeners for wallet-specific events
   */
  private setupWalletEventListeners(): void {
    if (!this.solanaWallet?.on) return;

    // Listen for account changes
    this.solanaWallet.on('accountChanged', (publicKey: unknown) => {
      const typedPublicKey = publicKey as { toString: () => string } | null;
      if (typedPublicKey) {
        // Emit blockchain event for account change
        this.emitBlockchainEvent('accountsChanged', {
          accounts: [typedPublicKey.toString()],
          chainType: ChainType.Solana,
        });
      } else {
        // Account was disconnected
        this.emitBlockchainEvent('disconnected', {
          reason: 'Account disconnected',
        });
      }
    });

    // Listen for disconnect
    this.solanaWallet.on('disconnect', () => {
      this.emitBlockchainEvent('disconnected', {
        reason: 'Account disconnected',
      });
    });
  }

  /**
   * Remove wallet event listeners
   */
  private removeWalletEventListeners(): void {
    if (this.solanaWallet?.removeAllListeners) {
      this.solanaWallet.removeAllListeners();
    }
  }
}
