/**
 * Unified Wallet Provider Interface - Common interface for all chain providers
 *
 * This module provides a unified interface that all chain-specific providers
 * must implement, along with connection state management and event handling.
 *
 * **IMPORTANT**: State management types have been moved to api/types/providerState.ts
 * This file now re-exports them for backward compatibility.
 *
 * Architecture:
 * - All blockchain providers (EVM, Solana, Aztec) implement BaseWalletProvider
 * - Common functionality like connection state and events are standardized
 * - Chain-specific functionality is added through type unions
 * - Providers handle the low-level blockchain communication
 *
 * @example
 * ```typescript
 * // Type guard to check provider type
 * function isEVMProvider(provider: WalletProvider): provider is EVMProvider {
 *   return provider.providerType === 'evm';
 * }
 *
 * // Using a provider
 * const provider = wallet.getProvider();
 * await provider.connect({ timeout: 30000 });
 *
 * if (isEVMProvider(provider)) {
 *   // EVM-specific operations
 *   const accounts = await provider.request({ method: 'eth_accounts' });
 * }
 *
 * // Listen to common events
 * provider.on('connectionStateChanged', (newState, oldState) => {
 *   console.log(`Connection: ${oldState} → ${newState}`);
 * });
 * ```
 *
 * @module providers/types/WalletProvider
 */

import type { EventEmitter } from 'node:events';
import type { SolanaProvider } from './SolanaProvider.js';
import type { EVMProvider } from './evmProvider.js';

// Re-export state management types from canonical location (api/types/providerState.ts)
// These re-exports are for backward compatibility
export {
  ConnectionState,
  type ConnectionInfo,
  type ProviderMetadata,
  type CommonConnectOptions,
  WalletProviderError,
  ConnectionStateManager,
} from '../../api/types/providerState.js';

// Import for local use
import { ConnectionState } from '../../api/types/providerState.js';

/**
 * Chain types supported by WalletMesh
 * Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
 */
export type ChainType = 'evm' | 'solana';

/**
 * Common wallet events across all chain types
 *
 * These events are emitted by all providers regardless of blockchain type.
 * Chain-specific providers may emit additional events.
 *
 * @example
 * ```typescript
 * provider.on('connectionStateChanged', (newState, oldState) => {
 *   if (newState === ConnectionState.Connected) {
 *     console.log('Wallet connected!');
 *   } else if (newState === ConnectionState.Error) {
 *     console.error('Connection error');
 *   }
 * });
 *
 * provider.on('error', (error) => {
 *   console.error(`Provider error [${error.code}]:`, error.message);
 *   // Handle specific error codes
 *   if (error.code === 'USER_REJECTED') {
 *     showUserRejectionMessage();
 *   }
 * });
 * ```
 */
export interface CommonWalletEventMap {
  /** Connection state changed */
  connectionStateChanged: (state: ConnectionState, previousState: ConnectionState) => void;
  /** Error occurred */
  error: (error: import('../../api/types/providerState.js').WalletProviderError) => void;
  /** Provider ready */
  ready: () => void;
  /** Provider destroyed */
  destroyed: () => void;
}

// Note: ConnectionInfo, ProviderMetadata, CommonConnectOptions, WalletProviderError, and ConnectionStateManager
// are now defined in api/types/providerState.ts and re-exported above for backward compatibility

/**
 * Base wallet provider interface
 *
 * @deprecated This rich interface is not implemented by any class in modal-core.
 * Use the simpler BaseWalletProvider from api/types/providers.ts instead, which
 * extends CommonProviderInterface and is the canonical interface for wallet providers.
 *
 * This interface will be removed in a future version.
 *
 * All chain-specific providers must implement this interface. This provides
 * a consistent API for wallet interactions across different blockchains.
 *
 * Implementation guidelines:
 * - Providers should emit 'connectionStateChanged' on any state change
 * - Connection info should be updated before state change events
 * - Errors should be emitted via 'error' event and thrown from methods
 * - Providers must clean up resources in destroy()
 *
 * @example
 * ```typescript
 * // Implementing a custom provider
 * class MyCustomProvider extends EventEmitter implements BaseWalletProvider {
 *   readonly providerType = 'evm' as const;
 *   readonly walletId = 'my-wallet';
 *   readonly isWalletMesh = true as const;
 *
 *   private _connectionState = ConnectionState.Disconnected;
 *   private _connectionInfo: ConnectionInfo | null = null;
 *
 *   get connectionState() { return this._connectionState; }
 *   get connectionInfo() { return this._connectionInfo; }
 *
 *   async connect(options?: CommonConnectOptions): Promise<ConnectionInfo> {
 *     this.updateState(ConnectionState.Connecting);
 *     try {
 *       // Connection logic here
 *       const info = await this.performConnection(options);
 *       this._connectionInfo = info;
 *       this.updateState(ConnectionState.Connected);
 *       return info;
 *     } catch (error) {
 *       this.updateState(ConnectionState.Error);
 *       throw error;
 *     }
 *   }
 * }
 * ```
 */
