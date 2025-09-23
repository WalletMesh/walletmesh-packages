/**
 * Unified Wallet Provider Interface - Common interface for all chain providers
 *
 * This module provides a unified interface that all chain-specific providers
 * must implement, along with connection state management and event handling.
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
import { ConnectionState } from '../../types.js';
import type { SolanaProvider } from './SolanaProvider.js';
import type { EVMProvider } from './evmProvider.js';

// Re-export ConnectionState for convenience
export { ConnectionState };

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
  error: (error: WalletProviderError) => void;
  /** Provider ready */
  ready: () => void;
  /** Provider destroyed */
  destroyed: () => void;
}

/**
 * Wallet provider error
 */
export class WalletProviderError extends Error {
  code: string;
  chainType?: ChainType;
  data?: unknown;

  constructor(message: string, code: string, chainType?: ChainType, data?: unknown) {
    super(message);
    this.name = 'WalletProviderError';
    this.code = code;
    if (chainType !== undefined) {
      this.chainType = chainType;
    }
    this.data = data;
  }
}

/**
 * Base connection info
 */
export interface ConnectionInfo {
  /** Connection state */
  state: ConnectionState;
  /** Connected accounts/addresses */
  accounts: string[];
  /** Chain/network identifier */
  chainId: string | number;
  /** Timestamp of connection */
  connectedAt?: number;
  /** Last activity timestamp */
  lastActivityAt?: number;
}

/**
 * Provider metadata
 */
export interface ProviderMetadata {
  /** Provider name */
  name: string;
  /** Provider icon URL */
  icon: string;
  /** Provider description */
  description?: string;
  /** Provider homepage */
  homepage?: string;
  /** Supported chains */
  supportedChains?: string[];
  /** Provider version */
  version?: string;
}

/**
 * Connection options common to all providers
 */
export interface CommonConnectOptions {
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Whether to show UI (false for silent connection) */
  showUI?: boolean;
  /** Preferred accounts to connect */
  preferredAccounts?: string[];
}

/**
 * Base wallet provider interface
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
  readonly metadata: ProviderMetadata;

  /** WalletMesh provider indicator - always true for WalletMesh providers */
  readonly isWalletMesh: true;

  // ===== State =====

  /** Current connection state */
  readonly connectionState: ConnectionState;

  /** Connection information - null when disconnected */
  readonly connectionInfo: ConnectionInfo | null;

  // ===== Core Methods =====

  /**
   * Connect to the wallet
   * @param options - Connection options
   * @returns Connection information
   * @throws {WalletProviderError} On connection failure
   */
  connect(options?: CommonConnectOptions): Promise<ConnectionInfo>;

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
  getConnectionInfo(): ConnectionInfo | null;

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

/**
 * Connection state manager for providers
 */
export class ConnectionStateManager {
  private state: ConnectionState = ConnectionState.Disconnected;
  private listeners: Array<(state: ConnectionState, previousState: ConnectionState) => void> = [];

  /**
   * Get current state
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Update state
   */
  setState(newState: ConnectionState): void {
    if (newState !== this.state) {
      const previousState = this.state;
      this.state = newState;
      this.notifyListeners(newState, previousState);
    }
  }

  /**
   * Add state change listener
   */
  onStateChange(listener: (state: ConnectionState, previousState: ConnectionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if in a specific state
   */
  isInState(state: ConnectionState): boolean {
    return this.state === state;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.state === ConnectionState.Connected;
  }

  /**
   * Check if connecting
   */
  isConnecting(): boolean {
    return this.state === ConnectionState.Connecting;
  }

  /**
   * Check if disconnected
   */
  isDisconnected(): boolean {
    return this.state === ConnectionState.Disconnected;
  }

  /**
   * Check if in error state
   */
  isError(): boolean {
    return this.state === ConnectionState.Error;
  }

  private notifyListeners(state: ConnectionState, previousState: ConnectionState): void {
    for (const listener of this.listeners) {
      try {
        listener(state, previousState);
      } catch (error) {
        console.error('Error in connection state listener:', error);
      }
    }
  }
}

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
): ConnectionInfo {
  return {
    state: ConnectionState.Connected,
    accounts,
    chainId,
    connectedAt: Date.now(),
    lastActivityAt: Date.now(),
  };
}
