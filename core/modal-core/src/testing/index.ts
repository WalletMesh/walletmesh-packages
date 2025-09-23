/**
 * Testing utilities for modal-core
 */

export { createMockSessionState } from './mocks/mockSession.js';
export { createAutoMockedStore, createTestStore } from './mocks/mockStore.js';
export type { TestStoreConfig } from './mocks/mockStore.js';

export {
  createConnectedTestSetup,
  createDisconnectedTestSetup,
  createTestWrapper,
} from './helpers/testSetups.js';

export { ChainType } from '../types.js';
export type { WalletInfo } from '../types.js';
export type { WalletMeshState } from '../state/store.js';
export type { SessionState, SessionManager } from '../api/types/sessionState.js';

export {
  createMockClient,
  createMockLogger,
  createMockRegistry,
  createMockModal,
  createMockErrorHandler,
  createMockWalletAdapter,
  createMockEvmProvider,
  createMockSolanaProvider,
  createMockJSONRPCTransport,
  createMockJSONRPCNode,
  createMockServiceDependencies,
  createMockWalletInfo,
  createMockTransport,
  createMockSessionState as createMockSessionStateHelper,
  createMockPopupWindow,
  createMockWindow,
  createMockEventEmitter,
  createMockResourceManager,
  createMockStateManager,
  createMockModalController,
  createMockConnectionScenario,
  mockValidation,
  createTypedMock,
  createMockFrameworkAdapter,
  createMockWalletPreferenceService,
  createMockDAppRpcService,
  createMockServiceRegistry,
  createMockSessionManager,
  createMockConnectionManager,
  createMockChromeExtensionTransport,
  createMockPopupWindowTransport,
  createAutoMockedTransactionService,
  createAutoMockedBalanceService,
  createAutoMockedChainService,
  createAutoMockedConnectionService,
  createAutoMockedDiscoveryService,
  createAutoMockedConnectionUIService,
  createAutoMockedEventMappingService,
} from './helpers/mocks.js';

// Enhanced testing utilities
export {
  createTestEnvironment,
  testSetupPatterns,
  timerUtils,
  mockUtils,
  type TestEnvironmentConfig,
} from './setup/testEnvironment.js';

export {
  mockFactories,
  mockPresets,
  mockPresetUtils,
  setupMocks,
} from './mocks/centralizedMocks.js';

export {
  connectionScenarios,
  connectionTestHelpers,
  type ConnectionScenarioConfig,
} from './scenarios/connectionFlows.js';

export {
  modalScenarios,
  modalTestHelpers,
} from './scenarios/modalFlows.js';

export {
  FluentTestBuilder,
  testScenarios,
  type TestScenarioResult,
} from './builders/FluentTestBuilder.js';

export { installCustomMatchers } from './assertions/customMatchers.js';

// Export test constants
export * from './constants.js';

// Export chain service mocks
export {
  createMockChainServiceRegistry,
  createMockBaseChainService,
  createMockEVMChainService,
  createMockSolanaChainService,
  createMockAztecChainService,
  createMockWalletRegistry,
  createMockProviderRegistry,
} from './mocks/mockChainServices.js';

// Export adapter mocks
export {
  createMockAbstractWalletAdapter,
  createMockEvmAdapter,
  createMockSolanaAdapter,
  // Note: createMockAztecAdapter removed - AztecAdapter is deprecated, use AztecRouterProvider instead
  createMockDiscoveryAdapter,
} from './mocks/mockAdapters.js';

// Export mock factory registry
export {
  mockFactoryRegistry,
  createMockEnvironment,
  createMock,
} from './mocks/mockFactoryRegistry.js';

// Export test/development wallets
export { DebugWallet } from '../internal/wallets/debug/DebugWallet.js';
export { MockTransport } from '../internal/wallets/debug/MockTransport.js';
export { AztecExampleWalletAdapter } from '../internal/wallets/aztec-example/AztecExampleWalletAdapter.js';

// Export test modal factory
export { createTestModal } from '../internal/factories/modalFactory.js';
