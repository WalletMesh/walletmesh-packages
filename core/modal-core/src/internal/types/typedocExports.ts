/**
 * This file exports types that are referenced in documentation
 * but not directly exported by the public API.
 *
 * It exists solely to satisfy TypeDoc and avoid warnings.
 * It's not intended to be used directly by consumers of the library.
 *
 * These types are not part of the public API and may change at any time.
 * @internal
 */

// Export the event types for TypeDoc
export { ModalEventType as InternalModalEventType } from '../core/events/modalEvents.js';
export { ModalEventType } from '../core/events/modalEvents.js';

// Re-export all event interfaces from the internal module
export type {
  OpeningEvent,
  OpenedEvent,
  ClosingEvent,
  ClosedEvent,
  ViewChangingEvent,
  ViewChangedEvent,
  ModalErrorEvent,
} from '../core/events/modalEvents.js';

// Note: we've removed the duplicated interface definitions and
// instead re-exported them directly from the internal module.

// ConnectorConfig has been removed with the refactoring to composition pattern
// BaseFrameworkAdapter has been removed with the refactoring to composition pattern

// Export framework adapter types
export type {
  ReactAdapterConfig,
  VueAdapterConfig,
  SvelteAdapterConfig
} from '../../schemas/adapters.js';

// Export the schemas themselves for TypeDoc
export {
  reactAdapterConfigSchema,
  svelteAdapterConfigSchema,
  vueAdapterConfigSchema
} from '../../schemas/adapters.js';

// These are type-only exports for TypeDoc compatibility
export type ReactAdapter = unknown;
export type VueAdapter = unknown;
export type SvelteAdapter = unknown;
export type ComponentMap = unknown;

export { errorCategorySchema as ErrorCategory } from '../../schemas/errors.js';

export type { ErrorData } from '../../api/system/errors.js';

// ModalView is now defined in schemas/connection.js
export type { ModalView } from '../../schemas/connection.js';

// Event system types have been moved to simplified event system

export type { ModalState } from '../../types.js';

export type { AnyTransportConfig } from '../../types.js';

export type { ViewHooks } from '../../schemas/views.js';

// Export the viewHooksSchema itself for TypeDoc
export { viewHooksSchema } from '../../schemas/views.js';

// Note: WalletMeshClient is now internal and ModalFactoryConfig uses the public
// WalletClient interface, so no additional exports are needed for documentation.

// Export internal types that are referenced in public API documentation
// These are marked as @internal to indicate they're not part of the public API
export type {
  WalletMeshClient,
  WalletMeshClient as WalletMeshBaseClient,
  CreateWalletMeshOptions,
} from '../client/WalletMeshClient.js';
export type {
  EvmTransaction,
  SolanaTransaction,
  SolanaInstruction,
  WalletProviderState as WalletStateType,
} from '../../api/types/providers.js';

export type { WalletInfo } from '../../types.js';

// Export types that are referenced in documentation but not in public API
export type { WalletProvider, BasicChainInfo } from '../../api/types/providers.js';
export type { ChainInfo } from '../../services/chain/types.js';
export type {
  WalletConnectionState,
  ConnectionState as ApiConnectionState,
  MultiWalletState,
} from '../../api/types/connection.js';

// Export WalletMeshClient types for TypeDoc (now properly exported in public API)
export type { ChainConfig } from '../client/WalletMeshClient.js';

// Export modalViewSchema for TypeDoc
export { modalViewSchema } from '../../schemas/connection.js';

// Export types referenced in documentation but not in public API
export type { ChainServiceEntry } from '../../services/chains/ChainServiceRegistry.js';
export type { ProviderEntry } from '../../providers/ProviderLoader.js';

// Export BaseWalletProvider for TypeDoc
export { BaseWalletProvider } from '../providers/base/BaseWalletProvider.js';

// Export transport event types for TypeDoc
export type {
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportErrorEvent,
  TransportMessageEvent,
} from '../../api/types/events.js';

// Discovery service types
export type { AztecAccount } from '../../api/types/providers.js';
export type {
  SolanaWalletStandardWallet as SolanaWallet,
  SolanaWalletAccount as SolanaAccount
} from '../../client/discovery/solana/types.js';

// Type-only export for compatibility
export type WalletStandardEvent = unknown;

