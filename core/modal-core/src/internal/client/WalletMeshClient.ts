/**
 * Base interface for all WalletMesh client implementations.
 *
 * This unified interface ensures type compatibility between SSR and browser clients,
 * eliminating the need for runtime type checking in framework adapters. It defines
 * the core contract that all client implementations must fulfill.
 *
 * ## Design Philosophy
 *
 * The interface is designed to be:
 * - **Universal**: Works in both browser and server environments
 * - **Type-safe**: Provides strong typing for all operations
 * - **Minimal**: Includes only essential methods that all clients must support
 * - **Extensible**: Optional methods allow for enhanced functionality
 *
 * ## Implementation Notes
 *
 * - SSR implementations return safe no-op responses
 * - Browser implementations provide full functionality
 * - Framework adapters can rely on this interface without type guards
 *
 * @module internal/client/WalletMeshClient
 * @internal
 */

import type { HeadlessModal, HeadlessModalActions, HeadlessModalState } from '../../api/core/headless.js';
import type { WalletConnection } from '../../api/types/connection.js';
import type { ChainType, ModalController, SupportedChain, WalletInfo } from '../../types.js';
import type { WalletRegistry } from '../registries/wallets/WalletRegistry.js';
import type { WalletAdapter } from '../wallets/base/WalletAdapter.js';

// Re-export WalletConnection for convenience
export type Connection = WalletConnection;

/**
 * Core WalletMesh client interface defining the contract for all implementations.
 *
 * This unified interface provides both public API methods and internal methods,
 * ensuring consistent behavior across different environments (browser, SSR, testing).
 * Framework adapters should program against this interface rather than concrete
 * implementations.
 *
 * ## Core Capabilities
 *
 * ### Connection Management
 * - `connect()` - Establish wallet connections with optional modal UI
 * - `disconnect()` - Terminate connections cleanly
 * - `disconnectAll()` - Bulk disconnection support
 * - `getConnection?()` - Get specific wallet connection (optional, internal)
 * - `getConnections?()` - Get all connected wallets (optional, internal)
 *
 * ### State Management
 * - `getState()` - Synchronous state access
 * - `subscribe()` - Reactive state subscriptions
 * - `isConnected` - Quick connection status check
 *
 * ### UI Control
 * - `openModal()` - Show wallet selection UI
 * - `closeModal()` - Hide wallet selection UI
 * - `modal` - Direct modal access for advanced use
 *
 * ### Optional Features
 * - `switchChain?()` - Cross-chain operations
 * - `getServices()` - Business logic services
 * - `initialize?()` - Async initialization
 * - Internal methods - Marked as optional for SSR compatibility
 *
 * @example
 * ```typescript
 * // Type-safe client usage
 * function useWallet(client: WalletMeshClient) {
 *   // Subscribe to state changes
 *   useEffect(() => {
 *     return client.subscribe((state) => {
 *       console.log('State:', state.connection.state);
 *     });
 *   }, [client]);
 *
 *   // Connect to wallet
 *   const handleConnect = async () => {
 *     const connection = await client.connect();
 *     if (connection) {
 *       console.log('Connected:', connection.address);
 *     }
 *   };
 * }
 * ```
 *
 * @interface
 * @since 1.0.0
 */
export interface WalletMeshClient {
  // Core modal access
  /**
   * Modal instance for programmatic control.
   * Provides access to modal state, actions, and UI without dependencies.
   * Optional to support two-phase construction pattern.
   *
   * SSR clients use HeadlessModal (subset of functionality).
   * Browser clients use ModalController (full functionality).
   */
  modal?: HeadlessModal | ModalController;

  // State management (headless)
  /**
   * Gets the current headless modal state.
   *
   * Returns a snapshot of the current state including connection status,
   * available wallets, and modal visibility.
   *
   * @returns Current modal state object
   */
  getState(): HeadlessModalState;

  /**
   * Subscribe to headless state changes.
   *
   * @param callback - Function called with updated state on each change
   * @returns Unsubscribe function to stop receiving updates
   */
  subscribe(callback: (state: HeadlessModalState) => void): () => void;

  // Connection management (standardized signatures)
  /**
   * Connects to a wallet.
   *
   * If no walletId is provided, opens the modal for user selection.
   * Returns undefined in SSR environments for safety.
   *
   * @param walletId - Optional ID of specific wallet to connect
   * @param options - Optional wallet-specific connection options
   * @returns Promise resolving to connection details or undefined
   */
  connect(walletId?: string, options?: unknown): Promise<Connection | undefined>;

