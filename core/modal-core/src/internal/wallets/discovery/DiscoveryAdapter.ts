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
  readonly id: string;
  readonly metadata: WalletAdapterMetadata;
  readonly capabilities: WalletCapabilities;

  private qualifiedResponder: QualifiedResponder;
  private connectionManager: DiscoveryConnectionManager;
  private config: DiscoveryAdapterConfig;

  constructor(
    qualifiedResponder: unknown,
    connectionManager: DiscoveryConnectionManager,
    config: DiscoveryAdapterConfig = {},
  ) {
    super();

    // Validate the qualified responder data
    let validatedResponder: QualifiedResponder;
    try {
      validatedResponder = validateQualifiedResponder(qualifiedResponder);
    } catch (error) {
      throw ErrorFactory.configurationError('Invalid discovery response data', {
        originalError: error,
        responderId: (qualifiedResponder as { responderId?: string })?.responderId,
      });
    }

    // Initialize required properties with validated data
    this.id = `discovery-${validatedResponder.responderId}`;

    // Map discovery technologies to modal-core chain types
    const chainTypes = mapDiscoveryTechnologiesToChainTypes(
      validatedResponder.matched.required.technologies || [],
    );

    // Extract description from validated metadata
    const description = validatedResponder.metadata?.['description'] || `${validatedResponder.name} wallet`;

    this.metadata = {
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

    this.capabilities = {
      chains: chainDefinitions,
      features,
    };

    this.qualifiedResponder = validatedResponder;
    this.connectionManager = connectionManager;
    this.config = config;
  }

  /**
   * Detect if discovery wallet is available
   */
  async detect(): Promise<DetectionResult> {
    // For discovery protocol adapters, availability is determined by the responder
    return {
      isInstalled: true,
      isReady: this.qualifiedResponder !== null,
      metadata: {
        type: 'discovery',
        responder: this.qualifiedResponder,
        connectionManager: this.connectionManager,
      },
    };
  }

  /**
   * Connect to the wallet using the discovery protocol
   */
  async connect(options?: ConnectOptions): Promise<WalletConnection> {
    try {
      (this.logger?.info || this.logger?.debug || console.info).call(this.logger, 'DiscoveryAdapter.connect invoked', {
        responderId: this.qualifiedResponder.responderId,
        transportType: (this.qualifiedResponder.transportConfig as any)?.type,
      });
      // Use discovery protocol's ConnectionManager to establish connection
      // Convert chains from ConnectOptions format to string array
      const requestedChains = options?.chains
        ? options.chains.map((c) => `${c.type}:${c.chainId || '*'}`)
        : this.getTechnologyChains();

      const connection = await this.connectionManager.connect(this.qualifiedResponder, {
        requestedChains,
        requestedPermissions: ['accounts', 'sign-transactions'],
      });

      // Validate accounts from connection response
      let validatedAccounts: ValidatedDiscoveryAccount[];
      try {
        validatedAccounts = validateDiscoveryAccounts(connection.accounts);
      } catch (error) {
        throw ErrorFactory.connectionFailed('Invalid account data received from wallet', {
          originalError: error,
          walletId: this.qualifiedResponder.responderId,
        });
      }

      // Create transport based on transport config
      this.transport = await this.createTransportFromConfig();

      // Create appropriate provider based on chains
      await this.createProviders();

      // Get chain type from technologies
      const chainType = this.getChainTypeFromTechnologies();
      const firstAccount = validatedAccounts[0];
      const chainId = firstAccount?.chainId || '1'; // Default to mainnet

      // Create wallet connection object
      const walletConnection: WalletConnection = {
        walletId: this.qualifiedResponder.responderId,
        address: firstAccount?.address || '',
        accounts: validatedAccounts.map((account) => account.address),
        chain: {
          chainId,
          chainType,
          name: 'Unknown Chain',
          required: false,
        },
        chainType,
        provider: null, // Will be set after creating providers
        walletInfo: {
          id: this.qualifiedResponder.responderId,
          name: this.qualifiedResponder.name,
          icon: this.qualifiedResponder.icon,
          chains: [chainType],
        },
      };

      // Connection state is managed by base class

      // Base class will handle events

      (this.logger?.info || this.logger?.debug || console.info).call(this.logger, 'DiscoveryAdapter.connect completed', {
        walletId: walletConnection.walletId,
        chainType: walletConnection.chainType,
      });
      return walletConnection;
    } catch (error) {
      const originalError = error instanceof Error ? error : new Error(String(error));

      this.logger?.error('Discovery adapter connection failed', {
        walletId: this.qualifiedResponder.responderId,
        message: originalError.message,
        stack: originalError.stack,
      });

      throw ErrorFactory.connectionFailed(originalError.message, {
        walletId: this.qualifiedResponder.responderId,
        originalError,
      });
    }
  }

  /**
   * Get default chains based on technologies
   */
  private getTechnologyChains(): string[] {
    const chains: string[] = [];
    const technologies = this.qualifiedResponder.matched?.required?.technologies || [];

    for (const tech of technologies) {
      switch (tech.type) {
        case 'evm':
          chains.push('eip155:1'); // Default to mainnet
          break;
        case 'solana':
          chains.push('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp');
          break;
        case 'aztec':
          chains.push('aztec:mainnet');
          break;
      }
    }

    return chains;
  }

  /**
   * Get chain type from technologies
   */
  private getChainTypeFromTechnologies(): ChainType {
    const technologies = this.qualifiedResponder.matched?.required?.technologies || [];

    // Return the first technology's chain type
    if (technologies.length > 0) {
      const firstTech = technologies[0];
      if (!firstTech) return ChainType.Evm;
      switch (firstTech.type) {
        case 'evm':
          return ChainType.Evm;
        case 'solana':
          return ChainType.Solana;
        case 'aztec':
          return ChainType.Aztec;
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
    // Check if there's network information in the responder metadata
    const metadata = this.qualifiedResponder.metadata;
    if (metadata && typeof metadata === 'object' && 'aztecNetwork' in metadata) {
      const network = metadata.aztecNetwork;
      if (typeof network === 'string') {
        return network.startsWith('aztec:') ? network : `aztec:${network}`;
      }
    }

    // Fall back to extracting from technology chains
    const chains = this.getTechnologyChains();
    const aztecChain = chains.find((chain) => chain.startsWith('aztec:'));
    if (aztecChain) {
      return aztecChain;
    }

    // Final fallback: use mainnet as the sensible production default
    return 'aztec:mainnet';
  }

  /**
   * Disconnect from the wallet
   */
  async disconnect(): Promise<void> {
    try {
      // Disconnect via ConnectionManager
      await this.connectionManager.disconnect(this.qualifiedResponder.responderId);

      // Clean up transport
      if (this.transport && 'disconnect' in this.transport) {
        await this.transport.disconnect();
      }

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
    const transportConfig = this.qualifiedResponder.transportConfig;

    if (!transportConfig) {
      throw ErrorFactory.configurationError('No transport configuration provided by wallet');
    }

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
      ...transportConfig.adapterConfig,
    };

    let transport: Transport;
    (this.logger?.info || this.logger?.debug || console.info).call(this.logger, 'DiscoveryAdapter: selecting transport', {
      walletId: this.qualifiedResponder.responderId,
      type: (transportConfig as any)?.type,
      hasUrl: Boolean((transportConfig as any)?.url),
      hasWebsocketUrl: Boolean((transportConfig as any)?.websocketUrl),
      extensionId: (transportConfig as any)?.extensionId,
    });

    // Select transport strictly from supported types
    switch ((transportConfig as any).type) {
      case 'extension':
        if (!transportConfig.extensionId) {
          throw ErrorFactory.configurationError('Extension ID required for Chrome extension transport');
        }
        baseConfig['extensionId'] = transportConfig.extensionId;
        transport = createTransport(TransportType.Extension, baseConfig);
        break;

      case 'websocket':
        if (!(transportConfig as any).url && !(transportConfig as any).websocketUrl) {
          throw ErrorFactory.configurationError('WebSocket URL required for WebSocket transport');
        }
        baseConfig['url'] = (transportConfig as any).url ?? (transportConfig as any).websocketUrl;
        // Map to Popup transport as a placeholder until WebSocket transport exists
        transport = createTransport(TransportType.Popup, baseConfig);
        break;

      case 'injected':
        // Injected wallets don't use discovery transports; treat as unsupported in this path
        throw ErrorFactory.configurationError('Injected wallets do not use transports');

      default:
        throw ErrorFactory.configurationError(`Unsupported transport type: ${transportConfig.type}`);
    }

    try {
      (this.logger?.info || this.logger?.debug || console.info).call(this.logger, 'DiscoveryAdapter: connecting transport', {
        walletId: this.qualifiedResponder.responderId,
        type: (transportConfig as any)?.type,
      });
      await transport.connect();
      (this.logger?.info || this.logger?.debug || console.info).call(this.logger, 'DiscoveryAdapter: transport connected', {
        walletId: this.qualifiedResponder.responderId,
      });
    } catch (error) {
      const connectError =
        error instanceof Error ? error : new Error(`Failed to connect transport: ${String(error)}`);
      // Provide clearer guidance for extension lastError cases
      const message = connectError.message?.includes('Receiving end does not exist')
        ? 'Extension not reachable. Ensure it is installed and allows this origin.'
        : connectError.message;
      throw ErrorFactory.connectionFailed(connectError.message, {
        walletId: this.qualifiedResponder.responderId,
        transportType: transportConfig.type,
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
          // Priority: 1) Negotiated chains, 2) Default from getTechnologyChains(), 3) Fail
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
          (this.logger?.info || this.logger?.debug || console.info).call(this.logger, 'DiscoveryAdapter: connecting Aztec adapter', {
            walletId: this.id,
            transportType: (this.qualifiedResponder.transportConfig as any)?.type,
            network: aztecNetwork,
          });
          // Connect the adapter to establish the provider
          await aztecAdapter.connect();
          this.logger?.debug('DiscoveryAdapter: Aztec adapter connected', {
            walletId: this.id,
            network: aztecNetwork,
          });
          // Store the provider from the adapter
          const aztecProvider = aztecAdapter.getProvider(ChainType.Aztec);
          if (aztecProvider) {
            this.providers.set(ChainType.Aztec, aztecProvider);
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

    // Only support technology-based matches
    if (this.qualifiedResponder.matched?.required?.technologies) {
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
   * Get the discovered wallet metadata
   */
  getWalletMetadata(): QualifiedResponder {
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
  getTransportConfig(): typeof this.qualifiedResponder.transportConfig {
    return this.qualifiedResponder.transportConfig;
  }
}
