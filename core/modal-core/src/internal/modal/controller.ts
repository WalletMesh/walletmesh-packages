/**
 * Modal controller using unified state management
 *
 * Orchestrates UI rendering, state management, wallet connections, and error handling.
 * Uses the unified Zustand store for all state management.
 *
 * @module modal/controllerUnified
 * @internal
 */

import type { z } from 'zod';
import type {
  ConnectionDisplayData,
  HeadlessModalActions,
  HeadlessModalState,
} from '../../api/core/headless.js';
import type { WalletConnection } from '../../api/types/connection.js';
import type { modalViewSchema } from '../../schemas/connection.js';
import { connectionActions } from '../../state/actions/connections.js';
import { uiActions } from '../../state/actions/ui.js';
import { useStore } from '../../state/store.js';
import { subscriptions } from '../../state/subscriptions.js';
import {
  ChainType,
  type ConnectionResult,
  type ModalController as PublicModalController,
  type SupportedChainsConfig,
  type WalletInfo,
} from '../../types.js';
import { generateId } from '../../utils/crypto.js';
import type { InternalWalletMeshClient } from '../client/WalletMeshClient.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { ErrorHandler } from '../core/errors/errorHandler.js';
import { isModalError } from '../core/errors/index.js';
import type { Logger } from '../core/logger/logger.js';
import { ModalSingletonManager } from './singletonManager.js';

/**
 * Modal view type inferred from schema
 * @typedef {z.infer<typeof modalViewSchema>} ModalView
 */
export type ModalView = z.infer<typeof modalViewSchema>;

/**
 * Modal configuration interface
 * @interface ModalConfig
 */
export interface ModalConfig {
  /**
   * Show provider selection view
   * @type {boolean}
   */
  showProviderSelection: boolean;
  /**
   * Chain type
   * @type {ChainType}
   */
  chain: ChainType;
  /**
   * Auto close delay in milliseconds
   * @type {number}
   */
  autoCloseDelay: number;
  /**
   * Persist wallet selection
   * @type {boolean}
   */
  persistWalletSelection: boolean;
  /**
   * Debug mode
   * @type {boolean}
   */
  debug: boolean;
  /**
   * Hook called before opening modal
   * @type {(() => Promise<boolean> | boolean) | undefined}
   */
  onBeforeOpen?: (() => Promise<boolean> | boolean) | undefined;
  /**
   * Hook called after opening modal
   * @type {(() => Promise<void> | void) | undefined}
   */
  onAfterOpen?: (() => Promise<void> | void) | undefined;
}

/**
 * Modal configuration
 * @constant {ModalConfig}
 */
export const MODAL_CONFIG: ModalConfig = {
  showProviderSelection: false,
  chain: ChainType.Evm,
  autoCloseDelay: 0,
  persistWalletSelection: false,
  debug: false,
};

/**
 * Recovery options for modal operations
 * @interface RecoveryOptions
 */
export interface RecoveryOptions {
  /**
   * Whether to show errors in the UI
   * If true, errors will be displayed in the error view
   * If false, errors will be suppressed from the UI but still reported in logs
   * @type {boolean}
   */
  showError?: boolean;
}

/**
 * Options for connect method
 * @interface ConnectOptions
 */
export interface ConnectOptions {
  /**
   * Maximum number of connection attempts
   * @type {number}
   */
  maxRetries?: number;
  /**
   * Optional context information
   * @type {string}
   */
  context?: string;
  /**
   * Whether to show errors in UI
   * @type {boolean}
   */
  showError?: boolean;
  /**
   * Base delay in milliseconds
   * @type {number}
   */
  baseDelayMs?: number;
  /**
   * Preferred provider interface to use
   * @type {string}
   */
  preferredProvider?: string;
}

/**
 * Options for disconnect method
 * @interface DisconnectOptions
 */
