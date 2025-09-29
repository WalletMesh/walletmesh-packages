/**
 * WalletMesh React Integration - Simplified Web3 Connection Library
 *
 * A streamlined React library for integrating Web3 wallet connections.
 * Built on top of @walletmesh/modal-core with React-specific enhancements.
 *
 * ## Architecture Overview
 *
 * - ✨ **10 Core Hooks**: Simplified from 20+ hooks for easier usage
 * - 🏗️ **Production Ready**: Error boundaries, automatic recovery, robust session management
 * - 🔄 **Session-Based**: Built on modern SessionState architecture
 * - 📦 **Single Import**: All modal-core functionality re-exported
 * - 🌐 **SSR-Ready**: Full server-side rendering support
 * - 🎨 **Customizable**: CSS modules, themes, and custom components
 * - 🔒 **Secure**: Sandboxed icons and CSP-compliant
 *
 * ## Quick Start
 *
 * ```tsx
 * import { WalletMeshProvider, useAccount, useConnect, useTheme } from '@walletmesh/modal-react';
 *
 * function App() {
 *   const { isConnected, address, wallet } = useAccount();
 *   const { connect, disconnect } = useConnect();
 *   const { theme, toggleTheme } = useTheme();
 *
 *   return (
 *     <WalletMeshProvider config={{
 *       appName: 'My DApp',
 *       chains: ['evm', 'solana'],
 *       wallets: { order: ['metamask', 'phantom'] },
 *       theme: {
 *         mode: 'system',
 *         persist: true
 *       }
 *     }}>
 *       <button onClick={toggleTheme}>
 *         {theme === 'dark' ? '☀️' : '🌙'} Toggle Theme
 *       </button>
 *       {isConnected ? (
 *         <div>
 *           <p>Connected to {wallet?.name}</p>
 *           <p>Address: {address}</p>
 *           <button onClick={() => disconnect()}>Disconnect</button>
 *         </div>
 *       ) : (
 *         <button onClick={() => connect()}>Connect Wallet</button>
 *       )}
 *     </WalletMeshProvider>
 *   );
 * }
 * ```
 *
 * ## Core Hooks (10)
 *
 * ### Connection & Account Management
 * - `useAccount` - Account state, wallet selection, and connection info
 * - `useConnect` - Connection and disconnection management
 * - `usePublicProvider` - dApp RPC provider for read operations
 * - `useWalletProvider` - Wallet RPC provider for write operations
 *
 * ### Chain & Transaction Management
 * - `useSwitchChain` - Chain switching with validation and ensurance
 * - `useBalance` - Token balance queries
 * - `useTransaction` - Multi-chain transactions
 *
 * ### UI & Configuration
 * - `useConfig` - Modal control and configuration
 * - `useTheme` - Theme management
 * - `useWalletEvents` - Event subscriptions
 * - `useSSR` - Server-side rendering utilities
 *
 * @module @walletmesh/modal-react
 * @packageDocumentation
 */

// === CORE MODAL-CORE RE-EXPORTS ===
// Re-export everything from modal-core so developers only need one import
export {
  // Main factory functions
  createWalletMesh,
  createModal,
  createTestModal,
  // createWalletMeshStore, // Not exported from modal-core
  createTransport,
  createWalletActionManager,
  createModalError,
  // createSelectors, // Not exported from modal-core
  // Store instances and utilities
  // walletMeshStore, // Not exported from modal-core
  // resetStore, // Not exported from modal-core
  // useWalletMeshStore, // Not exported from modal-core
  // subscribeToSlice, // Not exported from modal-core
  // subscribeToConnection, // Not exported from modal-core
  // subscribeToUI, // Not exported from modal-core
  subscriptions,
  waitForState,
  waitForConnection,
  waitForModalClose,
  subscribeToConnectionChanges,
  subscribeToAllChanges,
  // Utility functions and helpers
  displayHelpers,
  formatters,
  CHAIN_NAMES,
  // Managers and registries
  WalletMetadataManager,
  walletMetadataManager,
  ChainManager,
  CHAIN_CONFIGS,
  WalletActionManager,
  WalletRegistry,
  AbstractWalletAdapter,
  // Provider system
  BaseWalletProvider,
  EvmProvider,
  type SolanaProvider,
  ProviderRegistry,
  // Discovery services
  DiscoveryService,
  // Test wallet adapter
  DebugWallet,
  // Type guards and utilities
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
  // Environment utilities
  isServer,
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
  // Icon sandbox utilities
  createSandboxedIcon,
  createSandboxedIcons,
  isSandboxSupported,
  // Logging
  LogLevel,
  // UI utilities
  useConnectButtonState,
  // Query utilities
  queryKeys,
  createQueryKey,
  QueryManager,
  type QueryManagerDependencies,
} from '@walletmesh/modal-core';

