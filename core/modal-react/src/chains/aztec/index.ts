/**
 * Aztec blockchain support for @walletmesh/modal-react
 *
 * This module provides all Aztec-specific functionality including hooks,
 * components, adapters, and configuration utilities for Aztec dApps.
 *
 * @module chains/aztec
 * @packageDocumentation
 */

// === AZTEC HOOKS ===
export {
  useAztecWallet,
  useAztecWalletRequired,
  type AztecWalletInfo,
} from '../../hooks/useAztecWallet.js';

export { useAztecAddress, type UseAztecAddressReturn } from '../../hooks/useAztecAddress.js';
export {
  useAztecSimulation,
  type UseAztecSimulationOptions,
  type UseAztecSimulationReturn,
} from '../../hooks/useAztecSimulation.js';

export {
  useAztecContract,
  type UseAztecContractReturn,
} from '../../hooks/useAztecContract.js';

export {
  useAztecTransaction,
  type UseAztecTransactionReturn,
  type TransactionCallbacks,
  type AztecTransactionResult,
} from '../../hooks/useAztecTransaction.js';

export {
  useAztecDeploy,
  type UseAztecDeployReturn,
  type DeploymentOptions,
  type DeploymentResult,
  type ContractArtifact,
  DEPLOYMENT_STAGE_LABELS,
  getDeploymentStageLabel,
} from '../../hooks/useAztecDeploy.js';

export {
  useAztecEvents,
  type UseAztecEventsReturn,
  type EventQueryOptions,
} from '../../hooks/useAztecEvents.js';

export {
  useAztecBatch,
  type UseAztecBatchReturn,
  type BatchTransactionStatus,
} from '../../hooks/useAztecBatch.js';

export {
  executeTx,
  simulateTx,
  waitForTxReceipt,
} from '@walletmesh/modal-core/providers/aztec/lazy';

export {
  useAztecAuth,
  type UseAztecAuthReturn,
  type AuthWitnessEntry,
} from '../../hooks/useAztecAuth.js';

// === AZTEC COMPONENTS ===
export {
  AztecConnectButton,
  type AztecConnectButtonProps,
} from '../../components/AztecConnectButton.js';

export {
  AztecTransactionStatusOverlay,
  type AztecTransactionStatusOverlayProps,
} from '../../components/AztecTransactionStatusOverlay.js';

export {
  BackgroundTransactionIndicator,
  type BackgroundTransactionIndicatorProps,
} from '../../components/BackgroundTransactionIndicator.js';

export {
  AztecWalletMeshProvider,
  type AztecWalletMeshProviderProps,
  type AztecProviderConfig,
} from '../../components/AztecWalletMeshProvider.js';

export {
  AztecWalletReady,
  withAztecWalletReady,
  type AztecWalletReadyProps,
} from '../../components/AztecWalletReady.js';

// === AZTEC CONFIGURATION ===
export {
  createAztecConfig,
  createAztecDevConfig,
  createAztecProdConfig,
} from './config.js';

// === AZTEC ADAPTERS ===
// These come from the development module
export { AztecExampleWalletAdapter } from '@walletmesh/modal-core/development';

// === AZTEC CHAIN CONFIGURATIONS ===
export {
  aztecSandbox,
  aztecTestnet,
  aztecMainnet,
  aztecChains,
  aztecMainnets,
  aztecTestChains,
} from '@walletmesh/modal-core';

// === AZTEC PROVIDER TYPES ===
// AztecProvider has been removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet instead

// === AZTEC-ENHANCED HOOKS ===
// These are chain-aware versions of the core hooks
export { useAccount } from './hooks.js';
export { useConnect } from './hooks.js';
export { useSwitchChain } from './hooks.js';
export { useTransaction } from './hooks.js';
export { useBalance } from './hooks.js';
export { usePublicProvider } from './hooks.js';
export { useWalletProvider } from './hooks.js';

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
