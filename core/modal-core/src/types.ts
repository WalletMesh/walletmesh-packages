/**
 * Core public types for the modal-core package
 *
 * @module types
 * @packageDocumentation
 */

/**
 * Core type exports from the base types module
 *
 * @remarks
 * These fundamental types are used throughout the modal-core system:
 * - WalletInfo: Complete wallet metadata and configuration
 * - BaseConnectionState: Foundation for connection state tracking
 * - ModalView: UI view states for the modal
 * - BaseModalState: Foundation for modal state management
 * - ConnectionResult: Result of connection attempts
 * - ModalError: Structured error information
 */
export type {
  WalletInfo,
  BaseConnectionState,
  ModalView,
  BaseModalState,
  ConnectionResult,
  ModalError,
  SupportedChain,
} from './core/types.js';

/**
 * Core enum exports from the base types module
 *
 * @remarks
 * These enums define constants used throughout the system:
 * - ChainType: Blockchain technology types (EVM, Solana, etc.)
 * - ConnectionStatus: Wallet connection states
 * - TransportType: Communication transport mechanisms
 * - ConnectionState: Simplified connection states for UI
 *
 * @see {@link ChainType} for supported blockchain types
 * @see {@link ConnectionStatus} for detailed connection states
 * @see {@link TransportType} for wallet communication methods
 * @see {@link ConnectionState} for simplified UI states
 */
export { ChainType, ConnectionStatus, TransportType, ConnectionState } from './core/types.js';

// Import types for local use in this file
import type { ChainType, ConnectionResult, ModalError, SupportedChain, WalletInfo } from './core/types.js';

// Import schema-derived types to ensure consistency with runtime validation
import type { WalletInfo as SchemaWalletInfo } from './schemas/wallet.js';

import type {
  ConnectionResult as SchemaConnectionResult,
  ModalState as SchemaModalState,
} from './schemas/connection.js';

import type { ConnectionDisplayData, HeadlessModalState } from './api/core/headless.js';
import type { WalletConnectionState } from './api/types/connection.js';
import type { WalletProvider } from './api/types/providers.js';
import type {
  AvailableWallet,
  ChainConfig as ClientChainConfig,
  WalletConfig as ClientWalletConfig,
  InternalWalletMeshClient as WalletMeshClient,
} from './internal/client/WalletMeshClient.js';

/**
 * Re-export connection display data type
 *
 * @remarks
 * ConnectionDisplayData contains formatted information for displaying
 * wallet connection state in UI components, including wallet metadata,
 * connection status, and account information.
 *
 * @public
 */
export type { ConnectionDisplayData };

/**
 * Re-export wallet provider interface
 *
 * @remarks
 * WalletProvider is the base interface for blockchain providers.
 * It defines the standard API for interacting with blockchain networks
 * through wallet connections.
 *
 * @public
 */
export type { WalletProvider };

/**
 * Explicit Provider/Interface Type System
 *
 * @remarks
 * WalletMesh makes a clear distinction between:
 *
 * - **Provider Implementations**: Runtime objects (EVMProvider, SolanaProvider, etc.)
 *   that provide blockchain functionality with methods, events, and state.
 *
 * - **Interface Specifications**: Protocol standards (eip-1193, solana-standard, etc.)
 *   that define HOW providers communicate with wallets and dApps.
 *
 * This distinction helps developers understand that providers are the actual objects
 * they interact with, while interface specs are just string identifiers for protocols.
 *
 * @example
 * ```typescript
 * // Provider implementations - runtime objects with methods
 * const provider: EVMProvider = wallet.getProvider();
 * await provider.request({ method: 'eth_accounts' });
 *
 * // Interface specifications - protocol identifiers in configs
 * const chainConfig = {
 *   chainId: 'eip155:1',
 *   interfaces: ['eip-1193', 'eip-6963'] as EVMInterface[]
 * };
 * ```
 *
 * @public
 */
export type {
  // Interface specifications (protocol standards)
  ProviderInterface,
  EVMInterface,
  SolanaInterface,
  AztecInterface,
  // Provider implementations (runtime objects)
  BlockchainProviderImplementation,
  // Type mappings and utilities
  ChainInterfaceMap,
  ProviderImplementationMap,
  GetInterfacesForChain,
  GetProviderForInterface,
  // Interface resolution types
  InterfaceValidation,
} from './providers/types/index.js';

/**
 * Re-export wallet mesh client types
 *
 * @remarks
 * Core client types for the WalletMesh system:
 * - WalletMeshClient: Main client interface for wallet operations
 * - ClientChainConfig: Chain configuration for the client
 * - ClientWalletConfig: Wallet configuration for the client
 * - AvailableWallet: Wallet information with availability status
 *
 * @public
 */
export type { WalletMeshClient, ClientChainConfig, ClientWalletConfig, AvailableWallet };

/**
 * Re-export connection state types
 *
 * @remarks
 * WalletConnectionState provides comprehensive information about
 * the current wallet connection including status, accounts, chain details,
 * and any errors that may have occurred.
 *
 * @public
 */
export type { WalletConnectionState };

/**
 * Re-export connection status utilities
 *
 * @remarks
 * Helper functions for working with connection status:
 * - isConnected: Check if wallet is connected
 * - isConnecting: Check if connection is in progress
 * - isDisconnected: Check if wallet is disconnected
 * - isError: Check if connection has an error
 * - isReconnecting: Check if reconnection is in progress
 * - isActiveState: Check if status represents an active state
 * - isInactiveState: Check if status represents an inactive state
 * - getStatusDescription: Get human-readable status description
 * - isValidConnectionStatus: Validate connection status value
 *
 * @public
 */
export {
  isConnected,
  isConnecting,
  isDisconnected,
  isError,
  isReconnecting,
  isActiveState,
  isInactiveState,
  getStatusDescription,
  isValidConnectionStatus,
} from './api/types/connectionStatus.js';