// Re-export enums
export { ChainType, TransportType, ConnectionState } from '@walletmesh/modal-core';
export type { ConnectionStatus } from '@walletmesh/modal-core';

// Re-export core client interface
export type { WalletMeshClient } from '@walletmesh/modal-core';

// Re-export connection status utilities
export {
  isConnected,
  isConnecting,
  isDisconnected,
  isError,
  isReconnecting,
  isActiveState,
  isInactiveState,
  getStatusDescription,
  isValidConnectionStatus,
} from '@walletmesh/modal-core';

// Re-export all types
export type {
  // Core types
  WalletInfo,
  WalletMetadata,
  SupportedChain,
  ConnectionResult,
  ChainConfig,
  WalletProvider,
  WalletMeshConfig as CoreWalletMeshConfig,
  WalletConfig,
  AvailableWallet,
  CreateWalletMeshOptions,
  ModalError,
  ConnectionDisplayData,
  // Modal types
  ModalController,
  ModalState,
  ModalView,
  ModalFactoryConfig,
  DiscriminatedSessionState,
  Disposable,
  EventListener,
  // Store types
  // WalletMeshStore, // Use WalletMeshState instead
  WalletMeshState,
  // ConnectionStateSlice, // Not exported
  // DiscoveryStateSlice, // Not exported
  // UIStateSlice, // Not exported
  connectionActions,
  // DiscoveryActions, // Not exported
  uiActions,
  StoreConfig,
  UIError,
  ChainState,
  SessionHistoryEntry,
  WalletPermissions,
  // Connection types
  WalletConnection,
  WalletAdapterConnectionState,
  WalletConnectionState,
  MultiWalletState,
  MultiWalletConnectionState,
  ConnectionInfo,
  // Session types
  SessionPermissions,
  SessionComparison,
  SessionManager,
  SessionState,
  SessionStatus,
  ChainSessionInfo,
  SessionProvider,
  SessionLifecycle,
  WalletSessionContext,
  ChainSwitchRecord,
  CreateSessionParams,
  SessionStatus as CoreSessionStatus,
  SessionEventMap,
  ActiveSession,
  InactiveSession,
  TransitionalSession,
  SessionBuilder,
  AccountManagementContext,
  AccountDiscoveryOptions,
  AccountSelectionRecord,
  // Transaction types
  TransactionContext,
  SafeTransactionRequest,
  TransactionResult as CoreTransactionResult,
  TransactionManager,
  TransactionParams,
  SignMessageParams,
  TypedDataParams,
  // Provider types
  BaseProvider,
  ProviderEventListener,
  ProviderRequest,
  ProviderLoader,
  ProviderEntry,
  WalletProviderContext,
  PublicProvider,
  // Chain provider types
  BlockchainProvider,
  EVMProvider,
  EVMTransactionRequest,
  EVMChainConfig,
  EVMAssetConfig,
  ChainSolanaProvider,
  SolanaCapabilities,
  // Note: AztecProvider has been removed from modal-core
  // Use AztecRouterProvider from @walletmesh/aztec-rpc-wallet instead
  // Wallet adapter types
  WalletAdapter,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
  ChainDefinition,
  AdapterContext,
  DetectionResult,
  AdapterEvent,
  AdapterEvents,
  EventData,
  EventHandler,
  Unsubscribe,
  DebugWalletConfig,
  // Framework adapter types
  Transport,
  TransportConfig,
  PopupConfig,
  ChromeExtensionConfig,
  TransportMessageEvent,
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportErrorEvent,
  TransportEvent,
  // Metadata types
  WalletWithMetadata,
  GroupedWallets,
  WalletFilterCriteria,
  WalletSortOption,
  // Discovery types
  DiscoveredWallet,
  DiscoveryEvent,
  DiscoveryConfig,
  // Error types
  ErrorCategory,
  RecoveryAction,
  // Icon sandbox types
  CreateSandboxedIconOptions,
  // Transport types (commenting out until properly exported from modal-core)
  // TransportRequest,
  // TransportResponse,
  // WalletTransport,
  // WalletCapabilities as TransportCapabilities,
  // ChainInfo,
  // ProviderFeature,
} from '@walletmesh/modal-core';

