/**
 * @module @walletmesh/router
 *
 * Provides a flexible routing system for managing multi-chain wallet connections.
 * This package enables applications to interact with multiple blockchain wallets
 * through a unified interface, handling sessions, permissions, and request routing.
 *
 * Key exports:
 * - {@link WalletRouter} - The main router class that connects to wallet transports.
 * - {@link WalletRouterProvider} - Client-side provider for dApps to interact with the router.
 * - {@link OperationBuilder} - Fluent API for chaining multiple wallet method calls.
 * - {@link SessionStore} and implementations (e.g., `MemorySessionStore`, `LocalStorageSessionStore`).
 * - Permission management utilities (e.g., `PermissionManager`, `AllowAskDenyManager`).
 * - {@link JSONRPCWallet} type for wallet nodes.
 * - {@link createLocalTransportPair}, {@link createLocalTransport} for in-process communication.
 * - {@link ProviderSerializerRegistry} for managing method-specific serializers on the provider.
 */
export * from './errors.js';
export * from './localTransport.js';
export * from './provider.js';
export * from './router.js';
export * from './session-store.js';
export * from './types.js';
export { OperationBuilder } from './operation.js';
export { ProviderSerializerRegistry } from './provider-serialization.js';
