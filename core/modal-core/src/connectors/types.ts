import type { ChainType } from '../types/chains.js';
import type { ProviderCapability, ProviderInterface } from '../types/providers.js';
import type { EventListener, WalletClientEvent } from '../types/events.js';

/**
 * Connection options for wallet connectors
 * @interface ConnectOptions
 */
export interface ConnectOptions {
  /** Silent mode - no UI prompts */
  silent?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Result of a successful connection
 * @interface ConnectionResult
 */
export interface ConnectionResult {
  /** Connected chain type */
  chain: ChainType;
  /** Provider interface type */
  provider: ProviderInterface;
  /** Connected account addresses */
  accounts: string[];
}

/**
 * Wallet connection states
 * @enum {string}
 */
export enum ConnectionState {
  /** Wallet is disconnected */
  DISCONNECTED = 'disconnected',
  /** Wallet is in the process of connecting */
  CONNECTING = 'connecting',
  /** Wallet is connected */
  CONNECTED = 'connected',
  /** Connection error occurred */
  ERROR = 'error',
}

/**
 * Core wallet connector interface
 * Defines the required functionality for wallet connectors
 * @interface WalletConnector
 */
export interface WalletConnector {
  /** Unique identifier for the connector */
  readonly id: string;
  /** Display name */
  readonly name: string;
  /** Icon URL */
  readonly icon: string;
  /** Optional description */
  readonly description?: string;

  /** Supported blockchain types */
  readonly supportedChains: ChainType[];
  /** Supported provider interfaces */
  readonly supportedProviders: ProviderInterface[];

  /**
   * Initialize the connector
   * @returns Promise that resolves when initialization is complete
   */
  initialize(): Promise<void>;

  /**
   * Check if wallet is available
   * @returns Promise that resolves to true if wallet is available, false otherwise
   */
  detect(): Promise<boolean>;

  /**
   * Connect to wallet
   * @param chain - Optional chain to connect to
   * @param options - Optional connection options
   * @returns Promise that resolves with connection result
   */
  connect(chain?: ChainType, options?: ConnectOptions): Promise<ConnectionResult>;

  /**
   * Disconnect from wallet
   * @returns Promise that resolves when disconnection is complete
   */
  disconnect(): Promise<void>;

  /**
   * Get provider capabilities
   * @param interfaceType - The provider interface type
   * @returns Provider capabilities or null if not supported
   */
  getProviderCapabilities(interfaceType: ProviderInterface): ProviderCapability | null;

  /**
   * Get provider instance
   * @param interfaceType - Optional provider interface type
   * @param chain - Optional chain type
   * @returns Provider instance
   */
  getProvider<T = unknown>(interfaceType?: ProviderInterface, chain?: ChainType): T;

  /**
   * Add event listener
   * @param event - Event type
   * @param listener - Event listener function
   */
  on<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void;

  /**
   * Remove event listener
   * @param event - Event type
   * @param listener - Event listener function to remove
   */
  off<T extends WalletClientEvent>(event: T['type'], listener: EventListener<T>): void;
}

/**
 * Base connector configuration
 * @interface ConnectorConfig
 */
export interface ConnectorConfig {
  /** Optional default chain */
  defaultChain?: ChainType;
}
