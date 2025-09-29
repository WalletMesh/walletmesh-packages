/**
 * WalletMesh Modal Core
 *
 * A framework-agnostic, type-safe library for connecting web applications to blockchain wallets
 * through modal interfaces. Supports multiple blockchain ecosystems with clean, modular architecture.
 *
 * ## Features
 * - 🔗 **Multi-chain support**: EVM, Solana, Aztec
 * - 🎨 **Framework agnostic**: React, Vue, Svelte, vanilla JS
 * - 📱 **Multiple transports**: Popup, iframe, extension
 * - 🛡️ **Type-safe**: Full TypeScript support
 * - 🔄 **Error recovery**: Built-in retry and recovery mechanisms
 * - 📦 **Modular**: Use only what you need
 *
 * ## Documentation
 *
 * - Integration Patterns - Common usage patterns and best practices
 * - Architecture - System design and component overview
 * - API Reference - Complete API documentation
 *
 * @module @walletmesh/modal-core
 * @packageDocumentation
 *
 * @example
 * // Create wallet client with sensible defaults
 * import { createWalletMeshClient, ChainType } from '@walletmesh/modal-core';
 *
 * const client = createWalletMeshClient('My DApp', {
 *   chains: [
 *     { chainId: '1', chainType: ChainType.Evm, name: 'Ethereum' }
 *   ]
 * });
 *
 * await client.initialize();
 *
 * // Access business logic services
 * const services = client.getServices();
 * const connectionResult = services.connection.validateConnectionParams('metamask');
 * const chainResult = services.chain.switchChain(provider, '1');
 *
 * // Connect to wallet
 * const connection = await client.connect('metamask', { chainId: '1' });
 *
 * @example
 * // Complete setup with all services
 * import { createCompleteWalletSetup } from '@walletmesh/modal-core';
 *
 * const { client, connectionManager, discoveryService, eventSystem } = createCompleteWalletSetup({
 *   client: {
 *     appName: 'My DApp',
 *     chains: [{ chainId: '1', chainType: 'evm', name: 'Ethereum' }]
 *   },
 *   connectionRecovery: { autoReconnect: true },
 *   discovery: { enabled: true },
 *   events: { maxHistorySize: 1000 }
 * });
 *
 * await client.initialize();
 *
 * @example
 * // Service-driven error handling
 * try {
 *   const services = client.getServices();
 *   const validation = services.connection.validateConnectionParams('metamask');
 *
 *   if (validation.isValid) {
 *     await client.connect('metamask');
 *   }
 * } catch (error) {
 *   console.error('Connection error:', error);
 *   // ErrorFactory provides structured error handling
 * }
 */

/**
 * Re-export all public types, classes, and functions from the API module
 *
 * @public
 */
export * from './api/index.js';

/**
 * Re-export chain configurations
 *
 * @public
 */
export * from './chains/index.js';

/**
 * Re-export discovery factory functions
 *
 * @public
 */
export {
  createEVMDiscoveryConfig,
  createSolanaDiscoveryConfig,
  createMultiChainDiscoveryConfig,
  createCustomDiscoveryConfig,
  createTestDiscoveryConfig,
  type CustomDiscoveryConfig,
} from './client/discovery/factory.js';

/**
 * Discovery service exports for chain-specific wallet discovery
 *
 * @public
 */
export { EVMDiscoveryService } from './client/discovery/evm/EvmDiscoveryService.js';
export { SolanaDiscoveryService } from './client/discovery/solana/SolanaDiscoveryService.js';

/**
 * Discovery service type exports
 *
 * @public
 */
export type {
  // EVM discovery types
  EIP6963ProviderInfo,
  EIP6963ProviderDetail,
  EIP1193Provider,
  DiscoveredEVMWallet,
  EVMDiscoveryConfig,
  EVMDiscoveryResults,
  // Solana discovery types
  SolanaWalletAccount,
  SolanaConnectOptions,
  SolanaWalletStandardWallet,
  SolanaProvider,
  DiscoveredSolanaWallet,
  SolanaDiscoveryConfig,
  SolanaDiscoveryResults,
} from './client/discovery/index.js';