export interface DisconnectOptions {
  /**
   * Maximum number of disconnection attempts
   * @type {number}
   */
  maxRetries?: number;
  /**
   * Optional context information
   * @type {string}
   */
  context?: string;
  /**
   * Whether to show errors in UI
   * @type {boolean}
   */
  showError?: boolean;
  /**
   * Base delay in milliseconds
   * @type {number}
   */
  baseDelayMs?: number;
}

/**
 * Interface for modal controller configuration
 * @interface ModalControllerOptions
 */
export interface ModalControllerOptions {
  /**
   * Available wallets
   * @type {WalletInfo[]}
   */
  wallets: WalletInfo[];
  /**
   * Wallet client for managing connections
   * @type {InternalWalletMeshClient}
   */
  client: InternalWalletMeshClient;
  /**
   * Supported chains configuration
   * @type {SupportedChainsConfig}
   */
  supportedChains?: SupportedChainsConfig;
  /**
   * Initial view to display
   * @type {ModalView}
   */
  initialView?: ModalView;
  /**
   * Auto close delay in milliseconds
   * @type {number}
   */
  autoCloseDelay?: number;
  /**
   * Whether to persist wallet selection
   * @type {boolean}
   */
  persistWalletSelection?: boolean;
  /**
   * Show provider selection view
   * @type {boolean}
   */
  showProviderSelection?: boolean;
  /**
   * Debug mode
   * @type {boolean}
   */
  debug?: boolean;
  /**
   * Hook called before opening modal
   * @type {() => Promise<boolean> | boolean}
   */
  onBeforeOpen?: () => Promise<boolean> | boolean;
  /**
   * Hook called after opening modal
   * @type {() => Promise<void> | void}
   */
  onAfterOpen?: () => Promise<void> | void;
  /**
   * Error handler instance
   * @type {ErrorHandler}
   */
  errorHandler: ErrorHandler;
  /**
   * Logger instance
   * @type {Logger}
   */
  logger: Logger;
}

/**
 * Modal controller using unified state management
 * Now implements HeadlessModal interface for pure business logic
 * @class ModalController
 */
export class ModalController implements PublicModalController {
  /**
   * Controller options
   * @private
   * @readonly
   * @type {ModalControllerOptions}
   */
  private readonly options: ModalControllerOptions;

  /**
   * Logger instance
   * @private
   * @readonly
   * @type {Logger}
   */
  private readonly logger: Logger;

  /**
   * Error handler instance
   * @private
   * @readonly
   * @type {ErrorHandler}
   */
  private readonly errorHandler: ErrorHandler;

  // Note: UI mounting is now handled by framework-specific implementations
  // Modal controller is headless and does not track mount state

  /**
   * Store unsubscribe functions
   * @private
   * @type {(() => void)[]}
   */
  private unsubscriptions: (() => void)[] = [];

  /**
   * Modal configuration
   * @private
   * @readonly
   * @type {ModalConfig}
   */
  private readonly config: ModalConfig;

  /**
   * Unique modal ID for singleton management
   * @private
   * @readonly
   * @type {string}
   */
  private readonly modalId: string;

  /**
   * Singleton manager instance
   * @private
   * @readonly
   * @type {ModalSingletonManager}
   */
  private readonly singletonManager: ModalSingletonManager;

