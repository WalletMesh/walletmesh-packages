/**
 * Solana provider API exports
 *
 * @module api/providers/solana
 * @packageDocumentation
 */

export { SolanaProvider } from '../../internal/providers/solana/SolanaProvider.js';
export { NativeSolanaProvider } from '../../internal/providers/solana/NativeSolanaProvider.js';

// Re-export Solana-specific types
export type { SolanaTransaction } from '../types/providers.js';
