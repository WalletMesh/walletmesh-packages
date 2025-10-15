import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { WalletConnection } from '../../../api/types/connection.js';
import type { ProviderClass } from '../../../api/types/providers.js';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { EvmProvider } from '../../providers/evm/EvmProvider.js';
import { AbstractWalletAdapter } from '../base/AbstractWalletAdapter.js';
import type {
  ConnectOptions,
  DetectionResult,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
} from '../base/WalletAdapter.js';

/**
 * Configuration for EVM wallet adapter
 */
export interface EvmAdapterConfig {
  /** Custom adapter ID */
  id?: string;
  /** Wallet display name */
  name?: string;
  /** Wallet icon (data URI or URL) */
  icon?: string;
  /** Wallet description */
  description?: string;
  /** Pre-discovered EIP-1193 provider reference */
  provider?: unknown;
}

/**
 * Generic EVM Wallet Adapter - Connection layer for EVM-compatible wallets
 *
 * PURPOSE: This adapter handles HOW to connect to EVM wallets (MetaMask, Coinbase, etc.).
 * It manages the connection protocol, typically through window.ethereum or similar injection.
 *
 * ARCHITECTURAL ROLE:
 * - CONNECTION: Detects and connects to EVM wallet implementations
 * - TRANSPORT: Establishes communication channel (usually injected provider)
 * - PROVIDER CREATION: Creates EvmProvider with the established transport
 * - The created EvmProvider handles the actual blockchain operations
 *
 * This adapter can be used for:
 * 1. Known wallets (configured with specific metadata)
 * 2. Discovered wallets (configured with discovered provider references)
 * 3. Generic EVM wallets (uses window.ethereum)
 *
 * @example
 * ```typescript
 * // Basic usage with window.ethereum
 * const adapter = new EvmAdapter();
 * const connection = await adapter.connect();
 * // connection.provider is an EvmProvider for blockchain operations
 *
 * // With discovered wallet configuration
 * const adapter = new EvmAdapter({
 *   id: 'io.metamask',
 *   name: 'MetaMask',
 *   icon: 'data:image/svg+xml,...',
 *   provider: discoveredProvider  // Pre-discovered provider reference
 * });
 * ```
 *
 * @remarks
 * - Adapter handles: wallet detection, connection request, event setup
 * - Provider handles: sendTransaction, signMessage, getBalance, etc.
 *
 * @see EvmProvider for the blockchain API implementation
 * @see ADAPTER_PROVIDER_ARCHITECTURE.md for architecture details
 * @public
 */
export class EvmAdapter extends AbstractWalletAdapter {
  /**
   * Unique identifier for the EVM adapter
   */
  readonly id: string;

  /**
   * Metadata describing the EVM wallet
   */
  readonly metadata: WalletAdapterMetadata;

  /**
   * Capabilities of the EVM wallet adapter
   */
  readonly capabilities: WalletCapabilities = {
    chains: [
      { type: ChainType.Evm, chainIds: '*' }, // Supports all EVM chains
    ],
    features: new Set<WalletFeature>([
      'sign_message',
      'sign_typed_data',
      'encrypt',
      'decrypt',
      'multi_account',
    ]),
  };

  /**
   * Supported provider classes for EVM wallets
   */
  override readonly supportedProviders: Partial<Record<ChainType, ProviderClass>> = {
    [ChainType.Evm]: EvmProvider,
  };

  protected ethereum?: Record<string, unknown>;
  private cachedProvider: EvmProvider | null = null;
  private cachedTransport: JSONRPCTransport | null = null;

  constructor(config?: EvmAdapterConfig) {
    super();

    // Set ID from config or use default
    this.id = config?.id || 'evm-wallet';

    // Set metadata from config or use defaults
    this.metadata = {
      name: config?.name || 'EVM Wallet',
      icon:
        config?.icon ||
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234A5568"%3E%3Cpath d="M12 2l5.5 9.5L12 22l-5.5-10.5L12 2zm0 3.84L8.91 11.5 12 18.16l3.09-6.66L12 5.84z"/%3E%3C/svg%3E',
      description: config?.description || 'Connect with EVM-compatible wallet',
      homepage: 'https://ethereum.org/wallets',
    };

    // Store provider if provided (from discovery)
    if (config?.provider) {
      this.ethereum = config.provider as Record<string, unknown>;
    }
  }

