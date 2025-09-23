/**
 * Public API for wallet providers
 *
 * @module api/providers
 * @packageDocumentation
 */

/**
 * Re-export provider implementations
 */
export {
  BaseWalletProvider,
  EvmProvider,
  SolanaProvider,
  // Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
  ProviderRegistry,
  registerBuiltinProviders,
  ensureBuiltinProviders,
} from '../../internal/index.js';

export { PublicProviderWrapper } from '../../providers/PublicProvider.js';
export { WalletProviderFallbackWrapper } from '../../providers/WalletProviderFallbackWrapper.js';

export type { ProviderLoader } from '../../internal/registries/providers/ProviderRegistry.js';

/**
 * Re-export provider types
 */
export type {
  PublicProvider,
  WalletProvider,
  BaseWalletProvider as IBaseWalletProvider,
  EvmWalletProvider,
  SolanaWalletProvider,
  AztecWalletProvider,
  WalletMethodMap,
  WalletEventMap,
  EvmTransaction,
  SolanaTransaction,
  SolanaInstruction,
  AztecTransaction,
  AztecAccount,
  TxHash,
  AuthWitness,
  NodeInfo,
  ProviderClass,
  BasicChainInfo,
  WalletProviderState,
} from '../types/providers.js';

/**
 * Re-export provider type guards
 */
export {
  isEvmWalletProvider,
  isSolanaWalletProvider,
  isAztecWalletProvider,
} from '../types/providers.js';

export type { WalletConnectionState, WalletInfo } from '../../types.js';

export type { WalletProviderContext } from '../../internal/providers/base/BaseWalletProvider.js';
