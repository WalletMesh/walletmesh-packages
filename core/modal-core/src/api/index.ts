/**
 * @module @walletmesh/modal-core
 *
 * WalletMesh Modal Core - A comprehensive framework for wallet connection management.
 *
 * This module serves as the main entry point for the WalletMesh Modal Core library,
 * providing all public APIs, types, and utilities needed to integrate wallet
 * connections into your application.
 *
 * ## Key Features
 *
 * - **Multi-chain Support**: Connect to wallets across EVM, Solana, Aztec, and more
 * - **Unified Interface**: Consistent API regardless of blockchain type
 * - **Session Management**: Persistent connections with automatic recovery
 * - **Provider System**: Type-safe blockchain interactions
 * - **Security**: Built-in origin validation and permission management
 * - **Extensible**: Custom adapters and transport layers
 *
 * ## Quick Start
 *
 * ```typescript
 * import { createWalletMesh } from '@walletmesh/modal-core';
 *
 * const client = createWalletMesh({
 *   appName: 'My dApp',
 *   appDescription: 'Decentralized application',
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *     { chainId: 'mainnet-beta', chainType: 'solana', name: 'Solana' }
 *   ]
 * });
 *
 * // Connect to a wallet
 * const connection = await client.connect();
 * console.log('Connected to:', connection.walletId);
 * ```
 *
 * ## Main Exports
 *
 * ### Client Creation
 * - {@link createWalletMesh} - Main factory function for creating clients
 * - {@link WalletMeshClient} - Core client interface
 * - {@link WalletMeshConfig} - Configuration options
 *
 * ### Connection Types
 * - {@link WalletConnection} - Connection details
 * - {@link ConnectionState} - Connection state enum
 * - {@link SessionState} - Session management
 *
 * ### Blockchain Support
 * - {@link ChainType} - Supported blockchain types
 * - {@link BlockchainProvider} - Provider interfaces
 * - {@link EVMProvider}, {@link SolanaProvider} (for Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet)
 *
 * ### Wallet Adapters
 * - {@link WalletAdapter} - Base adapter interface
 * - {@link createAdapter} - Adapter factory
 * - {@link WalletRegistry} - Adapter registry
 *
 * ### UI Components
 * - {@link ModalController} - Modal control interface
 * - {@link Transport} - Communication transports
 *
 * @packageDocumentation
 * @public
 */

// Core types and enums
/**
 * Core blockchain and connection state enumerations and utilities.
 * These exports provide the foundation for chain identification and connection status management.
 *
 * @example
 * ```typescript
 * import { ChainType, ConnectionState, isConnected } from '@walletmesh/modal-core';
 *
 * // Check connection status
 * if (isConnected(state)) {
 *   console.log('Wallet is connected');
 * }
 * ```
 */
export {
  // Enums
  ChainType,
  TransportType,
  ConnectionState,
  ConnectionStatus,
  // Connection status utilities
  isConnected,
  isConnecting,
  isDisconnected,
  isError,
  isReconnecting,
  isActiveState,
  isInactiveState,
  getStatusDescription,
  isValidConnectionStatus,
} from '../types.js';

// Transaction safety types
/**
 * Transaction management types for safe blockchain interactions.
 * Provides context-aware transaction handling with proper error recovery.
 *
 * @example
 * ```typescript
 * import { TransactionManager, SafeTransactionRequest } from '@walletmesh/modal-core';
 *
 * const request: SafeTransactionRequest = {
 *   to: '0x...',
 *   value: '1000000000000000000',
 *   data: '0x'
 * };
 * ```
 */
export type {
  TransactionContext,
  SafeTransactionRequest,
  TransactionResult,
  TransactionManager,
} from './types/transaction.js';

// Session types (canonical)
/**
 * Comprehensive session management types for persistent wallet connections.
 * Handles session lifecycle, permissions, and multi-chain state management.
 *
 * @example
 * ```typescript
 * import { SessionState, SessionManager } from '@walletmesh/modal-core';
 *
 * // Access current session
 * const session: SessionState = client.getState().session;
 * if (session.status === 'connected') {
 *   console.log('Active chain:', session.chain.name);
 * }
 * ```
 */
