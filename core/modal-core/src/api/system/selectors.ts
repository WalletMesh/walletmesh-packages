/**
 * State selectors for deriving computed values from modal state
 *
 * These selectors provide a consistent way to derive values from the modal state
 * across all framework implementations.
 *
 * @module selectors
 * @packageDocumentation
 */

import type { ChainType, ModalState, WalletInfo } from '../../types.js';

/**
 * Connection state selectors
 */
export const connectionSelectors = {
  /**
   * Check if wallet is connected
   */
  isConnected: (state: ModalState): boolean => state.connection.state === 'connected',

  /**
   * Check if wallet is connecting
   */
  isConnecting: (state: ModalState): boolean => state.connection.state === 'connecting',

  /**
   * Check if wallet is disconnected
   */
  isDisconnected: (state: ModalState): boolean => state.connection.state === 'idle',

  /**
   * Get connected wallet info
   */
  getConnectedWallet: (state: ModalState, wallets: WalletInfo[]): WalletInfo | null => {
    const walletId = state.selectedWalletId;
    return walletId ? wallets.find((w) => w.id === walletId) || null : null;
  },
};

/**
 * UI state selectors
 */
export const uiSelectors = {
  /**
   * Check if modal is open
   */
  isModalOpen: (state: ModalState): boolean => state.isOpen,

  /**
   * Check if UI is loading
   */
  isLoading: (state: ModalState): boolean => state.connection.state === 'connecting',
};

/**
 * Error state selectors
 */
export const errorSelectors = {
  /**
   * Check if there's an error
   */
  hasError: (state: ModalState): boolean => !!state.connection.error,

  /**
   * Get error message
   */
  getErrorMessage: (state: ModalState): string | null => state.connection.error?.message || null,

  /**
   * Get full error object
   */
  getError: (state: ModalState): unknown => state.connection.error || null,
};

/**
 * Wallet selectors
 */
export const walletSelectors = {
  /**
   * Filter wallets by chain type
   */
  filterWalletsByChain: (wallets: WalletInfo[], chainType: ChainType): WalletInfo[] => {
    return wallets.filter((wallet) => wallet.chains?.includes(chainType));
  },
};

/**
 * Combined selectors for common use cases
 */
export const selectors = {
  ...connectionSelectors,
  ...uiSelectors,
  ...errorSelectors,
  ...walletSelectors,

  /**
   * Get complete modal state summary
   */
  getStateSummary: (state: ModalState) => ({
    isConnected: connectionSelectors.isConnected(state),
    isConnecting: connectionSelectors.isConnecting(state),
    isModalOpen: uiSelectors.isModalOpen(state),
    hasError: errorSelectors.hasError(state),
  }),
};

// Default export for convenience
export default selectors;