  /**
   * Create a new modal controller
   * @param {ModalControllerOptions} options - Controller configuration
   */
  constructor(options: ModalControllerOptions) {
    // Validate required dependencies
    if (!options.logger) {
      throw ErrorFactory.configurationError('Logger is required');
    }

    this.options = options;
    this.logger = options.logger;
    this.errorHandler = options.errorHandler;

    // Generate unique modal ID
    this.modalId = generateId({ prefix: 'modal', timestamp: true });

    // Get singleton manager
    this.singletonManager = ModalSingletonManager.getInstance(this.logger);

    // Register this modal with the singleton manager
    this.singletonManager.registerModal(this.modalId, this);

    // Initialize config
    this.config = {
      ...MODAL_CONFIG,
      showProviderSelection: options.showProviderSelection ?? MODAL_CONFIG.showProviderSelection,
      autoCloseDelay: options.autoCloseDelay ?? MODAL_CONFIG.autoCloseDelay,
      persistWalletSelection: options.persistWalletSelection ?? MODAL_CONFIG.persistWalletSelection,
      debug: options.debug ?? MODAL_CONFIG.debug,
      onBeforeOpen: options.onBeforeOpen,
      onAfterOpen: options.onAfterOpen,
    };

    // Initialize store with available wallets
    for (const wallet of options.wallets) {
      connectionActions.addWallet(useStore, wallet);
    }

    // Initialize view
    if (options.initialView) {
      // Filter out transition views
      const view = options.initialView;
      if (view === 'walletSelection' || view === 'connecting' || view === 'connected' || view === 'error') {
        uiActions.setView(useStore, view);
      } else {
        uiActions.setView(useStore, 'walletSelection');
      }
    } else {
      // Set default initial view
      uiActions.setView(useStore, 'walletSelection');
    }

    // Initialize subscriptions
    this.setupSubscriptions();
    this.setupClientListeners();

    if (this.logger) {
      this.logger.debug('ModalController initialized with unified store', {
        walletCount: options.wallets.length,
        initialView: options.initialView || 'walletSelection',
      });
    }
  }

  /**
   * Setup store subscriptions for logging and monitoring
   * @private
   */
  private setupSubscriptions() {
    // Subscribe to UI state changes for logging
    const unsubscribeUI = subscriptions.ui.view((view) => {
      if (this.logger) {
        this.logger.debug('View changed:', view);
      }
    });

    // Subscribe to loading state changes for logging
    const unsubscribeLoading = subscriptions.ui.loading((loading) => {
      if (this.logger) {
        this.logger.debug('Loading state changed:', loading);
      }
    });

    // Subscribe to error state changes for logging
    const unsubscribeError = subscriptions.ui.error((error) => {
      if (this.logger) {
        this.logger.debug('Error state changed:', error);
      }
    });

    // Subscribe to active wallet changes for logging
    const unsubscribeActiveWallet = subscriptions.activeWallet().subscribe((walletId) => {
      if (this.logger) {
        this.logger.debug('Active wallet changed:', walletId);
      }
    });

    // Store unsubscribe functions for cleanup
    this.unsubscriptions.push(unsubscribeUI, unsubscribeLoading, unsubscribeError, unsubscribeActiveWallet);
  }

  /**
   * Setup client event listeners
   *
   * Establishes bidirectional communication between the wallet client and modal.
   * Uses state subscriptions to monitor changes and keep the UI in sync with
   * the underlying wallet state.
   *
   * @private
   */
  private setupClientListeners() {
    // Check if client supports state subscriptions
    interface ClientWithSubscriptions {
      subscribe?: (callback: (state: unknown) => void) => () => void;
      getState?: () => unknown;
    }
    const client = this.options.client as ClientWithSubscriptions;

    if (client?.subscribe && client?.getState) {
      // Subscribe to state changes instead of using deprecated event methods
      let previousState = client.getState();

      const unsubscribe = client.subscribe((currentState) => {
        // Detect provider changes
        const prevState = previousState as Record<string, unknown>;
        const currState = currentState as Record<string, unknown>;

        if (
          prevState?.['selectedWalletId'] !== currState?.['selectedWalletId'] &&
          currState?.['selectedWalletId']
        ) {
          if (this.logger) {
            this.logger.debug('Provider changed detected via state', {
              previous: prevState?.['selectedWalletId'],
              current: currState?.['selectedWalletId'],
            });
          }
        }

        // Detect chain changes
        const prevConnection = prevState?.['connection'] as Record<string, unknown> | undefined;
        const currConnection = currState?.['connection'] as Record<string, unknown> | undefined;

        if (prevConnection?.['chainId'] !== currConnection?.['chainId'] && currConnection?.['chainId']) {
          if (this.logger) {
            this.logger.debug('Chain switched detected via state', {
              previous: prevConnection?.['chainId'],
              current: currConnection?.['chainId'],
            });
          }
        }

        // Update previous state for next comparison
        previousState = currentState;
      });

      if (typeof unsubscribe === 'function') {
        this.unsubscriptions.push(unsubscribe);
      }
    } else if (this.logger) {
      this.logger.debug('Client does not support state subscriptions');
    }
  }

