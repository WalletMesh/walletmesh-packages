/**
 * Aztec Provider Exports
 *
 * This module exports Aztec-specific provider functionality.
 * These exports are separated from the main bundle to avoid
 * requiring Aztec dependencies for users who don't need Aztec support.
 *
 * ## Lazy Loading Support
 *
 * For applications that want to reduce initial bundle size, this module provides
 * lazy-loaded variants of key Aztec functionality:
 *
 * ```typescript
 * // Regular import (loads @walletmesh/aztec-rpc-wallet immediately)
 * import { AztecRouterProvider } from '@walletmesh/aztec-rpc-wallet';
 *
 * // Lazy import from modal-core (defers loading until first use)
 * import { LazyAztecRouterProvider } from '@walletmesh/modal-core/providers/aztec';
 *
 * // Use it exactly like the regular provider
 * const provider = new LazyAztecRouterProvider(transport);
 * await provider.connect({ 'aztec:testnet': ['aztec_getAddress'] });
 * ```
 *
 * The lazy variants are especially useful for multi-chain applications where
 * Aztec support may not be immediately needed.
 *
 * @module @walletmesh/modal-core/providers/aztec
 * @packageDocumentation
 */

// AztecProvider removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
// The AztecProvider class extending BaseWalletProvider has been removed as it was unused.
// Aztec integration now uses AztecRouterProvider which extends WalletRouterProvider.

// Re-export Aztec types from the types system
export type {
  AztecAccount,
  AztecTransaction,
  TxHash,
  AuthWitness,
  NodeInfo,
} from '../../api/types/providers.js';

// Export Aztec wallet factory and utilities
export {
  createAztecWallet,
  createAztecWalletFactory,
  clearAztecWalletCache,
  type CreateAztecWalletOptions,
} from './createAztecWallet.js';

// Export Aztec helper utilities
export {
  deployContract,
  executeTx,
  executeInteraction,
  executeBatchInteractions,
  executeAtomicBatch,
  simulateTx,
  simulateInteraction,
  simulateUtility,
  waitForTxReceipt,
  getAddress,
  getCompleteAddress,
  isWalletAvailable,
  withAztecWallet,
  normalizeArtifact,
  ensureContractClassRegistered,
  normalizeAztecAddress,
  formatAztecAddress,
  isAztecAddressValue,
  DEPLOYMENT_STAGE_LABELS,
  getDeploymentStageLabel,
  type ExecuteInteractionResult,
} from './utils.js';

// Export contract interaction utilities
export {
  getContractAt,
  executeBatch,
  callViewFunction,
  getTxRequest,
} from './contract.js';

// Export account management utilities
export {
  getRegisteredAccounts,
  switchAccount,
  signMessage,
  getAccountInfo,
  isRegisteredAccount,
  type AccountInfo,
} from './account.js';

// Export event handling utilities
export {
  subscribeToEvents,
  queryEvents,
  queryPrivateEvents,
  getContractEvents,
  type EventSubscription,
  type EventQueryOptions,
} from './events.js';

// Export auth witness utilities
export {
  createAuthWitForInteraction,
  createBatchAuthWit,
  createAuthWitForMessage,
  verifyAuthWit,
  storeAuthWitnesses,
  getStoredAuthWitnesses,
  clearStoredAuthWitnesses,
  type AuthWitnessWithMetadata,
} from './auth.js';

// Export error handling utilities
export {
  AztecError,
  AztecContractError,
  AztecAccountError,
  AztecEventError,
  AztecAuthError,
  AZTEC_ERROR_CODE,
  isRecoverableError,
  getErrorRecoveryHint,
  extractErrorDetails,
} from './errors.js';

// Export types separately
export * from './types.js';

// Export lazy-loaded variants
// These exports defer loading of @walletmesh/aztec-rpc-wallet until first use
export { LazyAztecRouterProvider, lazyRegisterAztecSerializers } from './lazy.js';

// Export any Aztec-specific wallet adapters (if they exist)
// Note: Add Aztec wallet adapters here as they are created