/**
 * Re-export discovery protocol types for convenience
 *
 * @public
 */
export type {
  QualifiedResponder as QualifiedWallet,
  CapabilityRequirements,
  CapabilityPreferences,
  InitiatorInfo as DAppInfo,
  // Re-export types referenced in JSDoc comments to fix TypeDoc warnings
  DiscoveryResponseEvent,
  DiscoveryRequestEvent,
  DiscoveryInitiatorConfig,
} from '@walletmesh/discovery';

// Re-export RESPONDER_FEATURES constant and related types referenced in JSDoc comments
export { RESPONDER_FEATURES } from '@walletmesh/discovery';
export type { ResponderFeature, ResponderInfo } from '@walletmesh/discovery';

/**
 * Re-export type guards and utilities
 * Note: isModalError is exported from api/errors.js to avoid ambiguity
 *
 * @public
 */
export {
  isWalletInfo,
  isChainType,
  isConnectionResult,
  isTransportType,
  isModalViewType,
  isConnectionState,
  hasErrorCode,
  hasErrorMessage,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
} from './api/types/guards.js';

/**
 * Re-export debug utilities
 *
 * @public
 */
export * from './debug/index.js';

/**
 * Re-export logger utilities
 *
 * @public
 */
export { modalLogger } from './internal/core/logger/globalLogger.js';

/**
 * Re-export utility functions
 * Note: isServer is exported from api/ssr.js to avoid ambiguity
 *
 * @public
 */
export {
  // Environment utilities (except isServer which comes from api/ssr.js)
  isBrowser,
  hasWebWorkerSupport,
  hasServiceWorkerSupport,
  hasLocalStorage,
  hasSessionStorage,
  isBrowserExtension,
  hasIndexedDB,
  isInIframe,
  getCurrentOrigin,
  getWindow,
  getDocument,
  getNavigator,
  createSafeStorage,
  safeLocalStorage,
  safeSessionStorage,
  // Lazy loading utilities
  createLazy,
  createLazyAsync,
  createLazyProxy,
  createLazySingleton,
} from './api/utils/index.js';

/**
 * Re-export enhanced SSR utilities
 *
 * @public
 * @since 3.0.0
 */
export {
  // Enhanced SSR utilities
  safeBrowserAPI,
  transformFrameworkConfig,
  validateFrameworkConfig,
  ssrState,
  // Types
  type FrameworkConfig,
  type CoreWalletMeshConfig,
} from './api/utilities/ssr.js';

/**
 * Re-export icon sandbox utilities
 *
 * @public
 */
export {
  createSandboxedIcon,
  createSandboxedIcons,
  isSandboxSupported,
  type CreateSandboxedIconOptions,
  type DisabledIconStyle,
} from './api/utils/iconSandbox.js';

/**
 * Re-export icon utilities for framework-agnostic implementations
 *
 * @public
 */
export {
  createFallbackConfig,
  createFallbackConfigs,
  applyFallbackToElement,
  type FallbackIconConfig,
  type CreateFallbackOptions,
} from './api/utils/iconFallback.js';

export {
  createIconContainerConfig,
  normalizeIconOptions,
  createIconAccessibilityAttributes,
  getIconContainerStyles,
  type IconContainerConfig,
  type CreateIconContainerOptions,
  type NormalizedIconOptions,
  type LoadingStateConfig,
} from './api/utils/iconContainer.js';

export {
  IconErrorRecovery,
  createIconErrorRecovery,
  RECOVERY_PRESETS,
  type IconError,
  type RecoveryResult,
  type ErrorRecoveryConfig,
  type IconErrorType,
  type RecoveryStrategy as IconRecoveryStrategy,
} from './api/utils/iconErrorRecovery.js';

/**
 * Re-export formatting utilities
 *
 * @public
 */
export { formatters, CHAIN_NAMES } from './api/utils/formatters.js';

/**
 * Re-export error formatting utilities
 *
 * @public
 * @since 3.0.0
 */
