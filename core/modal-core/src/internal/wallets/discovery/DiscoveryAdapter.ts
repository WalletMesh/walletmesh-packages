/**
 * Discovery Wallet Adapter
 *
 * This adapter bridges the discovery protocol with modal-core's wallet system,
 * automatically configuring transports based on discovered wallet metadata.
 * It supports all chain types (EVM, Solana, Aztec) discovered through the protocol.
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import type { DiscoveryConnectionManager } from '../../../client/discovery/types.js';
import { mapDiscoveryTechnologiesToChainTypes } from '../../../client/types/discoveryMappings.js';
import { EvmProvider } from '../../../providers/evm/index.js';
import { SolanaProvider } from '../../../providers/solana/index.js';
import {
  type DiscoveryAccount as ValidatedDiscoveryAccount,
  validateDiscoveryAccounts,
  validateQualifiedResponder,
} from '../../../schemas/discovery.js';
import { TransportType } from '../../../types.js';
import type { Transport } from '../../../types.js';
import { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { getChainName } from '../../../utils/chainNameResolver.js';
import { AztecAdapter } from '../aztec/AztecAdapter.js';
import { AbstractWalletAdapter } from '../base/AbstractWalletAdapter.js';

import { createTransport } from '../../../api/transports/transports.js';
import type { WalletConnection } from '../../../api/types/connection.js';
import type {
  ChainDefinition,
  ConnectOptions,
  DetectionResult,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
} from '../base/WalletAdapter.js';
import { useStore } from '../../../state/store.js';

/**
 * Minimal data needed to construct a DiscoveryAdapter
 *
 * This interface defines the essential information required to create
 * a DiscoveryAdapter instance without needing the full QualifiedResponder
 * from the discovery protocol. This enables adapter recreation after
 * page refresh using only persisted session data.
 */
export interface DiscoveryAdapterData {
  /** Wallet identifier */
  id: string;

  /** Wallet metadata (name, icon, description) */
  metadata: WalletAdapterMetadata;

  /** Wallet capabilities (supported chains and features) */
  capabilities: WalletCapabilities;

  /** Transport configuration for communication */
  transportConfig: unknown;

  /** Optional network identifiers (e.g., ['aztec:31337', 'evm:1']) */
  networks?: string[];
}

/**
 * Configuration for the Discovery Wallet Adapter
 */
export interface DiscoveryAdapterConfig {
  /**
   * Whether to automatically connect the transport on adapter creation
   */
  autoConnect?: boolean;

  /**
   * Custom provider configuration
   */
  providerConfig?: Record<string, unknown>;

  /**
   * Transport creation options
   */
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  reconnect?: boolean;
  reconnectInterval?: number;
}

/**
 * Generic adapter that automatically configures transports and providers
 * based on discovered wallet metadata. Supports all chain types.
 */
export class DiscoveryAdapter extends AbstractWalletAdapter {
  /**
   * Extract wallet information from a QualifiedResponder
   * Useful for displaying discovered wallets without instantiating the adapter
   *
   * @param responder - The qualified responder from discovery protocol
   * @returns Wallet metadata and capabilities
   * @public
   */
  static getWalletInfoFromResponder(responder: QualifiedResponder): {
    id: string;
    name: string;
    icon: string;
    rdns: string;
    transportType: string;
    chains: ChainType[];
    features: Set<WalletFeature>;
  } {
    // Determine chain types from matched technologies
    const chains: ChainType[] = [];
    const features: Set<WalletFeature> = new Set();

    if (responder.matched?.required?.technologies) {
      for (const tech of responder.matched.required.technologies) {
        switch (tech.type) {
          case 'evm':
            chains.push(ChainType.Evm);
            features.add('sign_message');
            features.add('sign_transaction');
            break;
          case 'solana':
            chains.push(ChainType.Solana);
            features.add('sign_message');
            features.add('sign_transaction');
            break;
          case 'aztec':
            chains.push(ChainType.Aztec);
            features.add('sign_message');
            features.add('sign_transaction');
            features.add('encrypt');
            features.add('decrypt');
            break;
        }
      }
    }

    // Add multi_account feature by default for discovered wallets
    features.add('multi_account');

    return {
      id: responder.responderId,
      name: responder.name,
      icon: responder.icon,
      rdns: responder.rdns,
      transportType: (responder.transportConfig as { type?: string })?.type || 'unknown',
      chains,
      features,
    };
  }

