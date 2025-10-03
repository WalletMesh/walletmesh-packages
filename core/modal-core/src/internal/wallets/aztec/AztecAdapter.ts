import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { WalletConnection } from '../../../api/types/connection.js';
import type { WalletProvider } from '../../../api/types/providers.js';
import { ChainType, type Transport, type TransportEvent, type TransportMessageEvent } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { AbstractWalletAdapter } from '../base/AbstractWalletAdapter.js';
import type {
  ConnectOptions,
  DetectionResult,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
} from '../base/WalletAdapter.js';

/**
 * Configuration for Aztec wallet adapter
 */
export interface AztecAdapterConfig {
  /** Custom adapter ID */
  id?: string;
  /** Wallet display name */
  name?: string;
  /** Wallet icon (data URI or URL) */
  icon?: string;
  /** Wallet description */
  description?: string;
  /** Pre-configured transport for the wallet */
  transport?: Transport;
  /** Network to connect to (e.g., 'aztec:testnet', 'aztec:mainnet') */
  network?: string;
}

/**
 * Generic Aztec wallet adapter
 *
 * Provides integration with Aztec-compatible wallets using the AztecRouterProvider
 * from @walletmesh/aztec-rpc-wallet. This adapter acts as a thin wrapper that
 * bridges modal-core's adapter pattern with Aztec-specific wallet functionality.
 *
 * The adapter dynamically imports AztecRouterProvider to avoid requiring Aztec
 * dependencies when not needed, maintaining modal-core's chain-agnostic nature.
 *
 * @example
 * ```typescript
 * // Basic usage with a transport
 * const adapter = new AztecAdapter({
 *   transport: myTransport,
 *   network: 'aztec:testnet'
 * });
 * const connection = await adapter.connect();
 *
 * // With discovered wallet configuration
 * const adapter = new AztecAdapter({
 *   id: 'com.aztecwallet',
 *   name: 'Aztec Wallet',
 *   icon: 'data:image/svg+xml,...',
 *   transport: discoveredTransport
 * });
 * ```
 *
 * @public
 */
export class AztecAdapter extends AbstractWalletAdapter {
  /**
   * Unique identifier for the Aztec adapter
   */
  readonly id: string;

  /**
   * Metadata describing the Aztec wallet
   */
  readonly metadata: WalletAdapterMetadata;

  /**
   * Capabilities of the Aztec wallet adapter
   */
  readonly capabilities: WalletCapabilities = {
    chains: [
      { type: ChainType.Aztec, chainIds: '*' }, // Supports all Aztec networks
    ],
    features: new Set<WalletFeature>(['sign_message', 'encrypt', 'decrypt', 'multi_account']),
  };

  /**
   * Configuration for the adapter
   */
  private config: AztecAdapterConfig;

  /**
   * Cached AztecRouterProvider instance
   */
  private aztecProvider?: unknown;

  /**
   * Cleanup function for JSON-RPC transport subscriptions
   */
  private jsonrpcUnsubscribe: (() => void) | null = null;

  constructor(config?: AztecAdapterConfig) {
    super();

    // Set ID from config or use default
    this.id = config?.id || 'aztec-wallet';

    // Set metadata from config or use defaults
    this.metadata = {
      name: config?.name || 'Aztec Wallet',
      icon:
        config?.icon ||
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjMDAwMDAwIi8+CiAgPHBhdGggZD0iTTE2IDZMMjQgMjZIOEwxNiA2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4=',
      description: config?.description || 'Connect with Aztec privacy-preserving network',
      homepage: 'https://aztec.network',
    };

    this.config = config || {};

    // Set transport if provided
    if (config?.transport) {
      this.transport = config.transport;
    }
  }