/**
 * Interface for wallet metadata
 *
 * @remarks
 * Contains essential display information for a wallet.
 * Used for presenting wallet options in the UI.
 * This interface defines the minimal metadata required to display
 * a wallet option to users in selection interfaces.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const metadata: WalletMetadata = {
 *   name: 'MetaMask',
 *   icon: 'https://example.com/metamask-icon.png',
 *   description: 'Connect to the decentralized web'
 * };
 * ```
 * @example
 * ```typescript
 * // Using a data URI for the icon
 * const walletMetadata: WalletMetadata = {
 *   name: 'Rainbow',
 *   icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0i...',
 *   description: 'A fun, simple, and secure Ethereum wallet'
 * };
 * ```
 */
export interface WalletMetadata {
  /**
   * Display name of the wallet
   * @remarks This should be the official wallet name as recognized by users
   * @example "MetaMask", "Rainbow", "Coinbase Wallet"
   */
  name: string;

  /**
   * URL or data URI of the wallet's icon
   * @remarks
   * - Can be an HTTPS URL pointing to an image file
   * - Can be a data URI for embedded images
   * - Should be square format (1:1 aspect ratio) for best display
   * - Recommended size: at least 64x64 pixels
   * @example "https://example.com/wallet-icon.png"
   * @example "data:image/png;base64,iVBORw0KGgo..."
   */
  icon: string;

  /**
   * Optional description of the wallet
   * @remarks
   * A brief description explaining the wallet's key features or benefits.
   * Keep it concise (under 100 characters) for UI display purposes.
   * @example "Connect to the decentralized web"
   * @example "Your key to the world of Ethereum"
   */
  description?: string | undefined;
}

/**
 * Schema-derived wallet info type for runtime validation
 *
 * @remarks
 * This type is automatically generated from the wallet schema definition
 * to ensure type safety matches runtime validation. Use this when you need
 * to validate wallet data at runtime.
 *
 * @public
 */
export type WalletInfoSchema = SchemaWalletInfo;

/**
 * Interface for blockchain network configuration
 *
 * @remarks
 * Contains information about a blockchain network.
 * Used for displaying network information and switching chains.
 * This interface provides the essential data needed to represent
 * a blockchain network in the UI and handle chain switching operations.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const chainConfig: ChainConfig = {
 *   chainId: 1,
 *   chainType: ChainType.Evm,
 *   name: 'Ethereum Mainnet',
 *   icon: 'https://example.com/ethereum-icon.png'
 * };
 * ```
 * @example
 * ```typescript
 * // Solana network configuration
 * const solanaConfig: ChainConfig = {
 *   chainId: 'mainnet-beta',
 *   chainType: ChainType.Solana,
 *   name: 'Solana Mainnet Beta',
 *   icon: 'https://example.com/solana-icon.svg'
 * };
 * ```
 * @example
 * ```typescript
 * // Layer 2 network configuration
 * const optimismConfig: ChainConfig = {
 *   chainId: 10,
 *   chainType: ChainType.Evm,
 *   name: 'Optimism',
 *   icon: 'data:image/svg+xml;base64,...'
 * };
 * ```
 */
export interface ChainConfig extends SupportedChain {
  /**
   * Optional URL or data URI of the network's icon
   * @remarks
   * - Can be an HTTPS URL pointing to an image file
   * - Can be a data URI for embedded images
   * - Should be square format (1:1 aspect ratio) for best display
   * - If not provided, UI may show a default icon or the chain name
   * @example "https://example.com/ethereum-icon.png"
   * @example "data:image/svg+xml;base64,PHN2ZyB..."
   */
  icon?: string;
}

/**
 * Schema-derived connection result type for runtime validation
 *
 * @remarks
 * This type is automatically generated from the connection result schema
 * to ensure type safety matches runtime validation. Use this when you need
 * to validate connection results at runtime.
 *
 * @public
 */
export type ConnectionResultSchema = SchemaConnectionResult;

/**
 * Interface for modal state
 *
 * @remarks
 * Represents the current state of the modal UI.
 * Includes information about the current view, selected wallet, and any errors.
 * This is the headless modal state that can be used with any UI framework.
 *
 * @public
 * @example
 * ```typescript
 * const state: ModalState = modal.getState();
 * if (state.isOpen && state.view === 'walletSelection') {
 *   // Show wallet selection UI
 * }
 * ```
 */
// Re-export HeadlessModalState as the public ModalState for headless architecture
export type ModalState = HeadlessModalState;

// ModalView is exported from core/types.js - no need to redefine here

/**
 * Schema-derived modal state type for runtime validation
 *
 * @remarks
 * This type is automatically generated from the modal state schema
 * to ensure type safety matches runtime validation. Use this when you need
 * to validate modal state at runtime.
 *
 * @public
 */
export type ModalStateSchema = SchemaModalState;

/**
 * SSR-safe modal controller type
 *
 * @remarks
 * This type represents a modal controller that may not be available in SSR contexts.
 * Use this type in framework integrations to handle server-side rendering scenarios.
 * During server-side rendering, the controller will be null since DOM operations
 * and wallet interactions are not available on the server.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const controller: SSRSafeController = isServer ? null : createModalController();
 * ```
 * @example
 * ```typescript
 * // In a React component with SSR support
 * function useWalletModal() {
 *   const [controller, setController] = useState<SSRSafeController>(null);
 *
 *   useEffect(() => {
 *     // Only create controller on client side
 *     if (typeof window !== 'undefined') {
 *       setController(createModalController(config));
 *     }
 *   }, []);
 *
 *   return controller;
 * }
 * ```
 */
export type SSRSafeController = ModalController | null;

/**
 * Discriminated union for wallet connection state
 *
 * @remarks
 * This discriminated union provides type-safe access to connection state properties
 * based on the connection status. Use this for better type inference in your code.
 * TypeScript's discriminated union pattern ensures that properties are correctly
 * typed based on the status field, preventing null/undefined errors at compile time.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const state: DiscriminatedConnectionState = getConnectionState();
 * if (state.status === 'connected') {
 *   // TypeScript knows state.address is a string, not null
 *   console.log(state.address);
 * }
 * ```
 * @example
 * ```typescript
 * // Type-safe pattern matching
 * function handleConnectionState(state: DiscriminatedConnectionState) {
 *   switch (state.status) {
 *     case 'disconnected':
 *       // state.address is null, state.walletId is null
 *       return 'No wallet connected';
 *
 *     case 'connecting':
 *       // state.walletId is string, but address is still null
 *       return `Connecting to ${state.walletId}...`;
 *
 *     case 'connected':
 *       // All properties are populated
 *       return `Connected to ${state.walletId} on chain ${state.chain.name}`;
 *   }
 * }
 * ```
 */
