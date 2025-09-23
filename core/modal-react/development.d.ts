/**
 * Development utilities and wallets for @walletmesh/modal-react
 *
 * This module provides development-only wallets and utilities that are useful
 * for local development and demonstrations. These should NOT be used in production.
 *
 * Unlike the /testing export, this module does not include any test framework
 * dependencies (like vitest), making it safe to use in browser environments.
 *
 * @module development
 * @packageDocumentation
 */

// Re-export development wallets from modal-core's development export
// This avoids pulling in test framework dependencies
export {
  DebugWallet,
  MockTransport,
  AztecExampleWalletAdapter,
  createTestModal,
} from '@walletmesh/modal-core/development';

// Re-export logger utilities from modal-core main exports
export { createDebugLogger } from '@walletmesh/modal-core';
export type { Logger } from '@walletmesh/modal-core';
