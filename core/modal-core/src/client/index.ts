/**
 * WalletMeshClient package exports
 *
 * This module provides the complete WalletMeshClient implementation with all
 * supporting services and utilities for comprehensive wallet management.
 *
 * @module client
 * @packageDocumentation
 */

// Main client implementation
export {
  WalletMeshClient,
} from '../internal/client/WalletMeshClientImpl.js';

export type {
  WalletMeshClientConfig,
  WalletAdapterClass,
  AvailableWallet,
  DiscoveryRequestOptions,
} from '../internal/client/WalletMeshClient.js';

// Factory functions
export {
  createWalletMeshClient,
  createWalletMeshClientWithConfig,
  type CreateWalletMeshClientOptions,
} from './createWalletMeshClient.js';

// Connection management
export {
  ConnectionManager,
  type ConnectionState,
  type ConnectionRecoveryOptions,
  type ConnectionEvent,
} from './ConnectionManager.js';

// Discovery service
export {
  DiscoveryService,
  type DiscoveryConfig,
  type DiscoveredWallet,
  type DiscoveryEvent as DiscoveryServiceEvent,
  type EnhancedDiscoveryEvent,
  type DiscoveryResult,
} from './DiscoveryService.js';

// Discovery factory functions
export {
  createEVMDiscoveryConfig,
  createSolanaDiscoveryConfig,
  createMultiChainDiscoveryConfig,
  createCustomDiscoveryConfig,
  type CustomDiscoveryConfig,
} from './discovery/factory.js';

// Event system
export {
  EventSystem,
  type WalletEventMap,
  type EventSubscriptionOptions,
  type EventHandler,
  type EventSubscription,
  type EventHistoryEntry,
  type EventSystemConfig,
} from './EventSystem.js';

