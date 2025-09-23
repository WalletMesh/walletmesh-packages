import type {
  CreateWalletMeshOptions,
  WalletConfig,
  WalletMeshClient,
  WalletMeshConfig,
} from '../../internal/client/WalletMeshClient.js';
import type { ModalController, SupportedChain, WalletInfo } from '../../types.js';

// Re-export types that are part of the public API
export type { WalletMeshClient, CreateWalletMeshOptions, WalletMeshConfig };
import { WalletMeshClient as WalletMeshClientImpl } from '../../internal/client/WalletMeshClientImpl.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { createComponentServices } from '../../internal/core/factories/serviceFactory.js';
import { modalLogger } from '../../internal/core/logger/globalLogger.js';
import { WalletRegistry } from '../../internal/registries/wallets/WalletRegistry.js';
import { createModal } from '../core/modal.js';
import { createSSRController, isServer } from '../utilities/ssr.js';

// Import built-in adapters (non-Aztec to avoid bundling issues)
import { EvmAdapter } from '../../internal/wallets/evm/EvmAdapter.js';
// SolanaAdapter is not imported by default - can be added via config.wallets.custom
// DebugWallet is not imported by default - import from '@walletmesh/modal-core' to use it for testing
// AztecExampleWalletAdapter is not imported by default - loaded only when needed for Aztec dApps

// Import WalletAdapter interface
import type { WalletAdapter } from '../../internal/wallets/base/WalletAdapter.js';

// Cache to prevent duplicate initialization and improve performance
// Use a Map with content-based keys since WeakMap requires object references
const clientCache = new Map<string, WalletMeshClient>();

// Create a stable cache key from config content
function createConfigCacheKey(config: WalletMeshConfig): string {
  return JSON.stringify({
    appName: config.appName,
    appDescription: config.appDescription,
    appUrl: config.appUrl,
    appIcon: config.appIcon,
    chains: config.chains,
    wallets: config.wallets,
    debug: config.debug,
    projectId: config.projectId,
  });
}

