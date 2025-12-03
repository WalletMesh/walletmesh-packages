/**
 * Store and state management exports for WalletMesh
 *
 * Provides access to the normalized Zustand store and its selectors
 * for efficient state subscriptions and re-render optimization.
 *
 * @module api/system/store
 * @packageDocumentation
 */

// Import WalletMeshState for type usage in this file
import type { WalletMeshState } from '../../state/store.js';

// Export the store instance and type
export {
  useStore,
  getStoreInstance,
  getWalletMeshStore,
  type WalletMeshState,
  type LoadingState,
  type ModalView,
  type StoreApi,
} from '../../state/store.js';

// Export all selectors for computed/derived state
export {
  // Entity selectors
  getActiveWallet,
  getActiveSession,
  getActiveTransaction,
  getSelectedWallet,
  getAllWallets,
  getAvailableWallets,
  getFilteredWallets,
  // Session selectors
  getSessionsByWallet,
  getAllSessions,
  // Transaction selectors
  getAllTransactions,
  getTransactionHistory,
  // Utility selectors
  isWalletAvailable,
  getConnectionStatus,
  getConnectionTimestamp,
  isDiscovering,
  getError,
  isModalOpen,
  getCurrentView,
  canGoBack,
} from '../../state/store.js';

// Export action functions for state manipulation
export {
  // UI actions
  openModal,
  closeModal,
  setCurrentView,
  pushViewHistory,
  popViewHistory,
  setLoading,
  setError,
  clearError,
  setTargetChainType,
  setSwitchingChainData,
  setWalletFilter,
  // Entity actions
  addWallet,
  updateWallet,
  removeWallet,
  addSession,
  updateSession,
  removeSession,
  addTransaction,
  updateTransaction,
  removeTransaction,
  // Active reference actions
  setActiveWallet,
  setActiveSession,
  setActiveTransaction,
  setSelectedWallet,
  // Meta actions
  setLastDiscoveryTime,
  setConnectionTimestamp,
  setAvailableWalletIds,
  addDiscoveryError,
  clearDiscoveryErrors,
  setTransactionStatus,
} from '../../state/actions.js';

// Export helper types for React integration
export type StateSelector<T> = (state: WalletMeshState) => T;
export type StateSubscriber = (callback: () => void) => () => void;

/**
 * Helper function to create memoized selectors
 * @param selector - The selector function
 * @returns A memoized version of the selector
 */
export function createSelector<T>(selector: StateSelector<T>): StateSelector<T> {
  let lastState: WalletMeshState | undefined;
  let lastResult: T;

  return (state: WalletMeshState) => {
    if (state !== lastState) {
      lastResult = selector(state);
      lastState = state;
    }
    return lastResult;
  };
}

/**
 * Helper to compose multiple selectors
 * @param selectors - Array of selectors to compose
 * @returns A composed selector that returns an array of results
 */
export function composeSelectors<T extends readonly StateSelector<unknown>[]>(
  ...selectors: T
): StateSelector<{ [K in keyof T]: T[K] extends StateSelector<infer R> ? R : never }> {
  return (state: WalletMeshState) => {
    return selectors.map((selector) => selector(state)) as {
      [K in keyof T]: T[K] extends StateSelector<infer R> ? R : never;
    };
  };
}
