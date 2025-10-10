/**
 * Type definitions for WalletMesh React integration
 *
 * This module defines React-specific types and interfaces for the headless architecture.
 *
 * @module types
 * @packageDocumentation
 */

// Core type imports from modal-core (headless)
import type {
  ConnectionStatus,
  WalletMeshConfig as CoreWalletMeshConfig,
  DiscoveryConfig,
  ModalError,
  SupportedChain,
  WalletInfo,
} from '@walletmesh/modal-core';

// WalletConfig type - use local definition for now
type CoreWalletConfig = {
  order?: string[];
  include?: string[];
  exclude?: string[];
  filter?: (adapter: unknown) => boolean;
};
import type { QueryClient } from '@tanstack/react-query';
import type { ThemeProviderConfig } from './theme/types.js';

/**
 * Headless WalletMesh state interface
 * Pure business logic state without UI concerns
 */
export interface ReactWalletMeshState {
  // Connection state
  connectionStatus: ConnectionStatus;
  selectedWallet: WalletInfo | null;
  connectedWallets: WalletInfo[];
  provider: unknown | null;

  // UI state (framework controls this)
  isModalOpen: boolean;
  currentView: 'walletSelection' | 'connecting' | 'connected' | 'error' | 'switchingChain';

  // Data state
  availableWallets: WalletInfo[];
  detectedWallets: WalletInfo[];

  // Error state
  error: ModalError | null;

  // Chain state
  currentChain: SupportedChain | null;
  supportedChains: SupportedChain[];

  // Connection details - available when connectionStatus is 'connected'
  address?: string;
  accounts?: string[];

  // Connection progress - available when connectionStatus is 'connecting'
  connectionProgress?: {
    message: string;
    percentage?: number;
  };
}

/**
 * Headless WalletMesh actions interface
 * Pure actions without UI side effects
 */
export interface WalletMeshActions {
  // Connection actions
  requestConnection(): void;
  selectWallet(walletId: string): void | Promise<void>;
  cancelConnection(): void;
  disconnect(walletId?: string): void;
  retry(): void;

  // Chain actions
  switchChain(
    chain: SupportedChain,
    walletId?: string,
  ): Promise<{
    provider: unknown;
    chainType: string;
    chain: SupportedChain;
    previousChain: SupportedChain;
  }>;

  // UI actions (framework handles these)
  openModal(): void;
  closeModal(): void;
  setView(view: ReactWalletMeshState['currentView']): void;
}

/**
 * Headless WalletMesh queries interface
 * Pure state queries without UI dependencies
 */
export interface WalletMeshQueries {
  getAvailableWallets(): WalletInfo[];
  getConnectionStatus(): ReactWalletMeshState['connectionStatus'];
  getCurrentError(): ModalError | null;
  getProvider(): unknown | null;
  isConnected(): boolean;
  getProviderVersion(): number;
}

/**
 * Core headless store interface
 * Framework-agnostic state management
 */
export interface ReactWalletMeshStore {
  getState(): ReactWalletMeshState;
  subscribe(listener: (state: ReactWalletMeshState) => void): () => void;
  dispatch(action: { type: string; payload?: unknown }): void;
}

/**
 * Main headless WalletMesh interface
 * Pure business logic without UI concerns
 */
export interface HeadlessWalletMesh {
  // State management
  store: ReactWalletMeshStore;

  // Actions (no UI assumptions)
  actions: WalletMeshActions;

  // Queries
  queries: WalletMeshQueries;

  // Events
  on(event: string, handler: (data: unknown) => void): () => void;
  off(event: string, handler: (data: unknown) => void): void;
  emit(event: string, data: unknown): void;

  // Lifecycle
  destroy(): void;

  // Provider versioning for change detection
  providerVersion: number;

  // Internal client access for advanced use cases
  _client?: unknown;
}

// Re-export core types for convenience
export type {
  WalletInfo,
  ChainType,
  ModalError,
} from '@walletmesh/modal-core';

// Use ModalError directly from modal-core (ReactModalError was redundant)
// export interface ReactModalError - REMOVED: Use ModalError instead

/**
 * dApp metadata for identification and display
 * Provides identity information that flows through the entire system
 */
export interface DAppMetadata {
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

/**
 * Headless WalletMesh configuration
 * Pure business logic configuration without UI concerns
 */
export interface WalletMeshConfig extends Omit<CoreWalletMeshConfig, 'chains' | 'wallets'> {
  /** Explicitly supported chains (required - no automatic chain selection) */
  chains: SupportedChain[];

  /** Wallet configurations - array of WalletInfo objects */
  wallets?: WalletInfo[];

  /** Maximum number of simultaneous wallet connections */
  maxConnections?: number;