/**
 * Creates a new WalletMesh client instance for managing wallet connections.
 *
 * This is the primary entry point for integrating WalletMesh into your dApp.
 * The client handles wallet discovery, connection management, and provides
 * a unified interface for interacting with multiple blockchain wallets.
 *
 * @param config - Configuration options for the client
 * @param config.appName - Required: Your application's display name shown in wallet prompts
 * @param config.appDescription - Optional: Brief description of your application (recommended)
 * @param config.appUrl - Optional: Your application's URL for wallet verification
 * @param config.appIcon - Optional: Icon URL or base64 data URI (recommended 256x256px square)
 * @param config.projectId - Optional: WalletConnect project ID for WalletConnect integration
 * @param config.wallets - Optional: Wallet configuration - either direct {@link WalletInfo} array or {@link WalletConfig} filtering
 *                        Note: DebugWallet is not included by default. To add it for testing, see examples below.
 * @param config.chains - Optional: Array of {@link SupportedChain} objects defining supported blockchains
 * @param config.debug - Optional: Enable debug logging for troubleshooting
 *
 * @param options - Optional creation options
 * @param options.ssr - Force SSR mode (auto-detected by default). When true, returns a no-op client safe for server rendering
 * @param options.debug - Additional debug logging (overrides config.debug if provided)
 *
 * @returns Promise that resolves to a fully initialized {@link WalletMeshClient} instance with comprehensive wallet management capabilities:
 *   - **Connection Management**: `connect()`, `disconnect()`, `disconnectAll()`
 *   - **Chain Management**: `switchChain()` for cross-chain operations
 *   - **State Observation**: `subscribe()` for reactive state updates
 *   - **Service Access**: `getServices()` for business logic operations
 *   - **Modal Control**: `openModal()`, `closeModal()` for UI management
 *
 * @throws {ModalError} If required configuration is missing (e.g., appName)
 *
 * @example
 * ```typescript
 * // Basic setup with minimal configuration
 * const client = await createWalletMesh({
 *   appName: 'My dApp',
 *   appDescription: 'Decentralized trading platform',
 *   appUrl: 'https://mydapp.com',
 *   appIcon: 'https://mydapp.com/icon.png'
 * });
 *
 * // Connect to any available wallet
 * const connection = await client.connect();
 * console.log('Connected:', connection.walletId, connection.address);
 * ```
 *
 * @example
 * ```typescript
 * // Advanced multi-chain setup with wallet filtering
 * const client = await createWalletMesh({
 *   appName: 'CrossChain dApp',
 *   wallets: {
 *     // Only show specific wallets
 *     include: ['metamask', 'phantom', 'walletconnect'],
 *     // Custom display order
 *     order: ['metamask', 'phantom', 'walletconnect'],
 *     // Filter by capabilities
 *     filter: (adapter) => adapter.capabilities.multiChain
 *   },
 *   chains: [
 *     {
 *       chainId: 'eip155:1',
 *       chainType: ChainType.Evm,
 *       name: 'Ethereum',
 *       required: true,
 *       interfaces: ['eip-1193', 'eip-6963']
 *     },
 *     {
 *       chainId: 'eip155:137',
 *       chainType: ChainType.Evm,
 *       name: 'Polygon',
 *       required: false
 *     },
 *     {
 *       chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
 *       chainType: ChainType.Solana,
 *       name: 'Solana',
 *       required: false,
 *       interfaces: ['solana-standard-wallet']
 *     }
 *   ],
 *   supportedInterfaces: {
 *     evm: ['eip-1193', 'eip-6963'],
 *     solana: ['solana-standard-wallet']
 *   },
 *   projectId: 'your-walletconnect-project-id'
 * });
 *
 * // Connect to specific wallet
 * const connection = await client.connect('metamask');
 *
 * // Switch chains
 * await client.switchChain('eip155:137'); // Switch to Polygon
 * ```
 *
 * @example
 * ```typescript
 * // Server-side rendering with custom storage
 * const client = await createWalletMesh({
 *   appName: 'Universal dApp'
 * }, {
 *   ssr: true,  // Safe for Next.js, Remix, etc.
 *   storage: customStorageAdapter  // Persist sessions
 * });
 *
 * // State subscription (works in SSR)
 * const unsubscribe = client.subscribe((state) => {
 *   console.log('Wallet state:', state.connection);
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Direct wallet specification (bypasses adapter system)
 * const client = await createWalletMesh({
 *   appName: 'Custom Wallets',
 *   wallets: [
 *     {
 *       id: 'custom-wallet',
 *       name: 'My Custom Wallet',
 *       icon: 'https://example.com/icon.png',
 *       chains: ['evm', 'solana']
 *     }
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Include debug wallet for testing environments
 * import { DebugWallet } from '@walletmesh/modal-core';
 *
 * const client = await createWalletMesh({
 *   appName: 'Test dApp',
 *   wallets: process.env.NODE_ENV === 'test'
 *     ? [
 *         { id: 'metamask', name: 'MetaMask', icon: '...', chains: ['evm'] },
 *         { id: 'debug-wallet', name: 'Debug Wallet', icon: '...', chains: ['evm', 'solana', 'aztec'] }
 *       ]
 *     : undefined  // Use default wallets in production
 * });
 *
 * // Or using wallet config with custom adapters
 * const client = await createWalletMesh({
 *   appName: 'Test dApp',
 *   wallets: {
 *     custom: process.env.NODE_ENV === 'test' ? [new DebugWallet()] : []
 *   }
 * });
 * ```
 *
 * @remarks
 * - **Async Initialization**: Client initialization is now fully asynchronous, eliminating race conditions
 * - **SSR Safety**: Automatically detects server environments and returns safe no-op client
 * - **Lazy Loading**: Adapters and providers are loaded on-demand to minimize bundle size
 * - **Type Safety**: Full TypeScript support with discriminated unions for state
 * - **Extensible**: Register custom adapters and transports as needed
 * - **React Integration**: Use with `@walletmesh/modal-react` for React applications
 *
 * @see {@link WalletMeshConfig} for all configuration options
 * @see {@link WalletMeshClient} for available client methods
 * @see {@link https://docs.walletmesh.com/integration | Integration Guide} for detailed patterns
 *
 * @category API
 * @since 1.0.0
 */
