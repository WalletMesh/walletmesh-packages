/**
 * Solana blockchain support for @walletmesh/modal-react
 *
 * Import from this module when building Solana-specific dApps.
 * This module includes all core functionality plus Solana-specific features.
 *
 * @example
 * ```tsx
 * import {
 *   WalletMeshProvider,
 *   SolanaConnectButton,
 *   useSolanaWallet,
 *   useTransaction,
 *   createSolanaConfig
 * } from '@walletmesh/modal-react/solana';
 * ```
 *
 * @module solana
 * @packageDocumentation
 */

// Re-export all chain-agnostic functionality
export * from './core.js';

// Export all Solana-specific functionality
export * from './chains/solana/index.js';