  /**
   * Mount the modal UI
   * @returns {Promise<void>}
   */
  async mount(): Promise<void> {
    try {
      // Modal controller is now headless - UI framework handles rendering
      if (this.logger) {
        this.logger.debug('Modal controller mounted successfully');
      }
    } catch (error) {
      const modalError = ErrorFactory.mountFailed(
        error instanceof Error ? error.message : 'Failed to mount modal',
        'ModalController',
      );
      this.errorHandler.handleError(modalError, { operation: 'ModalController.mount' });
      throw modalError;
    }
  }

  /**
   * Unmount the modal UI
   * @returns {Promise<void>}
   */
  async unmount(): Promise<void> {
    try {
      // Cleanup subscriptions
      for (const unsubscribe of this.unsubscriptions) {
        unsubscribe();
      }
      this.unsubscriptions = [];

      // Modal controller is headless - no mount state tracking needed

      // Unregister from singleton manager
      this.singletonManager.unregisterModal(this.modalId);

      if (this.logger) {
        this.logger.debug('Modal unmounted successfully');
      }
    } catch (error) {
      const modalError = ErrorFactory.cleanupFailed(
        error instanceof Error ? error.message : 'Failed to unmount modal',
        'unmount',
      );
      this.errorHandler.handleError(modalError, { operation: 'ModalController.unmount' });
      throw modalError;
    }
  }

  /**
   * Get headless modal state
   *
   * Transforms the internal Zustand store state into a public API-friendly
   * format. This provides a consistent interface for external consumers
   * while keeping internal state management flexible.
   *
   * @returns Current modal state with connection info, errors, and UI state
   */
  getState(): HeadlessModalState {
    const state = useStore.getState();
    const { ui, active, entities } = state;
    const activeSessionId = active.sessionId;
    const activeSession = activeSessionId ? entities.sessions[activeSessionId] : undefined;

    // Map internal UI state to public connection state
    // This abstraction allows internal state changes without breaking the public API
    let connectionState: ConnectionDisplayData['state'] = 'idle';
    if (ui.currentView === 'connecting') {
      connectionState = 'connecting';
    } else if (activeSession && activeSession.status === 'connected') {
      connectionState = 'connected';
    } else if (ui.currentView === 'walletSelection') {
      connectionState = 'selecting';
    } else if (ui.errors['ui']) {
      connectionState = 'error';
    }

    const uiError = ui.errors['ui'];
    return {
      isOpen: ui.modalOpen,
      connection: {
        state: connectionState,
        ...(ui.loading.modal && {
          progress: {
            message: 'Loading...',
          },
        }),
        ...(uiError && {
          error: {
            code: typeof uiError === 'string' ? 'UNKNOWN_ERROR' : uiError.code || 'UNKNOWN_ERROR',
            message: typeof uiError === 'string' ? uiError : uiError.message,
            recoverable:
              typeof uiError === 'string'
                ? true
                : uiError.recoveryStrategy !== 'none' && uiError.recoveryStrategy !== undefined,
            action: 'retry' as const,
          },
        }),
        ...(activeSession &&
          activeSession.status === 'connected' && {
            address: activeSession.activeAccount.address,
            chainId: activeSession.chain.chainId,
            accounts: activeSession.accounts.map((acc) => acc.address),
          }),
      },
      wallets: Object.values(state.entities.wallets).map((wallet: WalletInfo) => ({
        wallet: {
          id: wallet.id,
          name: wallet.name,
          icon: wallet.icon || '', // Provide fallback for optional icon
        },
        status: {
          installed: state.meta.availableWalletIds?.includes(wallet.id) || false,
          available: true,
          recent: false,
          recommended: false,
        },
        capabilities: {
          chains: wallet.chains.map((chain: ChainType) => chain.toString()),
          features: [],
        },
      })),
      selectedWalletId: activeSession?.walletId || undefined,
    };
  }