export {
  formatError,
  getRecoveryMessage,
  getErrorTitle,
  isUserInitiatedError,
  ErrorType,
  type FormattedError,
} from './utils/errorFormatter.js';

/**
 * Re-export provider query utilities
 *
 * @public
 * @since 3.0.0
 */
export {
  executeProviderMethod,
  createProviderQueryKey,
  isMethodSupported,
  type ProviderQueryOptions,
  type ProviderQueryResult,
} from './utils/providerQuery.js';

/**
 * Re-export wallet selection utilities
 *
 * @public
 * @since 3.0.0
 */
export {
  // Basic functions
  getPreferredWallet,
  setPreferredWallet,
  clearWalletPreference,
  getRecommendedWallet,
  filterWalletsByChain,
  getInstallUrl,
  isWalletInstalled,
  getWalletsSortedByAvailability,
  createWalletSelectionManager,
  // Enhanced functions with preference service integration
  getRecommendedWalletWithHistory,
  getWalletsByUsageFrequency,
  createEnhancedWalletSelectionManager,
  // Constants
  DEFAULT_WALLET_PREFERENCE_KEY,
  // Types
  type WalletSelectionManager,
  type EnhancedWalletSelectionManager,
  type WalletRecommendationCriteria,
} from './utils/walletSelection.js';

/**
 * Re-export theme utilities
 *
 * @public
 * @since 3.0.0
 */
export {
  // Types
  type ThemeMode,
  type ThemeColors,
  type ThemeShadows,
  type ThemeAnimation,
  type ThemeTypography,
  type ThemeSpacing,
  type ThemeBorderRadius,
  type ThemeConfig,
  type ThemeCSSVariables,
  type ThemeDetection,
  // Constants
  DEFAULT_THEME_STORAGE_KEY,
  DEFAULT_CSS_PREFIX,
  // Detection functions
  getSystemTheme,
  getStoredTheme,
  storeTheme,
  removeStoredTheme,
  onSystemThemeChange,
  // Theme resolution
  resolveTheme,
  // CSS utilities
  themeConfigToCSSVariables,
  applyCSSVariables,
  removeCSSVariables,
  applyThemeClass,
  // Transitions
  disableTransitions,
  // Toggle utilities
  getNextTheme,
  toggleTheme,
  // Validation
  isValidThemeMode,
  // Composite utilities
  themeDetection,
  initializeTheme,
} from './theme/index.js';

// Store exports removed - using unified state management from ./state/index.js

/**
 * Re-export wallet metadata utilities
 *
 * @public
 */
export {
  WalletMetadataManager,
  walletMetadataManager,
  type WalletWithMetadata,
  type GroupedWallets,
  type WalletFilterCriteria,
  type WalletSortOption,
} from './api/utils/walletMetadata.js';

/**
 * Re-export chain management utilities
 *
 * @public
 */
export {
  ChainManager,
  CHAIN_CONFIGS,
  type ChainManagerConfig,
} from './internal/utils/chainManager.js';

/**
 * Re-export wallet action utilities
 *
 * @public
 */
export {
  WalletActionManager,
  createWalletActionManager,
  type TransactionParams,
  type SignMessageParams,
  type TypedDataParams,
  type WalletProvider,
} from './internal/utils/walletActions.js';

/**
 * Re-export error management utilities
 *
 * @public
 */
export {
  isWalletMeshError,
  categorizeError,
  getUserFriendlyMessage,
  getRecoveryActions,
  createModalError,
  toModalError,
  WALLET_ERROR_CODES,
  type ErrorCategory,
  type RecoveryAction,
} from './internal/utils/errorManager.js';

/**
 * Re-export unified state management
 *
 * @public
 */