// === CONSOLIDATED HOOKS ===
// Core hooks with merged functionality

// useConnect now includes disconnect functionality
export {
  useConnect,
  useWalletAdapters,
  useIsConnecting,
  useConnectionProgress,
  type UseConnectReturn,
  type ReactConnectOptions as ConnectOptions,
  type DisconnectOptions,
  type ConnectionProgress,
  type ConnectArgs,
  type ReactConnectionResult as ConnectResult,
  type ConnectVariables,
} from './hooks/useConnect.js';

// useAccount now includes wallet selection functionality
export {
  useAccount,
  type AccountInfo,
  type WalletSelectionOptions,
  type WalletAvailability,
} from './hooks/useAccount.js';

// useSwitchChain now includes ensureChain functionality
export {
  useSwitchChain,
  useSupportedChains,
  useIsSwitchingChain,
  useIsChainCompatible,
  useRequireChainType,
  type UseSwitchChainReturn,
  type SwitchChainResult,
  type ChainInfo as SwitchChainInfo,
  type SwitchChainVariables,
  type UseSwitchChainOptions,
  type SwitchChainArgs,
  type ChainValidationOptions,
  type ChainValidationResult,
} from './hooks/useSwitchChain.js';

// === TRANSACTION HOOKS ===
// Transaction execution and balance queries
export {
  useTransaction,
  type TransactionRequest,
  type TransactionResult,
  type TransactionStatus,
  type TransactionError,
  type UseTransactionReturn,
  type EVMTransactionParams,
  type SolanaTransactionParams,
} from './hooks/useTransaction.js';
export {
  useBalance,
  type TokenInfo,
  type UseBalanceOptions,
  type UseBalanceReturn,
  type BalanceInfo,
} from './hooks/useBalance.js';

// === TANSTACK QUERY HOOKS ===
// Generic query and invalidation utilities
export {
  useWalletQuery,
  type UseWalletQueryOptions,
  type UseWalletQueryReturn,
} from './hooks/useWalletQuery.js';
export {
  useQueryInvalidation,
  type InvalidationOptions,
  type UseQueryInvalidationReturn,
} from './hooks/useQueryInvalidation.js';

// === UI HOOKS ===
// Modal control, theme, and SSR utilities
export {
  useConfig,
  type UseConfigReturn,
  type RefreshWalletsOptions,
} from './hooks/useConfig.js';
export {
  useTheme,
  type UseThemeReturn,
} from './hooks/useTheme.js';
export {
  useSSR,
  type UseSSRReturn,
} from './hooks/useSSR.js';

// === EVENT HOOKS ===
// Event subscriptions
export {
  useWalletEvents,
  type ModalEventMap,
  type WalletEventHandler,
  type EventOptions,
  type EventConfig,
  type EventHandlers,
  type UseWalletEventsReturn,
  type StateUpdatedEvent,
  type ChainSwitchedEvent,
  type ConnectionEstablishedEvent,
} from './hooks/useWalletEvents.js';

