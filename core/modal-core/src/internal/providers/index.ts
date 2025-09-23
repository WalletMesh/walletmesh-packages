/**
 * Provider implementations using JSONRPCNode for type-safe communication
 *
 * @module internal/providers
 * @packageDocumentation
 */

export { BaseWalletProvider } from './base/BaseWalletProvider.js';
export type { WalletProviderContext } from './base/BaseWalletProvider.js';

export { EvmProvider } from './evm/EvmProvider.js';
export { NativeEvmProvider } from './evm/NativeEvmProvider.js';
export { SolanaProvider } from './solana/SolanaProvider.js';
export { NativeSolanaProvider } from './solana/NativeSolanaProvider.js';
// AztecProvider removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet

// Provider registry exports
export { ProviderRegistry } from '../registries/providers/ProviderRegistry.js';
export type { ProviderLoader, ProviderEntry } from '../registries/providers/ProviderRegistry.js';
export {
  registerBuiltinProviders,
  ensureBuiltinProviders,
} from '../registries/providers/registerBuiltinProviders.js';

/**
 * Re-export provider types for convenience
 */
export type {
  WalletProvider,
  WalletMethodMap,
  WalletEventMap,
  EvmTransaction,
  SolanaTransaction,
  AztecTransaction,
  AztecAccount,
  TxHash,
  AuthWitness,
  NodeInfo,
} from '../../api/types/providers.js';