  /**
   * Detect if EVM wallet is available
   */
  async detect(): Promise<DetectionResult> {
    try {
      // Check if we have an ethereum provider
      if (this.ethereum) {
        return {
          isInstalled: true,
          isReady: true,
          ...((this.ethereum['version'] as string) ? { version: this.ethereum['version'] as string } : {}),
          metadata: {
            type: 'injected',
            provider: 'configured',
          },
        };
      }

      // Check if window.ethereum is available
      if (typeof window !== 'undefined') {
        const ethereum = (window as { ethereum?: Record<string, unknown> }).ethereum;
        if (ethereum) {
          return {
            isInstalled: true,
            isReady: true,
            ...((ethereum['version'] as string) ? { version: ethereum['version'] as string } : {}),
            metadata: {
              type: 'injected',
              provider: 'window.ethereum',
            },
          };
        }
      }

      return {
        isInstalled: false,
        isReady: false,
        metadata: {
          type: 'injected',
          provider: 'none',
        },
      };
    } catch (error) {
      this.log('error', 'Unexpected error during EVM wallet detection', error);
      return {
        isInstalled: false,
        isReady: false,
        metadata: {
          type: 'injected',
          provider: 'none',
          error: error instanceof Error ? error.message : 'Unexpected detection error',
        },
      };
    }
  }

  /**
   * Get chain name from chain ID
   *
   * @param chainId - Chain ID in CAIP-2 format
   * @returns Human-readable chain name
   */
  private getChainName(chainId: string): string {
    const chainMap: Record<string, string> = {
      'eip155:1': 'Ethereum Mainnet',
      'eip155:11155111': 'Ethereum Sepolia',
      'eip155:137': 'Polygon',
      'eip155:10': 'Optimism',
      'eip155:42161': 'Arbitrum',
      'eip155:56': 'BNB Smart Chain',
      'eip155:43114': 'Avalanche',
      'eip155:100': 'Gnosis',
      'eip155:8453': 'Base',
    };
    return chainMap[chainId] || 'EVM Chain';
  }

