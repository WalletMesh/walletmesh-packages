/**
 * Client module types
 * @internal
 */

import type { ChainType, ConnectionResult, SupportedChain } from '../../types.js';

export type { ConnectionResult };
import type { ModalError } from '../core/errors/types.js';

/**
 * Provider request parameters with generic constraints
 * @interface ProviderRequest
 * @template TMethod - The method name type
 * @template TParams - The parameters type
 */
export interface ProviderRequest<TMethod extends string = string, TParams = unknown[]> {
  /**
   * The method name to call on the provider
   * @type {TMethod}
   */
  method: TMethod;

  /**
   * Optional parameters for the method
   * @type {TParams}
   */
  params?: TParams;
}

/**
 * Type-safe event listener
 * @typedef {Function} ProviderEventListener
 * @template TPayload - The event payload type
 * @param {TPayload} payload - The event payload
 * @returns {void}
 */
export type ProviderEventListener<TPayload = unknown> = (payload: TPayload) => void;

/**
 * Base provider interface with generic constraints
 * Represents wallet provider implementations
 * @interface BaseProvider
 */
export interface BaseProvider {
  /**
   * Type-safe request method for making calls to the provider
   * @template TMethod - The method name type
   * @template TParams - The parameters type
   * @template TResult - The expected result type
   * @param {ProviderRequest<TMethod, TParams>} args - Request arguments
   * @returns {Promise<TResult>} Promise resolving to the result
   */
  request<TMethod extends string = string, TParams = unknown[], TResult = unknown>(
    args: ProviderRequest<TMethod, TParams>,
  ): Promise<TResult>;

  /**
   * Add a type-safe event listener
   * @template TPayload - The event payload type
   * @param {string} event - Event name to listen for
   * @param {ProviderEventListener<TPayload>} listener - Event handler function
   * @returns {void}
   */
  on<TPayload = unknown>(event: string, listener: ProviderEventListener<TPayload>): void;

  /**
   * Remove a type-safe event listener
   * @template TPayload - The event payload type
   * @param {string} event - Event name to remove listener from
   * @param {ProviderEventListener<TPayload>} listener - Event handler to remove
   * @returns {void}
   */
  removeListener<TPayload = unknown>(event: string, listener: ProviderEventListener<TPayload>): void;

  /**
   * Additional methods for testing
   * @internal
   * @template TPayload - The event payload type
   * @param {string} event - Event name to emit
   * @param {TPayload} payload - Event payload
   * @returns {void}
   */
  emitMockEvent?: <TPayload = unknown>(event: string, payload: TPayload) => void;

  /**
   * Get all registered listeners with proper typing
   * @internal
   * @returns {Record<string, Array<ProviderEventListener<unknown>>>} Map of event names to listener arrays
   */
  getMockListeners?: () => Record<string, Array<ProviderEventListener<unknown>>>;
}

/**
 * Configuration options for the WalletClient
 * @internal
 * @interface WalletClientConfig
 */
export interface WalletClientConfig {
  /** Display name of the application */
  appName: string;

  /** Whether to automatically reconnect to the last wallet on initialization */
  autoReconnect?: boolean;

  /** Whether to persist connection details to storage */
  persistConnection?: boolean;

  /** Connection timeout in milliseconds */
  timeout?: number;

  /** Prefix for storage keys */
  storageKeyPrefix?: string;

  /** Whether to enable debug mode */
  debug?: boolean;
}

/**
 * Current state of the wallet client
 * @internal
 * @interface WalletClientState
 */
export interface WalletClientState {
  /** Current connection status (disconnected, connecting, connected) */
  status: 'disconnected' | 'connecting' | 'connected';

  /** ID of the active connector if connected */
  activeConnector: string | null;

  /** Current active chain if connected */
  activeChain: SupportedChain | null;

  /** List of connected accounts */
  accounts: string[];

  /** Current error if any */
  error: ModalError | null;
}

/**
 * Options for connecting to a wallet
 * @internal
 * @interface ConnectOptions
 */
export interface ConnectOptions {
  /** Preferred provider interface to use */
  preferredInterface?: string;

  /** Chain type to connect to */
  chainType?: ChainType;

  /** Whether to silently fail if connection is rejected */
  silent?: boolean;

  /** Maximum number of retry attempts for connection */
  maxRetries?: number;

