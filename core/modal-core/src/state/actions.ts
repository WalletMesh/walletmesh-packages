/**
 * State actions for WalletMesh store
 *
 * These actions provide controlled mutations to the normalized state.
 * They are designed to work with the Zustand store's immer middleware.
 *
 * @module state/actions
 */

import type { Draft } from 'immer';
import type { SessionState } from '../api/types/sessionState.js';
import type { ModalError } from '../internal/core/errors/types.js';
import type { TransactionResult, TransactionStatus } from '../services/transaction/types.js';
import type { WalletInfo } from '../types.js';
import type { ChainType } from '../types.js';
import type { ModalView, WalletMeshState } from './store.js';

/**
 * UI State Actions
 */

export const openModal = (state: Draft<WalletMeshState>) => {
  state.ui.modalOpen = true;
};

export const closeModal = (state: Draft<WalletMeshState>) => {
  state.ui.modalOpen = false;
  state.ui.viewHistory = [];
};

export const setCurrentView = (state: Draft<WalletMeshState>, view: ModalView) => {
  state.ui.currentView = view;
};

export const pushViewHistory = (state: Draft<WalletMeshState>, view: ModalView) => {
  state.ui.viewHistory.push(view);
};

export const popViewHistory = (state: Draft<WalletMeshState>): ModalView | undefined => {
  return state.ui.viewHistory.pop();
};

export const setLoading = (
  state: Draft<WalletMeshState>,
  loadingType: keyof WalletMeshState['ui']['loading'],
  isLoading: boolean,
) => {
  // Type-safe assignment for optional properties
  if (loadingType === 'modal') {
    state.ui.loading.modal = isLoading;
  } else if (loadingType === 'connection') {
    state.ui.loading.connection = isLoading;
  } else if (loadingType === 'discovery') {
    state.ui.loading.discovery = isLoading;
  } else if (loadingType === 'transaction') {
    state.ui.loading.transaction = isLoading;
  }
};

export const setError = (state: Draft<WalletMeshState>, context: string, error: ModalError) => {
  state.ui.errors[context] = error;
};

export const clearError = (state: Draft<WalletMeshState>, context: string) => {
  delete state.ui.errors[context];
};

export const setTargetChainType = (state: Draft<WalletMeshState>, chainType?: ChainType) => {
  if (chainType !== undefined) {
    state.ui.targetChainType = chainType;
  } else {
    // Use spread operator to conditionally omit the property
    const { targetChainType, ...restUi } = state.ui;
    state.ui = restUi as Draft<WalletMeshState>['ui'];
  }
};

export const setSwitchingChainData = (
  state: Draft<WalletMeshState>,
  data?: { fromChain?: { chainId: string; name?: string }; toChain?: { chainId: string; name?: string } },
) => {
  if (data !== undefined) {
    state.ui.switchingChainData = data;
  } else {
    // Use spread operator to conditionally omit the property
    const { switchingChainData, ...restUi } = state.ui;
    state.ui = restUi as Draft<WalletMeshState>['ui'];
  }
};

export const setWalletFilter = (state: Draft<WalletMeshState>, filter?: (wallet: WalletInfo) => boolean) => {
  if (filter !== undefined) {
    state.ui.walletFilter = filter;
  } else {
    // Use spread operator to conditionally omit the property
    const { walletFilter, ...restUi } = state.ui;
    state.ui = restUi as Draft<WalletMeshState>['ui'];
  }
};

/**
 * Entity Actions
 */

export const addWallet = (state: Draft<WalletMeshState>, wallet: WalletInfo) => {
  state.entities.wallets[wallet.id] = wallet;
};

export const updateWallet = (
  state: Draft<WalletMeshState>,
  walletId: string,
  updates: Partial<WalletInfo>,
) => {
  if (state.entities.wallets[walletId]) {
    Object.assign(state.entities.wallets[walletId], updates);
  }
};

export const removeWallet = (state: Draft<WalletMeshState>, walletId: string) => {
  delete state.entities.wallets[walletId];

  // Clean up references
  if (state.active.walletId === walletId) {
    state.active.walletId = null;
  }
  if (state.active.selectedWalletId === walletId) {
    state.active.selectedWalletId = null;
  }

  // Remove from available wallets
  const index = state.meta.availableWalletIds.indexOf(walletId);
  if (index > -1) {
    state.meta.availableWalletIds.splice(index, 1);
  }
};

export const addSession = (state: Draft<WalletMeshState>, session: SessionState) => {
  state.entities.sessions[session.sessionId] = session;
};

export const updateSession = (
  state: Draft<WalletMeshState>,
  sessionId: string,
  updates: Partial<SessionState>,
) => {
  if (state.entities.sessions[sessionId]) {
    Object.assign(state.entities.sessions[sessionId], updates);
  }
};

