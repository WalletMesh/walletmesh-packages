/**
 * Factory function for creating WalletMeshClient instances
 *
 * This module provides a convenient factory function for creating and configuring
 * WalletMeshClient instances with all necessary dependencies.
 *
 * @module client/createWalletMeshClient
 * @packageDocumentation
 */

import type { InternalWalletMeshClient, WalletMeshConfig } from '../internal/client/WalletMeshClient.js';
import { WalletMeshClient as WalletMeshClientImpl } from '../internal/client/WalletMeshClientImpl.js';
import type { Logger } from '../internal/core/logger/logger.js';
import { createDebugLogger } from '../internal/core/logger/logger.js';
import type { ModalController, WalletInfo } from '../types.js';
import { ChainType } from '../types.js';
import type {
  WalletMeshClient as PublicWalletMeshClient,
  WalletMeshClientConfig,
} from './WalletMeshClient.js';

import { createModal } from '../api/core/modal.js';
import { isServer } from '../api/utilities/ssr.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import { createComponentServices } from '../internal/core/factories/serviceFactory.js';
import { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';

import type { WalletAdapter } from '../internal/wallets/base/WalletAdapter.js';
// Import built-in adapters
import { EvmAdapter } from '../internal/wallets/evm/EvmAdapter.js';

/**
 * Options for creating a WalletMeshClient
 *
 * @public
 */
export interface CreateWalletMeshClientOptions {
  /** Whether to force SSR mode */
  ssr?: boolean;
  /** Custom registry instance to use */
  registry?: WalletRegistry;
  /** Custom modal controller to use */
  modal?: ModalController;
  /** Custom logger instance to use */
  logger?: Logger;
  /** Whether to register built-in adapters */
  registerBuiltinAdapters?: boolean;
}

/**
 * Creates a new WalletMeshClient instance with full configuration control
 *
 * This factory function handles the creation and configuration of:
 * - WalletRegistry with built-in adapters
 * - Modal controller with framework adapter
 * - Logger and error handling
 * - ProviderLoader for lazy loading
 * - Event system integration
 *
 * @param config - Full configuration for the WalletMeshClient
 * @param options - Optional creation options
 * @returns A fully configured WalletMeshClient instance
 * @throws If configuration is invalid or creation fails
 *
 * @example
 * ```typescript
 * // Full configuration
 * const client = createWalletMeshClientWithConfig({
 *   appName: 'My DApp',
 *   appDescription: 'A decentralized application',
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' }
 *   ],
 *   providerLoader: {
 *     preloadOnInit: true,
 *     preloadChainTypes: ['evm', 'solana']
 *   },
 *   discovery: {
 *     enabled: true,
 *     timeout: 5000
 *   }
 * }, {
 *   registerBuiltinAdapters: true
 * });
 * ```
 *
 * @example
 * ```typescript
 * // SSR-safe usage
 * const client = createWalletMeshClientWithConfig({
 *   appName: 'My DApp'
 * }, {
 *   ssr: true // Will return SSR-safe controller in server environment
 * });
 * ```
 *
 * @public
 */
export function createWalletMeshClientWithConfig(
  config: WalletMeshClientConfig,
  options: CreateWalletMeshClientOptions = {},
): PublicWalletMeshClient {
  // Create services for logging
  const services = createComponentServices('WalletMeshClient');
  let logger = options.logger || services.logger;

  // Configure logger based on config.logger settings
  if (config.logger) {
    const debugMode = config.logger.debug ?? config.debug ?? false;
    const prefix = config.logger.prefix ?? 'WalletMeshClient';
    logger = createDebugLogger(prefix, debugMode);

    // Set log level if specified
    if (config.logger.level) {
      const levelMap = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };
      logger.setLevel(levelMap[config.logger.level]);
    }
  }

  logger.debug('Creating WalletMeshClient', { config, options });

  // Validate configuration
  if (!config.appName) {
    throw ErrorFactory.configurationError('appName is required in WalletMeshClient configuration');
  }

  // Check if we should use SSR mode
  const shouldUseSSR = options.ssr || isServer();
  logger.debug('SSR mode check', { shouldUseSSR, isServer: isServer() });

  if (shouldUseSSR) {
    logger.info('SSR environment detected - returning SSR-safe controller');
    // For SSR, we need to return a client that implements the same interface
    // but provides safe no-op implementations
    return createSSRSafeClient(config, logger);
  }

  // Create or use provided registry
  const registry = options.registry || new WalletRegistry();

  // Register built-in adapters if requested
  if (options.registerBuiltinAdapters !== false) {
    registerBuiltinAdapters(registry, config, logger);
  }

  // Register custom adapters if provided
  let customAdapters: Array<WalletAdapter | unknown> | undefined;

  // Handle both new array format and old custom format
  if (Array.isArray(config.wallets)) {
    // Direct array of adapters/classes (unless it's WalletInfo[])
    const firstItem = config.wallets[0];
    if (
      firstItem &&
      (typeof firstItem === 'function' ||
        (typeof firstItem === 'object' && 'id' in firstItem && 'metadata' in firstItem))
    ) {
      customAdapters = config.wallets as Array<WalletAdapter | unknown>;
    }
  } else if (config.wallets && typeof config.wallets === 'object' && 'custom' in config.wallets) {
    customAdapters = (config.wallets as { custom: Array<WalletAdapter | unknown> }).custom;
  }

  if (customAdapters && Array.isArray(customAdapters)) {
    logger.debug('Registering custom adapters', {
      count: customAdapters.length,
    });

    for (const adapterOrClass of customAdapters) {
      // Check if it's a class (has getWalletInfo static method) or an instance
      if (typeof adapterOrClass === 'function' && 'getWalletInfo' in adapterOrClass) {
        // It's a class - get wallet info without instantiation
        const walletInfo = (adapterOrClass as { getWalletInfo(): WalletInfo }).getWalletInfo();
        logger.debug('Registering wallet adapter class', {
          id: walletInfo.id,
          name: walletInfo.name,
          chains: walletInfo.chains,
        });

        // Store the class for lazy instantiation
        // The registry will instantiate when needed
        registry.registerClass(adapterOrClass as never, walletInfo);
      } else if (typeof adapterOrClass === 'object' && adapterOrClass !== null && 'id' in adapterOrClass) {
        // It's an instance - register directly (backward compatibility)
        const adapter = adapterOrClass as WalletAdapter;
        registry.register(adapter);
        logger.debug('Registered custom adapter instance', {
          id: adapter.id,
          name: adapter.metadata.name,
          chains: adapter.capabilities.chains.map((c) => c.type),
        });
      }
    }
  }

  // Determine wallets for modal
  const walletsForModal = getWalletsForModal(config, registry, logger);

  // Modal is now headless - no adapter needed

  // Create the WalletMeshClient (convert config to internal format)
  const internalConfig = {
    appName: config.appName,
    appDescription: config.appDescription,
    appUrl: config.appUrl,
    appIcon: config.appIcon,
    projectId: config.projectId,
    chains: config.chains as never, // Type differences between public/internal APIs
    wallets: config.wallets,
    debug: config.debug,
  } as WalletMeshConfig;
  // Create modal controller now that we have the client structure
  let modal = options.modal;

  if (!modal) {
    // Create a placeholder client that will be updated later
    const placeholderClient = {} as InternalWalletMeshClient;
    modal = createModal({
      wallets: walletsForModal,
      client: placeholderClient,
    });
  }

  const client = new WalletMeshClientImpl(internalConfig, registry, modal as never, logger);

  // Now update the modal with the actual client reference if we created it
  if (!options.modal && typeof modal === 'object' && modal !== null && 'client' in modal) {
    const modalWithClient = modal as { client: InternalWalletMeshClient };
    modalWithClient.client = client as InternalWalletMeshClient;
  }

  logger.debug('WalletMeshClient created successfully', {
    registeredWallets: registry.getAllAdapters().length,
    modalWallets: walletsForModal.length,
    hasDiscovery: config.discovery?.enabled !== false,
  });

  return client as never;
}