export type {
  SessionState,
  SessionStatus,
  ChainSessionInfo,
  SessionProvider,
  SessionPermissions,
  SessionStateMetadata,
  SessionLifecycle,
  WalletSessionContext,
  ChainSwitchRecord,
  CreateSessionParams,
  SessionEventMap,
  DiscriminatedSessionState,
  ActiveSession,
  InactiveSession,
  TransitionalSession,
  SessionBuilder,
  SessionManager,
  SessionComparison,
  AccountInfo,
  AccountManagementContext,
  AccountDiscoveryOptions,
  AccountSelectionRecord,
} from './types/sessionState.js';

// Blockchain provider types (canonical)
/**
 * Type-safe blockchain provider interfaces for multi-chain support.
 * Each blockchain type has specialized providers with chain-specific methods.
 *
 * @example
 * ```typescript
 * import { EVMProvider, SolanaProvider } from '@walletmesh/modal-core';
 *
 * // Type-safe EVM interactions
 * const evmProvider = connection.provider as EVMProvider;
 * const block = await evmProvider.getBlockNumber();
 * ```
 */
export type {
  BlockchainProvider,
  EVMProvider,
  EVMTransactionRequest,
  EVMChainConfig,
  EVMAssetConfig,
  SolanaProvider as ChainSolanaProvider,
  SolanaCapabilities,
  // Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
} from './types/chainProviders.js';

// Direct factory exports

/**
 * Factory function for creating custom transport layers.
 * Supports different communication methods between dApp and wallet.
 *
 * @see {@link createTransport}
 */
export { createTransport } from './transports/transports.js';

/**
 * Factory function for creating debug loggers.
 * Useful for troubleshooting connection issues.
 *
 * @see {@link createDebugLogger}
 */
export { createDebugLogger } from '../internal/core/logger/logger.js';

// Core client APIs
/**
 * Core client creation and management APIs.
 * Includes the main {@link createWalletMesh} factory and related types.
 */
export * from './core/index.js';

// System services (errors, events, logging, selectors)
/**
 * System-level services including error handling, event management,
 * logging infrastructure, and state selectors.
 */
export * from './system/index.js';

// Transport system
/**
 * Communication transport layer for wallet interactions.
 * Supports multiple transport types including popups, extensions, and WebSockets.
 */
export * from './transports/index.js';

// Utilities (SSR, constants, views)
/**
 * Utility functions for server-side rendering support,
 * constants definitions, and view management.
 */
export * from './utilities/index.js';

// Provider system
/**
 * Blockchain provider system for interacting with different chains.
 * Provides unified interface with chain-specific implementations.
 */
export * from './providers/providers.js';

// Logger
/**
 * Log level enumeration for controlling logging verbosity.
 * @see {@link LogLevel}
 */
export { LogLevel } from '../internal/core/logger/logger.js';

// Utilities - exported separately to avoid conflicts with ssr.ts
// Note: isServer is exported from ssr.ts to avoid ambiguity
/**
 * Browser environment detection and safe DOM utilities.
 * Provides cross-platform utilities for browser feature detection
 * and safe access to browser APIs.
 *
 * @example
 * ```typescript
 * import { isBrowser, safeLocalStorage } from '@walletmesh/modal-core';
 *
 * if (isBrowser()) {
 *   safeLocalStorage.setItem('key', 'value');
 * }
 * ```
 */
export {
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
} from './utils/index.js';

// Lazy loading utilities and types
/**
 * Lazy loading utilities for deferred module loading.
 * Helps reduce initial bundle size by loading modules only when needed.
 *
 * @example
 * ```typescript
 * import { createLazyModule, type LazyModule } from '@walletmesh/modal-core';
 *
 * const ethersModule = createLazyModule(
 *   () => import('ethers'),
 *   { displayName: 'Ethers.js' }
 * );
 * ```
 */
export type { LazyModule } from '../utils/lazy/createLazyModule.js';

// Note: Lazy loading utilities (ethersModule, web3Module, viemModule) have been moved to
// a separate export path to avoid bundling issues with optional dependencies.
// Import them from '@walletmesh/modal-core/providers/evm/lazy' when needed.

// Framework Adapter Development Kit is now exported from adapters/index.js

// Wallet Adapter System
/**
 * Core wallet adapter system types for building wallet integrations.
 * Provides the foundation for creating adapters that connect to different wallet types.
 *
 * @example
 * ```typescript
 * import { WalletAdapter, WalletCapabilities } from '@walletmesh/modal-core';
 *
 * class MyWalletAdapter implements WalletAdapter {
 *   // Implementation
 * }
 * ```
 */
