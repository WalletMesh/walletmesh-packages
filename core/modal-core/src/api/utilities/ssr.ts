/**
 * Server-Side Rendering (SSR) support for modal-core
 *
 * Provides SSR-safe implementations of modal functionality for server environments
 * where browser APIs are not available.
 *
 * @module ssr
 * @packageDocumentation
 */

import type { Connection, WalletMeshClient } from '../../internal/client/WalletMeshClient.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { ModalController, ModalState } from '../../types.js';
import type { ChainType, SupportedChain, WalletInfo } from '../../types.js';
import type { HeadlessModal, HeadlessModalActions, HeadlessModalState } from '../core/headless.js';
import type { ModalEventMap } from '../types/events.js';

// SSREventEmitter removed - not needed in headless architecture

/**
 * SSR modal state
 *
 * Provides a safe default state for server-side rendering
 */
export const SSR_MODAL_STATE: ModalState = {
  connection: {
    state: 'idle',
  },
  wallets: [],
  selectedWalletId: undefined,
  isOpen: false,
};

/**
 * SSR-safe controller that implements WalletMeshClient interface
 *
 * This controller provides a unified interface that framework adapters can use
 * without runtime type checking, eliminating SSR/browser compatibility issues.
 */
class SSRController implements WalletMeshClient {
  private emptyUnsubscribe = () => {};

  // Headless modal interface
  readonly modal: HeadlessModal;

  constructor() {
    this.modal = this.createHeadlessModal();
  }

  // WalletMeshClient interface implementation
  getState(): ModalState {
    return SSR_MODAL_STATE;
  }

  subscribe(_callback: (state: ModalState) => void): () => void {
    return this.emptyUnsubscribe;
  }

  async connect(walletId?: string, _options?: unknown): Promise<Connection | undefined> {
    if (walletId) {
      // Return connection for specific wallet
      throw ErrorFactory.configurationError('Cannot connect wallet in SSR environment');
    }
    // No walletId means open modal (but in SSR, we can't)
    return;
  }

  async connectWithModal(_options?: { chainType?: ChainType }): Promise<Connection | undefined> {
    // No-op in SSR - cannot connect in server environment
    return;
  }

  async disconnect(_walletId?: string): Promise<void> {
    // No-op in SSR
  }

  async disconnectAll(): Promise<void> {
    // No-op in SSR
  }

  async openModal(_options?: { targetChainType?: import('../../types.js').ChainType }): Promise<void> {
    // No-op in SSR
  }

  closeModal(): void {
    // No-op in SSR
  }

  on<K extends keyof ModalEventMap>(_event: K, _handler: (data: ModalEventMap[K]) => void): () => void {
    return this.emptyUnsubscribe;
  }

  once<K extends keyof ModalEventMap>(_event: K, _handler: (data: ModalEventMap[K]) => void): () => void {
    return this.emptyUnsubscribe;
  }

  async switchChain(
    _chainId: string,
    _walletId?: string,
  ): Promise<{
    provider: unknown;
    chainType: ChainType;
    chainId: string;
    previousChainId: string;
  }> {
    throw ErrorFactory.configurationError('Cannot switch chain in SSR environment');
  }

  destroy(): void {
    // No-op in SSR
  }

  get isConnected(): boolean {
    return false;
  }

  getActions(): HeadlessModalActions {
    return {
      openModal: () => {},
      closeModal: () => {},
      selectWallet: async (_walletId: string) => {},
      connect: async () => {},
      disconnect: async () => {},
      retry: async () => {},
    };
  }

  getServices() {
    // Return empty services for SSR
    return {
      transaction: null,
      balance: null,
      chain: null,
      connection: null,
      account: null,
      preferences: null,
      sessionManagement: null,
      connectionRecovery: null,
      walletHealth: null,
      connectionUI: null,
      chainEnsurance: null,
      eventMapping: null,
    };
  }

  getQueryManager(): unknown {
    // No QueryManager available in SSR
    return null;
  }