export type DiscriminatedConnectionState =
  | {
      /** Connection status indicating no wallet is connected */
      status: 'disconnected';
      /** No wallet ID when disconnected */
      walletId: null;
      /** Empty accounts array when disconnected */
      accounts: [];
      /** No chain when disconnected */
      chain: null;
      /** No chain type when disconnected */
      chainType: null;
      /** No address when disconnected */
      address: null;
    }
  | {
      /** Connection status indicating connection in progress */
      status: 'connecting';
      /** ID of the wallet being connected to */
      walletId: string;
      /** Empty accounts array while connecting */
      accounts: [];
      /** No chain while connecting */
      chain: null;
      /** No chain type while connecting */
      chainType: null;
      /** No address while connecting */
      address: null;
    }
  | {
      /** Connection status indicating successful connection */
      status: 'connected';
      /** ID of the connected wallet */
      walletId: string;
      /** Array of connected account addresses */
      accounts: string[];
      /** Connected chain information */
      chain: SupportedChain;
      /** Type of the connected blockchain */
      chainType: ChainType;
      /** Primary account address (first account) */
      address: string;
    };

/**
 * Interface for modal controller
 *
 * @remarks
 * Primary interface for controlling the wallet connection modal.
 * Provides methods for opening/closing the modal, connecting to wallets,
 * and subscribing to modal events.
 *
 * @public
 * @example
 * ```typescript
 * // Create a modal controller
 * const modal = createModal({
 *   wallets: [
 *     {
 *       id: 'metamask',
 *       name: 'MetaMask',
 *       icon: 'https://example.com/metamask-icon.png',
 *       chains: [ChainType.Evm]
 *     }
 *   ]
 * });
 *
 * // Open the modal
 * modal.open();
 *
 * // Check connection state
 * const state = modal.getState();
 * if (state.connection.status === 'connected') {
 *   console.log('Wallet connected!');
 * }
 * ```
 * @interface ModalController
 */
export interface ModalController {
  /**
   * Open the modal
   *
   * @param options - Optional parameters including targetChainType for filtering wallets
   * @remarks
   * Opens the modal UI, showing the wallet selection screen or the last view.
   * If targetChainType is provided, only wallets supporting that chain type will be shown.
   */
  open(options?: { targetChainType?: ChainType }): void;

  /**
   * Close the modal
   *
   * @remarks
   * Closes the modal UI without affecting the connection state.
   */
  close(): void;

  /**
   * Get current modal state
   *
   * @returns The current state of the modal
   */
  getState(): ModalState;

  /**
   * Subscribe to modal state changes
   *
   * @param callback - Function to call when state changes
   * @returns A function that can be called to unsubscribe
   */
  subscribe(callback: (state: ModalState) => void): () => void;

  /**
   * Connect to a wallet
   *
   * @param walletId - ID of the wallet to connect to. If not provided, opens modal for wallet selection
   * @returns A promise that resolves with the connection result
   * @throws If the connection fails
   */
  connect(walletId?: string): Promise<ConnectionResult>;

  /**
   * Disconnect from the current wallet
   *
   * @param walletId - Optional wallet ID to disconnect. If not provided, disconnects current wallet
   * @returns A promise that resolves when disconnection is complete
   */
  disconnect(walletId?: string): Promise<void>;

  /**
   * Select a wallet for connection
   *
   * @param walletId - ID of the wallet to select
   */
  selectWallet(walletId: string): void;

  /**
   * Reset the modal state
   */
  reset(): void;

  /**
   * Set the current modal view
   *
   * @param view - The view to display ('walletSelection', 'connecting', 'connected', 'error')
   * @remarks
   * This allows programmatic navigation between modal views. Useful for custom flows.
   */
  setView(view: 'walletSelection' | 'connecting' | 'connected' | 'error'): void;

  /**
   * Navigate back to the previous view
   *
   * @remarks
   * Goes back to the previous view in the navigation stack. If no previous view exists, defaults to wallet selection.
   */
  goBack(): void;

  /**
   * Get available wallets with their availability status
   *
   * @returns Promise resolving to wallets with availability status
   * @remarks
   * This method checks which wallets are actually available/installed in the user's browser.
   */
  getAvailableWallets(): Promise<Array<WalletInfo & { isAvailable: boolean }>>;

  /**
   * Clean up resources
   *
   * @remarks
   * Cleans up all resources including event listeners, subscriptions, and DOM elements.
   * Call this when the modal is no longer needed to prevent memory leaks.
   */
  cleanup(): void;
}

/**
 * Interface for base transport configuration
 *
 * @remarks
 * Common configuration options for all transport types.
 * Specific transport types extend this with their own options.
 * The transport layer handles communication between the modal and wallet implementations.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const config: TransportConfig = {
 *   url: 'wss://example.com/wallet',
 *   timeout: 30000,
 *   reconnect: true,
 *   reconnectInterval: 5000
 * };
 * ```
 */
export interface TransportConfig {
  /**
   * URL to connect to (format depends on transport type)
   * - WebSocket: wss:// or ws:// URLs
   * - HTTP: https:// or http:// URLs
   * - Chrome Extension: chrome-extension:// URLs
   * @defaultValue undefined (transport-specific defaults apply)
   */
  url?: string;

  /**
   * Connection timeout in milliseconds
   * After this duration, connection attempts will fail with a timeout error
   * @defaultValue 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Whether to automatically reconnect on disconnection
   * When true, the transport will attempt to reconnect after unexpected disconnections
   * @defaultValue true
   */
  reconnect?: boolean;

  /**
   * Interval between reconnection attempts in milliseconds
   * Used when reconnect is true to space out reconnection attempts
   * @defaultValue 5000 (5 seconds)
   */
  reconnectInterval?: number;
}