export const removeSession = (state: Draft<WalletMeshState>, sessionId: string) => {
  delete state.entities.sessions[sessionId];

  // Clean up references
  if (state.active.sessionId === sessionId) {
    state.active.sessionId = null;
  }
};

export const addTransaction = (state: Draft<WalletMeshState>, transaction: TransactionResult) => {
  const txId = transaction.txStatusId || transaction.txHash || String(Date.now());
  state.entities.transactions[txId] = transaction;
};

export const updateTransaction = (
  state: Draft<WalletMeshState>,
  transactionId: string,
  updates: Partial<TransactionResult>,
) => {
  if (state.entities.transactions[transactionId]) {
    Object.assign(state.entities.transactions[transactionId], updates);
  }
};

export const removeTransaction = (state: Draft<WalletMeshState>, transactionId: string) => {
  delete state.entities.transactions[transactionId];

  // Clean up references
  if (state.active.transactionId === transactionId) {
    state.active.transactionId = null;
  }
};

/**
 * Active Reference Actions
 */

export const setActiveWallet = (state: Draft<WalletMeshState>, walletId: string | null) => {
  state.active.walletId = walletId;
};

export const setActiveSession = (state: Draft<WalletMeshState>, sessionId: string | null) => {
  state.active.sessionId = sessionId;
};

export const setActiveTransaction = (state: Draft<WalletMeshState>, transactionId: string | null) => {
  state.active.transactionId = transactionId;
};

export const setSelectedWallet = (state: Draft<WalletMeshState>, walletId: string | null) => {
  state.active.selectedWalletId = walletId;
};

/**
 * Metadata Actions
 */

export const setLastDiscoveryTime = (state: Draft<WalletMeshState>, timestamp: number | null) => {
  state.meta.lastDiscoveryTime = timestamp;
};

export const setConnectionTimestamp = (
  state: Draft<WalletMeshState>,
  walletId: string,
  timestamp: number,
) => {
  state.meta.connectionTimestamps[walletId] = timestamp;
};

export const setAvailableWalletIds = (state: Draft<WalletMeshState>, walletIds: string[]) => {
  state.meta.availableWalletIds = walletIds;
};

export const addDiscoveryError = (state: Draft<WalletMeshState>, error: string) => {
  state.meta.discoveryErrors.push(error);
};

export const clearDiscoveryErrors = (state: Draft<WalletMeshState>) => {
  state.meta.discoveryErrors = [];
};

export const setTransactionStatus = (state: Draft<WalletMeshState>, status: TransactionStatus) => {
  state.meta.transactionStatus = status;
};

/**
 * Batch Actions for Complex Operations
 */

export const connectWallet = (
  state: Draft<WalletMeshState>,
  walletId: string,
  sessionId: string,
  session: SessionState,
) => {
  // Add session
  addSession(state, session);

  // Set active references
  setActiveWallet(state, walletId);
  setActiveSession(state, sessionId);

  // Update metadata
  setConnectionTimestamp(state, walletId, Date.now());

  // Clear any connection errors
  clearError(state, 'connection');

  // Update UI state
  setLoading(state, 'connection', false);
  setCurrentView(state, 'connected');
};

export const disconnectWallet = (state: Draft<WalletMeshState>, sessionId: string) => {
  // Get the session to find wallet ID
  const session = state.entities.sessions[sessionId];

  if (session) {
    // Remove session
    removeSession(state, sessionId);

    // Clear active references if this was the active session
    if (state.active.sessionId === sessionId) {
      setActiveWallet(state, null);
      setActiveSession(state, null);
    }

    // Update UI state
    setCurrentView(state, 'walletSelection');
  }
};

export const resetState = (state: Draft<WalletMeshState>) => {
  // Clear all entities
  state.entities.wallets = {};
  state.entities.sessions = {};
  state.entities.transactions = {};

  // Reset UI state
  state.ui.modalOpen = false;
  state.ui.currentView = 'walletSelection';
  state.ui.viewHistory = [];
  state.ui.loading = {
    discovery: false,
    connection: false,
    transaction: false,
    modal: false,
  };
  state.ui.errors = {};
  // Use spread operator to omit optional properties
  const { targetChainType, switchingChainData, walletFilter, ...restUi } = state.ui;
  state.ui = { ...restUi } as Draft<WalletMeshState>['ui'];

  // Clear active references
  state.active.walletId = null;
  state.active.sessionId = null;
  state.active.transactionId = null;
  state.active.selectedWalletId = null;

  // Reset metadata
  state.meta.lastDiscoveryTime = null;
  state.meta.connectionTimestamps = {};
  state.meta.availableWalletIds = [];
  state.meta.discoveryErrors = [];
  state.meta.transactionStatus = 'idle';
};
