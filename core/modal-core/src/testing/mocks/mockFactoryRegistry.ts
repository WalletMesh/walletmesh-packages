/**
 * Centralized registry of all mock factories
 *
 * This provides a single import point for all mock factories,
 * organized by category for easy discovery and usage.
 */

// Import all mock factories
import {
  createMockChromeExtensionTransport,
  createMockClient,
  createMockConnectionManager,
  createMockConnectionScenario,
  createMockDAppRpcService,
  createMockErrorHandler,
  createMockEventEmitter,
  createMockEvmProvider,
  createMockFrameworkAdapter,
  createMockJSONRPCNode,
  createMockJSONRPCTransport,
  createMockLogger,
  createMockModal,
  createMockModalController,
  createMockPopupWindow,
  createMockPopupWindowTransport,
  createMockResourceManager,
  createMockServiceDependencies,
  createMockServiceRegistry,
  createMockSessionManager,
  createMockSessionState,
  createMockSolanaProvider,
  createMockStateManager,
  createMockTransport,
  createMockWalletAdapter,
  createMockWalletInfo,
  createMockWalletPreferenceService,
  createMockWindow,
} from '../helpers/mocks.js';

import {
  createAutoMockedBalanceService,
  createAutoMockedChainService,
  createAutoMockedConnectionService,
  createAutoMockedConnectionUIService,
  createAutoMockedDiscoveryService,
  createAutoMockedEventMappingService,
  createAutoMockedTransactionService,
} from './mockServices.js';

import {
  createMockAztecChainService,
  createMockBaseChainService,
  createMockChainServiceRegistry,
  createMockEVMChainService,
  createMockProviderRegistry,
  createMockSolanaChainService,
  createMockWalletRegistry,
} from './mockChainServices.js';

import {
  createMockAbstractWalletAdapter,
  createMockDiscoveryAdapter,
  createMockEvmAdapter,
  createMockSolanaAdapter,
} from './mockAdapters.js';

/**
 * Registry of all available mock factories organized by category
 */
export const mockFactoryRegistry = {
  /**
   * Core infrastructure mocks
   */
  core: {
    client: createMockClient,
    logger: createMockLogger,
    errorHandler: createMockErrorHandler,
    modal: createMockModal,
    modalController: createMockModalController,
    frameworkAdapter: createMockFrameworkAdapter,
    eventEmitter: createMockEventEmitter,
    resourceManager: createMockResourceManager,
    stateManager: createMockStateManager,
    window: createMockWindow,
    popupWindow: createMockPopupWindow,
  },

  /**
   * Service mocks
   */
  services: {
    // Auto-mocked services (recommended)
    transaction: createAutoMockedTransactionService,
    balance: createAutoMockedBalanceService,
    chain: createAutoMockedChainService,
    connection: createAutoMockedConnectionService,
    discovery: createAutoMockedDiscoveryService,
    connectionUI: createAutoMockedConnectionUIService,
    eventMapping: createAutoMockedEventMappingService,

    // Additional service mocks
    walletPreference: createMockWalletPreferenceService,
    dAppRpc: createMockDAppRpcService,

    // Manager mocks
    sessionManager: createMockSessionManager,
    connectionManager: createMockConnectionManager,
  },

  /**
   * Registry mocks
   */
  registries: {
    service: createMockServiceRegistry,
    wallet: createMockWalletRegistry,
    provider: createMockProviderRegistry,
    chainService: createMockChainServiceRegistry,
  },

  /**
   * Provider mocks
   */
  providers: {
    evm: createMockEvmProvider,
    solana: createMockSolanaProvider,
    // Note: aztec removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
  },

  /**
   * Chain service mocks
   */
  chainServices: {
    base: createMockBaseChainService,
    evm: createMockEVMChainService,
    solana: createMockSolanaChainService,
    aztec: createMockAztecChainService,
  },

  /**
   * Adapter mocks
   */
  adapters: {
    wallet: createMockWalletAdapter,
    abstract: createMockAbstractWalletAdapter,
    evm: createMockEvmAdapter,
    solana: createMockSolanaAdapter,
    // Note: aztec mock removed - AztecAdapter is deprecated, use AztecRouterProvider instead
    discovery: createMockDiscoveryAdapter,
  },

  /**
   * Transport mocks
   */
  transports: {
    base: createMockTransport,
    jsonrpc: createMockJSONRPCTransport,
    chromeExtension: createMockChromeExtensionTransport,
    popupWindow: createMockPopupWindowTransport,
    discovery: () => ({ discover: vi.fn(), destroy: vi.fn() }),
  },

  /**
   * State and session mocks
   */
  state: {
    session: createMockSessionState,
    walletInfo: createMockWalletInfo,
    serviceDependencies: createMockServiceDependencies,
  },

  /**
   * JSON-RPC mocks
   */
  jsonrpc: {
    transport: createMockJSONRPCTransport,
    node: createMockJSONRPCNode,
  },

  /**
   * Composite mocks for complete scenarios
   */
  scenarios: {
    connection: createMockConnectionScenario,
  },
};

/**
 * Helper function to create a complete mock environment
 */
export function createMockEnvironment(options?: {
  chainType?: 'evm' | 'solana';
  includeServices?: boolean;
  includeRegistries?: boolean;
}) {
  const chainType = options?.chainType || 'evm';

  return {
    // Core
    client: mockFactoryRegistry.core.client(),
    logger: mockFactoryRegistry.core.logger(),
    errorHandler: mockFactoryRegistry.core.errorHandler(),
    modal: mockFactoryRegistry.core.modal(),

    // Provider based on chain type
    provider: mockFactoryRegistry.providers[chainType](),

    // Services (if requested)
    ...(options?.includeServices && {
      services: {
        transaction: mockFactoryRegistry.services.transaction(),
        balance: mockFactoryRegistry.services.balance(),
        chain: mockFactoryRegistry.services.chain(),
        connection: mockFactoryRegistry.services.connection(),
      },
    }),

    // Registries (if requested)
    ...(options?.includeRegistries && {
      registries: {
        service: mockFactoryRegistry.registries.service(),
        wallet: mockFactoryRegistry.registries.wallet(),
        provider: mockFactoryRegistry.registries.provider(),
      },
    }),
  };
}

/**
 * Type-safe mock creation helper
 */
export function createMock<T extends keyof typeof mockFactoryRegistry>(
  category: T,
  name: keyof (typeof mockFactoryRegistry)[T],
) {
  const factory = mockFactoryRegistry[category][name];
  if (!factory) {
    throw new Error(`Mock factory not found: ${String(category)}.${String(name)}`);
  }
  return factory;
}