/**
 * Interface for popup window transport configuration
 *
 * @remarks
 * Configuration options specific to popup window transports.
 * Extends the base transport configuration.
 * This transport type opens wallet connections in a separate browser window,
 * useful for web-based wallets that don't have browser extensions.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const popupConfig: PopupConfig = {
 *   url: 'https://wallet.example.com',
 *   width: 400,
 *   height: 600,
 *   target: '_blank',
 *   features: 'menubar=no,toolbar=no'
 * };
 * ```
 * @example
 * ```typescript
 * // Centered popup configuration
 * const centeredPopup: PopupConfig = {
 *   url: 'https://wallet.example.com/connect',
 *   width: 450,
 *   height: 700,
 *   target: 'wallet-popup',
 *   features: 'resizable=yes,scrollbars=yes,status=no,location=no'
 * };
 * ```
 */
export interface PopupConfig extends TransportConfig {
  /**
   * Width of the popup window in pixels
   * @defaultValue 400
   * @remarks Recommended range: 350-500 pixels for mobile-friendly layouts
   */
  width?: number;

  /**
   * Height of the popup window in pixels
   * @defaultValue 600
   * @remarks Recommended range: 500-800 pixels to accommodate wallet UI
   */
  height?: number;

  /**
   * Target name for the popup window
   * @defaultValue "_blank"
   * @remarks
   * - "_blank": Opens in a new window
   * - Custom name: Reuses window with same name if already open
   * @example "_blank"
   * @example "wallet-connect-popup"
   */
  target?: string;

  /**
   * Window features string for window.open()
   * @remarks
   * Comma-separated list of window features. Common options:
   * - menubar=yes/no: Show menu bar
   * - toolbar=yes/no: Show toolbar
   * - location=yes/no: Show location bar
   * - status=yes/no: Show status bar
   * - resizable=yes/no: Allow resizing
   * - scrollbars=yes/no: Show scrollbars
   * @defaultValue "menubar=no,toolbar=no,location=no"
   * @example "menubar=no,toolbar=no,resizable=yes"
   */
  features?: string;
}

/**
 * Interface for Chrome extension transport configuration
 *
 * @remarks
 * Configuration options specific to Chrome extension transports.
 * Extends the base transport configuration.
 * This transport type communicates with browser extension wallets
 * using the Chrome Extension API for secure cross-origin messaging.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const extensionConfig: ChromeExtensionConfig = {
 *   extensionId: 'abcdefghijklmnopqrstuvwxyz',
 *   retries: 3,
 *   retryDelay: 1000
 * };
 * ```
 * @example
 * ```typescript
 * // MetaMask extension configuration
 * const metamaskConfig: ChromeExtensionConfig = {
 *   extensionId: 'nkbihfbeogaeaoehlefnkodbefgpgknn',
 *   timeout: 60000,
 *   retries: 5,
 *   retryDelay: 2000
 * };
 * ```
 */
export interface ChromeExtensionConfig extends TransportConfig {
  /**
   * ID of the target Chrome extension
   * @remarks
   * The 32-character extension ID from the Chrome Web Store.
   * Can be found in chrome://extensions/ when developer mode is enabled.
   * Each wallet extension has a unique ID.
   * @example "nkbihfbeogaeaoehlefnkodbefgpgknn" // MetaMask
   * @example "hnfanknocfeofbddgcijnmhnfnkdnaad" // Coinbase Wallet
   */
  extensionId: string;

  /**
   * Maximum number of connection retry attempts
   * @defaultValue 3
   * @remarks
   * Number of times to retry connecting if the extension is not immediately available.
   * Useful when the extension is still loading or temporarily unresponsive.
   */
  retries?: number;

  /**
   * Delay between retry attempts in milliseconds
   * @defaultValue 1000 (1 second)
   * @remarks
   * Time to wait between connection retry attempts.
   * Increase for slower systems or extensions that take longer to initialize.
   */
  retryDelay?: number;
}

/**
 * Interface for transport message event
 *
 * @remarks
 * Event emitted when a message is received through the transport.
 * Messages typically contain JSON-RPC requests or responses from the wallet.
 *
 * @public
 * @interface TransportMessageEvent
 * @example
 * ```typescript
 * transport.on('message', (event: TransportMessageEvent) => {
 *   if (event.type === 'message') {
 *     console.log('Received data:', event.data);
 *     // Handle JSON-RPC response
 *   }
 * });
 * ```
 */
export interface TransportMessageEvent {
  /** Event type identifier - always 'message' for message events */
  type: 'message';

  /**
   * Message data received from the transport
   * Usually contains JSON-RPC formatted messages
   * The exact structure depends on the wallet implementation
   */
  data: unknown;
}

/**
 * Interface for transport connection event
 *
 * @remarks
 * Event emitted when the transport successfully connects.
 * This indicates the communication channel is established and ready for messages.
 *
 * @public
 * @interface TransportConnectedEvent
 * @example
 * ```typescript
 * transport.on('connected', (event: TransportConnectedEvent) => {
 *   console.log('Transport connected!');
 *   // Now safe to send messages
 * });
 * ```
 */
export interface TransportConnectedEvent {
  /** Event type identifier - always 'connected' for connection events */
  type: 'connected';
}

/**
 * Interface for transport disconnection event
 *
 * @remarks
 * Event emitted when the transport disconnects.
 * This can happen due to network issues, wallet closure, or explicit disconnection.
 *
 * @public
 * @interface TransportDisconnectedEvent
 * @example
 * ```typescript
 * transport.on('disconnected', (event: TransportDisconnectedEvent) => {
 *   console.log('Transport disconnected:', event.reason);
 *   if (event.reason === 'wallet_closed') {
 *     // Handle wallet closure
 *   }
 * });
 * ```
 */
export interface TransportDisconnectedEvent {
  /** Event type identifier - always 'disconnected' for disconnection events */
  type: 'disconnected';

  /**
   * Optional reason for disconnection
   * Common reasons:
   * - 'wallet_closed': User closed the wallet
   * - 'network_error': Network connectivity issues
   * - 'timeout': Connection timed out
   * - 'user_rejection': User rejected the connection
   */
  reason?: string;
}

/**
 * Interface for transport error event
 *
 * @remarks
 * Event emitted when an error occurs in the transport.
 * Errors can occur during connection, message sending, or due to protocol violations.
 *
 * @public
 * @interface TransportErrorEvent
 * @example
 * ```typescript
 * transport.on('error', (event: TransportErrorEvent) => {
 *   console.error('Transport error:', event.error.message);
 *   if (event.error.code === 'TRANSPORT_TIMEOUT') {
 *     // Handle timeout specifically
 *   }
 * });
 * ```
 */
