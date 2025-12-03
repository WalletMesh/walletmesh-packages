/**
 * Test utilities for @walletmesh/modal-react
 *
 * Central export point for all testing utilities and helpers.
 */

// Core test helpers
export {
  createTestWrapper,
  createConnectedWrapper,
} from './testHelpers.js';

// React-specific mock utilities
export {
  createMockUseAccountReturn,
  createMockUseConnectReturn,
  createMockHookContext,
  simulateWalletConnection,
  simulateChainSwitch,
  TestStateManager,
  createMockWalletHealth,
  createMockRecoveryState,
  waitForHookUpdate,
  createMockWalletList,
  createMockSessionAnalytics,
  userInteractions,
  assertHookState,
} from './reactMocks.js';

// Re-export ChainType from modal-core
export { ChainType } from '@walletmesh/modal-core';

// Re-export centralized mocks
export { createMockSessionManager } from './centralizedMocks.js';

// Export types
export type { WalletMeshReactConfig } from '../types.js';