export async function createWalletMesh(
  config: WalletMeshConfig,
  options?: CreateWalletMeshOptions,
): Promise<WalletMeshClient> {
  // Create services for logging
  const services = createComponentServices('WalletClient');
  const logger = services.logger;

  logger.debug('Creating wallet client', { config, options });

  // Validate required configuration fields
  // appName is essential for wallet providers to display to users
  if (!config.appName) {
    throw ErrorFactory.configurationError('appName is required in WalletMesh configuration');
  }

  // Check if we should use SSR mode
  // SSR mode returns a no-op controller to prevent DOM operations on the server
  const shouldUseSSR = options?.ssr || isServer();
  logger.debug('SSR mode check', { shouldUseSSR, isServer: isServer() });

  if (shouldUseSSR) {
    logger.info('Returning SSR controller');
    return createSSRController();
  }

  // Check cache to prevent duplicate initialization
  const configKey = createConfigCacheKey(config);
  if (clientCache.has(configKey)) {
    const cachedClient = clientCache.get(configKey);
    if (cachedClient) {
      logger.debug('Returning cached client', { configKey });
      return cachedClient;
    }
  }

  // Create registry
  const registry = new WalletRegistry();

  // Determine if we're using direct wallet info or adapter-based approach
  let walletsForModal: WalletInfo[];
  let mutableWalletsForModal: WalletInfo[];

  if (Array.isArray(config.wallets)) {
    // Direct wallet info array was provided
    walletsForModal = config.wallets;
    logger.debug('Using direct wallet info from config', {
      walletCount: walletsForModal.length,
      walletIds: walletsForModal.map((w) => w.id),
    });
    modalLogger.debug('Using direct wallet info', {
      walletCount: walletsForModal.length,
      walletIds: walletsForModal.map((w) => w.id),
    });

    // Register default adapters for the wallet IDs provided
    const defaultAdapters: WalletAdapter[] = [new EvmAdapter()];

    // Note: AztecExampleWalletAdapter is not loaded by default
    // It should be explicitly added via wallet configuration for Aztec dApps
    logger.debug('Default adapters available', {
      adapters: defaultAdapters.map((a) => ({ id: a.id, name: a.metadata.name })),
    });
    modalLogger.debug('Default adapters available', {
      adapters: defaultAdapters.map((a) => ({ id: a.id, name: a.metadata.name })),
    });

    // Register adapters that match the provided wallet IDs
    for (const adapter of defaultAdapters) {
      const matchFound = walletsForModal.some((w) => w.id === adapter.id);
      logger.debug(`Checking adapter ${adapter.id} against wallet config`, {
        adapterId: adapter.id,
        walletIds: walletsForModal.map((w) => w.id),
        matchFound,
      });

      if (matchFound) {
        logger.debug(`Registering adapter ${adapter.id} as it matches wallet config`);
        registry.register(adapter);
      } else {
        logger.debug(`Not registering adapter ${adapter.id} - no match in wallet config`);
      }
    }

    // After registration, log what's in the registry
    logger.debug('Registry state after adapter registration', {
      registeredAdapterIds: registry.getAllAdapters().map((a) => a.id),
      registeredAdapterNames: registry.getAllAdapters().map((a) => a.metadata.name),
    });
    modalLogger.debug('Registry state after registration', {
      registeredAdapterIds: registry.getAllAdapters().map((a) => a.id),
      registeredAdapterNames: registry.getAllAdapters().map((a) => a.metadata.name),
    });
  } else {
    // Original adapter-based approach
    modalLogger.debug('Using adapter-based approach for wallet configuration', {
      configWallets: config.wallets,
      hasCustom: config.wallets && 'custom' in config.wallets,
      customArray:
        config.wallets && 'custom' in config.wallets
          ? (config.wallets as { custom: WalletAdapter[] }).custom
          : undefined,
    });

    // Register default adapters
    const defaultAdapters: WalletAdapter[] = [
      new EvmAdapter(),
      // SolanaAdapter not included by default - can be added via config.wallets.custom
      // DebugWallet not included by default - can be added via config.wallets.custom
      // AztecExampleWalletAdapter not included by default - should be added via config for Aztec dApps
    ];

    // Check if custom adapters are provided in the config
    const walletConfig = config.wallets as WalletConfig | undefined;
    modalLogger.debug('Checking for custom adapters', {
      hasWalletConfig: !!walletConfig,
      walletConfigType: typeof walletConfig,
      hasCustom: walletConfig && 'custom' in walletConfig,
      customIsArray: walletConfig?.custom && Array.isArray(walletConfig.custom),
    });

    if (walletConfig?.custom && Array.isArray(walletConfig.custom)) {
      // Add any custom adapters to the default list
      modalLogger.debug('Found custom adapters to register', {
        count: walletConfig.custom.length,
        adapters: walletConfig.custom.map((a) => ({
          id: a.id,
          name: a.metadata?.name,
          chains: a.capabilities?.chains?.map((c) => c.type),
        })),
      });

      for (const customAdapter of walletConfig.custom) {
        defaultAdapters.push(customAdapter);
        modalLogger.debug('Added custom adapter', {
          adapterId: customAdapter.id,
          adapterName: customAdapter.metadata.name,
          supportedChains: customAdapter.capabilities?.chains?.map((c) => c.type),
        });
      }
    }

    // Determine which adapters to register based on filters
    // If include is explicitly set to empty array, register nothing
    let adaptersToRegister = defaultAdapters;

    // Apply custom filter function first if provided
    if (walletConfig?.filter && typeof walletConfig.filter === 'function') {
      try {
        adaptersToRegister = adaptersToRegister.filter(walletConfig.filter);
      } catch (error) {
        modalLogger.error('Filter function threw error', error);
        // Re-throw the original error to match test expectations
        throw error;
      }
    }

    // Check if include is explicitly set to empty array
    if (
      walletConfig?.include !== undefined &&
      Array.isArray(walletConfig.include) &&
      walletConfig.include.length === 0
    ) {
      adaptersToRegister = [];
      modalLogger.debug('Include array is empty, not registering any adapters');
    } else if (walletConfig?.include && Array.isArray(walletConfig.include)) {
      // Filter to only include specified adapters
      adaptersToRegister = adaptersToRegister.filter((adapter) => walletConfig.include?.includes(adapter.id));
    } else if (walletConfig?.exclude && Array.isArray(walletConfig.exclude)) {
      // Filter out excluded adapters
      adaptersToRegister = adaptersToRegister.filter(
        (adapter) => !walletConfig.exclude?.includes(adapter.id),
      );
    }

    // Register filtered adapters
    modalLogger.debug('About to register adapters', {
      count: adaptersToRegister.length,
      adapters: adaptersToRegister.map((a) => ({
        id: a.id,
        name: a.metadata.name,
        chains: a.capabilities?.chains?.map((c) => c.type),
      })),
    });

    for (const adapter of adaptersToRegister) {
      registry.register(adapter);
      modalLogger.debug('Registered adapter in registry', {
        adapterId: adapter.id,
        adapterName: adapter.metadata.name,
        supportedChains: adapter.capabilities?.chains?.map((c) => c.type),
      });
    }

    // Get all registered adapters
    let adaptersForModal = registry.getAllAdapters();

    // Sort adapters if order is specified
    if (walletConfig?.order) {
      // This will be handled by the modal UI
    }

    // Apply custom filter function for modal if provided
    if (walletConfig?.filter && typeof walletConfig.filter === 'function') {
      try {
        adaptersForModal = adaptersForModal.filter(walletConfig.filter);
        modalLogger.debug('Applied filter function for modal', {
          resultCount: adaptersForModal.length,
          adapterIds: adaptersForModal.map((a) => a.id),
        });
      } catch (error) {
        modalLogger.error('Filter function threw error for modal adapters', error);
        // Re-throw the original error to match test expectations
        throw error;
      }
    }

    // Include/exclude lists still apply for explicit wallet control
    if (walletConfig?.include) {
      adaptersForModal = adaptersForModal.filter(
        (adapter) => walletConfig.include?.includes(adapter.id) ?? false,
      );
      modalLogger.debug('Applied include list', {
        includeList: walletConfig.include,
        resultCount: adaptersForModal.length,
      });
    }

    if (walletConfig?.exclude) {
      adaptersForModal = adaptersForModal.filter(
        (adapter) => !(walletConfig.exclude?.includes(adapter.id) ?? false),
      );
      modalLogger.debug('Applied exclude list', {
        excludeList: walletConfig.exclude,
        resultCount: adaptersForModal.length,
      });
    }

    // Convert filtered adapters to wallet info for modal
    mutableWalletsForModal = adaptersForModal.map((adapter) => ({
      id: adapter.id,
      name: adapter.metadata.name,
      icon: adapter.metadata.icon,
      description: adapter.metadata.description || '',
      chains: adapter.capabilities?.chains?.map((c) => c.type) || [],
    }));
    walletsForModal = mutableWalletsForModal;

    modalLogger.debug('Final wallets for modal', {
      count: walletsForModal.length,
      wallets: walletsForModal.map((w) => ({
        id: w.id,
        name: w.name,
        chains: w.chains,
      })),
    });
  }

  // Modal is now headless - no framework adapter needed

  // Create a placeholder modal controller that will be replaced
  // This proxy pattern allows us to create the client before the modal,
  // avoiding circular dependencies while maintaining proper initialization order
  let modalRef: ModalController | null = null;
  const placeholderModal = new Proxy({} as ModalController, {
    get(_target, prop: string | symbol) {
      if (modalRef) {
        return modalRef[prop as keyof ModalController];
      }
      // Return no-op functions for methods until modal is ready
      // This prevents errors if methods are called during initialization
      if (
        typeof prop === 'string' &&
        ['open', 'close', 'off', 'getState', 'subscribe', 'getActions', 'cleanup'].includes(prop)
      ) {
        return () => {};
      }
      return undefined;
    },
  });

  // Create the WalletMeshClient first with a placeholder modal
  const walletMeshClient = new WalletMeshClientImpl(
    config,
    registry,
    placeholderModal as import('../../internal/modal/controller.js').ModalController,
    logger,
  );

  // Now create the headless modal with the client
  // The modal handles state management, UI frameworks handle rendering
  modalLogger.info('Creating modal with wallets', {
    wallets: walletsForModal.map((w) => ({ id: w.id, name: w.name })),
  });

  // Assign to mutable reference
  mutableWalletsForModal = walletsForModal;

  const modal = createModal({ wallets: mutableWalletsForModal, client: walletMeshClient });
  modalLogger.debug('Modal created successfully');

  // Update the modal reference for the proxy to activate it
  modalRef = modal;

  // Initialize modal event handlers now that modal is available
  // This sets up the bidirectional communication between client and modal
  walletMeshClient.initializeModalHandlers();

  // Initialize the client to ensure services are ready before returning
  // This eliminates race conditions where services are accessed before initialization
  if (walletMeshClient.initialize) {
    try {
      await walletMeshClient.initialize();
      logger.debug('WalletMeshClient initialization completed successfully');
    } catch (error) {
      logger.error('Failed to initialize WalletMeshClient', error);
      throw error; // Propagate initialization errors to caller
    }
  }

  logger.debug('Created and initialized WalletMeshClient', {
    hasSwitchChain: 'switchChain' in walletMeshClient,
    clientType: walletMeshClient.constructor.name,
  });

  // Cache the client to prevent duplicate initialization
  clientCache.set(configKey, walletMeshClient);

  return walletMeshClient;
}