export interface TransportErrorEvent {
  /** Event type identifier - always 'error' for error events */
  type: 'error';

  /**
   * Modal error object with rich error information
   * Contains error code, message, and optional metadata
   * Common error codes:
   * - TRANSPORT_TIMEOUT: Connection or request timed out
   * - TRANSPORT_CLOSED: Transport is closed
   * - TRANSPORT_ERROR: Generic transport error
   */
  error: ModalError;
}

/**
 * Union type for all transport events
 *
 * @remarks
 * Combines all possible transport event types.
 * Use this type when handling transport events to ensure exhaustive type checking.
 *
 * @public
 * @example
 * ```typescript
 * function handleTransportEvent(event: TransportEvent) {
 *   switch (event.type) {
 *     case 'connected':
 *       console.log('Connected');
 *       break;
 *     case 'disconnected':
 *       console.log('Disconnected:', event.reason);
 *       break;
 *     case 'message':
 *       console.log('Message:', event.data);
 *       break;
 *     case 'error':
 *       console.error('Error:', event.error);
 *       break;
 *   }
 * }
 * ```
 */
export type TransportEvent =
  | TransportMessageEvent
  | TransportConnectedEvent
  | TransportDisconnectedEvent
  | TransportErrorEvent;

/**
 * Interface for transport implementations
 *
 * @remarks
 * Defines the API for communication transports.
 * All transports must implement this interface.
 *
 * @public
 * @example
 * ```typescript
 * // Create a WebSocket transport
 * const transport = createTransport(TransportType.WEBSOCKET, {
 *   url: 'wss://example.com/wallet'
 * });
 *
 * // Connect to the transport
 * await transport.connect();
 *
 * // Send data
 * await transport.send({ method: 'eth_requestAccounts' });
 *
 * // Listen for responses
 * transport.on('message', (event) => {
 *   console.log('Received message:', event.data);
 * });
 *
 * // Clean up when done
 * await transport.destroy();
 * ```
 * @interface Transport
 */
export interface Transport {
  /**
   * Connect to the transport
   *
   * @returns A promise that resolves when the connection is established
   * @throws If the connection fails
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the transport
   *
   * @returns A promise that resolves when the disconnection is complete
   */
  disconnect(): Promise<void>;

  /**
   * Send data through the transport
   *
   * @param data - Data to send
   * @returns A promise that resolves when the data has been sent
   * @throws If sending fails
   */
  send(data: unknown): Promise<void>;

  /**
   * Subscribe to transport events
   *
   * @param event - Event type to listen for
   * @param listener - Callback function to call when the event occurs
   * @returns A function that can be called to unsubscribe
   */
  on(event: string, listener: (event: TransportEvent) => void): () => void;

  /**
   * Unsubscribe from transport events
   *
   * @param event - Event type to stop listening for
   * @param listener - Callback function to remove
   */
  off(event: string, listener: (event: TransportEvent) => void): void;

  /**
   * Destroy the transport, cleaning up all resources
   *
   * @remarks
   * This method should perform a complete cleanup of all resources associated with the transport,
   * including disconnecting if connected, removing all event listeners, and releasing any other
   * resources that might cause memory leaks. This should be called when the transport is no longer needed.
   *
   * @returns A promise that resolves when all resources have been cleaned up
   * @throws If cleanup fails
   */
  destroy(): Promise<void>;
}

/**
 * Interface for framework adapter options
 *
 * @remarks
 * Configuration options for framework adapters.
 * This interface is used when integrating the modal with different UI frameworks
 * like React, Vue, or vanilla JavaScript applications.
 *
 * @public
 * @interface AdapterConfig
 * @example
 * ```typescript
 * // Mount to a specific DOM element
 * const config: AdapterConfig = {
 *   target: document.getElementById('wallet-modal-root')
 * };
 *
 * // Mount using a CSS selector
 * const config: AdapterConfig = {
 *   target: '#app-modal-container'
 * };
 * ```
 */
export interface AdapterConfig {
  /**
   * DOM element or CSS selector where the modal should be mounted
   *
   * @remarks
   * - When a string is provided, it will be used as a CSS selector
   * - When an HTMLElement is provided, it will be used directly
   * - If not specified, the modal may create its own root element
   *
   * @example
   * ```typescript
   * // Using DOM element
   * target: document.getElementById('modal-root')
   *
   * // Using CSS selector
   * target: '#wallet-modal'
   * ```
   */
  target?: HTMLElement | string;
}

/**
 * Type for event listener functions
 *
 * @remarks
 * Generic event listener type used throughout the framework.
 * Event listeners receive event data and perform side effects without returning values.
 * This type provides a consistent signature for all event handling in the modal system,
 * allowing for flexible event payloads while maintaining type safety where needed.
 *
 * @public
 * @example
 * ```typescript
 * const listener: EventListener = (event) => {
 *   console.log('Event received:', event);
 * };
 *
 * // Subscribe to events
 * const unsubscribe = emitter.on('change', listener);
 *
 * // Later, unsubscribe
 * unsubscribe();
 * ```
 * @example
 * ```typescript
 * // Type-safe event listener with type assertion
 * const accountListener: EventListener = (event) => {
 *   const { accounts } = event as { accounts: string[] };
 *   console.log('New accounts:', accounts);
 * };
 *
 * wallet.on('accountsChanged', accountListener);
 * ```
 */
export type EventListener = (event: unknown) => void;

/**
 * Union type for all transport configurations
 *
 * @remarks
 * Combines all possible transport configuration types.
 * Use this when accepting transport configuration that could be for any transport type.
 * The actual transport type is determined by the TransportType enum value passed
 * alongside this configuration.
 *
 * @public
 * @example
 * ```typescript
 * function createTransport(type: TransportType, config: AnyTransportConfig) {
 *   switch (type) {
 *     case TransportType.POPUP:
 *       return new PopupTransport(config as PopupConfig);
 *     case TransportType.CHROME_EXTENSION:
 *       return new ChromeExtensionTransport(config as ChromeExtensionConfig);
 *     default:
 *       return new WebSocketTransport(config);
 *   }
 * }
 * ```
 * @example
 * ```typescript
 * // Dynamic transport selection based on wallet type
 * function getTransportConfig(wallet: WalletInfo): AnyTransportConfig {
 *   if (wallet.type === 'extension') {
 *     return { extensionId: wallet.extensionId, retries: 5 };
 *   } else if (wallet.type === 'web') {
 *     return { url: wallet.url, width: 400, height: 600 };
 *   } else {
 *     return { url: wallet.wsUrl, reconnect: true };
 *   }
 * }
 * ```
 */