export {
  // Store instance and type
  useStore,
  getStoreInstance,
  type WalletMeshState,
  type LoadingState,
  // Selectors for computed/derived state
  getActiveWallet,
  getActiveSession,
  getActiveTransaction,
  getSelectedWallet,
  getAllWallets,
  getAvailableWallets,
  getFilteredWallets,
  getSessionsByWallet,
  getAllSessions,
  getAllTransactions,
  getTransactionHistory,
  isWalletAvailable,
  getConnectionStatus,
  getConnectionTimestamp,
  isDiscovering,
  getError,
  isModalOpen,
  getCurrentView,
  canGoBack,
  // Subscription utilities
  subscriptions,
  waitForState,
  waitForConnection,
  waitForModalClose,
  subscribeToConnectionChanges,
  subscribeToAllChanges,
  // Additional types
  type StoreConfig,
  type UIError,
  type ChainState,
  type SessionHistoryEntry,
  type WalletPermissions,
} from './state/index.js';

/**
 * Re-export external store actions
 *
 * @public
 */
export {
  uiActions,
  connectionActions,
  transactionActions,
  actions,
  useStoreActions,
} from './state/actions/index.js';

/**
 * Re-export discovery services
 *
 * @public
 */
export {
  // Discovery service
  DiscoveryService,
  // Discovery configuration and types
  type DiscoveryConfig,
  type DiscoveryResult,
  type EnhancedDiscoveryEvent,
  type DiscoveredWallet,
  type DiscoveryConnectionManager,
  type DiscoveryEvent,
} from './discovery/index.js';

/**
 * Re-export wallet adapters
 *
 * Note: AztecAdapter has been deprecated and removed. For Aztec wallet integration,
 * use AztecRouterProvider from @walletmesh/aztec-rpc-wallet instead.
 *
 * @public
 */

export {
  DiscoveryAdapter,
  type DiscoveryAdapterConfig,
} from './internal/wallets/discovery/DiscoveryAdapter.js';

/**
 * Re-export wallet adapter registry API
 *
 * @public
 */
export {
  registerWalletAdapter,
  unregisterWalletAdapter,
  isWalletAdapterRegistered,
  getRegisteredWalletAdapters,
  clearWalletAdapterRegistry,
  type WalletAdapterConstructor,
} from './api/adapters/registry.js';

/**
 * Re-export core services
 *
 * @public
 */
