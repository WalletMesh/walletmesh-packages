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
  isWalletAvailable,
  getConnectionStatus,
  getConnectionTimestamp,
  isDiscovering,
  getError,
  isModalOpen,
  getCurrentView,
  canGoBack,
  // Background transaction selectors
  getBackgroundTransactions,
  getBackgroundTransactionCount,
  isBackgroundTransaction,
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

// Aztec transaction lifecycle types
export type {
  TransactionMode,
  StageTiming,
  TransactionStages,
  AztecTransactionResult,
  TransactionCallbacks,
  BackgroundTransactionsState,
} from './types/aztecTransactions.js';
export { getStageDuration, getTotalDuration, isFinalStatus, isActiveStatus } from './types/aztecTransactions.js';