export type AnyTransportConfig = TransportConfig | PopupConfig | ChromeExtensionConfig;

/**
 * Interface for connection information
 *
 * @remarks
 * Contains information about the current wallet connection state.
 * Used by framework integrations to expose connection details.
 * This interface provides a simplified view of the connection state
 * suitable for UI components and application logic.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const connectionInfo: ConnectionInfo = {
 *   walletId: 'metamask',
 *   chainId: 1,
 *   accounts: ['0x1234...', '0x5678...'],
 *   isConnected: true
 * };
 * ```
 * @example
 * ```typescript
 * // Using connection info in a component
 * function WalletStatus({ connection }: { connection: ConnectionInfo }) {
 *   if (!connection.isConnected) {
 *     return <div>Not connected</div>;
 *   }
 *
 *   return (
 *     <div>
 *       Connected to {connection.walletId}
 *       Chain: {connection.chainId}
 *       Account: {connection.accounts[0]}
 *     </div>
 *   );
 * }
 * ```
 */
export interface ConnectionInfo {
  /**
   * ID of the connected wallet
   * @remarks Unique identifier for the wallet type (e.g., "metamask", "rainbow")
   * @example "metamask"
   */
  walletId: string;

  /**
   * Connected chain information
   * @remarks
   * Contains full chain details including chainId, chainType, name, and other metadata
   * @example { chainId: 'eip155:1', chainType: ChainType.Evm, name: 'Ethereum Mainnet', required: true }
   */
  chain: SupportedChain;

  /**
   * List of connected accounts
   * @remarks
   * Array of account addresses/public keys.
   * Usually contains one account, but some wallets support multiple.
   * The first account is typically the primary/active account.
   * @example ["0x742d35Cc6634C0532925a3b844Bc9e7595f15E90"]
   */
  accounts: string[];

  /**
   * Whether a wallet is connected
   * @remarks
   * Simple boolean flag for connection state.
   * True when actively connected, false otherwise.
   */
  isConnected: boolean;
}

/**
 * Public interface for wallet client implementations
 *
 * @remarks
 * Defines the public API for wallet clients used in modal configurations.
 * This interface provides access to wallet connection functionality without
 * exposing internal implementation details.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const client: WalletClient = createWalletClient();
 * await client.initialize();
 *
 * const connectionResult = await client.connect('metamask');
 * console.log('Connected:', connectionResult);
 *
 * // Listen for events
 * const unsubscribe = client.on('accountsChanged', (accounts) => {
 *   console.log('New accounts:', accounts);
 * });
 * ```
 */
export interface WalletClient {
  /**
   * Initialize the wallet client
   *
   * @returns Promise that resolves when initialization is complete
   */
  initialize(): Promise<void>;

  /**
   * Connect to a specific wallet
   *
   * @param walletId - Identifier of the wallet to connect to
   * @param options - Optional connection configuration
   * @returns Promise that resolves to connection details
   */
  connect(walletId: string, options?: unknown): Promise<unknown>;

  /**
   * Disconnect from the current wallet
   *
   * @returns Promise that resolves when disconnection is complete
   */
  disconnect(): Promise<void>;

  /**
   * Get the current connection information
   *
   * @returns Current connection details or null if not connected
   */
  getConnectionInfo(): ConnectionInfo | null;

  /**
   * Register an event listener for wallet events
   *
   * @param event - Event type to listen for
   * @param listener - Function to call when event occurs
   * @returns Function to unsubscribe the listener
   */
  on(event: string, listener: EventListener): () => void;

  /**
   * Remove an event listener
   *
   * @param event - Event type to stop listening for
   * @param listener - Function to remove
   */
  off(event: string, listener: EventListener): void;
}

/**
 * Interface for supported chain configuration
 *
 * @remarks
 * Defines chain requirements and metadata for dApp connections.
 * This interface allows dApps to specify which chains they support,
 * which are required vs optional, and what capabilities they need
 * from the wallet provider on each chain.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const supportedChain: SupportedChain = {
 *   chainId: 1,
 *   required: true,
 *   label: 'Ethereum Mainnet',
 *   interfaces: ['eth_sendTransaction', 'eth_signTypedData_v4'],
 *   group: 'evm'
 * };
 * ```
 * @example
 * ```typescript
 * // Multi-chain configuration with optional chains
 * const chains: SupportedChain[] = [
 *   {
 *     chainId: 1,
 *     required: true,
 *     label: 'Ethereum',
 *     interfaces: ['eth_sendTransaction', 'eth_sign'],
 *     group: 'primary'
 *   },
 *   {
 *     chainId: 137,
 *     required: false,
 *     label: 'Polygon',
 *     interfaces: ['eth_sendTransaction'],
 *     group: 'secondary'
 *   }
 * ];
 * ```
 */

/**
 * Type for supported chains configuration
 *
 * @remarks
 * Configuration for multi-chain dApp support with chain requirements.
 * This interface allows dApps to specify complex multi-chain requirements,
 * including which blockchain technologies they support and how flexible
 * they are with chain selection and wallet compatibility.
 *
 * This type is imported from the schema definition to ensure consistency
 * across the codebase. The schema provides runtime validation while this
 * type provides compile-time type safety.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * const chainsConfig: SupportedChainsConfig = {
 *   chainsByTech: {
 *     evm: [
 *       { chainId: 1, required: true, label: 'Ethereum' },
 *       { chainId: 137, required: false, label: 'Polygon' }
 *     ],
 *     solana: [
 *       { chainId: 'mainnet-beta', required: true, label: 'Solana' }
 *     ]
 *   },
 *   allowMultipleWalletsPerChain: true,
 *   allowFallbackChains: false
 * };
 * ```
 * @example
 * ```typescript
 * // Cross-chain DeFi app configuration
 * const defiConfig: SupportedChainsConfig = {
 *   chainsByTech: {
 *     evm: [
 *       { chainId: 1, required: true, label: 'Ethereum', group: 'mainnet' },
 *       { chainId: 10, required: false, label: 'Optimism', group: 'l2' },
 *       { chainId: 42161, required: false, label: 'Arbitrum', group: 'l2' }
 *     ],
 *     svm: [
 *       { chainId: 'mainnet-beta', required: false, label: 'Solana', group: 'alt' }
 *     ]
 *   },
 *   allowMultipleWalletsPerChain: false,
 *   allowFallbackChains: true
 * };
 * ```
 */
