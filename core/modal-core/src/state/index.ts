// Main exports for the unified state management
export {
  useStore,
  // Selectors for computed/derived state
  getActiveWallet,
  getActiveSession,
  getActiveTransaction,
  getSelectedWallet,
  getAllWallets,
  getAvailableWallets,
  getFilteredWallets,
  getSessionsByWallet,
  getAllSessions,
  getAllTransactions,
  getTransactionHistory,
  getAztecProvingState,
  getActiveAztecProvingEntries,
  hasActiveAztecProving,
  isWalletAvailable,
  getConnectionStatus,
  getConnectionTimestamp,
  isDiscovering,
  getError,
  isModalOpen,
  getCurrentView,
  canGoBack,
  // Store instance getter
  getStoreInstance,
  getWalletMeshStore,
} from './store.js';
export type { WalletMeshState, LoadingState, ModalView } from './store.js';
export {
  subscriptions,
  waitForState,
  waitForConnection,
  waitForModalClose,
  subscribeToConnectionChanges,
  subscribeToAllChanges,
} from './subscriptions.js';
export type * from './types.js';
