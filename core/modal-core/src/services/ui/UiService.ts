/**
 * UI service for WalletMesh
 *
 * Manages UI state and display logic for the modal.
 * Uses the unified store as the single source of truth for UI state.
 *
 * @module services/ui/UIService
 * @category Services
 */

import type { StoreApi } from 'zustand';
import { ConnectionStatus } from '../../api/types/connectionStatus.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import { uiActions } from '../../state/actions/ui.js';
import type { WalletMeshState } from '../../state/store.js';
import type { ModalView, WalletInfo } from '../../types.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';
import type { SessionInfo } from '../session/SessionService.js';
import { getChainName } from '../../utils/chainNameResolver.js';

/**
 * UI service dependencies
 */
export interface UIServiceDependencies extends BaseServiceDependencies {
  logger: Logger;
  store: StoreApi<WalletMeshState>;
}

/**
 * UI state interface
 */
export interface UIState {
  /** Whether modal is open */
  isModalOpen: boolean;
  /** Current modal view */
  currentView: 'wallet-selection' | 'connecting' | 'connected' | 'error' | 'account-details';
  /** Whether UI is loading */
  isLoading: boolean;
  /** Loading message */
  loadingMessage?: string | undefined;
  /** Error message */
  errorMessage?: string | undefined;
  /** Selected wallet for connection */
  selectedWallet?: WalletInfo | undefined;
  /** Connection progress percentage (0-100) */
  connectionProgress?: number | undefined;
}

/**
 * Connect button state
 */
export type ConnectButtonState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Connect button content
 */
export interface ConnectButtonContent {
  /** Main text to display on the button */
  text: string;
  /** Whether to show a status indicator (green dot, spinner, etc.) */
  showIndicator: boolean;
  /** Type of indicator to show */
  indicatorType: 'success' | 'loading' | 'none';
  /** Whether the button should be disabled */
  disabled: boolean;
  /** Additional display information (address, chain, etc.) */
  displayInfo?: {
    address?: string;
    chainName?: string;
    walletName?: string;
  };
}

/**
 * Connect button options
 */
export interface ConnectButtonOptions {
  /** Custom text for disconnected state */
  disconnectedText?: string;
  /** Custom text for connecting state */
  connectingText?: string;
  /** Custom text for connected state */
  connectedText?: string;
  /** Show wallet address when connected */
  showAddress?: boolean;
  /** Address format (short, medium, long, full) */
  addressFormat?: 'short' | 'medium' | 'long' | 'full';
  /** Show chain name when connected */
  showChain?: boolean;
  /** Show wallet name when connected */
  showWallet?: boolean;
}

/**
 * Simple connect button content
 */
export interface SimpleConnectButtonContent {
  /** Button text */
  text: string;
  /** Whether button is enabled */
  enabled: boolean;
}

/**
 * Simple connect button options
 */
export interface SimpleConnectButtonOptions {
  /** Custom text for disconnected state */
  disconnectedText?: string;
  /** Custom text for connecting state */
  connectingText?: string;
  /** Custom text for connected state */
  connectedText?: string;
  /** Custom text for error state */
  errorText?: string;
}

/**
 * UI connection info
 */
export interface UIConnectionInfo {
  /** Connection status */
  status: ConnectionStatus;
  /** Connected wallet info */
  wallet?: WalletInfo;
  /** Connected account address */
  account?: string;
  /** Connected chain ID */
  chainId?: string;
  /** Display-friendly chain name */
  chainName?: string;
  /** Formatted account address */
  displayAddress?: string;
}

/**
 * Connection display options
 */
export interface ConnectionDisplayOptions {
  /** Show chain information */
  showChain?: boolean;
  /** Address format */
  addressFormat?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * Connection flags for UI logic
 */
export interface ConnectionFlags {
  /** Whether wallet is connected */
  isConnected: boolean;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Whether there's an error */
  hasError: boolean;
  /** Whether reconnection is in progress */
  isReconnecting: boolean;
  /** Whether wallet is disconnecting */
  isDisconnecting: boolean;
}

/**
 * UI service configuration
 */
export interface UIServiceConfig {
  /** Default button options */
  defaultButtonOptions?: ConnectButtonOptions;
  /** Default display options */
  defaultDisplayOptions?: ConnectionDisplayOptions;
}

/**
 * UI service for managing UI state and display logic
 */
export class UIService {
  private logger: Logger;
  private store: StoreApi<WalletMeshState>;
  private config: UIServiceConfig;
  private loadingMessage: string | undefined;
  private connectionProgress: number | undefined;