  /** dApp metadata for identification (auto-populated from appName/appDescription if not provided) */
  appMetadata?: DAppMetadata;
}

/**
 * React-specific configuration for WalletMesh.
 *
 * Extends the base WalletMesh configuration with React-specific options for
 * modal rendering, theming, and DOM integration. This configuration supports
 * both simplified and advanced usage patterns.
 *
 * ## Configuration Formats
 *
 * **Chains**: Must be explicitly declared using ChainConfig objects:
 * - Built-in chains: `[ethereumMainnet, polygonMainnet, solanaMainnet]`
 * - Custom chains: `[{ chainId: 'eip155:999999', required: false, label: 'My L2', interfaces: ['eip1193'], group: 'custom' }]`
 * - Mixed: `[ethereumMainnet, myCustomChain]`
 *
 * **Wallets**: Specified as WalletInfo objects:
 * - Wallet info objects: `[{ id: 'metamask', name: 'MetaMask', icon: '...', chains: ['evm'] }]`
 * - From adapters: `[AztecExampleWalletAdapter.getWalletInfo()]`
 * - Mixed: `[metaMaskInfo, customWalletInfo]`
 *
 * ## React Integration
 *
 * The React-specific options control how WalletMesh integrates with React:
 * - **Modal Management**: Control automatic modal injection and positioning
 * - **Theme System**: Deep integration with WalletMesh theme system
 * - **Portal Rendering**: Custom DOM targets for modal rendering
 * - **CSS Integration**: Custom class names for styling integration
 *
 * @example
 * ```tsx
 * // Simple configuration
 * const config: WalletMeshReactConfig = {
 *   appName: 'My DApp',
 *   chains: ['evm', 'solana'],
 *   wallets: ['metamask', 'phantom']
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Advanced configuration with theming
 * const config: WalletMeshReactConfig = {
 *   appName: 'Advanced DApp',
 *   appDescription: 'A sophisticated decentralized application',
 *   chains: [
 *     { chainId: '1', chainType: 'evm', name: 'Ethereum' },
 *     { chainId: '137', chainType: 'evm', name: 'Polygon' }
 *   ],
 *   wallets: {
 *     include: ['metamask', 'walletconnect', 'coinbase'],
 *     order: ['metamask', 'coinbase', 'walletconnect'],
 *     filter: (adapter) => adapter.readyState === 'installed'
 *   },
 *   theme: {
 *     mode: 'dark',
 *     persist: true,
 *     customization: {
 *       colors: {
 *         primary: '#6366f1',
 *         background: '#0f172a'
 *       }
 *     }
 *   },
 *   autoInjectModal: true,
 *   debug: process.env['NODE_ENV'] === 'development'
 * };
 * ```
 *
 * @see {@link WalletMeshConfig} For base configuration options
 * @see {@link ThemeProviderConfig} For theme configuration details
 * @see {@link WalletMeshProvider} For the component that uses this configuration
 *
 * @public
 * @since 1.0.0
 */
export interface AztecProvingOverlayConfig {
  /** Whether the overlay should be rendered. Defaults to true when Aztec chains are present. */
  enabled?: boolean;
  /** Override headline text displayed in the overlay. */
  headline?: string;
  /** Override the descriptive/supporting text. */
  description?: string;
  /** Disable the beforeunload navigation guard while the overlay is shown. */
  disableNavigationGuard?: boolean;
}

export interface WalletMeshReactConfig extends WalletMeshConfig {
  // React-specific options
  /**
   * Whether to automatically inject the modal component into the DOM.
   *
   * When `true` (default), the WalletMeshModal component is automatically
   * rendered as a child of the provider. Set to `false` if you want to
   * render the modal manually or use a custom modal component.
   *
   * @defaultValue true
   */
  autoInjectModal?: boolean;

  /**
   * Configure the automatic Aztec proving overlay that appears while proofs are generated.
   *
   * Set to `false` to disable the overlay entirely. Provide an object to customize messaging
   * or disable navigation guards while keeping the overlay visible. When omitted, the overlay
   * is enabled automatically for configurations that include an Aztec chain.
   */
  aztecProvingOverlay?: boolean | AztecProvingOverlayConfig;

  /**
   * Custom portal target for modal rendering.
   *
   * By default, the modal renders into a portal attached to `document.body`.
   * You can specify a custom target as either a CSS selector string or
   * an HTMLElement reference.
   *
   * @example
   * ```tsx
   * // Using CSS selector
   * portalTarget: '#modal-root'
   *
   * // Using element reference
   * portalTarget: document.getElementById('modal-container')
   * ```
   */
  portalTarget?: string | HTMLElement;

  /**
   * Additional CSS class names to apply to the modal component.
   *
   * These classes are added to the modal's root element and can be used
   * for custom styling or integration with CSS frameworks.
   *
   * @example
   * ```tsx
   * className: 'my-wallet-modal custom-modal-styles'
   * ```
   */
  className?: string;

  /**
   * Theme configuration for modal styling and behavior.
   *
   * Controls the appearance and theming behavior of the modal component,
   * including color schemes, persistence, and customization options.
   *
   * @see {@link ThemeProviderConfig} For detailed theme options
   */
  theme?: ThemeProviderConfig;

