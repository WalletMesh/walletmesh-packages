/**
 * Solana Provider Exports
 *
 * This module exports Solana-specific provider functionality.
 * These exports are separated for better organization and modularity.
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