  /**
   * Connects to a wallet by opening the modal and waiting for user selection.
   *
   * This is a convenience method that combines `openModal()` and `connect()` into a single call,
   * simplifying the most common wallet connection pattern. The modal is automatically opened,
   * and the method waits for the user to select and connect to a wallet.
   *
   * @param options - Optional connection options
   * @param options.chainType - Filter wallets by chain type (e.g., 'evm', 'solana')
   * @returns Promise resolving to connection details or undefined if cancelled
   *
   * @example
   * ```typescript
   * // Simple connection with modal
   * const connection = await client.connectWithModal();
   *
   * // Filter to EVM wallets only
   * const connection = await client.connectWithModal({ chainType: ChainType.Evm });
   * ```
   *
   * @since 1.1.0
   */
  connectWithModal(options?: { chainType?: ChainType }): Promise<Connection | undefined>;

  /**
   * Disconnects from wallet(s).
   *
   * If no walletId is provided, disconnects all connected wallets.
   *
   * @param walletId - Optional ID of specific wallet to disconnect
   * @returns Promise that resolves when disconnection is complete
   */
  disconnect(walletId?: string): Promise<void>;

  /**
   * Disconnects from all connected wallets.
   *
   * Convenience method that ensures all wallet connections are properly
   * terminated and cleaned up.
   *
   * @returns Promise that resolves when all wallets are disconnected
   */
  disconnectAll(): Promise<void>;

  // Event system has been removed - use subscribe() for state changes instead

  // Modal Control
  /**
   * Opens the wallet selection modal.
   *
   * @param options - Modal display options
   * @param options.targetChainType - Target chain type to filter wallets
   * @returns Promise that resolves when modal is opened
   */
  openModal(options?: { targetChainType?: import('../../types.js').ChainType }): Promise<void>;

  /**
   * Closes the wallet selection modal.
   *
   * Immediately hides the modal if it's currently visible.
   */
  closeModal(): void;

  // Chain Management
  /**
   * Switches to a different blockchain network.
   *
   * Optional method that may not be available in all implementations
   * (e.g., SSR environments).
   *
   * @param chainId - ID of the target chain
   * @param walletId - Optional wallet ID, uses active wallet if not specified
   * @returns Promise with switch details including new provider
   */
  switchChain?(
    chainId: string,
    walletId?: string,
  ): Promise<{
    provider: unknown;
    chainType: ChainType;
    chainId: string;
    previousChainId: string;
  }>;

  // Lifecycle
  /**
   * Initializes the client and all its services.
   *
   * Optional method for implementations that require async initialization.
   * Should be called before using service methods.
   *
   * @returns Promise that resolves when initialization is complete
   */
  initialize?(): Promise<void>;

  /**
   * Cleans up all resources and connections.
   *
   * Should be called when disposing of the client to prevent memory leaks
   * and ensure proper cleanup of event listeners and connections.
   */
  destroy(): void;

  // Essential properties
  /**
   * Indicates whether any wallet is currently connected.
   *
   * @readonly
   */
  readonly isConnected: boolean;

  // Headless actions
  /**
   * Gets available headless actions for programmatic control.
   *
   * Provides methods for controlling the modal and connections without UI.
   *
   * @returns Object containing action methods
   */
  getActions(): HeadlessModalActions;

  // Service access
  /**
   * Gets all business logic services.
   *
   * Method providing access to high-level services for
   * transactions, balances, chains, and connections.
   *
   * Services have been consolidated:
   * - connection: Now includes account, health, recovery, and session functionality
   * - chain: Now includes validation, registry, and switching functionality
   *
   * @returns Object containing all available services
   */
  getServices(): {
    transaction: unknown;
    balance: unknown;
    chain: unknown;
    connection: unknown;
  };

  /**
   * Gets the QueryManager for data fetching and caching.
   *
   * @returns QueryManager instance
   */
  getQueryManager(): unknown;

  /**
   * Gets the chain service for blockchain network operations.
   *
   * Optional method for accessing chain-specific functionality.
   *
   * @returns Chain service instance
   */
  getChainService?(): unknown;

  /**
   * Gets the connection service for wallet connection management.
   *
   * Optional method for advanced connection operations.
   *
   * @returns Connection service instance
   */
  getConnectionService?(): unknown;

  /**
   * Gets the transaction service for blockchain transactions.
   *
   * Optional method for sending and managing transactions.
   *
   * @returns Transaction service instance
   */
  getTransactionService?(): unknown;

  /**
   * Gets the balance service for querying wallet balances.
   *
   * Optional method for checking token and native balances.
   *
   * @returns Balance service instance
   */
  getBalanceService?(): unknown;

