/**
 * EVM blockchain support for @walletmesh/modal-react
 *
 * This module provides all EVM-specific functionality including hooks,
 * components, adapters, and configuration utilities for EVM dApps
 * (Ethereum, Polygon, Arbitrum, Optimism, Base, etc.).
 *
 * @module chains/evm
 * @packageDocumentation
 */

// === EVM HOOKS ===
export {
  useEvmWallet,
  useEvmWalletRequired,
  type EvmWalletInfo,
} from '../../hooks/useEvmWallet.js';

export {
  useBalance,
  type TokenInfo,
  type UseBalanceOptions,
  type UseBalanceReturn,
  type BalanceInfo,
} from '../../hooks/useBalance.js';

export {
  useTransaction,
  type TransactionRequest,
  type TransactionResult,
  type TransactionStatus,
  type TransactionError,
  type UseTransactionReturn,
  type EVMTransactionParams,
} from '../../hooks/useTransaction.js';

export {
  usePublicProvider,
  type PublicProviderInfo,
} from '../../hooks/usePublicProvider.js';

export {
  useWalletProvider,
  type WalletProviderInfo,
} from '../../hooks/useWalletProvider.js';

// === EVM COMPONENTS ===
export {
  EVMConnectButton,
  type EVMConnectButtonProps,
} from '../../components/EVMConnectButton.js';

export {
  WalletMeshChainSwitchButton,
  type WalletMeshChainSwitchButtonProps,
} from '../../components/WalletMeshChainSwitchButton.js';

// === EVM CONFIGURATION ===
export {
  createEVMConfig,
  createMainnetConfig,
  createTestnetConfig,
} from './config.js';

// === EVM ADAPTERS ===
// Import EVM wallet adapters from modal-core
export { EvmProvider } from '@walletmesh/modal-core';

// === EVM CHAIN CONFIGURATIONS ===
export {
  // Individual chain constants
  ethereumMainnet,
  ethereumSepolia,
  ethereumHolesky,
  polygonMainnet,
  polygonAmoy,
  arbitrumOne,
  arbitrumSepolia,
  optimismMainnet,
  optimismSepolia,
  baseMainnet,
  baseSepolia,
  // Chain arrays
  evmMainnets,
  evmTestnets,
  evmChains,
  // Helper functions
  createMainnetConfig as createEvmMainnetConfig,
  createTestnetConfig as createEvmTestnetConfig,
  createAllChainsConfig,
  markChainsRequired,
  filterChainsByGroup,
  isChainSupported,
  getRequiredChains,
} from '@walletmesh/modal-core';

// === EVM PROVIDER TYPES ===
export type {
  EVMProvider,
  EVMTransactionRequest,
  EVMChainConfig,
  EVMAssetConfig,
} from '@walletmesh/modal-core';

// === EVM-ENHANCED HOOKS ===
// These are chain-aware versions of the core hooks
export { useAccount } from './hooks.js';
export { useConnect } from './hooks.js';
export { useSwitchChain } from './hooks.js';

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

export type { SolanaTransactionParams } from '../../hooks/useTransaction.js';
