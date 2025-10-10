/**
 * Chain-agnostic exports for @walletmesh/modal-react
 *
 * This module provides only the core, chain-agnostic functionality that doesn't
 * depend on any specific blockchain implementation. For chain-specific features,
 * import from the appropriate chain module:
 * - @walletmesh/modal-react/aztec - Aztec blockchain support
 * - @walletmesh/modal-react/evm - EVM chains (Ethereum, Polygon, etc.)
 * - @walletmesh/modal-react/solana - Solana blockchain support
 * - @walletmesh/modal-react/all - All chains (larger bundle)
 *
 * @module core
 * @packageDocumentation
 */

// === CORE MODAL-CORE RE-EXPORTS (Chain-Agnostic Only) ===
export {
  // Main factory functions
  createWalletMesh,
  createModal,
  createTestModal,
  createTransport,
  createModalError,
  // Store instances and utilities
  useStore,
  getStoreInstance,
  getWalletMeshStore,
  useStoreActions,
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
  // Managers and registries (base classes only, no chain-specific)
  WalletMetadataManager,
  walletMetadataManager,
  ChainManager,
  CHAIN_CONFIGS,
  WalletActionManager,
  WalletRegistry,
  AbstractWalletAdapter,
  // Base provider system (no chain-specific providers)
  BaseWalletProvider,
  ProviderRegistry,
  // Discovery services
  DiscoveryService,
  // Test wallet adapter (chain-agnostic)
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

// Re-export core types (chain-agnostic only)
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
  ModalFactoryConfig,
  DiscriminatedSessionState,
  Disposable,
  EventListener,
  // Store types
  WalletMeshState,
  LoadingState,
  ModalView,
  StoreApi,
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
  // Transaction types (base types only)
  TransactionContext,
  SafeTransactionRequest,
  TransactionResult as CoreTransactionResult,
  TransactionManager,
  TransactionParams,
  SignMessageParams,
  TypedDataParams,
  // Provider types (base types only)
  BaseProvider,
  ProviderEventListener,
  ProviderRequest,
  ProviderLoader,
  ProviderEntry,
  WalletProviderContext,
  PublicProvider,
  // Chain provider types (interfaces only, no implementations)
  BlockchainProvider,
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
  // ClientDiscoveryEvent as DiscoveryEvent,
  DiscoveryConfig,
  // Error types
  ErrorCategory,
  RecoveryAction,
  // Icon sandbox types
  CreateSandboxedIconOptions,
} from '@walletmesh/modal-core';

// === CHAIN-AGNOSTIC REACT HOOKS ===

// Core configuration and UI hooks
export {
  useConfig,
  type UseConfigReturn,
} from './hooks/useConfig.js';

export {
  useTheme,
  type UseThemeReturn,
} from './hooks/useTheme.js';

export {
  useSSR,
  type UseSSRReturn,
} from './hooks/useSSR.js';

// Event handling (chain-agnostic)
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

// Generic query hooks (chain-agnostic)
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

// Provider-agnostic hooks (base functionality)
export {
  useWalletProvider,
  type WalletProviderInfo,
} from './hooks/useWalletProvider.js';

export {
  usePublicProvider,
  type PublicProviderInfo,
} from './hooks/usePublicProvider.js';

// Chain-specific provider hooks
export {
  useChainProvider,
  useActiveProvider,
  useProvidersByChainType,
} from './hooks/providers/useChainProvider.js';

// === THEME SUPPORT ===
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
  useStore as useInternalStore,
  shallowEqual,
  useStoreWithEquality,
} from './hooks/internal/useStore.js';

// Store utilities and aliases for backward compatibility
import { getWalletMeshStore as _getWalletMeshStore, useStore as _useStore } from '@walletmesh/modal-core';
export const createWalletMeshStore = _getWalletMeshStore;
export const walletMeshStore = _useStore;
export const useWalletMeshStore = _useStore;

// Simple reset function for testing
export const resetStore = () => {
  const store = _useStore;
  store.setState({
    entities: { wallets: {}, sessions: {}, transactions: {} },
    ui: {
      modalOpen: false,
      currentView: 'walletSelection' as const,
      viewHistory: [],
      loading: { discovery: false, connection: false, transaction: false, modal: false },
      errors: {},
    },
    active: { walletId: null, sessionId: null, transactionId: null, selectedWalletId: null },
    meta: {
      lastDiscoveryTime: null,
      availableWalletIds: [],
      connectionTimestamps: {},
      discoveryErrors: [],
      transactionStatus: 'idle' as const,
      aztecProving: {
        entries: {},
      },
    },
  });
};

// === REACT COMPONENTS (Chain-Agnostic Only) ===

// Export base types
export * from './types.js';

// Export renamed React-specific types
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

// Connect button component
export {
  WalletMeshConnectButton,
  type WalletMeshConnectButtonProps,
} from './components/WalletMeshConnectButton.js';

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

// Generic configuration builder (chain-agnostic)
export {
  createCustomConfig,
  type SupportedChainsConfig,
} from '@walletmesh/modal-core';
