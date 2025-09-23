/**
 * All-chains support for @walletmesh/modal-react
 *
 * Import from this module when building multi-chain dApps that need
 * support for multiple blockchain types (Aztec, EVM, Solana).
 *
 * ⚠️ WARNING: This imports all chain-specific code and will result in a larger bundle.
 * For single-chain dApps, import from the specific chain module instead:
 * - @walletmesh/modal-react/aztec
 * - @walletmesh/modal-react/evm
 * - @walletmesh/modal-react/solana
 *
 * @example
 * ```tsx
 * import {
 *   WalletMeshProvider,
 *   useAccount,
 *   // Aztec-specific
 *   AztecConnectButton,
 *   useAztecWallet,
 *   // EVM-specific
 *   EVMConnectButton,
 *   useEvmWallet,
 *   // Solana-specific
 *   SolanaConnectButton,
 *   useSolanaWallet
 * } from '@walletmesh/modal-react/all';
 * ```
 *
 * @module all
 * @packageDocumentation
 */

// Re-export all chain-agnostic functionality
export * from './core.js';

// Export all chain-specific functionality
export * from './chains/aztec/index.js';
export * from './chains/evm/index.js';
export * from './chains/solana/index.js';

// Note: When importing from multiple chain modules, the last export wins for any conflicts.
// This is intentional - chain-specific versions override core versions.
// For example, useAccount from the last chain module will be the one exported.