export type {
  WalletAdapter,
  WalletAdapterMetadata,
  WalletCapabilities,
  WalletFeature,
  ChainDefinition,
  AdapterContext,
  DetectionResult,
  ConnectOptions,
  AdapterEvent,
  AdapterEvents,
  EventData,
  EventHandler,
  Unsubscribe,
} from '../internal/wallets/base/WalletAdapter.js';

// Connection types (canonical)
/**
 * Connection state management types for tracking wallet connections.
 * Provides comprehensive state tracking for single and multi-wallet scenarios.
 *
 * @example
 * ```typescript
 * import { WalletConnection, ConnectionState } from '@walletmesh/modal-core';
 *
 * const connection: WalletConnection = await client.connect();
 * console.log('Connected to:', connection.address);
 * ```
 */
export type {
  WalletConnection,
  WalletAdapterConnectionState,
  WalletConnectionState,
  MultiWalletState,
  MultiWalletConnectionState,
} from '../api/types/connection.js';

// State management types
/**
 * Internal state management types for modal and connection state.
 * Used for managing UI state and tracking connection progress.
 */
export type {
  ModalView,
  WalletConnectionState as ConnectionStateMachine, // Discriminated union for state machine
  ChainState,
  SessionHistoryEntry,
  WalletPermissions,
  UIError,
  StoreConfig,
} from '../state/types.js';

/**
 * Registry for managing wallet adapters.
 * Central repository for all available wallet implementations.
 *
 * @see {@link WalletRegistry}
 */
export { WalletRegistry } from '../internal/registries/wallets/WalletRegistry.js';

/**
 * Base class for creating wallet adapters.
 * Provides common functionality for wallet implementations.
 *
 * @see {@link AbstractWalletAdapter}
 */
export { AbstractWalletAdapter } from '../internal/wallets/base/AbstractWalletAdapter.js';

// New provider system exports
/**
 * Enhanced provider system with lazy-loading and multi-chain support.
 * Provides optimized provider management for better performance.
 */
export {
  BaseWalletProvider,
  EvmProvider,
  SolanaProvider,
  // Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
  ProviderRegistry,
} from '../internal/providers/index.js';

export type {
  ProviderLoader,
  ProviderEntry,
  WalletProviderContext,
} from '../internal/providers/index.js';

// Only export chain-agnostic adapters from main entry
/**
 * Debug wallet adapter for testing and development.
 * Simulates wallet behavior without requiring actual wallet installation.
 *
 * @see {@link DebugWallet}
 */
export {
  DebugWallet,
  type DebugWalletConfig,
} from '../internal/wallets/debug/DebugWallet.js';

// React hooks

// Core interfaces and types
/**
 * Core interfaces and types used throughout the WalletMesh system.
 * Includes wallet metadata, chain configuration, and transport definitions.
 */
export type {
  // Core entities
  WalletMetadata,
  WalletInfo,
  WalletClient,
  ChainConfig,
  ConnectionResult,
  ConnectionInfo,
  SupportedChain,
  SupportedChainsConfig,
  Disposable,
  // Interface implementations
  ModalController,
  ModalState,
  Transport,
  // Transport-related types
  TransportConfig,
  PopupConfig,
  ChromeExtensionConfig,
  TransportMessageEvent,
  TransportConnectedEvent,
  TransportDisconnectedEvent,
  TransportErrorEvent,
  TransportEvent,
  // Event system types
  EventListener,
} from '../types.js';

// Event system uses simplified EventTarget-based approach

// Logger utilities
/**
 * Logging utilities for debugging and monitoring.
 * Provides structured logging with different verbosity levels.
 *
 * @see {@link Logger}
 * @see {@link createLogger}
 */
export {
  Logger,
  createLogger,
} from '../internal/core/logger/logger.js';

/**
 * Global modal logger instance and configuration.
 * Use for debugging modal-specific issues.
 *
 * @see {@link modalLogger}
 * @see {@link configureModalLogger}
 */
export {
  modalLogger,
  configureModalLogger,
} from '../internal/core/logger/globalLogger.js';

/**
 * Type guard functions for runtime type checking and provider identification.
 * Essential for type-safe interaction with different blockchain providers.
 *
 * @example
 * ```typescript
 * import { isEvmProvider, isSolanaProvider, isAztecRouterProvider } from '@walletmesh/modal-core';
 *
 * // Determine provider type and use appropriate methods
 * if (isEvmProvider(provider)) {
 *   // Use EIP-1193 request method
 *   const accounts = await provider.request({ method: 'eth_requestAccounts' });
 * } else if (isSolanaProvider(provider)) {
 *   // Use Solana-specific methods
 *   const connection = await provider.connect();
 * } else if (isAztecRouterProvider(provider)) {
 *   // Use Aztec router call pattern
 *   const response = await provider.call({ method: 'aztec_getAddress' });
 * }
 * ```
 */
