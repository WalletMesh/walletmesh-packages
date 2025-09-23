/**
 * Development wallets for modal-core
 *
 * This module exports development-only wallets that are useful for local
 * development and demonstrations. Unlike the /testing export, this module
 * does not include any test framework dependencies.
 *
 * WARNING: These wallets should NOT be used in production environments.
 *
 * @module development
 * @packageDocumentation
 */

// Export development wallets (no test framework dependencies)
export { DebugWallet } from '../internal/wallets/debug/DebugWallet.js';
export { MockTransport } from '../internal/wallets/debug/MockTransport.js';
export { AztecExampleWalletAdapter } from '../internal/wallets/aztec-example/AztecExampleWalletAdapter.js';

// Export minimal testing utilities that don't depend on vitest
export { createTestModal } from '../internal/factories/modalFactory.js';