  /**
   * Gets the preference service for user preferences and history.
   *
   * Optional method for managing wallet preferences and connection history.
   *
   * @returns Preference service instance
   */
  getPreferenceService?(): unknown;

  /**
   * Gets the dApp RPC service for direct blockchain communication.
   *
   * Optional method for making RPC calls to blockchain nodes using
   * the application's own infrastructure.
   *
   * @returns dApp RPC service instance
   */
  getDAppRpcService?(): unknown;

  // Provider access methods
  /**
   * Gets a public provider for read-only operations on the specified chain.
   *
   * Public providers use dApp-specified RPC endpoints, allowing applications
   * to control their infrastructure and costs for read operations.
   *
   * @param chainId - The chain ID to get a public provider for
   * @returns Public provider instance or null if not available
   */
  getPublicProvider(chainId: string): import('../../api/types/providers.js').PublicProvider | null;

  /**
   * Gets the wallet provider for write operations on the specified chain.
   *
   * Wallet providers use the wallet's RPC endpoints, enabling transaction
   * signing and other privileged operations.
   *
   * @param chainId - The chain ID to get a wallet provider for
   * @returns Wallet provider instance or null if not connected
   */
  getWalletProvider(chainId: string): import('../../api/types/providers.js').WalletProvider | null;

  /**
   * Gets a wallet adapter by ID for provider-agnostic access.
   *
   * This method provides access to the underlying wallet adapter,
   * enabling access to provider adapters and transport layers for
   * advanced use cases.
   *
   * @param walletId - ID of the wallet adapter to retrieve
   * @returns The wallet adapter instance or null if not found
   */
  getWalletAdapter(walletId: string): WalletAdapter | null;

  /**
   * Discovers available wallets in the user's environment.
   *
   * Detects installed browser extensions, mobile wallets, and other
   * wallet providers available in the current environment. Can optionally
   * filter wallets based on chain types and capabilities.
   *
   * @param options - Optional discovery request options to filter wallets
   * @returns Promise resolving to array of discovery results
   *
   * @example
   * ```typescript
   * // Discover all wallets
   * const wallets = await client.discoverWallets();
   *
   * // Discover wallets with specific capabilities
   * const evmWallets = await client.discoverWallets({
   *   supportedChainTypes: [ChainType.Evm]
   * });
   * ```
   */
  discoverWallets(options?: any): Promise<any[]>;

  // Internal Methods (Optional - SSR clients don't implement these)

  /**
   * Get a specific wallet connection by ID.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @param walletId - ID of the wallet
   * @returns The wallet adapter if connected, undefined otherwise
   * @internal
   */
  getConnection?(walletId: string): WalletAdapter | undefined;

  /**
   * Get all connected wallet adapters.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @returns Array of connected wallet adapters
   * @internal
   */
  getConnections?(): WalletAdapter[];

  /**
   * Get all wallet connections with full connection details.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @returns Array of wallet connection objects
   * @internal
   */
  getAllConnections?(): WalletConnection[];

  /**
   * Get a specific wallet adapter by ID.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @param walletId - ID of the wallet
   * @returns The wallet adapter if registered, undefined otherwise
   * @internal
   */
  getWallet?(walletId: string): WalletAdapter | undefined;

  /**
   * Get all registered wallet adapters.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @returns Array of all registered wallet adapters
   * @internal
   */
  getAllWallets?(): WalletAdapter[];

  /**
   * Set the active wallet for operations.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @param walletId - ID of the wallet to make active
   * @throws {Error} If wallet is not connected
   * @internal
   */
  setActiveWallet?(walletId: string): void;

  /**
   * Get the currently active wallet ID.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @returns The active wallet ID or null if none active
   * @internal
   */
  getActiveWallet?(): string | null;

  /**
   * Get the maximum number of concurrent connections allowed.
   *
   * Optional method for internal use. SSR clients may not implement this.
   *
   * @returns Maximum connection limit
   * @internal
   */
  getMaxConnections?(): number;

  /**
   * Wallet registry for managing wallet adapters.
   *
   * Optional property for internal use. SSR clients may not have this.
   *
   * @internal
   */
  registry?: WalletRegistry;

  /**
   * Initialize modal event handlers.
   *
   * Optional method for internal use. Called during client initialization.
   *
   * @internal
   */
  initializeModalHandlers?(): void;
}

/**
 * Configuration options for the createWalletMesh factory function.
 *
 * These options control how the client is created and initialized,
 * allowing customization of environment detection and debugging.
 *
 * @example
 * ```typescript
 * // Force SSR mode for testing
 * const client = createWalletMesh(config, {
 *   ssr: true
 * });
 *
 * // Enable debug logging
 * const client = createWalletMesh(config, {
 *   debug: true
 * });
 * ```
 *
 * @interface
 * @since 1.0.0
 */
