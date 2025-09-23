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
 * This interface provides the essential methods needed for wallet management,
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
 * - `switchChain()` - Cross-chain operations
 * - `getServices()` - Business logic services
 * - `initialize()` - Async initialization
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
  // Core headless modal access
  /**
   * Headless modal instance for programmatic control.
   * Provides access to modal state and actions without UI dependencies.
   *
   * @readonly
   */
  readonly modal: HeadlessModal;

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
    chainType: string;
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
 * Comprehensive WalletMesh client interface for managing wallet connections.
 *
 * This interface provides comprehensive wallet management capabilities including
 * connection handling, chain management, wallet discovery, and event subscriptions.
 *
 * @example
 * ```typescript
 * const client = createWalletMesh(config);
 *
 * // Connect to a wallet
 * const connection = await client.connect('metamask');
 *
 * // Switch chains
 * await client.switchChain('137', 'metamask');
 *
 * // Listen for state changes
 * client.subscribe((state) => {
 *   console.log('State changed:', state);
 * });
 * ```
 *
 * @interface
 * @since 1.0.0
 */
export interface InternalWalletMeshClient {
  // Connection Management

  /**
   * Connect to a wallet.
   *
   * @param walletId - Optional ID of specific wallet to connect. If not provided, shows modal.
   * @param options - Optional connection options specific to the wallet.
   * @returns Promise resolving to the wallet connection.
   * @throws {Error} If connection fails or is rejected by user.
   *
   * @example
   * ```typescript
   * // Show modal for user to select wallet
   * const connection = await client.connect();
   *
   * // Connect to specific wallet
   * const connection = await client.connect('metamask');
   * ```
   */
  connect(walletId?: string, options?: unknown): Promise<WalletConnection>;

  /**
   * Disconnect from a specific wallet.
   *
   * @param walletId - ID of the wallet to disconnect.
   * @returns Promise that resolves when disconnected.
   * @throws {Error} If wallet is not connected or disconnect fails.
   */
  disconnect(walletId: string): Promise<void>;

  /**
   * Disconnect from all connected wallets.
   *
   * @returns Promise that resolves when all wallets are disconnected.
   */
  disconnectAll(): Promise<void>;

  // Chain Management

  /**
   * Switch to a different blockchain network.
   *
   * @param chainId - ID of the chain to switch to.
   * @param walletId - Optional wallet ID. Uses active wallet if not specified.
   * @returns Promise resolving to chain switch details.
   * @throws {Error} If chain is not supported or switch fails.
   *
   * @example
   * ```typescript
   * const result = await client.switchChain('137'); // Switch to Polygon
   * console.log(`Switched from ${result.previousChainId} to ${result.chainId}`);
   * ```
   */
  switchChain(
    chainId: string,
    walletId?: string,
  ): Promise<{
    provider: unknown;
    chainType: string;
    chainId: string;
    previousChainId: string;
  }>;

  // Get Connections

  /**
   * Get a specific wallet connection by ID.
   *
   * @param walletId - ID of the wallet.
   * @returns The wallet adapter if connected, undefined otherwise.
   */
  getConnection(walletId: string): WalletAdapter | undefined;

  /**
   * Get all connected wallet adapters.
   *
   * @returns Array of connected wallet adapters.
   */
  getConnections(): WalletAdapter[];

  /**
   * Get all wallet connections with full connection details.
   *
   * @returns Array of wallet connection objects.
   */
  getAllConnections(): WalletConnection[];

  // Wallet Discovery

  /**
   * Detect all available wallets in the user's environment.
   *
   * @returns Promise resolving to array of detected wallets with availability status.
   *
   * @example
   * ```typescript
   * const wallets = await client.discoverWallets();
   * const installed = wallets.filter(w => w.available);
   * ```
   */
  discoverWallets(): Promise<AvailableWallet[]>;

  /**
   * Get a specific wallet adapter by ID.
   *
   * @param walletId - ID of the wallet.
   * @returns The wallet adapter if registered, undefined otherwise.
   */
  getWallet(walletId: string): WalletAdapter | undefined;

  /**
   * Get all registered wallet adapters.
   *
   * @returns Array of all registered wallet adapters.
   */
  getAllWallets(): WalletAdapter[];

  // Events

  // Event methods have been removed - use subscribe() for state changes instead

  // Modal Control (for advanced usage)

  /**
   * Open the wallet selection modal.
   *
   * @param options - Optional parameters including targetChainType for filtering wallets
   * @returns Promise that resolves when modal is opened.
   */
  openModal(options?: { targetChainType?: import('../../types.js').ChainType }): Promise<void>;

  /**
   * Close the wallet selection modal.
   */
  closeModal(): void;

  // Sub-components

  /**
   * Modal controller for UI interactions.
   */
  modal: ModalController;

  /**
   * Wallet registry for managing wallet adapters.
   */
  registry: WalletRegistry;

  // Properties

  /**
   * Whether any wallet is currently connected.
   * @readonly
   */
  readonly isConnected: boolean;

  // Multi-wallet support

  /**
   * Set the active wallet for operations.
   *
   * @param walletId - ID of the wallet to make active.
   * @throws {Error} If wallet is not connected.
   */
  setActiveWallet(walletId: string): void;

  /**
   * Get the currently active wallet ID.
   *
   * @returns The active wallet ID or null if none active.
   */
  getActiveWallet(): string | null;

  /**
   * Get the maximum number of concurrent connections allowed.
   *
   * @returns Maximum connection limit.
   */
  getMaxConnections(): number;

  // Lifecycle

  /**
   * Destroy the client and clean up all resources.
   * Call this when unmounting or disposing of the client.
   */
  destroy(): void;

  // Internal initialization

  /**
   * Initialize modal event handlers.
   * @internal
   */
  initializeModalHandlers(): void;
}