  /**
   * Get headless modal actions
   * @returns {HeadlessModalActions} Available actions
   */
  getActions(): HeadlessModalActions {
    return {
      openModal: () => {
        uiActions.openModal(useStore);
      },
      closeModal: () => {
        uiActions.closeModal(useStore);
      },
      selectWallet: async (walletId: string) => {
        await this.connect(walletId);
      },
      connect: async () => {
        // Connect to selected wallet
        const state = useStore.getState();
        const activeSession = state.active.sessionId ? state.entities.sessions[state.active.sessionId] : null;
        if (activeSession) {
          await this.connect(activeSession.walletId);
        }
      },
      disconnect: async () => {
        await this.disconnect();
      },
      retry: async () => {
        const state = useStore.getState();
        const activeSession = state.active.sessionId ? state.entities.sessions[state.active.sessionId] : null;
        if (activeSession) {
          await this.connect(activeSession.walletId);
        }
      },
    };
  }

  /**
   * Open the modal
   * @param options - Optional parameters including targetChainType for filtering wallets
   * @returns {Promise<void>}
   */
  async open(options?: { targetChainType?: ChainType }): Promise<void> {
    try {
      if (this.logger) {
        this.logger.debug('Opening modal', { config: this.config, options });
      }

      // Run onBeforeOpen hook if provided
      if (this.config.onBeforeOpen) {
        const shouldOpen = await this.config.onBeforeOpen();
        if (!shouldOpen) {
          if (this.logger) {
            this.logger.debug('Modal open cancelled by onBeforeOpen hook');
          }
          return;
        }
      }

      uiActions.openModal(useStore, options?.targetChainType);

      // Run onAfterOpen hook if provided
      if (this.config.onAfterOpen) {
        await this.config.onAfterOpen();
      }

      if (this.logger) {
        this.logger.debug('Modal opened');
      }
    } catch (error) {
      const modalError = ErrorFactory.renderFailed(
        error instanceof Error ? error.message : 'Failed to open modal',
        'ModalController',
      );
      this.errorHandler.handleError(modalError, { operation: 'ModalController.open' });
      throw modalError;
    }
  }

  /**
   * Close the modal
   * @returns {Promise<void>}
   */
  async close(): Promise<void> {
    uiActions.closeModal(useStore);
    if (this.logger) {
      this.logger.debug('Modal closed');
    }
  }

