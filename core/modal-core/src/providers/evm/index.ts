/**
 * EVM Provider Exports
 *
 * This module exports EVM-specific provider functionality.
 * These exports are separated for better organization and modularity.
 *
 * @module @walletmesh/modal-core/providers/evm
 * @packageDocumentation
 */

// Export EVM provider and related types
export { EvmProvider } from '../../internal/providers/evm/EvmProvider.js';

// Re-export EVM types from the types system
export type { EvmTransaction } from '../../api/types/providers.js';

// Export EVM-specific wallet adapters
export { EvmAdapter } from '../../internal/wallets/evm/EvmAdapter.js';