  /**
   * Detect if Aztec wallet is available
   */
  async detect(): Promise<DetectionResult> {
    // For Aztec wallets, detection depends on transport availability
    const isAvailable = !!this.transport || !!this.config.transport;

    return {
      isInstalled: isAvailable,
      isReady: isAvailable,
      metadata: {
        type: 'aztec',
        transport: this.transport || this.config.transport,
      },
    };
  }

  /**
   * Connect to the Aztec wallet
   */
  async connect(_options?: ConnectOptions): Promise<WalletConnection> {
    try {
      // Ensure we have a transport
      if (!this.transport && !this.config.transport) {
        throw ErrorFactory.configurationError('Transport required for Aztec adapter', {
          adapterId: this.id,
        });
      }

      const transport = this.transport || this.config.transport;

      // Dynamically import AztecRouterProvider to avoid hard dependency
      let AztecRouterProvider: new (
        transport: JSONRPCTransport,
        context?: Record<string, unknown>,
        sessionId?: string
      ) => unknown;
      try {
        const aztecModule = await import('@walletmesh/aztec-rpc-wallet');
        AztecRouterProvider = aztecModule.AztecRouterProvider;
      } catch (error) {
        throw ErrorFactory.configurationError(
          'Failed to load @walletmesh/aztec-rpc-wallet. Please install it to use Aztec wallets: npm install @walletmesh/aztec-rpc-wallet',
          { adapterId: this.id, originalError: error }
        );
      }

      const jsonRpcTransport = this.ensureJSONRPCTransport(transport);

      // Create AztecRouterProvider instance
      this.aztecProvider = new AztecRouterProvider(jsonRpcTransport);

      // Determine network to connect to
      const network = this.normalizeNetworkId(_options);

      // Request permissions for Aztec operations (minimal set for connection)
      const permissions = this.resolveRequestedPermissions(_options);

      // Establish session with the wallet router
      const provider = this.aztecProvider as {
        connect: (config: Record<string, string[]>) => Promise<{ sessionId: string }>;
        call: <M extends string>(chainId: string, call: { method: M; params?: unknown[] }) => Promise<unknown>;
        disconnect?: () => Promise<void>;
      };

      const { sessionId } = await provider.connect({
        [network]: permissions,
      });

      // Retrieve the wallet address (Aztec wallets expose a single account)
      const addressResponse = await provider.call(network, {
        method: 'aztec_getAddress',
      });

      const address = this.normalizeAddress(addressResponse);
      const accounts = [address];

      // Store the provider reference for future calls
      this.providers.set(ChainType.Aztec, this.aztecProvider as WalletProvider);

      // Use base class method to create connection and manage state
      const walletConnection = await this.createConnection({
        address,
        accounts,
        chainId: network,
        chainType: ChainType.Aztec,
        provider: this.aztecProvider as WalletProvider,
        chainName: this.getChainName(network),
        chainRequired: false,
        sessionId,
      });

      return walletConnection;
    } catch (error) {
      throw ErrorFactory.connectionFailed('Failed to connect to Aztec wallet', {
        originalError: error,
        adapterId: this.id,
      });
    }
  }

  private ensureJSONRPCTransport(transport: Transport | undefined): JSONRPCTransport {
    if (!transport) {
      throw ErrorFactory.configurationError('Transport required for Aztec adapter', {
        adapterId: this.id,
      });
    }

    const maybeJsonrpc = transport as Partial<JSONRPCTransport>;
    if (typeof maybeJsonrpc.send === 'function' && typeof maybeJsonrpc.onMessage === 'function') {
      return maybeJsonrpc as JSONRPCTransport;
    }

    // Bridge Transport events to JSON-RPC expectations
    return {
      send: async (message: unknown) => {
        await transport.send(message);
      },
      onMessage: (callback: (message: unknown) => void) => {
        if (this.jsonrpcUnsubscribe) {
          this.jsonrpcUnsubscribe();
          this.jsonrpcUnsubscribe = null;
        }

        this.jsonrpcUnsubscribe = transport.on('message', (event: TransportEvent) => {
          const messageEvent = event as TransportMessageEvent;
          callback(messageEvent.data);
        });
      },
    };
  }