  /**
   * Connect to a wallet
   * @param {string} walletId - Wallet identifier
   * @param {ConnectOptions} [options] - Connection options
   * @returns {Promise<ConnectionResult>} Connection result
   */
  async connect(walletId: string, options?: ConnectOptions): Promise<ConnectionResult> {
    try {
      if (this.logger) {
        this.logger.debug('Connecting to wallet', { walletId, options });
      }

      // Update UI to show connecting state
      uiActions.setView(useStore, 'connecting');

      // Get the client from modal
      const client = this.options.client;
      if (!client) {
        throw ErrorFactory.configurationError('Client not initialized');
      }

      // Connect and get the connection result directly
      const connectionResult = await client.connect(walletId);

      // Verify connection was successful
      if (!connectionResult || !connectionResult.address) {
        throw ErrorFactory.connectionFailed('Connection failed', { walletId });
      }

      // Update view to connected
      uiActions.setView(useStore, 'connected');

      // Auto-close modal if configured
      if (this.config.autoCloseDelay > 0) {
        setTimeout(() => {
          this.close();
        }, this.config.autoCloseDelay);
      }

      // Get wallet info from the store
      const state = useStore.getState();
      const walletInfo = state.entities.wallets[walletId];

      // Type-safe chain information extraction
      // Some mocks may have flat chainId while the interface expects nested chain
      interface ConnectionWithOptionalFlatChain extends WalletConnection {
        chainId?: string | number;
      }

      const connectionWithFlatChain = connectionResult as ConnectionWithOptionalFlatChain;
      const rawChainId = connectionWithFlatChain.chainId || connectionResult.chain?.chainId;
      const chainId = typeof rawChainId === 'number' ? rawChainId.toString() : rawChainId;
      const chainType = connectionResult.chainType || connectionResult.chain?.chainType;
      const chainName = connectionResult.chain?.name || 'Unknown Chain';

      if (this.logger) {
        this.logger.debug('Connection result:', {
          address: connectionResult.address,
          chainId: chainId,
          walletId: walletId,
        });
      }

      // Build the complete connection result
      // Transform WalletConnection to ConnectionResult format

      const result: ConnectionResult = {
        address: connectionResult.address,
        accounts: connectionResult.accounts,
        chain: {
          chainId: chainId,
          chainType: chainType,
          name: chainName,
          required: false,
        },
        provider: connectionResult.provider,
        walletId: walletId,
        walletInfo: walletInfo
          ? {
              id: walletInfo.id,
              name: walletInfo.name,
              icon: walletInfo.icon || '', // Provide fallback for optional icon
              chains: walletInfo.chains || [],
            }
          : {
              id: walletId,
              name: walletId,
              icon: '',
              chains: chainType ? [chainType] : [],
            },
      };

      return result;
    } catch (error) {
      if (this.logger) {
        this.logger.error('Connection failed', { walletId, error });
      }

      const modalError = isModalError(error)
        ? error
        : ErrorFactory.connectionFailed(error instanceof Error ? error.message : 'Connection failed', {
            walletId,
            error,
          });

      // Handle error through error handler
      if (this.errorHandler) {
        this.errorHandler.handleError(modalError, {
          operation: 'general',
          extra: {
            context: 'modal-controller',
          },
        });
      }

      if (options?.showError !== false) {
        uiActions.setError(useStore, 'ui', modalError);
        uiActions.setView(useStore, 'error');
      }

      throw error;
    }
  }

  /**
   * Disconnect from current wallet
   * @param {string} [walletId] - Optional wallet ID to disconnect
   * @returns {Promise<void>}
   */
  async disconnect(walletId?: string): Promise<void> {
    const state = useStore.getState();
    const activeSession = state.active.sessionId ? state.entities.sessions[state.active.sessionId] : null;
    const targetWalletId = walletId || activeSession?.walletId;

    if (!targetWalletId) {
      if (this.logger) {
        this.logger.debug('No wallet to disconnect');
      }
      return;
    }

    try {
      if (this.logger) {
        this.logger.debug('Disconnecting wallet', { walletId: targetWalletId });
      }

      // Get all sessions for this wallet and end them
      const walletSessions = Object.values(state.entities.sessions).filter(
        (s) => s.walletId === targetWalletId,
      );
      for (const session of walletSessions) {
        await connectionActions.endSession(useStore, session.sessionId);
      }

      // Reset view to wallet selection after disconnect
      uiActions.setView(useStore, 'walletSelection');

      if (this.logger) {
        this.logger.debug('Wallet disconnected successfully', { walletId: targetWalletId });
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error('Disconnection failed', { walletId: targetWalletId, error });
      }

      const modalError = isModalError(error)
        ? error
        : ErrorFactory.connectionFailed(error instanceof Error ? error.message : 'Disconnection failed', {
            walletId: targetWalletId,
            error,
          });
      uiActions.setError(useStore, 'ui', modalError);

      throw error;
    }
  }

