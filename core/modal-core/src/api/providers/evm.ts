/**
 * EVM provider API exports
 *
 * @module api/providers/evm
 * @packageDocumentation
 */

export { EvmProvider } from '../../internal/providers/evm/EvmProvider.js';
export { NativeEvmProvider } from '../../internal/providers/evm/NativeEvmProvider.js';

// Re-export EVM-specific types
export type { EvmTransaction } from '../types/providers.js';