/**
 * Creates an SSR-safe client that provides no-op implementations
 *
 * @param config - Client configuration
 * @param logger - Logger instance
 * @returns SSR-safe client implementation
 * @private
 */
function createSSRSafeClient(_config: WalletMeshClientConfig, logger: Logger): PublicWalletMeshClient {
  logger.debug('Creating SSR-safe client');

  // Create a proxy that implements the WalletMeshClient interface
  // but provides safe no-op implementations for all methods
  return new Proxy({} as PublicWalletMeshClient, {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'string') {
        switch (prop) {
          case 'initialize':
            return async () => {
              logger.debug('SSR: initialize() called - no-op');
            };

          case 'connect':
            return async () => {
              logger.warn('SSR: connect() called - returning mock connection');
              return createMockConnection();
            };

          case 'disconnect':
          case 'disconnectAll':
            return async () => {
              logger.debug(`SSR: ${prop}() called - no-op`);
            };

          case 'switchChain':
            return async () => {
              logger.warn('SSR: switchChain() called - returning mock result');
              return {
                provider: null,
                chainType: 'evm' as const,
                chainId: '1',
                previousChainId: '1',
              };
            };

          case 'getConnection':
          case 'getWallet':
            return () => undefined;

          case 'getConnections':
          case 'getAllConnections':
          case 'getAllWallets':
            return () => [];

          case 'discoverWallets':
            return async () => {
              logger.debug('SSR: discoverWallets() called - returning empty array');
              return [];
            };

          case 'openModal':
            return async () => {
              logger.debug('SSR: openModal() called - no-op');
            };

          case 'closeModal':
          case 'destroy':
            return () => {
              logger.debug(`SSR: ${prop}() called - no-op`);
            };

          case 'isConnected':
            return false;

          case 'getActiveWallet':
            return () => null;

          case 'setActiveWallet':
            return () => {
              logger.debug(`SSR: ${prop}() called - no-op`);
            };

          case 'getMaxConnections':
            return () => 5;

          case 'getState':
            return () => ({
              connection: { state: 'idle' },
              wallets: [],
              isOpen: false,
            });

          case 'subscribe':
          case 'on':
          case 'once':
            return () => () => {}; // Return unsubscribe function

          case 'getActions':
            return () => ({
              openModal: () => {},
              closeModal: () => {},
              selectWallet: async () => {},
              connect: async () => {},
              disconnect: async () => {},
              retry: async () => {},
            });

          default:
            logger.debug(`SSR: Unknown property ${prop} accessed - returning undefined`);
            return undefined;
        }
      }
      return undefined;
    },
  });
}

