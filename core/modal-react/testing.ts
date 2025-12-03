/**
 * Testing utilities and development wallets for @walletmesh/modal-react
 *
 * This module re-exports testing wallets from modal-core for easy access
 * in React applications during development and testing.
 *
 * @module testing
 * @packageDocumentation
 */

// Re-export testing wallets from modal-core
export {
  DebugWallet,
  MockTransport,
  AztecExampleWalletAdapter,
} from '@walletmesh/modal-core/testing';

// Re-export testing utilities
export {
  createTestModal,
  createMockWalletInfo,
} from '@walletmesh/modal-core/testing';

// Re-export logger utilities and types from modal-core main exports
export { createDebugLogger } from '@walletmesh/modal-core';
export type { Logger } from '@walletmesh/modal-core';