export {
  // Core type guards
  isWalletInfo,
  isChainType,
  isConnectionResult,
  isModalError,
  isTransportType,
  isModalViewType,
  isConnectionState,
  hasErrorCode,
  hasErrorMessage,
  // Utility type guards
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  // Provider identification type guards
  isEvmProvider,
  isSolanaProvider,
  isAztecRouterProvider,
} from './types/guards.js';

// Error handling
/**
 * ErrorFactory provides convenient methods for creating structured errors.
 * Use these methods instead of generic Error constructors for consistent error handling.
 *
 * @example
 * ```typescript
 * import { ErrorFactory } from '@walletmesh/modal-core';
 *
 * throw ErrorFactory.connectionFailed('Failed to connect to wallet');
 * throw ErrorFactory.transactionFailed('Transaction rejected by user');
 * ```
 */
export { ErrorFactory } from '../internal/core/errors/errorFactory.js';

// Client types
/**
 * Base provider types for blockchain interactions.
 * Foundation for all chain-specific provider implementations.
 */
export type {
  BaseProvider,
  ProviderEventListener,
  ProviderRequest,
} from '../internal/client/types.js';

/**
 * Core client interface for WalletMesh.
 * Defines the contract all client implementations must fulfill.
 *
 * @see {@link WalletMeshClient}
 */
export type { WalletMeshClient } from '../internal/client/WalletMeshClient.js';

// Event types
/**
 * Comprehensive event system types for monitoring wallet and connection state.
 * Provides fine-grained events for all state transitions and user actions.
 *
 * @example
 * ```typescript
 * import { ConnectionEstablishedEvent } from '@walletmesh/modal-core';
 *
 * client.subscribe((state) => {
 *   if (state.connection.state === 'connected') {
 *     console.log('Connection established');
 *   }
 * });
 * ```
 */
export type {
  ModalEventMap,
  ViewChangingEvent,
  ViewChangedEvent,
  ConnectionInitiatedEvent,
  ConnectionEstablishingEvent,
  ConnectionEstablishedEvent,
  ConnectionFailedEvent,
  ConnectionLostEvent,
  ConnectionRestoredEvent,
  StateUpdatedEvent,
  StateResetEvent,
  WalletDiscoveredEvent,
  WalletAvailableEvent,
  WalletUnavailableEvent,
  WalletSelectedEvent,
  SessionCreatedEvent,
  SessionUpdatedEvent,
  SessionStatusChangedEvent,
  SessionEndedEvent,
  SessionExpiredEvent,
  SessionErrorEvent,
  ProviderRegisteredEvent,
  ProviderUnregisteredEvent,
  ProviderStatusChangedEvent,
  ProviderConnectedEvent,
  ProviderDisconnectedEvent,
  ProviderErrorEvent,
  TransportConnectedEvent as ModalTransportConnectedEvent,
  TransportDisconnectedEvent as ModalTransportDisconnectedEvent,
  TransportMessageEvent as ModalTransportMessageEvent,
  TransportErrorEvent as ModalTransportErrorEvent,
  ChainSwitchingEvent,
  ChainSwitchedEvent,
  ChainSwitchFailedEvent,
  ChainAddedEvent,
  EventCategory,
  EventEmitter,
  ProviderInstance,
  ProviderStatus,
} from './types/events.js';

// Event utility functions
/**
 * Utility functions for working with modal events.
 * Helpers for event categorization and filtering.
 */
export {
  isModalEvent,
  modalEventNames,
  eventCategories,
  getEventsByCategory,
  isEventInCategory,
} from './types/events.js';

// dApp RPC service exports
/**
 * dApp RPC service for direct blockchain node communication.
 * Allows applications to make RPC calls using their own infrastructure.
 *
 * @see {@link DAppRpcService}
 * @see {@link DAppRpcIntegration}
 */
export { DAppRpcService, DAppRpcIntegration } from '../services/dapp-rpc/index.js';

/**
 * dApp RPC configuration and result types.
 * Used for configuring and handling RPC communications.
 */
export type {
  DAppRpcConfig,
  DAppRpcEndpoint,
  RpcResult,
} from '../services/dapp-rpc/index.js';

