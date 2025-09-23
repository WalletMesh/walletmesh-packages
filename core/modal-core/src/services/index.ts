/**
 * Service exports - Refactored version with focused services
 *
 * @module services
 * @packageDocumentation
 */

// Service registry exports
export { ServiceRegistry } from '../internal/registries/ServiceRegistry.js';

// Service types
export type { ServicesConfig } from '../internal/registries/ServiceRegistry.js';

// Service dependency types
export type { BaseServiceDependencies } from './base/ServiceDependencies.js';
export type { ConnectionServiceDependencies } from './connection/ConnectionService.js';
export type { SessionServiceDependencies } from './session/SessionService.js';
export type { HealthServiceDependencies } from './health/HealthService.js';
export type { UIServiceDependencies } from './ui/UiService.js';
export type { WalletPreferenceServiceDependencies } from './preferences/WalletPreferenceService.js';
export type { ChainServiceDependencies } from './chain/ChainService.js';
export type { TransactionServiceDependencies } from './transaction/TransactionService.js';
export type { BalanceServiceDependencies } from './balance/BalanceService.js';
export type { DAppRpcServiceDependencies } from './dapp-rpc/dAppRpcService.js';

// Connection service (refactored - connection lifecycle only)
export { ConnectionService } from './connection/ConnectionService.js';
export type {
  ConnectArgs,
  ConnectOptions,
  DisconnectOptions,
  ConnectionProgress,
  ConnectionValidation,
  ConnectionServiceResult,
  ConnectionConfig,
} from './connection/ConnectionService.js';

// Session service (extracted from ConnectionService)
export { SessionService } from './session/SessionService.js';
export type {
  SessionInfo,
  SessionMetadata,
  SessionCreationContext,
  SessionValidationResult,
  AccountDisplayInfo,
  AddressFormat,
} from './session/SessionService.js';

// Health service (extracted from ConnectionService)
export { HealthService } from './health/HealthService.js';
export type {
  HealthStatus,
  NetworkStatus,
  RecoveryStrategy,
  ErrorClassification,
  ResponsivenessMetrics,
  StabilityMetrics,
  HealthIssue,
  HealthDiagnostics,
  ProviderTestParams,
  NetworkDiagnostics,
  HealthTestResult,
  HealthMonitoringConfig,
  RecoveryAttempt,
  ErrorAnalysis,
  RecoveryState,
} from './health/HealthService.js';

// UI service (consolidated from multiple UI services)
export { UIService } from './ui/UiService.js';
export type {
  ConnectButtonState,
  ConnectButtonContent,
  ConnectButtonOptions,
  SimpleConnectButtonContent,
  SimpleConnectButtonOptions,
  UIConnectionInfo,
  ConnectionDisplayOptions,
  UIState,
  ConnectionFlags,
  UIServiceConfig,
} from './ui/UiService.js';

// Preference service (already existed, now properly integrated)
export { WalletPreferenceService } from './preferences/WalletPreferenceService.js';
export type {
  WalletHistoryEntry,
  WalletPreference,
  WalletPreferences,
  WalletPreferenceServiceConfig,
} from './preferences/types.js';

// Chain service (unchanged)
export { ChainService } from './chain/ChainService.js';
export type {
  EnsureChainParams,
  ValidateChainParams,
} from './chain/ChainService.js';

export type {
  ChainInfo,
  SwitchChainArgs,
  SwitchChainResult,
} from './chain/types.js';

export type {
  ChainValidationOptions,
  ChainValidationResult,
  ChainCompatibilityOptions,
  ChainCompatibilityResult,
  ChainRequirementValidationResult,
  ChainConfig,
  ChainEnsuranceConfig,
  ChainEnsuranceValidationResult,
  ChainSwitchOrchestrationOptions,
  ChainSwitchConfirmData,
  ChainSwitchSuccessData,
  ChainCompatibilityInfo,
  ChainSwitchContext,
  ChainMismatchAnalysis,
  ChainSwitchRecommendation,
  ChainSwitchingEventData,
  ChainSwitchCompletedEventData,
  ChainValidationEventData,
  ChainServiceEvents,
} from './chain/ChainService.js';

// Transaction service (unchanged)
export { TransactionService } from './transaction/TransactionService.js';
export type { TransactionServiceConfig, SendTransactionParams } from './transaction/TransactionService.js';
export { TransactionValidator } from './transaction/TransactionValidator.js';
export { TransactionFormatter } from './transaction/TransactionFormatter.js';

export type {
  TransactionStatus,
  TransactionRequest,
  TransactionResult,
  TransactionReceipt,
  TransactionError,
  BaseTransactionParams,
  EVMTransactionParams,
  SolanaTransactionParams,
  AztecTransactionParams,
  TransactionValidationResult,
  GasEstimationResult,
  TransactionHistoryFilter,
} from './transaction/types.js';

// Balance service (unchanged)
export { BalanceService } from './balance/BalanceService.js';
export { BalanceFormatter } from './balance/BalanceFormatter.js';
export { TokenMetadataFetcher } from './balance/TokenMetadataFetcher.js';
export { ChainNativeSymbols } from './balance/ChainNativeSymbols.js';

export type {
  GetNativeBalanceParams,
  GetTokenBalanceParams,
} from './balance/BalanceService.js';

export type {
  BalanceInfo,
  TokenInfo,
  TokenMetadata,
  BalanceQueryOptions,
} from './balance/types.js';

// dApp RPC service (now properly integrated)
export { DAppRpcService, DAppRpcIntegration } from './dapp-rpc/index.js';

export type {
  DAppRpcConfig,
  DAppRpcEndpoint,
  RpcResult,
} from './dapp-rpc/index.js';

// Common types
export type {
  ServiceResult,
  ServiceEvent,
  ConnectionInfo,
  TransactionInfo,
  Balance,
  TokenBalance,
  ServiceEvents,
  ValidationResult,
} from './types.js';

// Re-export ConnectionStatus from the canonical location
export { ConnectionStatus } from '../api/types/connectionStatus.js';

// Event types
export type {
  WalletEventType,
  BaseWalletEvent,
  ViewChangeEvent,
  ConnectionEstablishedEvent,
  ConnectionFailedEvent,
  ConnectionLostEvent,
  ChainSwitchEvent,
  AccountChangeEvent,
  WalletEvent,
  StateChangeResult,
} from '../internal/utils/events/eventMapping.js';

// Polling utility (moved to internal utils)
export { PollingService } from '../internal/utils/polling.js';

export type {
  PollingOptions,
  Poller,
} from '../internal/utils/polling.js';

// Query utilities
export { QueryManager, createQueryManager, type QueryManagerDependencies } from './query/QueryManager.js';
export { queryKeys, createQueryKey, type QueryKey } from './query/queryKeys.js';
export type { QueryClient, QueryClientConfig } from '@tanstack/query-core';
