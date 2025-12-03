/**
 * Solana blockchain support for @walletmesh/modal-react
 *
 * This module provides all Solana-specific functionality including hooks,
 * components, adapters, and configuration utilities for Solana dApps.
 *
 * @module chains/solana
 * @packageDocumentation
 */

// === SOLANA HOOKS ===
export {
  useSolanaWallet,
  useSolanaWalletRequired,
  type SolanaWalletInfo,
} from '../../hooks/useSolanaWallet.js';

export {
  useTransaction,
  type TransactionRequest,
  type TransactionResult,
  type TransactionStatus,
  type TransactionError,
  type UseTransactionReturn,
  type SolanaTransactionParams,
} from '../../hooks/useTransaction.js';

export {
  usePublicProvider,
  type PublicProviderInfo,
} from '../../hooks/usePublicProvider.js';

export {
  useWalletProvider,
  type WalletProviderInfo,
} from '../../hooks/useWalletProvider.js';

// === SOLANA COMPONENTS ===
export {
  SolanaConnectButton,
  type SolanaConnectButtonProps,
} from '../../components/SolanaConnectButton.js';

// === SOLANA CONFIGURATION ===
export {
  createSolanaConfig,
  createSolanaMainnetConfig,
  createSolanaDevnetConfig,
} from './config.js';

// === SOLANA CHAIN CONFIGURATIONS ===
export {
  solanaMainnet,
  solanaDevnet,
  solanaTestnet,
  solanaChains,
  solanaMainnets,
  solanaTestChains,
} from '@walletmesh/modal-core';

// === SOLANA PROVIDER TYPES ===
export type {
  SolanaProvider,
  ChainSolanaProvider,
  SolanaCapabilities,
} from '@walletmesh/modal-core';

// === SOLANA-ENHANCED HOOKS ===
// These are chain-aware versions of the core hooks
export { useAccount } from './hooks.js';
export { useConnect } from './hooks.js';
export { useSwitchChain } from './hooks.js';
export { useBalance } from './hooks.js';

// Re-export types for convenience
export type {
  AccountInfo,
  WalletSelectionOptions,
  WalletAvailability,
} from '../../hooks/useAccount.js';

export type {
  UseConnectReturn,
  ReactConnectOptions as ConnectOptions,
  DisconnectOptions,
  ConnectionProgress,
  ConnectArgs,
  ReactConnectionResult as ConnectResult,
  ConnectVariables,
} from '../../hooks/useConnect.js';

export type {
  UseSwitchChainReturn,
  SwitchChainResult,
  ChainInfo as SwitchChainInfo,
  SwitchChainVariables,
  UseSwitchChainOptions,
  SwitchChainArgs,
  ChainValidationOptions,
  ChainValidationResult,
} from '../../hooks/useSwitchChain.js';

export type {
  TokenInfo,
  UseBalanceOptions,
  UseBalanceReturn,
  BalanceInfo,
} from '../../hooks/useBalance.js';

export type { EVMTransactionParams } from '../../hooks/useTransaction.js';