  /**
   * Discovery protocol configuration for automatic wallet detection.
   *
   * Enables the WalletMesh discovery protocol to automatically detect
   * wallets that are available in the user's environment. This includes
   * support for cross-origin wallet announcements and capability matching.
   *
   * @example
   * ```tsx
   * discovery: {
   *   enabled: true,
   *   protocols: ['walletmesh', 'eip6963'],
   *   timeout: 5000,
   *   autoScan: true,
   *   capabilities: {
   *     chains: ['aztec:sandbox'],
   *     features: ['sign-transaction', 'sign-message']
   *   }
   * }
   * ```
   *
   * @see {@link DiscoveryConfig} For detailed discovery options
   * @since 1.1.0
   */
  // discovery?: DiscoveryConfig; // Inherited from WalletMeshConfig

  /**
   * Chain-specific permissions configuration.
   *
   * Defines the permissions that will be requested for each chain when
   * connecting wallets. This is used to configure which methods the dApp
   * is allowed to call on each chain.
   *
   * @example
   * ```tsx
   * permissions: {
   *   'aztec:31337': [
   *     'aztec_getAddress',
   *     'aztec_sendTx',
   *     'aztec_getChainId'
   *   ],
   *   'eip155:1': [
   *     'eth_accounts',
   *     'eth_sendTransaction'
   *   ]
   * }
   * ```
   */
  permissions?: Record<string, string[]>;
}

/**
 * Props for the WalletMeshProvider component.
 *
 * Defines the configuration and children required for the WalletMesh React provider.
 * The provider component uses these props to initialize the WalletMesh client and
 * provide wallet functionality throughout the React component tree.
 *
 * @example
 * ```tsx
 * const providerProps: WalletMeshProviderProps = {
 *   children: <App />,
 *   config: {
 *     appName: 'My DApp',
 *     chains: ['evm', 'solana'],
 *     wallets: ['metamask', 'phantom']
 *   }
 * };
 *
 * <WalletMeshProvider {...providerProps} />
 * ```
 *
 * @see {@link WalletMeshProvider} For the component that uses these props
 * @see {@link WalletMeshReactConfig} For detailed configuration options
 *
 * @public
 * @since 1.0.0
 */
export interface WalletMeshProviderProps {
  /**
   * React children to render within the WalletMesh provider context.
   * All children will have access to WalletMesh functionality through hooks.
   */
  children: React.ReactNode;

  /**
   * WalletMesh configuration object with React-specific extensions.
   * Supports simplified configuration formats that are automatically transformed.
   */
  config: WalletMeshReactConfig;

  /**
   * Optional QueryClient instance from @tanstack/react-query.
   * If not provided, the provider will use the QueryClient from modal-core.
   */
  queryClient?: QueryClient;
}

/**
 * WalletMesh React context value
 * Provides access to headless instance and React-optimized state
 */
export interface WalletMeshContextValue {
  // Headless instance access
  /** The headless WalletMesh instance (null during initialization) */
  mesh: HeadlessWalletMesh | null;

  // React-optimized state
  /** Current WalletMesh state (null during initialization) */
  state: ReactWalletMeshState | null;

  // Initialization state
  /** Whether the WalletMesh client is currently being initialized */
  isInitializing: boolean;
  /** Error that occurred during initialization */
  initializationError: Error | null;

  // React conveniences
  /** Connect to a wallet with React-friendly error handling */
  connect: (walletId?: string) => Promise<void>;
  /** Disconnect from a specific wallet */
  disconnect: (walletId?: string) => Promise<void>;
  /** Whether any wallet is connected */
  isConnected: boolean;

  // Modal control
  /** Whether modal is open */
  isOpen: boolean;
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;

  // SSR support
  /** Whether currently in SSR mode */
  isSSR?: boolean;
  /** Whether component has mounted on client */
  hasMounted?: boolean;
}

/**
 * Connection hook return type
 * Provides connection state and methods with loading states
 */
export interface UseConnectionReturn {
  /** Connect to a wallet */
  connect: (walletId?: string) => Promise<void>;
  /** Disconnect from a specific wallet */
  disconnect: (walletId?: string) => Promise<void>;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Whether any wallet is connected */
  isConnected: boolean;
  /** Primary connected address */
  address: string | null;
  /** Current chain */
  chain: SupportedChain | null;
  /** Connected wallets */
  connectedWallets: WalletInfo[];
  /** Current provider instance */
  provider: unknown | null;
}

/**
 * Modal hook return type
 *
 * Provides modal control methods
 */
export interface UseModalReturn {
  /** Whether modal is open */
  isOpen: boolean;
  /** Open the modal */
  open: () => void;
  /** Close the modal */
  close: () => void;
  /** Toggle modal open/close */
  toggle: () => void;
}

/**
 * Account hook return type
 * Provides account information
 */
export interface UseAccountReturn {
  /** Primary account address */
  address: string | null;
  /** Current chain */
  chain: SupportedChain | null;
  /** All connected accounts */
  accounts: string[];
  /** Whether any wallet is connected */
  isConnected: boolean;
  /** Connected wallets with account info */
  connectedWallets: WalletInfo[];
  /** Current provider instance */
  provider: unknown | null;
}

/**
 * Wallet event hook type
 * Generic type for wallet event subscriptions
 */
export type WalletEventHandler<T = unknown> = (payload: T) => void;

// Re-export WalletConfig from modal-core
export type WalletConfig = CoreWalletConfig;