  /**
   * Disconnect from the Aztec wallet
   */
  async disconnect(): Promise<void> {
    try {
      const provider = this.aztecProvider as { disconnect?: () => Promise<void> };
      if (provider?.disconnect) {
        await provider.disconnect();
      }

      // Clear provider reference
      this.aztecProvider = undefined;
      if (this.jsonrpcUnsubscribe) {
        this.jsonrpcUnsubscribe();
        this.jsonrpcUnsubscribe = null;
      }

      // Use base class cleanup which handles state and providers
      await this.cleanup();
    } catch (error) {
      throw ErrorFactory.connectionFailed('Failed to disconnect from Aztec wallet', {
        originalError: error,
        adapterId: this.id,
      });
    }
  }

  /**
   * Get the provider for the specified chain type
   */
  override getProvider(chainType: ChainType): WalletProvider {
    if (chainType !== ChainType.Aztec) {
      throw ErrorFactory.configurationError(`AztecAdapter does not support ${chainType}`, {
        adapterId: this.id,
      });
    }
    if (!this.aztecProvider) {
      throw ErrorFactory.configurationError(`Provider not found for chain type: ${chainType}`, {
        walletId: this.id,
        chainType,
      });
    }
    return this.aztecProvider as WalletProvider;
  }

  /**
   * Set transport for the adapter
   * Useful when transport is discovered after adapter creation
   */
  setTransport(transport: Transport): void {
    this.transport = transport;
    this.log('debug', 'Set transport for Aztec adapter');
  }

  private normalizeNetworkId(options?: ConnectOptions): string {
    let network = this.config.network;

    if (!network && options?.chains) {
      const aztecChain = options.chains.find((chain) => chain.type === ChainType.Aztec && chain.chainId);
      if (aztecChain?.chainId) {
        network = aztecChain.chainId;
      }
    }

    if (!network && this.capabilities.chains.length > 0) {
      const firstChain = this.capabilities.chains[0];
      if (typeof firstChain === 'object' && 'chainIds' in firstChain) {
        const chainIds = firstChain.chainIds;
        if (typeof chainIds === 'string' && chainIds !== '*') {
          network = chainIds;
        } else if (Array.isArray(chainIds) && chainIds.length > 0) {
          network = chainIds[0];
        }
      }
    }

    if (!network) {
      network = 'aztec:testnet';
    }

    if (!network.startsWith('aztec:')) {
      network = `aztec:${network}`;
    }

    return network;
  }

  private resolveRequestedPermissions(options?: ConnectOptions): string[] {
    const aztecOptions = (options as Record<string, unknown> | undefined)?.['aztecOptions'] as
      | { permissions?: string[] }
      | undefined;

    const fromOptions = aztecOptions?.permissions;
    if (Array.isArray(fromOptions) && fromOptions.length > 0) {
      return fromOptions;
    }

    return ['aztec_getAddress'];
  }

  private normalizeAddress(addressResponse: unknown): string {
    if (typeof addressResponse === 'string') {
      return addressResponse;
    }

    if (addressResponse && typeof addressResponse === 'object' && 'toString' in addressResponse) {
      const stringValue = (addressResponse as { toString: () => string }).toString();
      if (stringValue && stringValue !== '[object Object]') {
        return stringValue;
      }
    }

    throw ErrorFactory.connectionFailed('Failed to parse Aztec address from wallet response', {
      originalError: new Error(`Unsupported address format: ${typeof addressResponse}`),
    });
  }

  private getChainName(chainId: string): string {
    switch (chainId) {
      case 'aztec:mainnet':
        return 'Aztec Mainnet';
      case 'aztec:testnet':
        return 'Aztec Testnet';
      case 'aztec:31337':
        return 'Aztec Sandbox';
      default:
        return 'Aztec Network';
    }
  }
}
