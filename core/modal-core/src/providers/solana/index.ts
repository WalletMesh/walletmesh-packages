/**
 * Solana Provider Exports
 *
 * This module exports Solana-specific provider functionality.
 * These exports are separated from the main bundle to avoid
 * requiring Solana dependencies for users who don't need Solana support.
 *
 * ## Lazy Loading Support
 *
 * For applications that want to reduce initial bundle size, this module provides
 * lazy-loaded variants of Solana utilities. The @solana/web3.js library (~200KB+)
 * is only loaded when first accessed:
 *
 * ```typescript
 * // Regular import (loads @solana/web3.js immediately)
 * import { SolanaProvider } from '@walletmesh/modal-core/providers/solana';
 *
 * // Lazy import for utilities (defers loading until first use)
 * import {
 *   solanaWeb3Module,
 *   createConnection,
 *   lamportsToSol
 * } from '@walletmesh/modal-core/providers/solana/lazy';
 *
 * // Use lazy utilities
 * const connection = await createConnection('https://api.mainnet-beta.solana.com');
 * const balance = await connection.getBalance(publicKey);
 * const sol = await lamportsToSol(balance);
 * ```
 *
 * The lazy variants are especially useful for multi-chain applications where
 * Solana support may not be immediately needed.
 *
 * @module @walletmesh/modal-core/providers/solana
 * @packageDocumentation
 */

// Export Solana provider and related types
export { SolanaProvider } from '../../internal/providers/solana/SolanaProvider.js';

// Re-export Solana types from the types system
export type { SolanaTransaction } from '../../api/types/providers.js';

// Export Solana-specific wallet adapters
export { SolanaAdapter } from '../../internal/wallets/solana/SolanaAdapter.js';
