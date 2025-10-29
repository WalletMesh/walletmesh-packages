/**
 * Discovery module exports
 *
 * @module client/discovery
 */

export * from './factory.js';
export {
  ConnectionStateManager,
  type ConnectionState,
  type ConnectionStateChangeEvent,
} from './ConnectionState.js';

// EVM discovery exports
export { EVMDiscoveryService } from './evm/EvmDiscoveryService.js';
export type {
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
  EIP1193Provider,
  DiscoveredEVMWallet,
  EVMDiscoveryConfig,
  EVMDiscoveryResults,
} from './evm/types.js';

// Solana discovery exports
export { SolanaDiscoveryService } from './solana/SolanaDiscoveryService.js';
export type {
  SolanaWalletAccount,
  SolanaConnectOptions,
  SolanaWalletStandardWallet,
  SolanaProvider,
  DiscoveredSolanaWallet,
  SolanaDiscoveryConfig,
  SolanaDiscoveryResults,
} from './solana/types.js';