  constructor(dependencies: UIServiceDependencies, config: UIServiceConfig = {}) {
    this.logger = dependencies.logger;
    this.store = dependencies.store;
    this.config = {
      defaultButtonOptions: {
        showAddress: true,
        addressFormat: 'short',
        showChain: false,
        showWallet: false,
      },
      defaultDisplayOptions: {
        showChain: true,
        addressFormat: 'short',
      },
      ...config,
    };
  }

  /**
   * Get current UI state from store
   */
  getUIState(): UIState {
    const state = this.store.getState();
    const selectedWallet = state.active.selectedWalletId
      ? state.entities.wallets[state.active.selectedWalletId]
      : undefined;

    // Map store view to UIState view
    const currentView = this.mapStoreViewToUIView(state.ui.currentView);

    return {
      isModalOpen: state.ui.modalOpen,
      currentView,
      isLoading: state.ui.loading.modal || false,
      loadingMessage: this.loadingMessage,
      errorMessage: state.ui.errors['ui']?.message,
      selectedWallet,
      connectionProgress: this.connectionProgress,
    };
  }

  /**
   * Map store ModalView to UIState currentView
   */
  private mapStoreViewToUIView(view: ModalView): UIState['currentView'] {
    switch (view) {
      case 'walletSelection':
        return 'wallet-selection';
      case 'connecting':
        return 'connecting';
      case 'connected':
        return 'connected';
      case 'error':
        return 'error';
      default:
        return 'wallet-selection';
    }
  }

  /**
   * Map UIState view to store ModalView
   */
  private mapUIViewToStoreView(view: UIState['currentView']): ModalView {
    switch (view) {
      case 'wallet-selection':
        return 'walletSelection';
      case 'connecting':
        return 'connecting';
      case 'connected':
        return 'connected';
      case 'error':
        return 'error';
      case 'account-details':
        // Map account-details to connected view since accountDetails is not a valid ModalView
        return 'connected';
      default:
        return 'walletSelection';
    }
  }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean, message?: string): void {
    uiActions.setLoading(this.store, 'modal', isLoading);
    if (message !== undefined) {
      this.loadingMessage = message;
    }
    this.logger.debug('UI loading state changed', { isLoading, message });
  }

  /**
   * Navigate to a view
   */
  navigateToView(view: UIState['currentView']): void {
    const storeView = this.mapUIViewToStoreView(view);
    uiActions.setView(this.store, storeView);
    this.logger.debug('Navigated to view', { view });
  }

  /**
   * Set selected wallet
   */
  setSelectedWallet(wallet: WalletInfo | undefined): void {
    const currentState = this.store.getState();
    const updates: Partial<WalletMeshState> = wallet
      ? {
          entities: {
            ...currentState.entities,
            wallets: {
              ...currentState.entities.wallets,
              [wallet.id]: wallet,
            },
          },
          active: {
            ...currentState.active,
            selectedWalletId: wallet.id,
          },
        }
      : {
          active: {
            ...currentState.active,
            selectedWalletId: null,
          },
        };
    this.store.setState(updates);
    this.logger.debug('Selected wallet changed', { wallet: wallet?.id });
  }

  /**
   * Set error message
   */
  setError(error: string | undefined): void {
    if (error) {
      uiActions.setError(this.store, 'ui', {
        code: 'UI_ERROR',
        message: error,
        category: 'general',
        recoveryStrategy: 'retry',
      });
      this.logger.warn('UI error set', { error });
    } else {
      uiActions.clearError(this.store, 'ui');
    }
  }

  /**
   * Set connection progress
   */
  setConnectionProgress(progress: number): void {
    this.connectionProgress = Math.min(100, Math.max(0, progress));
    this.logger.debug('Connection progress updated', { progress: this.connectionProgress });
  }

  /**
   * Open modal
   */
  openModal(): void {
    uiActions.openModal(this.store);
    this.logger.debug('Modal opened');
  }

  /**
   * Close modal
   */
  closeModal(): void {
    uiActions.closeModal(this.store);
    this.logger.debug('Modal closed');
  }

  /**
   * Reset UI state
   */
  reset(): void {
    uiActions.closeModal(this.store);
    this.loadingMessage = undefined;
    this.connectionProgress = undefined;
    this.logger.debug('UI state reset');
  }

