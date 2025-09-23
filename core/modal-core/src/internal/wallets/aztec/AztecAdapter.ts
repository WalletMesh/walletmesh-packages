import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { WalletConnection } from '../../../api/types/connection.js';
import type { WalletProvider } from '../../../api/types/providers.js';
import { ChainType, type Transport } from '../../../types.js';
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
      const { AztecRouterProvider } = await import('@walletmesh/aztec-rpc-wallet');

      // Create a JSONRPCTransport adapter from the Transport
      // The Transport interface is compatible with JSONRPCTransport for our use case
      const jsonRpcTransport = transport as unknown as JSONRPCTransport;

      // Create AztecRouterProvider instance
      this.aztecProvider = new AztecRouterProvider(jsonRpcTransport);

      // Determine network to connect to
      const network = this.config.network || 'aztec:testnet';

      // Request permissions for Aztec operations
      const permissions = ['aztec_getAddress', 'aztec_sendTx', 'aztec_getAccounts'];

      // Connect to the wallet
      const provider = this.aztecProvider as {
        connect: (config: Record<string, string[]>) => Promise<void>;
        request: (params: { method: string; params: unknown[] }) => Promise<unknown>;
      };
      await provider.connect({
        [network]: permissions,
      });

      // Get the connected accounts
      const accounts = (await provider.request({
        method: 'aztec_getAccounts',
        params: [],
      })) as Array<{ address: string; name?: string }> | undefined;

      const address = accounts?.[0]?.address || '';
      const accountAddresses = accounts?.map((acc) => acc.address) || [address];

      // Store the provider reference
      this.providers.set(ChainType.Aztec, this.aztecProvider as WalletProvider);

      // Use base class method to create connection and manage state
      const walletConnection = await this.createConnection({
        address,
        accounts: accountAddresses,
        chainId: network.split(':')[1] || 'testnet',
        chainType: ChainType.Aztec,
        provider: this.aztecProvider as WalletProvider,
        chainName: 'Aztec Network',
        chainRequired: false,
      });

      return walletConnection;
    } catch (error) {
      throw ErrorFactory.connectionFailed('Failed to connect to Aztec wallet', {
        originalError: error,
        adapterId: this.id,
      });
    }
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
}