export interface CreateWalletMeshOptions {
  /**
   * Force SSR mode regardless of environment detection.
   *
   * When true, returns a no-op client safe for server-side rendering.
   * Useful for:
   * - Testing SSR behavior
   * - Forcing SSR in ambiguous environments
   * - Ensuring consistent behavior across environments
   *
   * @default Automatically detected using isServer()
   */
  ssr?: boolean;

  /**
   * Enable additional debug logging.
   *
   * When true, the client will output detailed logs for:
   * - Connection attempts and results
   * - State transitions
   * - Service initialization
   * - Error details
   *
   * @default false
   */
  debug?: boolean;
}

/**
 * Configuration options for initializing a WalletMesh client.
 *
 * @example
 * ```typescript
 * const config: WalletMeshConfig = {
 *   appName: 'My DApp',
 *   appDescription: 'A decentralized application',
 *   appUrl: 'https://mydapp.com',
 *   appIcon: 'https://mydapp.com/icon.png',
 *   projectId: 'your-walletconnect-project-id',
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' }
 *   ],
 *   wallets: {
 *     order: ['metamask', 'walletconnect'],
 *     exclude: ['phantom']
 *   }
 * };
 * ```
 *
 * @interface
 */
export interface WalletMeshConfig {
  /**
   * The name of your application.
   * This is displayed in wallet connection prompts.
   */
  appName: string;

  /**
   * Optional description of your application.
   * Provides context to users when connecting wallets.
   */
  appDescription?: string | undefined;

  /**
   * URL of your application.
   * Used by wallets for verification and display.
   */
  appUrl?: string | undefined;

  /**
   * Icon URL for your application.
   * Should be a square image (recommended 256x256 or larger).
   */
  appIcon?: string | undefined;

  /**
   * Extended dApp metadata for identification and display.
   * Provides comprehensive identity information that flows through the entire system.
   */
  appMetadata?:
    | {
        /** Explicit origin URL (auto-detected from window.location.origin if not provided) */
        origin?: string;
        /** dApp name (can override appName) */
        name?: string;
        /** dApp description (can override appDescription) */
        description?: string;
        /** dApp icon URL for wallet display */
        icon?: string;
        /** dApp homepage URL */
        url?: string;
        /** Additional metadata fields for future extensions */
        [key: string]: unknown;
      }
    | undefined;

  /**
   * WalletConnect project ID.
   * Required for WalletConnect integration.
   * Get one at https://cloud.walletconnect.com
   */
  projectId?: string | undefined;

  /**
   * Supported blockchain networks.
   * Defines which chains your app supports using SupportedChain objects.
   */
  chains?: SupportedChain[] | undefined;

  /**
   * Wallet preferences and filtering options.
   * Controls which wallets are displayed and in what order.
   * Can also be an array of WalletInfo objects for direct wallet specification.
   */
  wallets?: WalletConfig | WalletInfo[] | undefined;

  /**
   * Enable debug mode for additional logging.
   * @default false
   */
  debug?: boolean | undefined;

  /**
   * Whether the client should handle session rehydration automatically.
   * Set to false if your framework (e.g., React) handles this separately.
   * @default true
   */
  handleRehydration?: boolean | undefined;

  /**
   * Supported interfaces per technology for discovery.
   * Allows specifying which provider interfaces to use for each blockchain technology.
   */
  supportedInterfaces?: {
    /** EVM interfaces (e.g., ['eip-1193', 'eip-6963']) */
    evm?: string[];
    /** Solana interfaces (e.g., ['solana-standard-wallet']) */
    solana?: string[];
    /** Aztec interfaces (e.g., ['aztec-wallet-api-v1', 'aztec-connect-v2']) */
    aztec?: string[];
  };

  /**
   * Discovery configuration for wallet detection.
   * Configures how the client discovers available wallets.
   */
  discovery?: {
    /** Whether discovery is enabled */
    enabled?: boolean;
    /** Discovery timeout in milliseconds */
    timeout?: number;
    /** Retry interval for periodic discovery */
    retryInterval?: number;
    /** Maximum number of discovery attempts */
    maxAttempts?: number;
    /** Technology requirements for discovery */
    technologies?: Array<{
      type: string;
      interfaces?: string[];
      features?: string[];
    }>;
    /** dApp information for wallet discovery */
    dappInfo?: {
      name: string;
      description?: string;
      url?: string;
      icon?: string;
    };
    /** Capability requirements for wallet matching */
    capabilities?: {
      technologies?: Array<{
        type: string;
        interfaces?: string[];
      }>;
      chains?: string[];
      features?: string[];
      interfaces?: string[];
    };
  };