export {
  // Services - accessed through WalletMeshClient.getServices()
  ServiceRegistry,
  TransactionService,
  BalanceService,
  ChainService,
  ConnectionService, // Now consolidated with account, health, recovery, session functionality
  // AccountService, // Merged into ConnectionService
  // WalletHealthService, // Merged into ConnectionService
  // ConnectionRecoveryService, // Merged into ConnectionService
  // SessionManagementService, // Merged into ConnectionService
  WalletPreferenceService, // Export for TypeDoc documentation
  type WalletPreferenceServiceDependencies,
  type WalletHistoryEntry,
  DAppRpcService,
  // Query utilities
  QueryManager,
  queryKeys,
  createQueryKey,
  type QueryManagerDependencies,
  // Service types
  type ServicesConfig,
  type TransactionRequest,
  type TransactionResult,
  type TransactionStatus,
  type EVMTransactionParams,
  type SolanaTransactionParams,
  type AztecTransactionParams,
  type SendTransactionParams,
  type BalanceInfo,
  type TokenInfo,
  type BalanceQueryOptions,
  type GetNativeBalanceParams,
  type GetTokenBalanceParams,
  type ChainInfo as ServiceChainInfo,
  type SwitchChainResult,
  type EnsureChainParams,
  type ValidateChainParams,
  type ConnectArgs,
  type ConnectOptions,
  type ConnectionServiceResult,
  type ConnectionProgress,
  type DisconnectOptions,
  type ConnectArgs as ConnectVariables,
  type ConnectionValidation,
  // Connection configuration
  type ConnectionConfig,
  // Account types
  ConnectionStatus,
  type ConnectionFlags,
  type AccountDisplayInfo,
  type UIState,
  type AddressFormat,
  // Health types
  type HealthStatus,
  type NetworkStatus,
  type ResponsivenessMetrics,
  type StabilityMetrics,
  type HealthDiagnostics,
  type HealthIssue,
  type HealthMonitoringConfig,
  type ProviderTestParams,
  type NetworkDiagnostics,
  type HealthTestResult,
  // Recovery types
  type RecoveryStrategy,
  type ErrorClassification,
  type RecoveryAttempt,
  type ErrorAnalysis,
  type RecoveryState,
  // type ConnectionRecoveryConfig, // Removed in refactoring
  // type RecoveryExecutionContext, // Removed in refactoring
  // type RecoveryExecutionResult, // Removed in refactoring
  // type RecoveryRecommendation, // Removed in refactoring
  // Session types (service-specific)
  type SessionInfo,
  type SessionMetadata,
  type SessionCreationContext,
  type SessionValidationResult,
  // Preference types
  type WalletPreference,
  type WalletPreferences,
  type WalletPreferenceServiceConfig as WalletPreferenceConfig,
  // Chain validation types
  type ChainValidationOptions,
  type ChainValidationResult,
  type ChainCompatibilityResult,
  type ChainRequirementValidationResult,
  type ChainCompatibilityOptions,
  // Chain ensurance types
  type ChainEnsuranceConfig,
  type ChainEnsuranceValidationResult,
  // Chain orchestration types
  type ChainSwitchOrchestrationOptions,
  type ChainSwitchConfirmData,
  type ChainSwitchSuccessData,
  type ChainCompatibilityInfo,
  type ChainSwitchContext,
  type ChainMismatchAnalysis,
  type ChainSwitchRecommendation,
  // Chain configuration and events
  type ChainConfig,
  type ChainSwitchingEventData,
  type ChainSwitchCompletedEventData,
  type ChainValidationEventData,
  type ChainServiceEvents,
  // UI service types (now merged into ConnectionService)
  type ConnectButtonState,
  type ConnectButtonContent,
  type ConnectButtonOptions,
  type UIConnectionInfo,
  type ConnectionDisplayOptions,
  // Service classes (for TypeDoc documentation)
  HealthService,
  SessionService,
  UIService,
  // Service dependency types
  type BaseServiceDependencies,
  type BalanceServiceDependencies,
  type ChainServiceDependencies,
  type ConnectionServiceDependencies,
  type HealthServiceDependencies,
  type SessionServiceDependencies,
  type UIServiceDependencies,
  type TransactionServiceDependencies,
  type DAppRpcServiceDependencies,
  // Service config types
  type UIServiceConfig,
  // dApp RPC types
  type DAppRpcConfig,
  type DAppRpcEndpoint,
  type RpcResult,
} from './services/index.js';

/**
 * Re-export wallet client and related functionality
 *
 * @public
 */
// Export the client implementation

export {
  // Factory functions
  createWalletMeshClient,
  createWalletMeshClientWithConfig,
  createCompleteWalletSetup,
  createDevelopmentWalletSetup,
  createProductionWalletSetup,
  // Client types
  type WalletMeshClientConfig,
  type WalletAdapterClass,
  // type WalletConnectOptions,
  type AvailableWallet,
  // type ConnectionStateChangeEvent,
  // type DiscoveryEvent as ClientDiscoveryEvent,
  type DiscoveryRequestOptions,
  type CreateWalletMeshClientOptions,
  type WalletClientSetup,
  type ClientEventHandler,
  type Unsubscribe,
  // Supporting services
  ConnectionManager,
  DiscoveryService as ClientDiscoveryService,
  EventSystem,
  // Supporting service types
  type ConnectionState,
  type ConnectionRecoveryOptions,
  type ConnectionEvent,
  type WalletEventMap,
  type EventSubscriptionOptions,
  type EventHandler,
  type EventSubscription,
  type EventHistoryEntry,
  type EventSystemConfig,
} from './client/index.js';

/**
 * Re-export core types and enums
 *
 * @public
 */
export {
  ChainType,
  TransportType,
} from './types.js';

/**
 * Re-export core type definitions
 *
 * @public
 */
export type {
  WalletInfo,
  ModalError,
  ConnectionResult,
  BaseModalState,
  ModalView,
  DiscoveredWalletInfo,
} from './types.js';

/**
 * Re-export wallet adapter types
 *
 * @public
 */
export type {
  WalletAdapter,
  WalletAdapterStatic,
} from './internal/wallets/base/WalletAdapter.js';