  /**
   * Get connect button content based on current state
   */
  getConnectButtonContent(
    state: ConnectButtonState,
    session?: SessionInfo,
    options: ConnectButtonOptions = {},
  ): ConnectButtonContent {
    const mergedOptions = { ...this.config.defaultButtonOptions, ...options };

    let text = '';
    let showIndicator = false;
    let indicatorType: 'success' | 'loading' | 'none' = 'none';
    let disabled = false;
    let displayInfo: ConnectButtonContent['displayInfo'];

    switch (state) {
      case 'disconnected':
        text = mergedOptions.disconnectedText || 'Connect Wallet';
        showIndicator = false;
        indicatorType = 'none';
        disabled = false;
        break;

      case 'connecting':
        text = mergedOptions.connectingText || 'Connecting...';
        showIndicator = true;
        indicatorType = 'loading';
        disabled = true;
        break;

      case 'connected': {
        text = mergedOptions.connectedText || 'Connected';
        showIndicator = true;
        indicatorType = 'success';
        disabled = false;

        const chainName =
          mergedOptions.showChain && session?.chainId !== undefined
            ? getChainName(session.chainId)
            : undefined;

        displayInfo = {
          ...(session?.account !== undefined && { address: session.account }),
          ...(chainName !== undefined && { chainName }),
          ...(mergedOptions.showWallet &&
            session?.metadata?.custom &&
            typeof session.metadata.custom === 'object' &&
            'walletName' in session.metadata.custom && {
              walletName: session.metadata.custom['walletName'] as string,
            }),
        };
        break;
      }

      case 'error':
        text = 'Error';
        showIndicator = false;
        indicatorType = 'none';
        disabled = false;
        break;
    }

    return {
      text,
      showIndicator,
      indicatorType,
      disabled,
      ...(displayInfo !== undefined && { displayInfo }),
    };
  }

  /**
   * Get simple connect button content
   */
  getSimpleButtonContent(
    status: ConnectionStatus,
    options: SimpleConnectButtonOptions = {},
  ): SimpleConnectButtonContent {
    let text = '';
    let enabled = true;

    switch (status) {
      case ConnectionStatus.Disconnected:
        text = options.disconnectedText || 'Connect Wallet';
        enabled = true;
        break;

      case ConnectionStatus.Connecting:
        text = options.connectingText || 'Connecting...';
        enabled = false;
        break;

      case ConnectionStatus.Connected:
        text = options.connectedText || 'Connected';
        enabled = true;
        break;

      case ConnectionStatus.Error:
        text = options.errorText || 'Connection Error';
        enabled = true;
        break;

      case ConnectionStatus.Reconnecting:
        text = 'Reconnecting...';
        enabled = false;
        break;

      default:
        text = 'Connect Wallet';
        enabled = true;
    }

    return { text, enabled };
  }

  /**
   * Get connection info for UI display
   */
  getConnectionInfo(session?: SessionInfo, options: ConnectionDisplayOptions = {}): UIConnectionInfo {
    if (!session) {
      return {
        status: ConnectionStatus.Disconnected,
      };
    }

    const mergedOptions = { ...this.config.defaultDisplayOptions, ...options };

    const result: UIConnectionInfo = {
      status: session.status,
    };

    // Only add optional properties if they have values
    const wallet =
      session.metadata && 'wallet' in session.metadata ? (session.metadata.wallet as WalletInfo) : undefined;
    if (wallet !== undefined) {
      result.wallet = wallet;
    }

    if (session.account !== undefined) {
      result.account = session.account;
    }

    if (session.chainId !== undefined) {
      result.chainId = session.chainId;
    }

    if (mergedOptions.showChain && session.chainId !== undefined) {
      const chainName = getChainName(session.chainId);
      if (chainName !== undefined) {
        result.chainName = chainName;
      }
    }

    if (session.account !== undefined) {
      result.displayAddress = this.formatAddress(session.account, mergedOptions.addressFormat);
    }

    return result;
  }

  /**
   * Get connection flags for UI logic
   */
  getConnectionFlags(status: ConnectionStatus): ConnectionFlags {
    return {
      isConnected: status === ConnectionStatus.Connected,
      isConnecting: status === ConnectionStatus.Connecting,
      hasError: status === ConnectionStatus.Error,
      isReconnecting: status === ConnectionStatus.Reconnecting,
      isDisconnecting: false, // ConnectionStatus doesn't have a Disconnecting state
    };
  }

  /**
   * Format address for display
   */
  private formatAddress(
    address: string,
    format: ConnectionDisplayOptions['addressFormat'] = 'short',
  ): string {
    if (!address) return '';

    switch (format) {
      case 'short':
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      case 'medium':
        return `${address.slice(0, 10)}...${address.slice(-8)}`;
      case 'long':
        return `${address.slice(0, 14)}...${address.slice(-12)}`;
      default:
        return address;
    }
  }

  // Note: getChainName() has been consolidated to src/utils/chainNameResolver.ts
}