  /** Base delay in milliseconds between retry attempts */
  baseDelayMs?: number;

  /** Optional connection timeout in milliseconds */
  timeoutMs?: number;
}

/**
 * Enum for client event types
 * @internal
 */
export enum ClientEventType {
  /** Connecting to wallet */
  Connecting = 'connecting',

  /** Successfully connected to wallet */
  Connected = 'connected',

  /** Disconnected from wallet */
  Disconnected = 'disconnected',

  /** Chain changed on the connected wallet */
  ChainChanged = 'chain_changed',

  /** Accounts changed on the connected wallet */
  AccountsChanged = 'accounts_changed',

  /** Error occurred */
  Error = 'error',
}

/**
 * Core client event interface
 * @internal
 * @interface ClientEvent
 */
export interface ClientEvent {
  /** Type of the event */
  type: ClientEventType;
}

/**
 * Client connecting event
 * @internal
 * @interface ClientConnectingEvent
 */
export interface ClientConnectingEvent extends ClientEvent {
  type: ClientEventType.Connecting;
  /** Wallet ID being connected to */
  walletId: string;
}

/**
 * Client connected event
 * @internal
 * @interface ClientConnectedEvent
 */
export interface ClientConnectedEvent extends ClientEvent {
  type: ClientEventType.Connected;
  /** Wallet ID that was connected */
  walletId: string;
  /** Connected accounts */
  accounts: string[];
  /** Connected chain ID */
  chainId: string | number;
  /** Connected chain type */
  chainType: ChainType;
}

/**
 * Client disconnected event
 * @internal
 * @interface ClientDisconnectedEvent
 */
export interface ClientDisconnectedEvent extends ClientEvent {
  type: ClientEventType.Disconnected;
  /** Reason for disconnection if available */
  reason?: string;
}

/**
 * Chain changed event
 * @internal
 * @interface ClientChainChangedEvent
 */
export interface ClientChainChangedEvent extends ClientEvent {
  type: ClientEventType.ChainChanged;
  /** New chain ID */
  chainId: string | number;
  /** New chain type */
  chainType: ChainType;
}

/**
 * Accounts changed event
 * @internal
 * @interface ClientAccountsChangedEvent
 */
export interface ClientAccountsChangedEvent extends ClientEvent {
  type: ClientEventType.AccountsChanged;
  /** New accounts list */
  accounts: string[];
}

/**
 * Client error event
 * @internal
 * @interface ClientErrorEvent
 */
export interface ClientErrorEvent extends ClientEvent {
  type: ClientEventType.Error;
  /** Modal error object with rich error information */
  error: ModalError;
  /** Operation context where error occurred */
  code?: string | number | null;
  /** Error context if available */
  context?: string;
  /** Number of retry attempts that were made (if applicable) */
  retryCount?: number;
  /** Whether the error is recoverable */
  recoverable?: boolean;
}

/**
 * Union type for all client events
 * @internal
 */
export type WalletClientEvent =
  | ClientConnectingEvent
  | ClientConnectedEvent
  | ClientDisconnectedEvent
  | ClientChainChangedEvent
  | ClientAccountsChangedEvent
  | ClientErrorEvent;

/**
 * Wallet client event listener type
 * @internal
 */
export type WalletClientEventListener = (event: WalletClientEvent) => void;

/**
 * Interface for the wallet client
 * @internal
 * @interface WalletClient
 */
export interface WalletClient {
  /**
   * Initialize the client
   */
  initialize(): Promise<void>;

  /**
   * Connect to a specific wallet
   */
  connect(walletId: string, options?: ConnectOptions): Promise<ConnectionResult>;

  /**
   * Disconnect from the current wallet
   */
  disconnect(): Promise<void>;

  /**
   * Get the current client state
   */
  getState(): WalletClientState;

  /**
   * Get the current provider for making blockchain requests
   * @param chainType - Optional chain type to get provider for
   */
  getProvider(chainType?: ChainType): unknown;

  /**
   * Switch to a different blockchain network
   */
  switchChain(chainId: string | number): Promise<void>;

  /**
   * Register an event listener
   */
  on(event: ClientEventType, listener: WalletClientEventListener): () => void;

  /**
   * Remove an event listener
   */
  off(event: ClientEventType, listener: WalletClientEventListener): void;
}
