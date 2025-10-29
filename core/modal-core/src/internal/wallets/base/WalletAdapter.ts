import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { WalletAdapterConnectionState, WalletConnection } from '../../../api/types/connection.js';
import type { ProviderClass, WalletProvider } from '../../../api/types/providers.js';
import type { ChainType, WalletInfo } from '../../../types.js';
import type { ModalError } from '../../core/errors/types.js';

/**
 * Represents metadata about a wallet
 */
export interface WalletAdapterMetadata {
  /** Display name of the wallet */
  name: string;
  /** Icon as data URI or URL */
  icon: string;
  /** Optional description */
  description?: string;
  /** Optional homepage URL */
  homepage?: string;
}

/**
 * Defines what a wallet supports
 */
export interface WalletCapabilities {
  /** Supported blockchain types and their chain IDs */
  chains: ChainDefinition[];
  /** Set of features this wallet supports */
  features: Set<WalletFeature>;
  /** Permissions this wallet requires/supports */
  permissions?: {
    /** Methods the wallet can execute */
    methods: string[];
    /** Events the wallet can emit */
    events: string[];
  };
}

/**
 * Chain definition for wallet capabilities
 */
export interface ChainDefinition {
  /** Type of blockchain */
  type: ChainType;
  /** Supported chain IDs, or '*' for all chains of this type */
  chainIds?: string[] | '*';
}

/**
 * Features that a wallet can support
 */
export type WalletFeature =
  | 'sign_message'
  | 'sign_typed_data'
  | 'encrypt'
  | 'decrypt'
  | 'multi_account'
  | 'hardware_wallet'
  | 'wallet_connect';

/**
 * Context provided to wallet adapters during installation
 */
export interface AdapterContext {
  /** Logger instance for debugging */
  logger: {
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, error?: unknown): void;
  };
  /** Application metadata */
  appMetadata?: {
    name: string;
    description?: string;
    url?: string;
    icons?: string[];
  };
}

/**
 * Options for connecting to a wallet
 */
export interface ConnectOptions {
  /** Request specific chains */
  chains?: Array<{ type: ChainType; chainId?: string }>;
  /** Request specific features */
  requiredFeatures?: string[];
  /** Silent connection (no modal) */
  silent?: boolean;
  /** Custom RPC URLs */
  rpcUrls?: Record<string, string>;
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Optional project ID for services like WalletConnect */
  projectId?: string;
  /** Optional logger instance */
  logger?: AdapterContext['logger'];
  /** Session ID for reconnection attempts */
  sessionId?: string;
  /** Force creation of a new session even if sessionId is provided */
  requestNewSession?: boolean;
  /** Whether this is a reconnection attempt */
  isReconnection?: boolean;
  /** Additional adapter-specific options */
  [key: string]: unknown;
}

/**
 * Result of wallet detection
 */
export interface DetectionResult {
  /** Whether the wallet is installed/available */
  isInstalled: boolean;
  /** Whether the wallet is ready to use */
  isReady?: boolean;
  /** Optional version information */
  version?: string;
  /** Optional additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Type-safe event system
 */
export type AdapterEvents = {
  'connection:established': { connection: WalletConnection };
  'connection:lost': { reason: string; error?: ModalError };
  'accounts:changed': { accounts: string[]; chainType: ChainType };
  'chain:changed': { chainId: string; chainType: ChainType };
  error: { error: ModalError; operation: string };
  'state:changed': { state: WalletAdapterConnectionState };

  // NEW: Simplified blockchain events for AbstractWalletAdapter pattern
  // These events focus on "what happened" rather than "how to update state"
  'wallet:accountsChanged': { accounts: string[]; chainType?: ChainType };
  'wallet:chainChanged': { chainId: string; chainType?: ChainType };
  'wallet:connected': { connection: WalletConnection };
  'wallet:disconnected': { reason?: string };
};

export type AdapterEvent = keyof AdapterEvents;
export type EventData<E extends AdapterEvent> = AdapterEvents[E];
export type EventHandler<E extends AdapterEvent> = (data: EventData<E>) => void;
export type Unsubscribe = () => void;

/**
 * Static interface for WalletAdapter classes
 * Allows retrieving wallet information without instantiation
 */
export interface WalletAdapterStatic {
  /**
   * Get wallet information without instantiating the adapter
   * @returns Wallet metadata and capabilities
   */
  getWalletInfo(): WalletInfo;
}

/**
 * Constructor type for WalletAdapter classes
 */
export interface WalletAdapterConstructor extends WalletAdapterStatic {
  new (): WalletAdapter;
}

/**
 * Main wallet adapter interface
 * Implementations of this interface provide wallet-specific functionality
 */
export interface WalletAdapter {
  /** Unique identifier for this wallet */
  readonly id: string;

  /** Display metadata for the wallet */
  readonly metadata: WalletAdapterMetadata;

  /** Capabilities and requirements of this wallet */
  readonly capabilities: WalletCapabilities;

  /**
   * Map of supported chain types to provider classes
   * Used by modal-core client to instantiate the appropriate provider
   *
   * @example
   * ```typescript
   * supportedProviders: {
   *   [ChainType.Evm]: EvmProvider,
   *   [ChainType.Solana]: SolanaProvider
   * }
   * ```
   */
  readonly supportedProviders: Partial<Record<ChainType, ProviderClass>>;

  /**
   * Initialize the adapter when registered
   * @param context - Adapter context with logger and app metadata
   */
  install(context: AdapterContext): Promise<void>;

  /**
   * Cleanup when adapter is unregistered
   */
  uninstall(): Promise<void>;

  /** Current connection state */
  readonly state: WalletAdapterConnectionState;

  /**
   * Connect to the wallet
   * @param options - Connection options
   * @returns Connection object
   * @throws {ModalError} If connection fails
   */
  connect(options?: ConnectOptions): Promise<WalletConnection>;

  /**
   * Disconnect from the wallet
   */
  disconnect(): Promise<void>;

  /**
   * Get a typed provider for a specific chain type
   * @param chainType - Type of blockchain
   * @returns Typed provider instance
   * @throws {Error} If chain type not supported or not connected
   */
  getProvider(chainType: ChainType): WalletProvider;

  /**
   * Check if a provider is available for a chain type
   * @param chainType - Type of blockchain to check
   */
  hasProvider(chainType: ChainType): boolean;

  /**
   * Subscribe to adapter events
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  on<E extends AdapterEvent>(event: E, handler: EventHandler<E>): Unsubscribe;

  /**
   * Subscribe to a one-time event
   * @param event - Event name
   * @param handler - Event handler function
   * @returns Unsubscribe function
   */
  once<E extends AdapterEvent>(event: E, handler: EventHandler<E>): Unsubscribe;

  /**
   * Unsubscribe from an event
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off<E extends AdapterEvent>(event: E, handler: EventHandler<E>): void;

  /**
   * Detect if wallet is available/installed
   * @returns Detection result with installation status and metadata
   */
  detect(): Promise<DetectionResult>;

  /**
   * Get JSON-RPC transport for provider communication
   * Called by modal-core client after connection is established
   *
   * @param chainType - The chain type to get transport for
   * @returns JSON-RPC transport instance or undefined if not supported
   */
  getJSONRPCTransport?(chainType: ChainType): JSONRPCTransport | undefined;
}