  /**
   * Logger configuration for debugging and monitoring.
   */
  logger?: {
    /** Enable debug logging */
    debug?: boolean;
    /** Log level */
    level?: 'debug' | 'info' | 'warn' | 'error' | 'silent';
    /** Log prefix */
    prefix?: string;
  };
}

// Type alias for backwards compatibility
export type WalletMeshClientConfig = WalletMeshConfig;

// Export WalletAdapterClass for compatibility
export type WalletAdapterClass = {
  new (...args: unknown[]): WalletAdapter;
  getWalletInfo(): WalletInfo;
};

// Discovery request options
export interface DiscoveryRequestOptions {
  supportedChainTypes?: ChainType[];
  capabilities?: {
    chains?: string[];
    features?: string[];
    interfaces?: string[];
  };
  technologies?: Array<{
    type: string;
    interfaces?: string[];
    features?: string[];
  }>;
}

/**
 * Configuration for a supported blockchain network.
 *
 * @interface
 */
export interface ChainConfig extends Omit<SupportedChain, 'chainType' | 'chainId' | 'name' | 'required'> {
  /**
   * Unique identifier for the chain (e.g., '1' for Ethereum mainnet).
   */
  chainId: string;

  /**
   * Type of blockchain (e.g., 'evm', 'solana', 'aztec').
   */
  chainType: ChainType;

  /**
   * Human-readable name of the chain.
   */
  name: string;

  /**
   * Whether this chain is required for the dApp to function.
   */
  required: boolean;

  /**
   * Optional icon URL for the chain.
   */
  icon?: string;

  /**
   * dApp RPC endpoints for blockchain communication.
   * These endpoints are used by the dApp to read blockchain data,
   * separate from the wallet's RPC endpoints used for transaction submission.
   *
   * @example
   * ```typescript
   * dappRpcUrls: [
   *   'https://your-primary-node.com/rpc',
   *   'https://your-backup-node.com/rpc'
   * ]
   * ```
   */
  dappRpcUrls?: string[];

  /**
   * Configuration for dApp RPC endpoint behavior.
   */
  dappRpcConfig?:
    | {
        /** Timeout for RPC requests in milliseconds (default: 30000) */
        timeout?: number;
        /** Number of retry attempts on failure (default: 3) */
        retries?: number;
        /** Whether to use round-robin load balancing across endpoints (default: true) */
        loadBalance?: boolean;
        /** Custom headers to include in RPC requests */
        headers?: Record<string, string>;
      }
    | undefined;
}

/**
 * Configuration options for wallet filtering and ordering.
 *
 * @example
 * ```typescript
 * const walletConfig: WalletConfig = {
 *   order: ['metamask', 'walletconnect', 'coinbase'],
 *   exclude: ['phantom'],
 *   filter: (adapter) => adapter.capabilities.supportsTestnets
 * };
 * ```
 *
 * @interface
 */
export interface WalletConfig {
  /**
   * Preferred order of wallets in the UI.
   * Wallets not in this list appear after ordered ones.
   */
  order?: string[] | undefined;

  /**
   * Custom filter function for wallet adapters.
   * Return true to include the wallet.
   */
  filter?: ((adapter: WalletAdapter) => boolean) | undefined;

  /**
   * Whitelist of wallet IDs to include.
   * Only these wallets will be shown if specified.
   */
  include?: string[] | undefined;

  /**
   * Blacklist of wallet IDs to exclude.
   * These wallets will not be shown.
   */
  exclude?: string[] | undefined;

  /**
   * Custom wallet adapters to register.
   * These are added to the registry in addition to discovered wallets.
   * Useful for development/testing wallets.
   */
  custom?: WalletAdapter[] | undefined;
}

/**
 * Result of wallet detection, including availability status.
 *
 * @interface
 */
export interface AvailableWallet {
  /**
   * The wallet adapter instance.
   */
  adapter: WalletAdapter;

  /**
   * Whether the wallet is currently available (installed/accessible).
   */
  available: boolean;

  /**
   * Optional version string of the detected wallet.
   */
  version?: string | undefined;

  /**
   * Additional wallet-specific metadata.
   */
  customData?: Record<string, unknown> | undefined;
}

/**
 * Type alias for backwards compatibility.
 * Use WalletMeshClient instead.
 *
 * @deprecated Use WalletMeshClient directly. This alias will be removed in a future version.
 * @since 1.0.0
 */
export type InternalWalletMeshClient = WalletMeshClient;