  /**
   * Connect to EVM wallet
   */
  async connect(_options?: ConnectOptions): Promise<WalletConnection> {
    try {
      // Check if we have an existing cached provider that's still valid
      if (this.cachedProvider && this.cachedTransport) {
        try {
          // Validate the cached provider is still connected
          const testAccounts = await (
            this.ethereum as { request: (req: { method: string }) => Promise<string[]> }
          ).request({ method: 'eth_accounts' });

          if (testAccounts && testAccounts.length > 0) {
            // Get current chain ID to ensure we're on the right chain
            const chainIdHex = await (
              this.ethereum as { request: (req: { method: string }) => Promise<string> }
            ).request({ method: 'eth_chainId' });

            const chainIdNum = Number.parseInt(chainIdHex, 16);
            const chainIdCAIP2 = `eip155:${chainIdNum}`;

            // Return connection with cached provider
            const connection = await this.createConnection({
              address: testAccounts[0] || '0x0',
              accounts: testAccounts,
              chainId: chainIdCAIP2,
              chainType: ChainType.Evm,
              chainName: this.getChainName(chainIdCAIP2),
              chainRequired: false,
              provider: this.cachedProvider,
              providerType: 'eip1193',
              features: Array.from(this.capabilities.features),
            });

            return connection;
          }
        } catch {
          // Cached provider is no longer valid, clear it
          this.cachedProvider = null;
          this.cachedTransport = null;
        }
      }

      // Check if we have a provider (configured or from window)
      if (!this.ethereum) {
        // Try to get from window if not configured
        if (typeof window !== 'undefined') {
          const ethereum = (window as { ethereum?: Record<string, unknown> }).ethereum;
          if (ethereum) {
            this.ethereum = ethereum;
          }
        }

        if (!this.ethereum) {
          throw ErrorFactory.connectionFailed('No Ethereum provider available');
        }
      }

      // Request accounts
      const accounts = await (
        this.ethereum as { request: (req: { method: string }) => Promise<string[]> }
      ).request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw ErrorFactory.connectionFailed('No accounts returned from wallet');
      }

      // Get chain ID
      const chainIdHex =
        (await (this.ethereum as { request: (req: { method: string }) => Promise<string> }).request({
          method: 'eth_chainId',
        })) || '0x1';

      // Convert hex chain ID to CAIP-2 format
      const chainIdNum = Number.parseInt(chainIdHex, 16);
      const chainIdCAIP2 = `eip155:${chainIdNum}`;

      // Capture this context for use in transport object
      const self = this;

      // Create an EVM-specific transport that wraps window.ethereum
      const transport: unknown = {
        async send(message: unknown): Promise<void> {
          // EVM providers use JSON-RPC request/response pattern
          // The send method forwards messages to window.ethereum.request()
          const ethereum = (window as { ethereum?: Record<string, unknown> }).ethereum;
          if (!ethereum) {
            throw ErrorFactory.connectionFailed('EVM provider not available');
          }

          if (typeof message === 'object' && message !== null && 'method' in message) {
            const request = message as { method: string; params?: unknown[] };
            try {
              await (
                ethereum as { request: (req: { method: string; params?: unknown[] }) => Promise<unknown> }
              ).request({
                method: request.method,
                ...(request.params && { params: request.params }),
              });
            } catch (error) {
              throw ErrorFactory.transportError(
                `Failed to send EVM request: ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          } else {
            throw ErrorFactory.transportError('Invalid message format for EVM transport');
          }
        },
        onMessage(callback: (message: unknown) => void): (() => void) {
          // EVM wallets use EIP-1193 provider events for notifications
          // Set up event listeners that forward events to the callback
          const ethereum = (window as { ethereum?: Record<string, unknown> }).ethereum;
          if (!ethereum) {
            self.log('warn', 'EVM provider not available for event listening');
            return () => {}; // Return no-op cleanup
          }

          const provider = ethereum as {
            on?: (event: string, handler: (...args: unknown[]) => void) => void;
            removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
            off?: (event: string, handler: (...args: unknown[]) => void) => void;
          };

          if (!provider.on) {
            self.log('warn', 'EVM provider does not support event listening');
            return () => {}; // Return no-op cleanup
          }

          // Define event handlers
          const accountsChangedHandler = (accounts: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'accountsChanged',
              params: accounts,
            });
          };

          const chainChangedHandler = (chainId: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'chainChanged',
              params: { chainId },
            });
          };

          const connectHandler = (connectInfo: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'connect',
              params: connectInfo,
            });
          };

          const disconnectHandler = (error: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'disconnect',
              params: { error },
            });
          };

          const messageHandler = (message: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'message',
              params: message,
            });
          };

          // Register event handlers
          provider.on('accountsChanged', accountsChangedHandler);
          provider.on('chainChanged', chainChangedHandler);
          provider.on('connect', connectHandler);
          provider.on('disconnect', disconnectHandler);
          provider.on('message', messageHandler);

          // Return cleanup function
          return () => {
            try {
              if (provider.removeListener) {
                provider.removeListener('accountsChanged', accountsChangedHandler);
                provider.removeListener('chainChanged', chainChangedHandler);
                provider.removeListener('connect', connectHandler);
                provider.removeListener('disconnect', disconnectHandler);
                provider.removeListener('message', messageHandler);
              } else if (provider.off) {
                provider.off('accountsChanged', accountsChangedHandler);
                provider.off('chainChanged', chainChangedHandler);
                provider.off('connect', connectHandler);
                provider.off('disconnect', disconnectHandler);
                provider.off('message', messageHandler);
              }
            } catch (error) {
              self.log('warn', 'Failed to remove EVM event listeners', error);
            }
          };
        },
        // Add custom request method for EVM compatibility
        async request(method: string, params?: unknown[]): Promise<unknown> {
          const ethereum = (window as { ethereum?: Record<string, unknown> }).ethereum;
          if (!ethereum) throw ErrorFactory.connectionFailed('EVM provider not available');

          return (
            ethereum as { request: (req: { method: string; params?: unknown[] }) => Promise<unknown> }
          ).request({ method, ...(params && { params }) });
        },
      };

      // Cache the transport for reuse
      this.cachedTransport = transport as JSONRPCTransport;

      // ARCHITECTURAL INTEGRATION POINT:
      // Adapter (connection layer) creates Provider (API layer) with transport
      // - Adapter established the transport to the wallet
      // - Provider will use this transport for blockchain operations
      const provider = await this.createProvider<EvmProvider>(
        EvmProvider, // API layer implementation for EVM
        this.cachedTransport, // Connection established by adapter
        ChainType.Evm,
        chainIdCAIP2,
      );

      // Cache the provider for reuse
      this.cachedProvider = provider;

      // Return connection with provider for dApp use
      const connection = await this.createConnection({
        address: accounts[0] || '0x0',
        accounts,
        chainId: chainIdCAIP2,
        chainType: ChainType.Evm,
        chainName: this.getChainName(chainIdCAIP2),
        chainRequired: false,
        provider,
        providerType: 'eip1193',
        features: Array.from(this.capabilities.features),
      });

      return connection;
    } catch (error) {
      throw ErrorFactory.fromConnectorError('evm-wallet', error, 'connect');
    }
  }

  /**
   * Disconnect from EVM wallet
   */
  async disconnect(): Promise<void> {
    // Clear cached provider and transport
    this.cachedProvider = null;
    this.cachedTransport = null;

    await this.cleanup();
  }

  /**
   * Set up event listeners for provider changes
   */
  protected override setupProviderListeners(_provider: EvmProvider): void {
    if (!this.ethereum) return;

    const eth = this.ethereum as {
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
    };

    if (eth.on) {
      eth.on('accountsChanged', (accounts: unknown) => {
        if (Array.isArray(accounts)) {
          if (accounts.length === 0) {
            // User disconnected all accounts
            this.disconnect();
          } else {
            // Emit blockchain event - state updates handled by WalletMeshClient
            this.emitBlockchainEvent('accountsChanged', {
              accounts,
              chainType: ChainType.Evm,
            });
          }
        }
      });

      eth.on('chainChanged', (chainId: unknown) => {
        if (typeof chainId === 'string') {
          // Emit blockchain event - state updates handled by WalletMeshClient
          this.emitBlockchainEvent('chainChanged', {
            chainId,
            chainType: ChainType.Evm,
          });
        }
      });

      eth.on('disconnect', () => {
        this.emitBlockchainEvent('disconnected', {
          reason: 'Provider disconnected',
        });
      });
    }
  }

  /**
   * Get JSON-RPC transport for provider communication
   *
   * @param chainType - The chain type to get transport for
   * @returns JSON-RPC transport instance or undefined if not supported
   */
  override getJSONRPCTransport(
    chainType: ChainType,
  ): import('@walletmesh/jsonrpc').JSONRPCTransport | undefined {
    if (chainType !== ChainType.Evm) {
      return undefined;
    }

    // Check if running in browser and EVM provider is available
    if (typeof window === 'undefined') {
      return undefined;
    }

    const ethereum = (window as { ethereum?: Record<string, unknown> }).ethereum;

    if (!ethereum) {
      return undefined;
    }

    // Create EVM JSON-RPC transport that wraps window.ethereum
    const logger = this.logger;
    return {
      async send(message: unknown): Promise<void> {
        logger?.debug('[EvmAdapter] Sending message:', message);
        // EVM wallets expect requests to be sent via window.ethereum.request()
        // The message should be a JSON-RPC request object
        if (typeof message === 'object' && message !== null && 'method' in message) {
          const request = message as { method: string; params?: unknown[] };
          const ethereumRequest: { method: string; params?: unknown[] } = {
            method: request.method,
            ...(request.params && { params: request.params }),
          };
          logger?.debug('[EvmAdapter] Making ethereum.request:', ethereumRequest);
          const result = await (
            ethereum as { request: (req: { method: string; params?: unknown[] }) => Promise<unknown> }
          ).request(ethereumRequest);
          logger?.debug('[EvmAdapter] Ethereum request result:', result);
        }
      },

      onMessage(callback: (message: unknown) => void): void {
        // EVM wallets don't use traditional message-based communication for requests
        // Instead, they use a request-response pattern via window.ethereum.request()
        // For events and notifications, EVM wallets use the EIP-1193 provider events

        // Set up event listeners for EVM provider events
        const provider = ethereum as {
          on?: (event: string, handler: (...args: unknown[]) => void) => void;
        };

        if (provider.on) {
          // Listen for account changes
          provider.on('accountsChanged', (accounts: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'accountsChanged',
              params: accounts,
            });
          });

          // Listen for chain changes
          provider.on('chainChanged', (chainId: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'chainChanged',
              params: { chainId },
            });
          });

          // Listen for connection events
          provider.on('connect', (connectInfo: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'connect',
              params: connectInfo,
            });
          });

          // Listen for disconnect events
          provider.on('disconnect', (error: unknown) => {
            callback({
              jsonrpc: '2.0',
              event: 'disconnect',
              params: { error },
            });
          });
        }
      },
    };
  }
}