// === PROVIDER HOOKS ===
// Public/private provider pattern hooks
export {
  usePublicProvider,
  type PublicProviderInfo,
} from './hooks/usePublicProvider.js';

export {
  useWalletProvider,
  type WalletProviderInfo,
} from './hooks/useWalletProvider.js';

// === CONSOLIDATED AZTEC HOOKS ===
// Simplified Aztec wallet integration
export {
  useAztecWallet,
  useAztecWalletRequired,
  type AztecWalletInfo,
} from './hooks/useAztecWallet.js';

// === CONSOLIDATED EVM HOOKS ===
// Simplified EVM wallet integration
export {
  useEvmWallet,
  useEvmWalletRequired,
  type EvmWalletInfo,
} from './hooks/useEvmWallet.js';

// === CONSOLIDATED SOLANA HOOKS ===
// Simplified Solana wallet integration
export {
  useSolanaWallet,
  useSolanaWalletRequired,
  type SolanaWalletInfo,
} from './hooks/useSolanaWallet.js';

// === AZTEC-SPECIFIC HOOKS ===
// Aztec blockchain integration hooks
export {
  useAztecContract,
  type UseAztecContractReturn,
} from './hooks/useAztecContract.js';

// Aztec transaction hook
export {
  useAztecTransaction,
  type UseAztecTransactionReturn,
  type TransactionOptions,
  type TransactionResult as AztecTransactionResult,
} from './hooks/useAztecTransaction.js';

// Aztec deployment hook
export {
  useAztecDeploy,
  type UseAztecDeployReturn,
  type DeploymentOptions,
  type DeploymentResult,
  type ContractArtifact,
} from './hooks/useAztecDeploy.js';

export {
  useAztecAccounts,
  type UseAztecAccountsReturn,
  type AccountInfo as AztecAccountInfo,
} from './hooks/useAztecAccounts.js';

export {
  useAztecEvents,
  type UseAztecEventsReturn,
  type EventQueryOptions,
} from './hooks/useAztecEvents.js';

export {
  useAztecBatch,
  type UseAztecBatchReturn,
  type BatchTransactionStatus,
} from './hooks/useAztecBatch.js';

export {
  useAztecAuth,
  type UseAztecAuthReturn,
  type AuthWitnessEntry,
} from './hooks/useAztecAuth.js';

// === THEME SUPPORT ===
// Theme management and customization
export {
  ThemeProvider,
  useThemeContext,
  useHasThemeProvider,
  withTheme,
  DefaultThemeProvider,
  type ThemeProviderProps,
} from './theme/ThemeContext.js';
export type {
  ThemeMode,
  ThemeColors,
  ThemeShadows,
  ThemeAnimation,
  ThemeTypography,
  ThemeSpacing,
  ThemeBorderRadius,
  ThemeConfig,
  ThemeCustomization,
  ThemeProviderConfig,
  ThemeContextValue,
  ThemeCSSVariables,
  ThemeDetection,
} from './theme/types.js';
export {
  lightTheme,
  darkTheme,
  defaultTheme,
  getThemeByMode,
  mergeThemeConfig,
} from './theme/definitions.js';

// Internal store hooks (for advanced usage)
export {
  useStore,
  useStoreActions,
  shallowEqual,
  useStoreWithEquality,
} from './hooks/internal/useStore.js';

// === REACT COMPONENTS ===

// Export all types
export * from './types.js';

// Export renamed React-specific types explicitly to avoid conflicts
export type {
  ReactWalletMeshStore,
  ReactWalletMeshState,
} from './types.js';

// Core React context
export {
  WalletMeshContext,
  useWalletMeshContext,
  useHasWalletMeshProvider,
  useWalletMeshServices,
  type InternalContextValue,
} from './WalletMeshContext.js';

