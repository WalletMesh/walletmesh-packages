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
  AztecExampleWalletAdapter,
  MockTransport,
} from '@walletmesh/modal-core/testing';

// Re-export testing utilities
export {
  createTestModal,
  createMockWalletInfo,
  createMockConnectionResult,
  createDebugLogger,
  type Logger,
} from '@walletmesh/modal-core/testing';