  /**
   * Extract minimal adapter data from a QualifiedResponder
   *
   * This static method extracts only the essential information needed to
   * construct a DiscoveryAdapter, without requiring the full QualifiedResponder
   * object. This enables adapter persistence and recreation after page refresh.
   *
   * @param qualifiedResponder - The discovery protocol response
   * @returns Minimal data required to construct the adapter
   * @public
   */
  static extractAdapterData(qualifiedResponder: unknown): DiscoveryAdapterData {
    // Validate the qualified responder data
    const validatedResponder = validateQualifiedResponder(qualifiedResponder);

    // Map discovery technologies to modal-core chain types
    const chainTypes = mapDiscoveryTechnologiesToChainTypes(
      validatedResponder.matched.required.technologies || [],
    );

    // Extract description from validated metadata
    const description = validatedResponder.metadata?.['description'] || `${validatedResponder.name} wallet`;

    // Build metadata object
    const metadata: WalletAdapterMetadata = {
      name: validatedResponder.name,
      icon: validatedResponder.icon,
      description: typeof description === 'string' ? description : '',
      homepage: '',
    };

    // Convert ChainType[] to ChainDefinition[]
    const chainDefinitions: ChainDefinition[] = chainTypes.map((chainType) => ({
      type: chainType,
      chainIds: '*', // Support all chains of this type
    }));

    // Create features set
    const features = new Set<WalletFeature>();
    features.add('multi_account');

    // Build capabilities object
    const capabilities: WalletCapabilities = {
      chains: chainDefinitions,
      features,
    };

    return {
      id: validatedResponder.responderId,
      metadata,
      capabilities,
      transportConfig: validatedResponder.transportConfig,
      networks: validatedResponder.networks || [],
    };
  }

  readonly id: string;
  readonly metadata: WalletAdapterMetadata;
  readonly capabilities: WalletCapabilities;

  private transportConfig: unknown;
  private networks: string[];
  private qualifiedResponder?: QualifiedResponder; // Optional - only for backward compatibility
  private connectionManager: DiscoveryConnectionManager;
  private config: DiscoveryAdapterConfig;
  private aztecConnectionResult: WalletConnection | null = null;
  private connectOptions?: ConnectOptions;
  private sessionId: string | null = null;

  /**
   * Create a DiscoveryAdapter
   *
   * @param adapterDataOrResponder - Either minimal DiscoveryAdapterData or full QualifiedResponder
   * @param connectionManager - Connection manager for discovery protocol
   * @param config - Optional adapter configuration
   */
  constructor(
    adapterDataOrResponder: DiscoveryAdapterData | unknown,
    connectionManager: DiscoveryConnectionManager,
    config: DiscoveryAdapterConfig = {},
  ) {
    super();

    // Check if we received DiscoveryAdapterData or QualifiedResponder
    const isAdapterData = (data: any): data is DiscoveryAdapterData => {
      return (
        data &&
        typeof data === 'object' &&
        'id' in data &&
        'metadata' in data &&
        'capabilities' in data &&
        'transportConfig' in data
      );
    };

    let adapterData: DiscoveryAdapterData;

    if (isAdapterData(adapterDataOrResponder)) {
      // New path: Use provided minimal data directly
      adapterData = adapterDataOrResponder;
    } else {
      // Legacy path: Extract data from QualifiedResponder
      try {
        adapterData = DiscoveryAdapter.extractAdapterData(adapterDataOrResponder);
        // Store the qualified responder for backward compatibility
        this.qualifiedResponder = validateQualifiedResponder(adapterDataOrResponder);
      } catch (error) {
        throw ErrorFactory.configurationError('Invalid discovery response data', {
          originalError: error,
          responderId: (adapterDataOrResponder as { responderId?: string })?.responderId,
        });
      }
    }

    // Initialize from adapter data
    this.id = `discovery-${adapterData.id}`;
    this.metadata = adapterData.metadata;
    this.capabilities = adapterData.capabilities;
    this.transportConfig = adapterData.transportConfig;
    this.networks = adapterData.networks || [];
    this.connectionManager = connectionManager;
    this.config = config;
  }

  /**
   * Get the wallet ID (without the 'discovery-' prefix)
   * @private
   */
  private getWalletId(): string {
    return this.id.replace(/^discovery-/, '');
  }

  /**
   * Detect if discovery wallet is available
   */
  async detect(): Promise<DetectionResult> {
    // For discovery protocol adapters, availability is determined by having transport config
    return {
      isInstalled: true,
      isReady: this.transportConfig !== null && this.transportConfig !== undefined,
      metadata: {
        type: 'discovery',
        responder: this.qualifiedResponder, // May be undefined for minimal data path
        connectionManager: this.connectionManager,
      },
    };
  }