/**
 * Creates a mock connection for SSR environments
 *
 * @returns Mock wallet connection
 * @private
 */
function createMockConnection() {
  return {
    walletId: 'ssr-mock',
    address: '0x0000000000000000000000000000000000000000',
    accounts: ['0x0000000000000000000000000000000000000000'],
    chainId: '1',
    chainType: 'evm' as const,
    provider: null,
    walletInfo: {
      id: 'ssr-mock',
      name: 'SSR Mock Wallet',
      icon: '',
      description: 'Mock wallet for SSR environments',
      chains: ['evm' as const],
    },
  };
}

/**
 * Registers built-in wallet adapters with the registry
 *
 * @param registry - Wallet registry to register adapters with
 * @param config - Client configuration
 * @param logger - Logger instance
 * @private
 */
function registerBuiltinAdapters(
  registry: WalletRegistry,
  config: WalletMeshClientConfig,
  logger: Logger,
): void {
  logger.debug('Registering built-in adapters');

  // Create default adapters
  const defaultAdapters = [
    new EvmAdapter(),
    // Additional built-in adapters can be added here
  ];

  // Apply wallet filters if config.wallets is a configuration object
  let adaptersToRegister = defaultAdapters;

  if (!Array.isArray(config.wallets)) {
    const walletConfig = config.wallets;

    if (walletConfig?.filter) {
      adaptersToRegister = adaptersToRegister.filter(walletConfig.filter);
      logger.debug('Applied wallet filter', {
        originalCount: defaultAdapters.length,
        filteredCount: adaptersToRegister.length,
      });
    }

    if (walletConfig?.include) {
      adaptersToRegister = adaptersToRegister.filter(
        (adapter) => walletConfig.include?.includes(adapter.id) ?? false,
      );
      logger.debug('Applied wallet include filter', {
        includeList: walletConfig.include,
        filteredCount: adaptersToRegister.length,
      });
    }

    if (walletConfig?.exclude) {
      adaptersToRegister = adaptersToRegister.filter(
        (adapter) => !(walletConfig.exclude?.includes(adapter.id) ?? false),
      );
      logger.debug('Applied wallet exclude filter', {
        excludeList: walletConfig.exclude,
        filteredCount: adaptersToRegister.length,
      });
    }
  }

  // Register the filtered adapters
  for (const adapter of adaptersToRegister) {
    registry.register(adapter);
    logger.debug('Registered adapter', {
      id: adapter.id,
      name: adapter.metadata.name,
    });
  }

  logger.info('Built-in adapters registered', {
    count: adaptersToRegister.length,
    adapters: adaptersToRegister.map((a) => a.id),
  });
}

