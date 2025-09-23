/**
 * Aztec provider API exports
 *
 * @module api/providers/aztec
 * @packageDocumentation
 */

// AztecProvider removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet

// Re-export Aztec-specific types
export type {
  AztecTransaction,
  AztecAccount,
  AuthWitness,
  NodeInfo,
  TxHash,
} from '../types/providers.js';