  /**
   * Connect to the wallet using the discovery protocol
   */
  async connect(options?: ConnectOptions): Promise<WalletConnection> {
    try {
      // Store options for use in provider creation (only if defined)
      if (options) {
        this.connectOptions = options;
      }

      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter.connect invoked',
        {
          responderId: this.getWalletId(),
          transportType: (this.transportConfig as any)?.type,
        },
      );

      // Check if we have an existing connected provider that can be reused
      const currentChainType = this.getChainTypeFromTechnologies();
      const existingProvider = this.providers.get(currentChainType);

      if (existingProvider && this.sessionId && this.state.isConnected) {
        (this.logger?.info || this.logger?.debug || console.info).call(
          this.logger,
          '🔄 Checking existing provider connection',
          {
            hasProvider: true,
            sessionId: this.sessionId,
            chainType: currentChainType,
          },
        );

        try {
          // Verify connection is still active by attempting to get accounts
          // Different approaches for different chain types
          let isStillConnected = false;
          let accounts: string[] = [];

          if (currentChainType === ChainType.Aztec) {
            // For Aztec, check if we have the cached connection result
            if (this.aztecConnectionResult) {
              accounts = this.aztecConnectionResult.accounts;
              isStillConnected = true;
            }
          } else if ('getAccounts' in existingProvider) {
            // For EVM/Solana, try to get accounts
            const providerAccounts = await (
              existingProvider as { getAccounts: () => Promise<string[]> }
            ).getAccounts();
            if (Array.isArray(providerAccounts) && providerAccounts.length > 0) {
              accounts = providerAccounts;
              isStillConnected = true;
            }
          }

          if (isStillConnected && accounts.length > 0) {
            (this.logger?.info || this.logger?.debug || console.info).call(
              this.logger,
              '✅ Existing provider is still connected, reusing it',
              {
                chainType: currentChainType,
                sessionId: this.sessionId,
                accountCount: accounts.length,
              },
            );

            // Reuse existing connection
            const chainId = options?.chains?.[0]?.chainId || this.networks[0] || '1';
            // We know accounts has at least one element because we checked accounts.length > 0
            const primaryAddress = accounts[0] as string;
            return {
              walletId: this.getWalletId(),
              address: primaryAddress,
              accounts,
              chain: {
                chainId,
                chainType: currentChainType,
                name: getChainName(chainId, currentChainType),
                required: false,
              },
              chainType: currentChainType,
              provider: existingProvider,
              walletInfo: {
                id: this.getWalletId(),
                name: this.metadata.name,
                icon: this.metadata.icon,
                chains: [currentChainType],
              },
            };
          }
        } catch (error) {
          (this.logger?.warn || this.logger?.debug || console.warn).call(
            this.logger,
            'Existing provider is no longer connected, will create new connection',
            {
              error,
              sessionId: this.sessionId,
            },
          );
          // Provider is no longer valid, clear it and continue with new connection
          this.providers.delete(currentChainType);
          this.sessionId = null;
          this.aztecConnectionResult = null;

          // Also clear the transport if it exists
          if (this.transport) {
            try {
              if ('disconnect' in this.transport) {
                await this.transport.disconnect();
              }
            } catch {
              // Ignore errors during cleanup
            }
            this.transport = null;
          }
        }
      }
      // Use discovery protocol's ConnectionManager to establish connection
      // Convert chains from ConnectOptions format to string array
      // chainId is already in CAIP-2 format (e.g., 'aztec:31337'), so use it directly
      if (!options?.chains || options.chains.length === 0) {
        throw ErrorFactory.configurationError(
          'No chains specified for wallet connection. Please provide chains in ConnectOptions.',
        );
      }
      // Create transport based on transport config
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter: Creating transport from config',
        {
          transportType: (this.transportConfig as any)?.type,
          hasExtensionId: !!(this.transportConfig as any)?.extensionId,
          hasUrl: !!(this.transportConfig as any)?.url,
        },
      );
      this.transport = await this.createTransportFromConfig();
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter: Transport created successfully',
      );

      // Create appropriate provider based on chains
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter: Creating providers',
        {
          capabilities: this.capabilities.chains.map((c) => ({
            type: c.type,
            chainIds: c.chainIds,
          })),
        },
      );
      await this.createProviders();
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter: Providers created successfully',
      );

      // Get chain type from technologies
      const chainType = this.getChainTypeFromTechnologies();
      (this.logger?.debug || console.debug).call(this.logger, 'DiscoveryAdapter: Determined chain type', {
        chainType,
      });

      // Retrieve the created provider from the providers map
      const provider = this.providers.get(chainType);
      if (!provider) {
        throw ErrorFactory.connectionFailed('Provider was not created successfully', {
          walletId: this.getWalletId(),
          chainType,
        });
      }

      // Get accounts - different approach for Aztec vs EVM/Solana
      let accounts: Array<{ address: string; chainId: string }> = [];
      try {
        const chainId = this.networks[0] || (chainType === ChainType.Aztec ? 'aztec:31337' : '1');

        (this.logger?.info || this.logger?.debug || console.info).call(
          this.logger,
          'DiscoveryAdapter: Retrieving accounts',
          {
            chainType,
            chainId,
            method: chainType === ChainType.Aztec ? 'cached_connection' : 'getAccounts',
          },
        );

        if (chainType === ChainType.Aztec) {
          // For Aztec: Use the connection result that was already established in createProviders()
          // The AztecAdapter.connect() already retrieved the address via aztec_getAddress RPC call
          if (!this.aztecConnectionResult) {
            throw new Error('Aztec connection was not established during provider creation');
          }

          accounts = this.aztecConnectionResult.accounts.map((addr) => ({
            address: addr,
            chainId,
          }));
        } else if ('getAccounts' in provider) {
          // For EVM/Solana: Get accounts directly from provider
          const providerAccounts = await provider.getAccounts();

          if (Array.isArray(providerAccounts)) {
            accounts = providerAccounts.map((addr) => ({
              address: typeof addr === 'string' ? addr : String(addr),
              chainId,
            }));
          }
        }

        // Ensure we got at least one account
        if (accounts.length === 0) {
          throw new Error('No accounts returned from wallet provider');
        }

        (this.logger?.info || this.logger?.debug || console.info).call(
          this.logger,
          'DiscoveryAdapter: Accounts retrieved successfully',
          {
            accountCount: accounts.length,
            firstAccount: `${accounts[0]?.address?.substring(0, 10)}...`,
          },
        );
      } catch (error) {
        this.logger?.error('DiscoveryAdapter: Failed to retrieve accounts', {
          error,
          chainType,
        });
        throw ErrorFactory.connectionFailed('Failed to retrieve accounts from wallet', {
          originalError: error,
          walletId: this.getWalletId(),
          chainType,
        });
      }

      // Validate accounts from provider response
      let validatedAccounts: ValidatedDiscoveryAccount[];
      try {
        validatedAccounts = validateDiscoveryAccounts(accounts);
      } catch (error) {
        throw ErrorFactory.connectionFailed('Invalid account data received from wallet', {
          originalError: error,
          walletId: this.getWalletId(),
        });
      }

      const firstAccount = validatedAccounts[0];
      const chainId = firstAccount?.chainId || '1'; // Default to mainnet

      // Extract sessionId if available (especially for Aztec connections)
      let sessionId: string | undefined;
      if (chainType === ChainType.Aztec && this.aztecConnectionResult?.sessionId) {
        sessionId = this.aztecConnectionResult.sessionId;
        this.sessionId = sessionId; // Store for reuse
      }

      // Create wallet connection object
      const walletConnection: WalletConnection = {
        walletId: this.getWalletId(),
        address: firstAccount?.address || '',
        accounts: validatedAccounts.map((account) => account.address),
        chain: {
          chainId,
          chainType,
          name: getChainName(chainId, chainType),
          required: false,
        },
        chainType,
        provider: provider,
        walletInfo: {
          id: this.getWalletId(),
          name: this.metadata.name,
          icon: this.metadata.icon,
          chains: [chainType],
        },
        ...(sessionId && { sessionId }),
      };

      // Connection state is managed by base class

      // Base class will handle events

      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter.connect completed',
        {
          walletId: walletConnection.walletId,
          chainType: walletConnection.chainType,
          sessionId: this.sessionId,
        },
      );
      return walletConnection;
    } catch (error) {
      const originalError = error instanceof Error ? error : new Error(String(error));

      this.logger?.error('Discovery adapter connection failed', {
        walletId: this.getWalletId(),
        message: originalError.message,
        stack: originalError.stack,
      });

      // Enhanced error recovery: clean up any partial state
      try {
        // Clear providers that may have been partially created
        if (this.providers.size > 0) {
          this.logger?.debug('Cleaning up partial provider state after connection error', {
            providerCount: this.providers.size,
          });
          this.providers.clear();
        }

        // Clear session state
        if (this.sessionId) {
          this.logger?.debug('Clearing session state after connection error');
          this.sessionId = null;
        }

        // Clear Aztec connection result if present
        if (this.aztecConnectionResult) {
          this.logger?.debug('Clearing Aztec connection result after connection error');
          this.aztecConnectionResult = null;
        }

        // Disconnect transport if it was created
        if (this.transport) {
          this.logger?.debug('Disconnecting transport after connection error');
          try {
            if ('disconnect' in this.transport && typeof this.transport.disconnect === 'function') {
              await this.transport.disconnect();
            }
          } catch (transportError) {
            this.logger?.warn('Failed to disconnect transport during error cleanup', transportError);
            // Continue with cleanup even if transport disconnect fails
          }
          this.transport = null;
        }
      } catch (cleanupError) {
        // Log cleanup errors but don't throw - we want to preserve the original error
        this.logger?.warn('Error during connection failure cleanup', {
          cleanupError,
          originalError,
        });
      }

      throw ErrorFactory.connectionFailed(originalError.message, {
        walletId: this.getWalletId(),
        originalError,
      });
    }
  }

  /**
   * Get chain type from capabilities
   */
  private getChainTypeFromTechnologies(): ChainType {
    // Get chain types from capabilities (which were derived from technologies)
    if (this.capabilities.chains.length > 0) {
      // Safe to use non-null assertion since we checked length > 0
      return this.capabilities.chains[0]!.type;
    }

    // Fallback to qualifiedResponder if available (legacy path)
    if (this.qualifiedResponder) {
      const technologies = this.qualifiedResponder.matched?.required?.technologies || [];
      if (technologies.length > 0) {
        const firstTech = technologies[0];
        if (firstTech) {
          switch (firstTech.type) {
            case 'evm':
              return ChainType.Evm;
            case 'solana':
              return ChainType.Solana;
            case 'aztec':
              return ChainType.Aztec;
          }
        }
      }
    }

    return ChainType.Evm; // Default
  }

  /**
   * Get Aztec network from discovery metadata
   * @returns Aztec network string (e.g., 'aztec:mainnet', 'aztec:testnet', 'aztec:31337')
   * @private
   */
  private getAztecNetworkFromDiscovery(): string {
    // Check networks array
    const networks = this.networks || [];

    // If qualifiedResponder exists (legacy path), also check its networks
    if (this.qualifiedResponder) {
      const legacyNetworks = this.qualifiedResponder.matched?.required?.networks || [];
      networks.push(...legacyNetworks);
    }

    const aztecNetwork = networks.find((network: string) => network.startsWith('aztec:'));
    if (aztecNetwork) {
      return aztecNetwork;
    }

    // No default - throw error if network cannot be determined
    throw new Error(
      `Unable to determine Aztec network for wallet "${this.metadata.name}". ` +
        `The wallet must provide network information in the discovery response.`,
    );
  }

  /**
   * Disconnect from the wallet
   */
  async disconnect(): Promise<void> {
    try {
      // Disconnect via ConnectionManager
      await this.connectionManager.disconnect(this.getWalletId());

      // Clean up transport
      if (this.transport && 'disconnect' in this.transport) {
        await this.transport.disconnect();
      }

      // Clear session and connection state
      this.sessionId = null;
      this.aztecConnectionResult = null;

      // Clear providers
      this.providers.clear();

      // Clear transport
      this.transport = null;

      // Base class will handle disconnect event
    } catch (error) {
      const walletError = ErrorFactory.connectionFailed('Failed to disconnect cleanly', {
        originalError: error,
      });
      throw walletError;
    }
  }

  /**
   * Create transport based on transport config from discovery
   */
  private async createTransportFromConfig(): Promise<Transport> {
    const transportConfig = this.transportConfig;

    if (!transportConfig) {
      throw ErrorFactory.configurationError('No transport configuration provided by wallet');
    }

    // Cast to any for accessing dynamic properties
    const configAny = transportConfig as any;

    const {
      retries = 3,
      retryDelay = 1000,
      timeout = 30000,
      reconnect = false,
      reconnectInterval = 5000,
    } = this.config;

    const baseConfig: Record<string, unknown> = {
      retries,
      retryDelay,
      timeout,
      reconnect,
      reconnectInterval,
      ...configAny.adapterConfig,
    };

    let transport: Transport;
    (this.logger?.info || this.logger?.debug || console.info).call(
      this.logger,
      'DiscoveryAdapter: selecting transport',
      {
        walletId: this.getWalletId(),
        type: (transportConfig as any)?.type,
        hasUrl: Boolean((transportConfig as any)?.url),
        hasWebsocketUrl: Boolean((transportConfig as any)?.websocketUrl),
        extensionId: (transportConfig as any)?.extensionId,
      },
    );

    // Select transport strictly from supported types
    switch (configAny.type) {
      case 'extension':
        if (!configAny.extensionId) {
          throw ErrorFactory.configurationError('Extension ID required for Chrome extension transport');
        }
        baseConfig['extensionId'] = configAny.extensionId;
        transport = createTransport(TransportType.Extension, baseConfig);
        break;

      case 'websocket':
        if (!configAny.url && !configAny.websocketUrl) {
          throw ErrorFactory.configurationError('WebSocket URL required for WebSocket transport');
        }
        baseConfig['url'] = configAny.url ?? configAny.websocketUrl;
        // Map to Popup transport as a placeholder until WebSocket transport exists
        transport = createTransport(TransportType.Popup, baseConfig);
        break;

      case 'injected':
        // Injected wallets don't use discovery transports; treat as unsupported in this path
        throw ErrorFactory.configurationError('Injected wallets do not use transports');

      default:
        throw ErrorFactory.configurationError(`Unsupported transport type: ${configAny.type}`);
    }

    try {
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter: connecting transport',
        {
          walletId: this.getWalletId(),
          type: (transportConfig as any)?.type,
        },
      );
      await transport.connect();
      (this.logger?.info || this.logger?.debug || console.info).call(
        this.logger,
        'DiscoveryAdapter: transport connected',
        {
          walletId: this.getWalletId(),
        },
      );
    } catch (error) {
      const connectError =
        error instanceof Error ? error : new Error(`Failed to connect transport: ${String(error)}`);
      // Provide clearer guidance for extension lastError cases
      const message = connectError.message?.includes('Receiving end does not exist')
        ? 'Extension not reachable. Ensure it is installed and allows this origin.'
        : connectError.message;
      throw ErrorFactory.connectionFailed(connectError.message, {
        walletId: this.getWalletId(),
        transportType: configAny.type,
        originalError: new Error(message),
      });
    }

    return transport;
  }

  /**
   * Create providers based on supported chains and negotiated interfaces
   */
  private async createProviders(): Promise<void> {
    if (!this.transport) {
      throw ErrorFactory.configurationError('Transport must be created before providers');
    }

    // Get negotiated interfaces from the qualified responder
    const negotiatedInterfaces = this.getNegotiatedInterfaces();

    // Create providers based on chain definitions
    for (const chainDef of this.capabilities.chains) {
      // Get the negotiated interfaces for this chain type
      const chainInterfaces = this.getInterfacesForChainType(chainDef.type, negotiatedInterfaces);

      switch (chainDef.type) {
        case ChainType.Evm:
          // TODO: Use interface-aware provider selection once integrated
          // For now, use standard provider
          await this.createProvider(EvmProvider, this.transport, ChainType.Evm);
          this.logger?.debug('Created EVM provider with interfaces:', chainInterfaces);
          break;
        case ChainType.Solana:
          await this.createProvider(SolanaProvider, this.transport, ChainType.Solana);
          this.logger?.debug('Created Solana provider with interfaces:', chainInterfaces);
          break;
        case ChainType.Aztec: {
          // Determine Aztec network from discovery data
          const aztecNetwork = this.getAztecNetworkFromDiscovery();

          // Create AztecAdapter with the transport and dynamically determined network
          const aztecAdapter = new AztecAdapter({
            id: this.id,
            name: this.metadata.name,
            icon: this.metadata.icon,
            ...(this.metadata.description && { description: this.metadata.description }),
            transport: this.transport || undefined,
            network: aztecNetwork,
          });
          // Log permission information for Aztec connection
          const aztecOptions = (this.connectOptions?.['aztecOptions'] as { permissions?: string[] }) || {};
          const permissions = aztecOptions.permissions || [];

          (this.logger?.info || this.logger?.debug || console.info).call(
            this.logger,
            'DiscoveryAdapter: connecting Aztec adapter',
            {
              walletId: this.id,
              transportType: (this.transportConfig as any)?.type,
              network: aztecNetwork,
              hasPermissions: permissions.length > 0,
              permissionCount: permissions.length,
            },
          );

          // Log detailed permission table if permissions are requested
          if (permissions.length > 0) {
            const permissionCategories = this.categorizeAztecPermissions(permissions);
            (this.logger?.info || this.logger?.debug || console.info).call(
              this.logger,
              'Requesting Aztec wallet permissions',
              {
                network: aztecNetwork,
                total: permissions.length,
                byCategory: permissionCategories,
                permissions: permissions.slice(0, 10), // Show first 10 to avoid excessive logging
              },
            );
          }

          // Connect the adapter to establish the provider and get connection details
          // Pass the connection options (which include permissions) to the Aztec adapter
          this.aztecConnectionResult = await aztecAdapter.connect(this.connectOptions);
          this.logger?.debug('DiscoveryAdapter: Aztec adapter connected', {
            walletId: this.id,
            network: aztecNetwork,
            address: this.aztecConnectionResult.address,
            accounts: this.aztecConnectionResult.accounts,
          });
          // Store the provider from the adapter
          const aztecProvider = aztecAdapter.getProvider(ChainType.Aztec);
          if (aztecProvider) {
            this.providers.set(ChainType.Aztec, aztecProvider);
            // Set up provider event listeners
            this.setupProviderListeners(aztecProvider);
          }
          this.logger?.debug('Created Aztec adapter with interfaces:', chainInterfaces);
          break;
        }
      }
    }
  }

  /**
   * Get negotiated interfaces from the qualified responder
   */
  private getNegotiatedInterfaces(): Record<string, string[]> {
    const interfaces: Record<string, string[]> = {};

    // Only support technology-based matches (only available if created from QualifiedResponder)
    if (this.qualifiedResponder?.matched?.required?.technologies) {
      for (const tech of this.qualifiedResponder.matched.required.technologies) {
        interfaces[tech.type] = tech.interfaces || [];
      }
    }

    return interfaces;
  }

  /**
   * Get interfaces for a specific chain type
   */
  private getInterfacesForChainType(
    chainType: ChainType,
    negotiatedInterfaces: Record<string, string[]>,
  ): string[] {
    const techType = chainType.toLowerCase();
    return negotiatedInterfaces[techType] || [];
  }

  /**
   * Set up provider event listeners to forward events to adapter
   * @override
   */
  protected override setupProviderListeners(provider: unknown): void {
    const chainType = this.getChainTypeFromTechnologies();

    this.log('debug', 'Setting up provider event listeners', { chainType });

    // Set up event listeners based on chain type
    switch (chainType) {
      case ChainType.Evm:
        this.setupEvmProviderListeners(provider);
        break;
      case ChainType.Solana:
        this.setupSolanaProviderListeners(provider);
        break;
      case ChainType.Aztec:
        this.setupAztecProviderListeners(provider);
        break;
      default:
        this.log('warn', 'Unknown chain type for event forwarding', { chainType });
    }
  }

  /**
   * Set up EVM provider event listeners
   * @private
   */
  private setupEvmProviderListeners(provider: unknown): void {
    const evmProvider = provider as { on?: (event: string, listener: (...args: unknown[]) => void) => void };

    if (typeof evmProvider.on !== 'function') {
      this.log('warn', 'EVM provider does not support event listeners');
      return;
    }

    // Forward accountsChanged events
    evmProvider.on('accountsChanged', (accounts: unknown) => {
      this.log('debug', 'EVM accounts changed', { accounts });
      const accountArray = accounts as string[];
      this.emitBlockchainEvent('accountsChanged', {
        accounts: accountArray,
        chainType: ChainType.Evm,
      });
    });

    // Forward chainChanged events
    evmProvider.on('chainChanged', (chainId: unknown) => {
      this.log('debug', 'EVM chain changed', { chainId });
      const chainIdString = chainId as string;
      this.emitBlockchainEvent('chainChanged', {
        chainId: chainIdString,
        chainType: ChainType.Evm,
      });
    });

    // Forward disconnect events
    evmProvider.on('disconnect', () => {
      this.log('debug', 'EVM provider disconnected');
      this.emitBlockchainEvent('disconnected', { reason: 'Provider disconnected' });
    });
  }

  /**
   * Set up Solana provider event listeners
   * @private
   */
  private setupSolanaProviderListeners(provider: unknown): void {
    const solanaProvider = provider as {
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
    };

    if (typeof solanaProvider.on !== 'function') {
      this.log('warn', 'Solana provider does not support event listeners');
      return;
    }

    // Forward accountChanged events (Solana uses singular 'accountChanged')
    solanaProvider.on('accountChanged', (event: unknown) => {
      this.log('debug', 'Solana account changed', { event });
      // Extract public key - event could be the key directly or an object with publicKey property
      let accountString = '';
      if (event && typeof event === 'object' && 'publicKey' in event) {
        const pubKeyObj = (event as { publicKey: unknown }).publicKey;
        accountString = pubKeyObj ? String(pubKeyObj) : '';
      } else {
        accountString = event ? String(event) : '';
      }
      this.emitBlockchainEvent('accountsChanged', {
        accounts: accountString ? [accountString] : [],
        chainType: ChainType.Solana,
      });
    });

    // Forward connect events
    solanaProvider.on('connect', (event: unknown) => {
      this.log('debug', 'Solana provider connected', { event });
      // Extract public key from connect event
      let publicKey = '';
      if (event && typeof event === 'object' && 'publicKey' in event) {
        const pubKeyObj = (event as { publicKey: unknown }).publicKey;
        publicKey = pubKeyObj ? String(pubKeyObj) : '';
      }
      this.emitBlockchainEvent('connected', {
        publicKey,
        chainType: ChainType.Solana,
      });
    });

    // Forward disconnect events
    solanaProvider.on('disconnect', () => {
      this.log('debug', 'Solana provider disconnected');
      this.emitBlockchainEvent('disconnected', { reason: 'Provider disconnected' });
    });
  }

  /**
   * Set up Aztec provider event listeners
   * @private
   */
  private setupAztecProviderListeners(provider: unknown): void {
    const aztecProvider = provider as {
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
    };

    if (typeof aztecProvider.on !== 'function') {
      this.log('warn', 'Aztec provider does not support event listeners');
      return;
    }

    // Forward accountsChanged events
    aztecProvider.on('accountsChanged', (accounts: unknown) => {
      this.log('debug', 'Aztec accounts changed', { accounts });
      const accountArray = accounts as string[];
      this.emitBlockchainEvent('accountsChanged', {
        accounts: accountArray,
        chainType: ChainType.Aztec,
      });
    });

    // Forward chainChanged events
    aztecProvider.on('chainChanged', (chainId: unknown) => {
      this.log('debug', 'Aztec chain changed', { chainId });
      const chainIdString = chainId as string;
      this.emitBlockchainEvent('chainChanged', {
        chainId: chainIdString,
        chainType: ChainType.Aztec,
      });
    });

    // Forward statusChanged events
    aztecProvider.on('statusChanged', (event: unknown) => {
      this.log('debug', 'Aztec status changed', { event });
      this.emitBlockchainEvent('statusChanged', {
        ...(event as object),
        chainType: ChainType.Aztec,
      });
    });

    // Forward networkChanged events (map to chainChanged)
    aztecProvider.on('networkChanged', (event: unknown) => {
      this.log('debug', 'Aztec network changed', { event });
      // Extract network/chainId from event
      let chainId = '';
      if (event && typeof event === 'object' && 'network' in event) {
        chainId = String((event as { network: unknown }).network);
      }
      this.emitBlockchainEvent('chainChanged', {
        chainId,
        chainType: ChainType.Aztec,
      });
    });

    // Forward disconnect events
    aztecProvider.on('disconnect', () => {
      this.log('debug', 'Aztec provider disconnected');
      this.emitBlockchainEvent('disconnected', { reason: 'Provider disconnected' });
    });
  }

  // Note: getChainName() has been consolidated to src/utils/chainNameResolver.ts

  /**
   * Categorize Aztec permissions for logging and display
   * @private
   */
  private categorizeAztecPermissions(permissions: string[]): Record<string, string[]> {
    const categories: {
      Read: string[];
      Transaction: string[];
      Contract: string[];
      Auth: string[];
      Other: string[];
    } = {
      Read: [],
      Transaction: [],
      Contract: [],
      Auth: [],
      Other: [],
    };

    for (const permission of permissions) {
      if (permission.startsWith('aztec_get') || permission.startsWith('aztec_list')) {
        categories['Read'].push(permission);
      } else if (
        permission.includes('Transaction') ||
        permission.includes('send') ||
        permission === 'aztec_signMessage'
      ) {
        categories['Transaction'].push(permission);
      } else if (
        permission.includes('Contract') ||
        permission.includes('deploy') ||
        permission.includes('call')
      ) {
        categories['Contract'].push(permission);
      } else if (
        permission.includes('Auth') ||
        permission.includes('Witness') ||
        permission.includes('register')
      ) {
        categories['Auth'].push(permission);
      } else {
        categories['Other'].push(permission);
      }
    }

    // Remove empty categories
    return Object.fromEntries(Object.entries(categories).filter(([_, perms]) => perms.length > 0));
  }

  /**
   * Override persistSession to save DiscoveryAdapter-specific data
   */
  protected override async persistSession(connection: WalletConnection, sessionId: string): Promise<void> {
    // Call parent to save base data
    await super.persistSession(connection, sessionId);

    // Build discovery data to save
    const discoveryData = {
      id: this.getWalletId(),
      metadata: this.metadata,
      capabilities: this.capabilities,
      transportConfig: this.transportConfig,
      networks: this.networks,
    };

    // Add discovery-specific adapter data for reconnection
    // Parent always creates adapterReconstruction, so we can safely extend it
    useStore.setState((state) => ({
      entities: {
        ...state.entities,
        sessions: {
          ...state.entities.sessions,
          [sessionId]: {
            ...state.entities.sessions[sessionId],
            adapterReconstruction: {
              ...state.entities.sessions[sessionId]?.adapterReconstruction,
              discoveryData,
            },
          },
        },
      },
    }));

    this.log('debug', 'Persisted discovery adapter data', { walletId: this.getWalletId(), sessionId });
  }

  /**
   * Get the discovered wallet metadata
   * Returns the QualifiedResponder if available (legacy path), otherwise undefined
   */
  getWalletMetadata(): QualifiedResponder | undefined {
    return this.qualifiedResponder;
  }

  /**
   * Check if this adapter supports a specific chain
   */
  supportsChain(chainType: ChainType): boolean {
    return this.capabilities.chains.some((chainDef) => chainDef.type === chainType);
  }

  /**
   * Get transport config for debugging
   */
  getTransportConfig(): unknown {
    return this.transportConfig;
  }
}