// Export missing types referenced in TypeDoc warnings
export type { WalletEventMap } from '../../api/types/providers.js';
export type { TokenMetadata } from '../../services/balance/types.js';
export type { ChainConfig as ChainServiceConfig } from '../../services/chain/ChainService.js';
export type { ChainServiceRegistry } from '../../services/chains/ChainServiceRegistry.js';
export type { TransactionServiceConfig } from '../../services/transaction/TransactionService.js';
export type {
  TransactionResult as TransactionServiceResult,
  TransactionError,
  GasEstimationResult,
  TransactionReceipt as TransactionServiceReceipt,
  TransactionHistoryFilter,
  TransactionRequest,
  TransactionStatus,
} from '../../services/transaction/types.js';
// Health types from HealthService
export type {
  HealthStatus,
  NetworkStatus,
  HealthIssue,
  HealthDiagnostics,
} from '../../services/health/HealthService.js';
export type { ProviderLoader } from '../../providers/ProviderLoader.js';
export type { ConnectionState } from '../../types.js';
export type { InternalWalletMeshClient } from '../../internal/client/WalletMeshClient.js';
export type { ChainServiceRegistryConfig } from '../../services/chains/ChainServiceRegistry.js';
export type { ConnectionResult } from '../../types.js';
export type { Unsubscribe } from '../../internal/wallets/base/WalletAdapter.js';
export type {
  ChainCompatibilityResult,
  ChainValidationResult,
  ChainRequirementValidationResult,
  ChainCompatibilityOptions,
  SwitchChainArgs,
  ChainValidationOptions,
} from '../../services/chain/types.js';
export type {
  ConnectArgs,
  ConnectionValidation,
  SessionInfo as ConnectionSessionInfo,
} from '../../services/connection/ConnectionService.js';
export type { DiscoveryEvent } from '../../client/DiscoveryService.js';
export type { AvailableWallet } from '../../internal/client/WalletMeshClient.js';
export type { TransactionResult } from '../../api/types/transaction.js';
export type {
  ConnectOptions,
  EventHandler,
} from '../../internal/wallets/base/WalletAdapter.js';
export type { TransactionReceipt } from '../../services/types.js';

// Additional types to reduce remaining warnings
export type { BaseTransactionParams } from '../../services/transaction/types.js';
export type {
  ProviderLoaderFunction,
  ProviderLoaderConfig,
  ProviderFactory,
} from '../../providers/ProviderLoader.js';
export type {
  WalletPreferenceServiceConfig,
  WalletPreferences,
  WalletPreference,
} from '../../services/preferences/types.js';
// Export SessionMetadata from SessionService as ConnectionSessionMetadata for connection context
export type { SessionMetadata as ConnectionSessionMetadata } from '../../services/session/SessionService.js';
export type {
  BaseChainService,
  ChainBalanceInfo,
  ChainTransactionResult,
  ChainTokenInfo,
  ChainServiceLoader,
  ChainTransactionParams,
} from '../../services/chains/BaseChainService.js';
export type { ChainServiceStatus } from '../../services/chains/ChainServiceRegistry.js';

// Fix TypeDoc warnings - export missing types
// Note: ChainServiceEntry and ProviderEntry are internal interfaces, not exported

// Chain Ensurance types are now exported from ChainService
export type {
  ChainMismatchAnalysis,
  ChainSwitchRecommendation,
  ChainSwitchContext,
  ChainEnsuranceConfig,
} from '../../services/chain/ChainService.js';

// Connection Recovery Service types
export type {
  RecoveryStrategy,
  RecoveryAttempt,
  RecoveryState,
} from '../../services/health/HealthService.js';

// Session Management Service types
export type {
  SessionInfo as SessionManagementInfo,
  SessionMetadata as SessionManagementMetadata,
} from '../../services/session/SessionService.js';

// Export SessionValidationResult from sessionSecurity.ts
export type { SessionValidationResult } from '../../security/sessionSecurity.js';

// Export SessionStateMetadata from sessionState.ts (used by SessionManager)
export type { SessionStateMetadata } from '../../api/types/sessionState.js';

// Chain Service Factory type
export type { ChainServiceFactory } from '../../services/chains/BaseChainService.js';

// WalletInfo is now imported from main types, no need for duplicate export

// Export types that are referenced in TypeDoc warnings but missing from documentation
export type {
  ChainCompatibilityInfo,
  ChainSwitchOrchestrationOptions,
  ChainSwitchConfirmData,
  ChainSwitchSuccessData,
} from '../../services/chain/ChainService.js';

// ConnectVariables doesn't exist, using ConnectOptions instead
export type { ConnectOptions as ConnectVariables } from '../../services/connection/ConnectionService.js';

export type {
  WalletEventType as EventMappingWalletEventType,
  AccountChangeEvent,
  ChainSwitchEvent,
  WalletEvent,
  ViewChangeEvent,
  ConnectionEstablishedEvent,
  ConnectionFailedEvent,
  ConnectionLostEvent,
} from '../../internal/utils/events/eventMapping.js';

// Export UI button types from UIService
export type {
  SimpleConnectButtonContent,
  SimpleConnectButtonOptions,
} from '../../services/ui/UiService.js';

// Export missing chain configuration types
export type {
  SupportedChain,
  SupportedChainsConfig,
} from '../../schemas/chains.js';

// Export the schemas themselves for TypeDoc
export {
  supportedChainSchema,
  supportedChainsConfigSchema,
} from '../../schemas/chains.js';

// Export ConnectButton types directly for TypeDoc
export type {
  ConnectButtonContent,
  ConnectButtonState,
} from '../../services/ui/connectionUiService.js';

// Export WalletAdapterConstructor for TypeDoc to resolve WalletRegistry references
export type { WalletAdapterConstructor } from '../wallets/base/WalletAdapter.js';

// Export ChainType from core types
export { ChainType } from '../../core/types.js';

// Export EventEmitter class and related types for TypeDoc
export { EventEmitter, type EventListener } from '../core/events/eventEmitter.js';