// Main provider component
export { WalletMeshProvider } from './WalletMeshProvider.js';
export type { WalletMeshProviderProps } from './types.js';

// Main modal component
export { WalletMeshModal } from './components/WalletMeshModal.js';

// Built-in UI components
export {
  WalletMeshConnectButton,
  type WalletMeshConnectButtonProps,
} from './components/WalletMeshConnectButton.js';
export {
  WalletMeshChainSwitchButton,
  type WalletMeshChainSwitchButtonProps,
} from './components/WalletMeshChainSwitchButton.js';
export {
  AztecConnectButton,
  type AztecConnectButtonProps,
} from './components/AztecConnectButton.js';
export {
  EVMConnectButton,
  type EVMConnectButtonProps,
} from './components/EVMConnectButton.js';
export {
  SolanaConnectButton,
  type SolanaConnectButtonProps,
} from './components/SolanaConnectButton.js';
export {
  AztecWalletMeshProvider,
  type AztecWalletMeshProviderProps,
  type AztecProviderConfig,
} from './components/AztecWalletMeshProvider.js';

// Icon sandbox components
export {
  WalletMeshSandboxedIcon,
  WalletMeshSandboxedWalletIcon,
  type WalletMeshSandboxedIconProps,
  type WalletMeshSandboxedWalletIconProps,
} from './components/WalletMeshSandboxedIcon.js';

// Error boundary component
export {
  WalletMeshErrorBoundary,
  useErrorBoundary,
  type ErrorBoundaryProps,
  type ErrorBoundaryState,
} from './components/WalletMeshErrorBoundary.js';

// Error recovery component
export {
  WalletMeshErrorRecovery,
  type WalletMeshErrorRecoveryProps,
  type ErrorAction,
} from './components/WalletMeshErrorRecovery.js';

// === UTILITIES ===

// Chain constants and helpers (re-exported from modal-core)
export {
  // Individual chain constants (wagmi-style)
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
  solanaMainnet,
  solanaDevnet,
  solanaTestnet,
  aztecSandbox,
  aztecTestnet,
  aztecMainnet,
  // Chain arrays for convenience
  evmMainnets,
  evmTestnets,
  evmChains,
  solanaMainnets,
  solanaTestChains,
  solanaChains,
  aztecMainnets,
  aztecTestChains,
  aztecChains,
  // Helper functions
  createMainnetConfig,
  createTestnetConfig,
  createAllChainsConfig,
  createCustomConfig,
  markChainsRequired,
  filterChainsByGroup,
  isChainSupported,
  getRequiredChains,
  // Core types
  type SupportedChainsConfig,
} from '@walletmesh/modal-core';

// Enhanced error types
export {
  WalletMeshErrorCode,
  WalletMeshErrors,
  createWalletMeshError,
  isWalletMeshError as isReactWalletMeshError,
  getErrorMessage,
  isRecoverableError,
  type WalletMeshError,
} from './types/errors.js';

// React-specific logger utilities
export {
  getLogger as getReactLogger,
  createComponentLogger,
  type Logger,
} from './utils/logger.js';

// Testing utilities
export { createDebugLogger } from '@walletmesh/modal-core';

// SSR utilities
export {
  isServer as isServerReact,
  isBrowser as isBrowserReact,
  useHasMounted,
  useClientOnly,
  safeBrowserAPI,
  createSSRWalletMesh,
  serializeState,
  deserializeState,
} from './utils/ssr-walletmesh.js';

// Aztec configuration utilities
export {
  createAztecConfig,
  createAztecDevConfig,
  createAztecProdConfig,
} from './chains/aztec/config.js';

// Wallet capabilities hooks
export { useWalletCapabilities, type WalletCapabilitiesInfo } from './hooks/useWalletCapabilities.js';
export {
  useWalletTransport,
  type WalletTransport,
  type WalletTransportInfo,
} from './hooks/useWalletTransport.js';

// Performance optimization hooks and utilities
export * from './hooks/granular/index.js';
export * from './utils/performance.js';