export type SupportedChainsConfig = import('./schemas/chains.js').SupportedChainsConfig;

/**
 * Interface for objects that require cleanup
 *
 * @remarks
 * Implemented by services and resources that need to perform cleanup
 * when they are no longer needed to prevent memory leaks.
 * This is a fundamental pattern in the modal-core system for managing
 * resources like event listeners, timers, subscriptions, and DOM elements.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * class MyService implements Disposable {
 *   private timer: NodeJS.Timeout;
 *
 *   constructor() {
 *     this.timer = setInterval(() => {}, 1000);
 *   }
 *
 *   dispose(): void {
 *     clearInterval(this.timer);
 *   }
 * }
 *
 * const service = new MyService();
 * // Use service...
 * service.dispose(); // Clean up resources
 * ```
 * @example
 * ```typescript
 * // Async cleanup example
 * class WebSocketService implements Disposable {
 *   private ws: WebSocket;
 *
 *   constructor(url: string) {
 *     this.ws = new WebSocket(url);
 *   }
 *
 *   async dispose(): Promise<void> {
 *     if (this.ws.readyState === WebSocket.OPEN) {
 *       this.ws.close();
 *       await new Promise(resolve => {
 *         this.ws.addEventListener('close', resolve, { once: true });
 *       });
 *     }
 *   }
 * }
 * ```
 * @example
 * ```typescript
 * // Composite disposable pattern
 * class CompositeService implements Disposable {
 *   private disposables: Disposable[] = [];
 *
 *   addDisposable(disposable: Disposable) {
 *     this.disposables.push(disposable);
 *   }
 *
 *   async dispose(): Promise<void> {
 *     await Promise.all(
 *       this.disposables.map(d => d.dispose())
 *     );
 *     this.disposables = [];
 *   }
 * }
 * ```
 */
export interface Disposable {
  /**
   * Cleanup method called when the object is no longer needed
   *
   * @remarks
   * This method should clean up all resources held by the object:
   * - Remove event listeners
   * - Clear timers and intervals
   * - Close connections (WebSocket, etc.)
   * - Unsubscribe from observables
   * - Remove DOM elements
   * - Clear cached data
   *
   * The method can be synchronous (returning void) or asynchronous
   * (returning Promise<void>) depending on the cleanup requirements.
   *
   * @returns A promise that resolves when cleanup is complete, or void for synchronous cleanup
   * @example
   * ```typescript
   * // Synchronous cleanup
   * dispose(): void {
   *   this.eventEmitter.removeAllListeners();
   *   clearInterval(this.timer);
   * }
   * ```
   * @example
   * ```typescript
   * // Asynchronous cleanup
   * async dispose(): Promise<void> {
   *   await this.connection.close();
   *   this.cache.clear();
   * }
   * ```
   */
  dispose(): void | Promise<void>;
}

/**
 * Re-export framework adapter types
 *
 * @remarks
 * These types provide type definitions for framework-specific adapters.
 *
 * @public
 */

/**
 * Re-export provider types
 *
 * @remarks
 * These types provide type definitions for wallet providers and JSON-RPC communication.
 *
 * @public
 */
export * from './api/types/providers.js';

/**
 * Re-export consolidated connection types
 *
 * @remarks
 * These are the canonical connection state interfaces used throughout the codebase.
 *
 * @public
 */
export * from './api/types/connection.js';

/**
 * Re-export chain-specific provider interfaces
 *
 * @remarks
 * These provide standardized provider APIs for each blockchain type
 * ensuring consistent behavior across different wallet implementations.
 *
 * @public
 */
export * from './api/types/chainProviders.js';

/**
 * Re-export smart connect options
 *
 * @remarks
 * These provide unified connection options with chain-specific sub-options
 * for type-safe connections across different blockchain types.
 *
 * @public
 */
export * from './api/types/connectOptions.js';

/**
 * Re-export unified session state
 *
 * @remarks
 * These provide a consolidated session architecture that replaces multiple
 * session patterns with a single, consistent approach to session management.
 *
 * @public
 */
export * from './api/types/sessionState.js';

/**
 * Re-export unified provider instances
 *
 * @remarks
 * These provide consolidated provider instance types that unify various
 * provider patterns into a single, consistent provider architecture.
 *
 * @public
 */

/**
 * Re-export CAIP-2 utilities
 *
 * @remarks
 * These utilities provide parsing, formatting, and validation of CAIP-2 chain identifiers.
 *
 * @public
 */
export {
  parseCAIP2,
  isCAIP2,
  extractNamespace,
  extractReference,
  type CAIP2Parts,
} from './schemas/caip2.js';