// Schema exports for TypeDoc
/**
 * Error validation schemas used internally for runtime validation.
 * These schemas define the structure of error objects in the system.
 *
 * @internal
 */
export {
  errorContextSchema,
  modalErrorSchema,
} from '../schemas/errors.js';

// Security module exports
/**
 * Security components for wallet connections.
 * Provides origin validation, rate limiting, and session security.
 *
 * @see {@link OriginValidator}
 * @see {@link RateLimiter}
 * @see {@link SessionSecurityManager}
 */
export {
  OriginValidator,
  RateLimiter,
  SessionSecurityManager,
  type OriginValidationConfig,
  type RateLimitConfig,
  type RateLimitEntry,
  type RateLimitResult,
  type SessionSecurityConfig,
  type SessionValidationResult,
  type SecureSession,
} from '../security/index.js';

// Discovery module exports
/**
 * Discovery protocol integration components.
 * Manages wallet discovery and connection state.
 *
 * @see {@link ConnectionStateManager}
 */
export {
  ConnectionStateManager,
  type ConnectionState as DiscoveryConnectionState,
  type ConnectionStateChangeEvent as DiscoveryConnectionStateChangeEvent,
} from '../client/discovery/index.js';

// Re-export discovery types from @walletmesh/discovery
/**
 * Discovery protocol types for wallet capability negotiation.
 * These types are re-exported from the @walletmesh/discovery package.
 */
export type {
  QualifiedResponder as QualifiedWallet,
  CapabilityRequirements as CapabilityRequest,
  DiscoveryInitiator,
} from '@walletmesh/discovery';

export { CapabilityMatcher } from '@walletmesh/discovery';
export type { CapabilityMatchResult } from '@walletmesh/discovery';
export type { DiscoveryResponder } from '@walletmesh/discovery/responder';

// DiscoveryInitiator is already exported above

// DiscoveryResponder is already exported above

// UI services for connect button business logic
/**
 * Connect button business logic services.
 * These services provide framework-agnostic logic for managing connect button states,
 * content generation, and connection display formatting.
 *
 * @example
 * ```typescript
 * import { useConnectButtonState, connectButtonUtils } from '@walletmesh/modal-core';
 *
 * const buttonState = useConnectButtonState({
 *   isConnected: true,
 *   isConnecting: false,
 *   address: '0x123...',
 *   chainId: '1',
 *   chainType: 'evm',
 *   wallet: { name: 'MetaMask' }
 * }, {
 *   targetChainType: 'evm',
 *   showAddress: true,
 *   showChain: true
 * });
 *
 * console.log(buttonState.content.text); // "MetaMask • 0x123...abc • Ethereum"
 * ```
 */
export {
  useConnectButtonState,
  connectButtonUtils,
  connectionUIService,
  ConnectionUIService,
} from './ui/connectButton.js';

/**
 * Connect button service types.
 * Types for configuring button behavior and handling button content.
 */
export type {
  ConnectButtonState,
  ConnectButtonContent,
  ConnectButtonOptions,
  ConnectButtonConnectionInfo,
} from './ui/connectButton.js';

/**
 * Wallet adapter registry functions for custom wallet integrations.
 * These functions allow registration of custom wallet adapters that can be used
 * when wallets are discovered through the discovery protocol.
 *
 * @example
 * ```typescript
 * import { registerWalletAdapter } from '@walletmesh/modal-core';
 * import { MetaMaskAdapter } from './adapters/MetaMaskAdapter.js';
 *
 * // Register a custom adapter
 * registerWalletAdapter('MetaMaskAdapter', MetaMaskAdapter);
 * ```
 */
export {
  registerWalletAdapter,
  unregisterWalletAdapter,
  isWalletAdapterRegistered,
  getRegisteredWalletAdapters,
  clearWalletAdapterRegistry,
} from './adapters/registry.js';

/**
 * Wallet adapter constructor type for custom discovery adapter implementations.
 * Note: This is specifically for discovery protocol adapters.
 * For general wallet adapters, see WalletAdapterConstructor from internal/wallets/base/WalletAdapter.
 */
export type { WalletAdapterConstructor as DiscoveryWalletAdapterConstructor } from './adapters/registry.js';

/**
 * Wallet adapter constructor interface for general wallet adapter classes.
 * This is used by WalletRegistry for registering adapter classes.
 */
export type { WalletAdapterConstructor } from '../internal/wallets/base/WalletAdapter.js';