  /**
   * Switch to a different chain
   * @param {string} chainId - Target chain ID
   * @returns {Promise<void>}
   */
  async switchChain(chainId: string): Promise<void> {
    const state = useStore.getState();
    const activeSession = state.active.sessionId ? state.entities.sessions[state.active.sessionId] : null;
    const activeWalletId = activeSession?.walletId;

    if (!activeWalletId) {
      throw ErrorFactory.connectionFailed('No active wallet', { chainId });
    }

    try {
      if (this.logger) {
        this.logger.debug('Switching chain', { walletId: activeWalletId, chainId });
      }

      if (!this.options.client) {
        throw ErrorFactory.configurationError('Client not initialized');
      }

      await this.options.client.switchChain(chainId, activeWalletId);

      if (this.logger) {
        this.logger.debug('Chain switched successfully', { walletId: activeWalletId, chainId });
      }
    } catch (error) {
      if (this.logger) {
        this.logger.error('Chain switch failed', { walletId: activeWalletId, chainId, error });
      }
      throw error;
    }
  }

  /**
   * Subscribe to state changes
   * @param {(state: HeadlessModalState) => void} callback - Callback function
   * @returns {() => void} Unsubscribe function
   */
  subscribe(callback: (state: HeadlessModalState) => void): () => void {
    return useStore.subscribe(() => {
      callback(this.getState());
    });
  }

  /**
   * Destroy the modal and clean up resources
   */
  destroy(): void {
    if (this.logger) {
      this.logger.debug('Destroying modal controller');
    }

    this.unmount();
  }

  /**
   * Select a wallet for connection
   * @param {string} walletId - ID of the wallet to select
   */
  selectWallet(walletId: string): void {
    // Set active wallet by finding existing session or creating one
    const existingSessions = connectionActions.getWalletSessions(useStore, walletId);
    if (existingSessions.length > 0 && existingSessions[0]) {
      connectionActions.switchToSession(useStore, existingSessions[0].sessionId);
    } else {
      // No existing session, start connecting
      this.connect(walletId).catch((error) => {
        if (this.logger) {
          this.logger.error('Failed to connect after wallet selection', error);
        }
      });
    }
  }

  /**
   * Reset the modal state
   */
  async reset(): Promise<void> {
    const state = useStore.getState();
    // Clear all sessions
    const allSessions = Object.values(state.entities.sessions);
    for (const session of allSessions) {
      await connectionActions.endSession(useStore, session.sessionId);
    }
    uiActions.setView(useStore, 'walletSelection');
  }

  /**
   * Set the current modal view
   * @param {ModalView} view - The view to display
   */
  setView(view: 'walletSelection' | 'connecting' | 'connected' | 'error'): void {
    // Map public view names to internal ModalView
    switch (view) {
      case 'walletSelection':
      case 'connecting':
      case 'connected':
      case 'error':
        uiActions.setView(useStore, view);
        break;
      default:
        uiActions.setView(useStore, 'walletSelection');
    }
  }

  /**
   * Navigate back to the previous view
   */
  goBack(): void {
    uiActions.setView(useStore, 'walletSelection');
  }

  /**
   * Get available wallets with their availability status
   * @returns {Promise<Array<WalletInfo & { isAvailable: boolean }>>}
   */
  async getAvailableWallets(): Promise<Array<WalletInfo & { isAvailable: boolean }>> {
    const state = useStore.getState();
    const allWallets = Object.values(state.entities.wallets);

    // All wallets are already combined in the simplified store
    const wallets = allWallets;

    // Check availability using the client if available
    const availabilityMap = new Map<string, boolean>();
    if (this.options.client && 'discoverWallets' in this.options.client) {
      try {
        const detectedWallets = await (
          this.options.client as InternalWalletMeshClient & { discoverWallets?: () => Promise<unknown[]> }
        ).discoverWallets?.();
        if (Array.isArray(detectedWallets)) {
          for (const detected of detectedWallets) {
            const walletId =
              (detected as { adapter?: { id?: string }; id?: string })?.adapter?.id ||
              (detected as { id?: string })?.id;
            if (walletId) {
              availabilityMap.set(walletId, (detected as { available?: boolean }).available ?? true);
            }
          }
        }
      } catch (error) {
        if (this.logger) {
          this.logger.debug('Failed to detect available wallets', error);
        }
      }
    }

    return wallets.map((wallet) => ({
      ...wallet,
      isAvailable: availabilityMap.get(wallet.id) ?? true,
    }));
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.unmount();
  }
}