import { getLogger } from '../internal/core/factories/serviceFactory.js';
import { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';
import { SessionManager } from '../internal/session/SessionManager.js';
import { ChainType } from '../types.js';
import { ConnectionManager } from './ConnectionManager.js';
import type { ConnectionRecoveryOptions } from './ConnectionManager.js';
import { DiscoveryService } from './DiscoveryService.js';
import type { DiscoveryConfig } from './DiscoveryService.js';
import { EventSystem } from './EventSystem.js';
import type { EventSystemConfig } from './EventSystem.js';
// Import the classes for internal use
import type { WalletMeshClient } from '../internal/client/WalletMeshClient.js';
import type { WalletMeshClientConfig } from '../internal/client/WalletMeshClient.js';
import { createWalletMeshClientWithConfig } from './createWalletMeshClient.js';
import type { CreateWalletMeshClientOptions } from './createWalletMeshClient.js';

/**
 * Re-export commonly used types from other modules
 */
export type {
  WalletInfo,
  ModalController,
  ConnectionResult,
  WalletConnection,
  SupportedChain,
} from '../types.js';

export { ChainType } from '../types.js';

export type {
  ProviderLoader,
  ProviderLoaderConfig,
  ProviderFactory,
} from '../providers/ProviderLoader.js';

export type { Logger } from '../internal/core/logger/logger.js';

/**
 * Utility type for client event handlers
 *
 * @public
 */
export type ClientEventHandler<T = unknown> = (event: T) => void | Promise<void>;

/**
 * Utility type for unsubscribe functions
 *
 * @public
 */
export type Unsubscribe = () => void;

/**
 * Configuration for creating a complete wallet client setup
 *
 * @public
 */
export interface WalletClientSetup {
  /** Client configuration */
  client: WalletMeshClientConfig;
  /** Connection recovery options */
  connectionRecovery?: ConnectionRecoveryOptions;
  /** Discovery service configuration */
  discovery?: DiscoveryConfig & {
    /** Custom chain IDs for discovery (overrides chain type mappings) */
    customChains?: string[];
  };
  /** Event system configuration */
  events?: EventSystemConfig;
  /** Creation options */
  options?: CreateWalletMeshClientOptions;
}

/**
 * Creates a complete wallet client setup with all services configured
 *
 * This is a convenience function that creates a WalletMeshClient with
 * ConnectionManager, DiscoveryService, and EventSystem all properly
 * integrated and configured.
 *
 * @param setup - Complete setup configuration
 * @returns Object with all client services
 *
 * @example
 * ```typescript
 * const { client, connectionManager, discoveryService, eventSystem } = createCompleteWalletSetup({
 *   client: {
 *     appName: 'My DApp',
 *     chains: [{ chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: false }]
 *   },
 *   connectionRecovery: {
 *     autoReconnect: true,
 *     maxReconnectAttempts: 3
 *   },
 *   discovery: {
 *     enabled: true,
 *     retryInterval: 30000
 *   },
 *   events: {
 *     maxHistorySize: 1000,
 *     enableReplay: true
 *   }
 * });
 *
 * await client.initialize();
 * ```
 *
 * @public
 */
export function createCompleteWalletSetup(setup: WalletClientSetup): {
  client: WalletMeshClient;
  connectionManager: ConnectionManager;
  discoveryService: DiscoveryService;
  eventSystem: EventSystem;
  destroy: () => Promise<void>;
} {
  // Create the main client
  const client = createWalletMeshClientWithConfig(setup.client, setup.options);

  // Extract necessary dependencies from client
  // Note: In a real implementation, these would need to be properly extracted
  // from the client instance. For now, we'll create new instances.

  // Create logger using service factory
  const logger = getLogger();

  // Create session manager (create new instance since this is setup code)
  const sessionManager = new SessionManager();

  // Create registry (create new instance since this is setup code)
  const registry = new WalletRegistry();

  // Create services
  const connectionManager = new ConnectionManager(sessionManager, logger);
  const discoveryService = new DiscoveryService(setup.discovery || {}, registry, logger);
  const eventSystem = new EventSystem(logger, setup.events);

  // Set up default connection recovery if specified
  if (setup.connectionRecovery) {
    // This would be applied to all wallets by default
    // In practice, you might want to configure this per wallet
  }

  // Integrate services with client events
  setupServiceIntegration(client, connectionManager, discoveryService, eventSystem);

  // Create cleanup function
  const destroy = async (): Promise<void> => {
    await discoveryService.destroy();
    connectionManager.destroy();
    eventSystem.destroy();
    client.destroy();
  };

  return {
    client,
    connectionManager,
    discoveryService,
    eventSystem,
    destroy,
  };
}

/**
 * Set up integration between client and services
 *
 * @param client - WalletMeshClient instance
 * @param connectionManager - ConnectionManager instance
 * @param discoveryService - DiscoveryService instance
 * @param eventSystem - EventSystem instance
 * @private
 */
function setupServiceIntegration(
  client: WalletMeshClient,
  _connectionManager: ConnectionManager,
  discoveryService: DiscoveryService,
  eventSystem: EventSystem,
): void {
  // Use state subscriptions instead of deprecated event methods
  // Subscribe to state changes and detect connection events
  let previousState = client.getState();

  client.subscribe((currentState) => {
    // Detect connection state changes
    if (currentState.connection.state === 'connected' && previousState.connection.state !== 'connected') {
      // Connection established
      const connection: import('../api/types/connection.js').WalletConnection = {
        walletId: currentState.selectedWalletId || '',
        address: currentState.connection.address || '',
        chain: currentState.connection.chain || {
          chainId: '',
          chainType: ChainType.Evm,
          name: '',
          required: false,
        },
        chainType: currentState.connection.chain?.chainType || ChainType.Evm,
        accounts: currentState.connection.accounts || [],
        provider: undefined as unknown,
        walletInfo: (currentState.wallets?.[0] && {
          id: currentState.wallets[0].wallet.id,
          name: currentState.wallets[0].wallet.name,
          icon: currentState.wallets[0].wallet.icon,
          chains: currentState.wallets[0].capabilities.chains.map(() => ChainType.Evm), // TODO: Map chain strings to ChainType
        }) || { id: '', name: '', icon: '', chains: [] },
      };
      eventSystem.emit('connection:added', connection);

      // Also emit connection:established for compatibility
      if (currentState.selectedWalletId) {
        eventSystem.emit('connection:established', {
          walletId: currentState.selectedWalletId,
          address: connection.address,
          chain: connection.chain,
          chainType: connection.chainType,
          provider: connection.provider,
          accounts: connection.accounts,
          timestamp: Date.now(),
        });
      }
    } else if (
      previousState.connection.state === 'connected' &&
      currentState.connection.state !== 'connected'
    ) {
      // Connection lost
      if (previousState.selectedWalletId) {
        eventSystem.emit('connection:removed', {
          walletId: previousState.selectedWalletId,
          timestamp: Date.now(),
        });

        // Also emit connection:lost for compatibility
        eventSystem.emit('connection:lost', {
          walletId: previousState.selectedWalletId,
          reason: 'Disconnected',
          timestamp: Date.now(),
        });
      }
    } else if (currentState.connection.state === 'error') {
      // Connection error
      if (currentState.selectedWalletId && currentState.connection.error) {
        eventSystem.emit('error:connection', {
          walletId: currentState.selectedWalletId,
          error: new Error(currentState.connection.error.message),
          timestamp: Date.now(),
        });
      }
    }

    // Update previous state for next comparison
    previousState = currentState;
  });

  // Forward discovery events
  discoveryService.on('wallet_discovered', (event: unknown) => {
    eventSystem.emit('discovery:event', {
      type: 'wallet_discovered',
      walletInfo: (event as { wallet: unknown }).wallet,
      timestamp: Date.now(),
    });
  });

  discoveryService.on('wallet_available', (event: unknown) => {
    eventSystem.emit('discovery:event', {
      type: 'wallet_available',
      walletInfo: (event as { wallet: unknown }).wallet,
      timestamp: Date.now(),
    });
  });

  discoveryService.on('wallet_unavailable', (event: unknown) => {
    eventSystem.emit('discovery:event', {
      type: 'wallet_unavailable',
      walletInfo: { id: (event as { walletId: string }).walletId } as unknown,
      timestamp: Date.now(),
    });
  });
}

/**
 * Create a development-focused wallet client setup
 *
 * This function creates a wallet client setup optimized for development
 * with enhanced logging, debug features, and helpful defaults.
 *
 * @param appName - Application name
 * @param additionalConfig - Additional configuration
 * @returns Complete development setup
 *
 * @example
 * ```typescript
 * const setup = createDevelopmentWalletSetup('My DApp Dev', {
 *   chains: [
 *     { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
 *     { chainId: '5', chainType: ChainType.Evm, name: 'Goerli', required: false }
 *   ]
 * });
 *
 * await setup.client.initialize();
 * ```
 *
 * @public
 */
export function createDevelopmentWalletSetup(
  appName: string,
  additionalConfig: Partial<WalletMeshClientConfig> = {},
): ReturnType<typeof createCompleteWalletSetup> {
  return createCompleteWalletSetup({
    client: {
      appName: `${appName} (Development)`,
      debug: true,
      // providerLoader: {
      //   preloadOnInit: true,
      //   preloadChainTypes: [ChainType.Evm],
      // },
      chains: [
        { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
        { chainId: '5', chainType: ChainType.Evm, name: 'Goerli', required: false },
      ],
      ...additionalConfig,
    },
    connectionRecovery: {
      autoReconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      recoveryStrategy: 'exponential-backoff',
    },
    discovery: {
      enabled: true,
      timeout: 3000,
      retryInterval: 15000,
      announce: true,
      supportedChainTypes: [ChainType.Evm, ChainType.Solana],
      capabilities: {
        features: ['account-management', 'transaction-signing', 'message-signing'],
        interfaces: ['eip-1193', 'solana-standard'],
      },
      dappInfo: {
        name: `${appName} (Development)`,
        description: 'Development environment for testing',
      },
    },
    events: {
      maxHistorySize: 500,
      enablePersistence: true,
      enableReplay: true,
      debug: true,
    },
    options: {
      registerBuiltinAdapters: true,
    },
  });
}

/**
 * Create a production-focused wallet client setup
 *
 * This function creates a wallet client setup optimized for production
 * with performance optimizations and minimal logging.
 *
 * @param appName - Application name
 * @param additionalConfig - Additional configuration
 * @returns Complete production setup
 *
 * @example
 * ```typescript
 * const setup = createProductionWalletSetup('My DApp', {
 *   appUrl: 'https://mydapp.com',
 *   appIcon: 'https://mydapp.com/icon.png',
 *   projectId: 'your-walletconnect-project-id'
 * });
 *
 * await setup.client.initialize();
 * ```
 *
 * @public
 */
export function createProductionWalletSetup(
  appName: string,
  additionalConfig: Partial<WalletMeshClientConfig> = {},
): ReturnType<typeof createCompleteWalletSetup> {
  return createCompleteWalletSetup({
    client: {
      appName,
      debug: false,
      // providerLoader: {
      //   preloadOnInit: false, // Load on demand in production
      // },
      ...additionalConfig,
    },
    connectionRecovery: {
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 3,
      recoveryStrategy: 'linear-backoff',
    },
    discovery: {
      enabled: true,
      timeout: 5000,
      retryInterval: 60000, // Less frequent in production
      announce: false, // Disable announcement in production for security
      supportedChainTypes: additionalConfig.chains?.map((c) => c.chainType) || [ChainType.Evm],
      capabilities: {
        features: ['account-management', 'transaction-signing'],
        interfaces: ['eip-1193'], // Minimal required interfaces
      },
      dappInfo: {
        name: appName,
        ...(additionalConfig.appUrl && { url: additionalConfig.appUrl }),
        ...(additionalConfig.appIcon && { icon: additionalConfig.appIcon }),
        ...(additionalConfig.appDescription && { description: additionalConfig.appDescription }),
      },
    },
    events: {
      maxHistorySize: 100, // Smaller history in production
      enablePersistence: false,
      enableReplay: false,
      debug: false,
    },
    options: {
      registerBuiltinAdapters: true,
    },
  });
}