/**
 * Determines the wallet list for modal based on configuration
 *
 * @param config - Client configuration
 * @param registry - Wallet registry
 * @param logger - Logger instance
 * @returns Array of wallet info for modal
 * @private
 */
function getWalletsForModal(
  config: WalletMeshClientConfig,
  registry: WalletRegistry,
  logger: Logger,
): WalletInfo[] {
  if (Array.isArray(config.wallets)) {
    // Check if it's a WalletInfo array (has id and chains properties)
    const firstItem = config.wallets[0];
    if (firstItem && typeof firstItem === 'object' && 'id' in firstItem && 'chains' in firstItem) {
      // Direct wallet info array provided
      const walletInfos = config.wallets as WalletInfo[];
      logger.debug('Using direct wallet info from config', {
        walletCount: walletInfos.length,
        walletIds: walletInfos.map((w) => w.id),
      });
      return walletInfos;
    }
    // Otherwise it's an array of adapters/classes, fall through to use registry
  }

  // Get wallet info from registry (includes non-instantiated classes)
  const walletsForModal = registry.getAllWalletInfo();

  // Apply ordering if specified
  if (!Array.isArray(config.wallets) && config.wallets?.order) {
    const order = config.wallets.order;
    walletsForModal.sort((a, b) => {
      const aIndex = order.indexOf(a.id);
      const bIndex = order.indexOf(b.id);

      // Items in order list come first
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;

      // Items not in order list maintain relative order
      return 0;
    });

    logger.debug('Applied wallet ordering', {
      order,
      finalOrder: walletsForModal.map((w) => w.id),
    });
  }

  logger.debug('Generated wallet list for modal', {
    count: walletsForModal.length,
    wallets: walletsForModal.map((w) => ({ id: w.id, name: w.name })),
  });

  return walletsForModal;
}

/**
 * Creates a WalletMeshClient instance with sensible defaults
 *
 * This is a convenience function that provides commonly used configurations
 * for typical dApp scenarios.
 *
 * @param appName - Name of the application
 * @param additionalConfig - Additional configuration options
 * @returns Configured WalletMeshClient instance
 *
 * @example
 * ```typescript
 * // Quick setup for development
 * const client = createWalletMeshClient('My DApp', {
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *     { chainId: '137', chainType: 'evm', name: 'Polygon' }
 *   ]
 * });
 * ```
 *
 * @public
 */
export function createWalletMeshClient(
  appName: string,
  additionalConfig: Partial<WalletMeshClientConfig> = {},
): PublicWalletMeshClient {
  const finalConfig: WalletMeshClientConfig = {
    appName,
    appDescription: additionalConfig.appDescription || `${appName} - Web3 Application`,
    debug: process.env['NODE_ENV'] === 'development',
    providerLoader: {
      preloadOnInit: true,
      preloadChainTypes: [ChainType.Evm],
      ...additionalConfig.providerLoader,
    },
    discovery: {
      enabled: true,
      timeout: 5000,
      retryInterval: 30000,
      ...additionalConfig.discovery,
    },
    chains: additionalConfig.chains || [
      { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum', required: false },
    ],
    ...additionalConfig,
  };

  return createWalletMeshClientWithConfig(finalConfig, {
    registerBuiltinAdapters: true,
  });
}