  getPublicProvider(_chainId: string): import('../../api/types/providers.js').PublicProvider | null {
    // No providers available in SSR
    return null;
  }

  getWalletProvider(_chainId: string): import('../../api/types/providers.js').WalletProvider | null {
    // No providers available in SSR
    return null;
  }

  getWalletAdapter(
    _walletId: string,
  ): import('../../internal/wallets/base/WalletAdapter.js').WalletAdapter | null {
    // No adapters available in SSR
    return null;
  }

  // Headless modal interface
  private createHeadlessModal(): HeadlessModal {
    return {
      // Get current state
      getState: (): HeadlessModalState => SSR_MODAL_STATE,

      // Subscribe to state changes
      subscribe: (_listener: (state: HeadlessModalState) => void): (() => void) => {
        return this.emptyUnsubscribe;
      },

      // Get available actions
      getActions: (): HeadlessModalActions => {
        return {
          openModal: () => {},
          closeModal: () => {},
          selectWallet: async (_walletId: string) => {},
          connect: async () => {},
          disconnect: async () => {},
          retry: async () => {},
        };
      },

      // Destroy the modal and clean up resources
      destroy: () => {},
    };
  }

  // Wallet discovery (returns empty in SSR)
  async discoverWallets(_options?: any): Promise<any[]> {
    return [];
  }
}

/**
 * Creates an SSR-safe controller for server environments
 *
 * This controller provides a safe implementation for server-side rendering
 * that maintains the same interface as the client-side controller without
 * requiring browser APIs.
 *
 * @returns SSR-safe controller implementing WalletMeshClient interface
 *
 * @example
 * ```typescript
 * // In a Next.js or other SSR framework
 * import { createSSRController } from '@walletmesh/modal-core/ssr';
 *
 * const controller = typeof window === 'undefined'
 *   ? createSSRController()
 *   : createModal(config);
 * ```
 */
export function createSSRController(): WalletMeshClient {
  return new SSRController();
}

/**
 * Check if code is running in server environment
 *
 * @returns true if running on server, false if in browser
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Check if code is running in browser environment
 *
 * @returns true if running in browser, false if on server
 *
 * @since 3.0.0
 */
export function isBrowser(): boolean {
  return !isServer();
}

/**
 * Safe wrapper for browser APIs that may not be available during SSR
 *
 * Executes the provided function only if running in a browser environment,
 * otherwise returns the fallback value. Also includes error handling for
 * cases where browser APIs might fail.
 *
 * @param fn - Function that uses browser APIs
 * @param fallback - Fallback value for SSR or when function fails
 * @returns Result of fn() on client, fallback on server or error
 *
 * @example
 * ```typescript
 * // Get current URL safely
 * const currentUrl = safeBrowserAPI(
 *   () => window.location.href,
 *   'https://example.com'
 * );
 *
 * // Get localStorage value safely
 * const theme = safeBrowserAPI(
 *   () => localStorage.getItem('theme'),
 *   'light'
 * );
 *
 * // Get viewport dimensions safely
 * const dimensions = safeBrowserAPI(
 *   () => ({ width: window.innerWidth, height: window.innerHeight }),
 *   { width: 1920, height: 1080 }
 * );
 * ```
 *
 * @category SSR Utilities
 * @public
 * @since 3.0.0
 */