/**
 * Interface for discovered wallet information
 *
 * @remarks
 * Contains metadata about a wallet that has been discovered through various discovery mechanisms
 * such as EIP-6963 wallet detection, browser extension discovery, or the WalletMesh discovery protocol.
 * This information is used by the wallet registry to create adapters on-demand when users select
 * discovered wallets for connection.
 *
 * Discovered wallets are different from pre-configured wallets - they are dynamically found
 * at runtime and may have different capabilities or configurations based on how they were discovered.
 *
 * @public
 * @category Types
 * @example
 * ```typescript
 * // Wallet discovered via EIP-6963
 * const discoveredWallet: DiscoveredWalletInfo = {
 *   id: 'io.metamask',
 *   name: 'MetaMask',
 *   icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0...',
 *   adapterType: 'evm',
 *   adapterConfig: {
 *     provider: window.ethereum,
 *     chainId: 1
 *   },
 *   discoveryMethod: 'eip6963',
 *   metadata: {
 *     version: '10.22.0',
 *     description: 'MetaMask browser extension'
 *   }
 * };
 * ```
 * @example
 * ```typescript
 * // Wallet discovered via WalletConnect
 * const walletConnectWallet: DiscoveredWalletInfo = {
 *   id: 'rainbow-wallet',
 *   name: 'Rainbow',
 *   icon: 'https://rainbow.me/assets/icon-512.png',
 *   adapterType: 'evm',
 *   adapterConfig: {
 *     projectId: 'your-project-id',
 *     chainIds: [1, 137, 10]
 *   },
 *   discoveryMethod: 'walletconnect'
 * };
 * ```
 * @example
 * ```typescript
 * // Accessing discovered wallets from registry
 * const registry = new WalletRegistry();
 * const discoveredWallets = registry.getAllDiscoveredWallets();
 *
 * for (const wallet of discoveredWallets) {
 *   console.log(`Found wallet: ${wallet.name} (${wallet.discoveryMethod})`);
 *   if (wallet.adapterType === 'evm') {
 *     // Handle EVM wallet discovery
 *     await handleEvmWallet(wallet);
 *   }
 * }
 * ```
 */
export interface DiscoveredWalletInfo {
  /**
   * Unique wallet identifier
   *
   * @remarks
   * A unique string that identifies this wallet instance. For browser extensions,
   * this is often the extension ID or a standard identifier like those defined in EIP-6963.
   * For web wallets, this might be a domain-based identifier or app-specific ID.
   *
   * @example "io.metamask" // MetaMask extension
   * @example "com.coinbase.wallet" // Coinbase Wallet
   * @example "app.phantom" // Phantom wallet
   */
  id: string;

  /**
   * Original responder identifier provided by discovery transport.
   * Kept for correlation with discovery protocol events.
   */
  responderId?: string;

  /**
   * Display name for the wallet
   *
   * @remarks
   * Human-readable name of the wallet as it should appear in the UI.
   * This is typically the official wallet name that users will recognize.
   *
   * @example "MetaMask"
   * @example "Rainbow Wallet"
   * @example "Phantom"
   */
  name: string;

  /**
   * Icon data URI or URL
   *
   * @remarks
   * Visual representation of the wallet for UI display. Can be:
   * - Data URI (preferred for performance and reliability)
   * - HTTPS URL pointing to an icon
   * - Should be square format (1:1 aspect ratio) for consistent display
   * - Recommended minimum size: 64x64 pixels
   *
   * @example "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0..."
   * @example "https://wallet.example.com/icon.png"
   */
  icon: string;

  /**
   * Type of adapter to create
   *
   * @remarks
   * Specifies which adapter type should be used to connect to this wallet.
   * This determines the blockchain technology and communication protocol:
   * - 'evm': Ethereum Virtual Machine compatible wallets
   * - 'solana': Solana blockchain wallets
   * - 'aztec': Aztec privacy-focused wallets
   * - 'discovery': Wallets using the WalletMesh discovery protocol
   *
   * @example 'evm' // For MetaMask, Rainbow, Coinbase Wallet
   * @example 'solana' // For Phantom, Solflare
   * @example 'aztec' // For Aztec-compatible wallets
   */
  adapterType: 'evm' | 'solana' | 'aztec' | 'discovery';

  /**
   * Configuration needed to create the adapter
   *
   * @remarks
   * Adapter-specific configuration data required to instantiate the wallet adapter.
   * The structure varies based on the adapterType:
   * - EVM adapters: may include provider object, chain IDs, RPC URLs
   * - Solana adapters: may include connection configuration, commitment levels
   * - Aztec adapters: may include PXE configuration, encryption keys
   * - Discovery adapters: may include transport configuration, endpoint URLs
   *
   * This configuration is passed to the adapter constructor when the user selects
   * this wallet for connection.
   *
   * @example
   * ```typescript
   * // EVM adapter config
   * {
   *   provider: window.ethereum,
   *   preferredChains: [1, 137]
   * }
   * ```
   * @example
   * ```typescript
   * // Solana adapter config
   * {
   *   network: 'mainnet-beta',
   *   commitment: 'confirmed'
   * }
   * ```
   */
  adapterConfig: unknown;

  /**
   * Discovery method used
   *
   * @remarks
   * Indicates how this wallet was discovered, which can affect how it's handled
   * and what capabilities it might have:
   * - 'eip6963': Discovered via EIP-6963 wallet detection standard
   * - 'eip1193': Detected as an EIP-1193 provider (e.g., injected window.ethereum)
   * - 'walletconnect': Discovered through WalletConnect protocol
   * - 'discovery-protocol': Found via WalletMesh discovery protocol
   *
   * This information can be used for analytics, debugging, or applying
   * discovery-method-specific behavior.
   * @example 'eip6963' // Most modern browser extension wallets
   * @example 'walletconnect' // Mobile wallets via WalletConnect
   * @example 'discovery-protocol' // Cross-origin wallet discovery
   */
  discoveryMethod?: 'eip6963' | 'eip1193' | 'walletconnect' | 'discovery-protocol';

  /**
   * Additional metadata
   *
   * @remarks
   * Optional metadata that provides additional context about the discovered wallet.
   * This can include:
   * - Wallet version information
   * - Supported features or capabilities
   * - Discovery-specific data (timestamps, source information)
   * - Custom properties provided by the wallet
   *
   * The exact structure depends on the discovery method and wallet implementation.
   * This data is primarily used for debugging, analytics, or enhanced user experience.
   * @example
   * ```typescript
   * {
   *   version: '10.22.0',
   *   description: 'MetaMask browser extension',
   *   discoveredAt: '2025-01-15T10:30:00Z',
   *   supportedFeatures: ['eth_signTypedData_v4', 'wallet_switchEthereumChain']
   * }
   * ```
   * @example
   * ```typescript
   * {
   *   walletConnectVersion: '2.0',
   *   sessionTopic: 'abc123...',
   *   peerMetadata: {
   *     name: 'Rainbow',
   *     description: 'Rainbow Wallet Mobile'
   *   }
   * }
   * ```
   */
  metadata?: Record<string, unknown>;
}
