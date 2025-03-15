import type { ChainType } from './chains.js';
import type { ProviderInterface, ProviderCapability, BaseProvider } from './providers.js';
import type { EventEmitter } from './events.js';

/**
 * Client Types Module
 * Defines core interfaces and types for wallet client implementation
 * This module provides the foundation for wallet connection and management
 *
 * @module client
 */

/**
 * Configuration options for WalletClient
 * Defines customization options for client behavior
 *
 * @interface WalletClientConfig
 */
export interface WalletClientConfig {
  /** Application name for identification */
  appName: string;
  /** Whether to automatically reconnect on initialization */
  autoReconnect?: boolean;
  /** Whether to persist connection state */
  persistConnection?: boolean;
  /** Default provider interface to use */
  defaultProviderInterface?: ProviderInterface;
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Storage key prefix for persistence */
  storageKeyPrefix?: string;
}

/**
 * Client state interface
 * Represents the complete state of the wallet client
 *
 * @interface WalletClientState
 */
export interface WalletClientState {
  /** Current connection status */
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  /** Currently active connector ID */
  activeConnector: string | null;
  /** Currently active chain */
  activeChain: ChainType | null;
  /** Currently active provider interface */
  activeProviderInterface: ProviderInterface | null;
  /** Connected accounts */
  accounts: string[];
  /** Latest error if any */
  error: Error | null;
}

/**
 * Connection options interface
 * Options for wallet connection attempts
 *
 * @interface ConnectOptions
 */
export interface ConnectOptions {
  /** Preferred provider interface */
  preferredInterface?: ProviderInterface;
  /** Chain to connect to */
  chainType?: ChainType;
  /** Whether to cache the connection */
  cache?: boolean;
}

/**
 * Connection result interface
 * Information about a successful wallet connection
 *
 * @interface ConnectionResult
 */
export interface ConnectionResult {
  /** Connected accounts */
  accounts: string[];
  /** Active chain type */
  chainType: ChainType;
  /** Provider interface used */
  providerInterface: ProviderInterface;
  /** Provider capabilities */
  capabilities: ProviderCapability;
}

/**
 * Core WalletClient interface
 * Defines the main API for wallet interactions
 *
 * @interface WalletClient
 * @extends {EventEmitter}
 */
export interface WalletClient extends EventEmitter {
  /**
   * Initialize the client
   * Sets up event listeners and restores cached state if available
   */
  initialize(): Promise<void>;

  /**
   * Get current client state
   * @returns Current state of the wallet client
   */
  getState(): WalletClientState;

  /**
   * Connect to a wallet
   * @param connectorId - ID of the connector to use
   * @param options - Optional connection configuration
   * @returns Connection result
   */
  connect(connectorId: string, options?: ConnectOptions): Promise<ConnectionResult>;

  /**
   * Disconnect current wallet
   * Cleans up connection and resets state
   */
  disconnect(): Promise<void>;

  /**
   * Get provider instance
   * @template T - Type of provider to return
   * @param providerInterface - Desired provider interface
   * @param chain - Desired chain for the provider
   * @returns Provider instance or null if not available
   */
  getProvider<T extends BaseProvider = BaseProvider>(
    providerInterface?: ProviderInterface,
    chain?: ChainType,
  ): T | null;

  /**
   * Get supported provider interfaces
   * @returns Array of supported provider interfaces
   */
  getSupportedProviderInterfaces(): ProviderInterface[];

  /**
   * Check if a provider interface is supported
   * @param type - Provider interface to check
   * @returns True if interface is supported
   */
  supportsInterface(type: ProviderInterface): boolean;

  /**
   * Get active accounts
   * @returns Array of connected account addresses
   */
  getAccounts(): string[];

  /**
   * Switch chain
   * @param chainType - Chain to switch to
   */
  switchChain(chainType: ChainType): Promise<void>;
}

/**
 * Client factory interface
 * Factory for creating wallet client instances
 *
 * @interface WalletClientFactory
 */
export interface WalletClientFactory {
  /**
   * Create a new WalletClient instance
   * @param config - Client configuration options
   * @returns Configured wallet client instance
   */
  create(config: WalletClientConfig): WalletClient;
}