export function safeBrowserAPI<T>(fn: () => T, fallback: T): T {
  if (isServer()) {
    return fallback;
  }

  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * Create a controller that works in both SSR and browser environments
 *
 * @param createBrowserController - Function to create browser controller
 * @returns Controller instance appropriate for the environment
 *
 * @example
 * ```typescript
 * const controller = createUniversalController(() =>
 *   createModal({ wallets, theme: 'light' })
 * );
 * ```
 */
export function createUniversalController(createBrowserController: () => ModalController): ModalController {
  if (isServer()) {
    // Create an SSR-safe ModalController
    const ssrModalController: ModalController = {
      open: () => {},
      close: () => {},
      getState: () => SSR_MODAL_STATE,
      subscribe: () => () => {},
      connect: async () => {
        throw ErrorFactory.configurationError('Cannot connect wallet in SSR environment');
      },
      disconnect: async () => {},
      selectWallet: () => {},
      reset: () => {},
      setView: () => {},
      goBack: () => {},
      getAvailableWallets: async () => [],
      cleanup: () => {},
    };
    return ssrModalController;
  }
  return createBrowserController();
}

/**
 * SSR state serialization
 *
 * Serialize modal state for hydration
 */
export const ssrState = {
  /**
   * Serialize state for SSR
   */
  serialize: (state: ModalState): string => {
    return JSON.stringify(state);
  },

  /**
   * Deserialize state from SSR
   */
  deserialize: (serialized: string): ModalState => {
    try {
      return JSON.parse(serialized) as ModalState;
    } catch {
      return SSR_MODAL_STATE;
    }
  },

  /**
   * Extract safe state for SSR (no functions or browser-specific data)
   */
  extractSafeState: (state: ModalState): ModalState => {
    return {
      connection: {
        state: state.connection.state,
        ...(state.connection.progress && { progress: { ...state.connection.progress } }),
        ...(state.connection.error && { error: { ...state.connection.error } }),
      },
      wallets: [...state.wallets],
      selectedWalletId: state.selectedWalletId,
      isOpen: state.isOpen,
    };
  },
};

/**
 * Framework configuration interface
 *
 * Represents a framework-specific configuration that needs to be transformed
 * to the core WalletMesh configuration format.
 */
export interface FrameworkConfig {
  /** Application name */
  appName: string;
  /** Application description (optional) */
  appDescription?: string;
  /** Application URL (optional) */
  appUrl?: string;
  /** Application icon URL (optional) */
  appIcon?: string;
  /** Project ID for analytics/tracking (optional) */
  projectId?: string;
  /** Debug mode flag (optional) */
  debug?: boolean;
  /** Supported chains */
  chains?: SupportedChain[];
  /** Wallet configuration - can be array of wallet IDs or wallet objects */
  wallets?: (string | WalletInfo)[];
}

/**
 * Core WalletMesh configuration interface for framework transformation
 *
 * The target format that framework configurations are transformed into.
 */
export interface CoreWalletMeshConfig {
  /** Application name */
  appName: string;
  /** Application description (optional) */
  appDescription?: string;
  /** Application URL (optional) */
  appUrl?: string;
  /** Application icon URL (optional) */
  appIcon?: string;
  /** Project ID for analytics/tracking (optional) */
  projectId?: string;
  /** Debug mode flag (optional) */
  debug?: boolean;
  /** Chain configurations */
  chains?: Array<{
    chainId: string;
    chainType: ChainType;
    name: string;
    required?: boolean;
    icon?: string;
    label?: string;
    interfaces?: string[];
    group?: string;
  }>;
  /** Wallet configurations */
  wallets?: {
    include?: string[];
    exclude?: string[];
  };
}

/**
 * Transform framework-specific configuration to core WalletMesh configuration
 *
 * Converts framework-specific configuration formats (e.g., from React, Vue, Svelte)
 * into the standardized core configuration format. Handles chain type inference,
 * wallet configuration normalization, and property mapping.
 *
 * @param config - Framework-specific configuration
 * @returns Transformed core configuration
 *
 * @example
 * ```typescript
 * // Transform React/Vue/Svelte config to core format
 * const frameworkConfig = {
 *   appName: 'My DApp',
 *   chains: [
 *     { chainId: '1', name: 'Ethereum' },
 *     { chainId: 'solana:mainnet', name: 'Solana' }
 *   ],
 *   wallets: ['metamask', 'phantom']
 * };
 *
 * const coreConfig = transformFrameworkConfig(frameworkConfig);
 * // Result: { appName: 'My DApp', chains: [...], wallets: { include: ['metamask', 'phantom'] } }
 * ```
 *
 * @example
 * ```typescript
 * // Transform config with complex wallet objects
 * const frameworkConfig = {
 *   appName: 'My DApp',
 *   chains: [{ chainId: 'eip155:1', chainType: 'evm', name: 'Ethereum' }],
 *   wallets: [
 *     { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
 *     'phantom'
 *   ]
 * };
 *
 * const coreConfig = transformFrameworkConfig(frameworkConfig);
 * ```
 *
 * @category SSR Utilities
 * @public
 * @since 3.0.0
 */
export function transformFrameworkConfig(config: FrameworkConfig): CoreWalletMeshConfig {
  const coreConfig: CoreWalletMeshConfig = {
    appName: config.appName,
    ...(config.appDescription && { appDescription: config.appDescription }),
    ...(config.appUrl && { appUrl: config.appUrl }),
    ...(config.appIcon && { appIcon: config.appIcon }),
    ...(config.projectId && { projectId: config.projectId }),
    ...(config.debug !== undefined && { debug: config.debug }),
  };

  // Transform chains if provided
  if (config.chains && config.chains.length > 0) {
    coreConfig.chains = config.chains.map((supportedChain) => {
      const chain = supportedChain as {
        chainId?: string;
        chainType?: string;
        name?: string;
        label?: string;
        required?: boolean;
        icon?: string;
        interfaces?: string[];
        group?: string;
      };

      // Infer chainType from chainId if not provided
      let chainType: ChainType = chain.chainType as ChainType;
      if (!chainType && chain.chainId) {
        if (chain.chainId.startsWith('eip155:') || /^\d+$/.test(chain.chainId)) {
          chainType = 'evm' as ChainType;
        } else if (chain.chainId.startsWith('solana:')) {
          chainType = 'solana' as ChainType;
        } else if (chain.chainId.startsWith('aztec:')) {
          chainType = 'aztec' as ChainType;
        } else {
          chainType = 'evm' as ChainType; // default fallback
        }
      }

      return {
        chainId: chain.chainId || '',
        chainType: chainType || ('evm' as ChainType),
        name: chain.name || chain.label || chain.chainId || 'Unknown Chain',
        required: chain.required || false,
        // Only include optional properties if they exist
        ...(chain.icon && { icon: chain.icon }),
        ...(chain.label && { label: chain.label }),
        ...(chain.interfaces && { interfaces: chain.interfaces }),
        ...(chain.group && { group: chain.group }),
      };
    });
  }

  // Transform wallets if provided
  if (config.wallets && config.wallets.length > 0) {
    const walletIds = config.wallets.map((wallet) => (typeof wallet === 'string' ? wallet : wallet.id));

    coreConfig.wallets = {
      include: walletIds,
    };
  }

  return coreConfig;
}

/**
 * Validate framework configuration before transformation
 *
 * Performs basic validation on framework configuration to ensure required
 * properties are present and have valid values.
 *
 * @param config - Framework configuration to validate
 * @throws {Error} If configuration is invalid
 *
 * @example
 * ```typescript
 * try {
 *   validateFrameworkConfig(config);
 *   const coreConfig = transformFrameworkConfig(config);
 * } catch (error) {
 *   console.error('Invalid configuration:', error.message);
 * }
 * ```
 *
 * @category SSR Utilities
 * @public
 * @since 3.0.0
 */
export function validateFrameworkConfig(config: unknown): asserts config is FrameworkConfig {
  if (!config || typeof config !== 'object') {
    throw ErrorFactory.configurationError('Configuration must be an object');
  }

  const cfg = config as Record<string, unknown>;

  if (!cfg['appName'] || typeof cfg['appName'] !== 'string' || cfg['appName'].trim().length === 0) {
    throw ErrorFactory.configurationError('appName is required and must be a non-empty string');
  }

  if (cfg['chains'] && !Array.isArray(cfg['chains'])) {
    throw ErrorFactory.configurationError('chains must be an array');
  }

  if (cfg['wallets'] && !Array.isArray(cfg['wallets'])) {
    throw ErrorFactory.configurationError('wallets must be an array');
  }

  if (cfg['debug'] !== undefined && typeof cfg['debug'] !== 'boolean') {
    throw ErrorFactory.configurationError('debug must be a boolean');
  }
}