export interface BaseWalletProvider extends EventEmitter {
  // ===== Identification =====

  /** Provider type - identifies the blockchain */
  readonly providerType: ChainType;

  /** Wallet identifier - unique ID for this wallet */
  readonly walletId: string;

  /** Provider metadata - display information */
  readonly metadata: import('../../api/types/providerState.js').ProviderMetadata;

  /** WalletMesh provider indicator - always true for WalletMesh providers */
  readonly isWalletMesh: true;

  // ===== State =====

  /** Current connection state */
  readonly connectionState: ConnectionState;

  /** Connection information - null when disconnected */
  readonly connectionInfo: import('../../api/types/providerState.js').ConnectionInfo | null;

  // ===== Core Methods =====

  /**
   * Connect to the wallet
   * @param options - Connection options
   * @returns Connection information
   * @throws {WalletProviderError} On connection failure
   */
  connect(
    options?: import('../../api/types/providerState.js').CommonConnectOptions,
  ): Promise<import('../../api/types/providerState.js').ConnectionInfo>;

  /**
   * Disconnect from the wallet
   */
  disconnect(): Promise<void>;

  /**
   * Get connection state
   */
  getConnectionState(): ConnectionState;

  /**
   * Get connection info
   */
  getConnectionInfo(): import('../../api/types/providerState.js').ConnectionInfo | null;

  /**
   * Check if provider is available
   */
  isAvailable(): boolean;

  /**
   * Initialize provider
   */
  initialize?(): Promise<void>;

  /**
   * Destroy provider and cleanup
   */
  destroy(): Promise<void>;

  // ===== Events =====

  /**
   * Type-safe event emitter
   */
  on<K extends keyof CommonWalletEventMap>(event: K, listener: CommonWalletEventMap[K]): this;
  once<K extends keyof CommonWalletEventMap>(event: K, listener: CommonWalletEventMap[K]): this;
  removeListener<K extends keyof CommonWalletEventMap>(event: K, listener: CommonWalletEventMap[K]): this;
  off<K extends keyof CommonWalletEventMap>(event: K, listener: CommonWalletEventMap[K]): this;
  emit<K extends keyof CommonWalletEventMap>(event: K, ...args: Parameters<CommonWalletEventMap[K]>): boolean;
}

/**
 * Unified wallet provider type
 *
 * This type represents any chain-specific provider implementation
 * Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
 */
export type WalletProvider = EVMProvider | SolanaProvider;

/**
 * Extended wallet provider with common interface
 *
 * @deprecated This type uses the deprecated BaseWalletProvider interface.
 * Use WalletProvider directly instead.
 *
 * This type combines chain-specific providers with the base interface
 */
export type ExtendedWalletProvider = WalletProvider & BaseWalletProvider;

/**
 * Provider type map for type inference
 * Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
 */
export interface ProviderTypeMap {
  evm: EVMProvider;
  solana: SolanaProvider;
  // Note: aztec removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
}

/**
 * Get provider type from chain type
 */
export type GetProviderForChain<T extends ChainType> = ProviderTypeMap[T];

// Note: ConnectionStateManager is now defined in api/types/providerState.ts and re-exported above

/**
 * Type guards for wallet providers
 */
export function isWalletProvider(provider: unknown): provider is WalletProvider {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'isWalletMesh' in provider &&
    (provider as { isWalletMesh?: unknown }).isWalletMesh === true &&
    'providerType' in provider &&
    typeof (provider as { providerType?: unknown }).providerType === 'string'
  );
}

/**
 * Check if provider is of specific type
 */
export function isProviderType<T extends ChainType>(
  provider: WalletProvider,
  type: T,
): provider is ProviderTypeMap[T] {
  return (provider as ExtendedWalletProvider).providerType === type;
}

/**
 * Get chain type from provider
 */
export function getChainType(provider: WalletProvider): ChainType {
  return (provider as ExtendedWalletProvider).providerType;
}

/**
 * Provider capability checker
 */
export function hasCapability(provider: WalletProvider, _capability: string): boolean {
  if ('getCapabilities' in provider && typeof provider.getCapabilities === 'function') {
    // This would need to be async in real implementation
    return true;
  }
  return false;
}

/**
 * Create a mock connection info for testing
 */
export function createMockConnectionInfo(
  _chainType: ChainType,
  accounts: string[] = [],
  chainId: string | number = '1',
): import('../../api/types/providerState.js').ConnectionInfo {
  return {
    state: ConnectionState.Connected,
    accounts,
    chainId,
    connectedAt: Date.now(),
    lastActivityAt: Date.now(),
  };
}
