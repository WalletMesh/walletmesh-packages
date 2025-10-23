/**
 * Unified State store for WalletMesh
 *
 * Store architecture:
 * - Normalized entity storage (wallets, sessions, transactions)
 * - Minimal UI state (non-derived data only)
 * - Active entity references (just IDs)
 * - Metadata for timestamps and other info
 * - Computed/derived state via selectors
 */

import { enableMapSet, setAutoFreeze } from 'immer';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { SessionState } from '../api/types/sessionState.js';
import type { ModalError } from '../internal/core/errors/types.js';
import type { TransactionResult, TransactionStatus } from '../services/transaction/types.js';
import type { ChainType, ModalView } from '../types.js';
import type { WalletInfo } from '../types.js';

// Enable MapSet plugin for Immer (still needed for SessionState internals)
enableMapSet();

// Disable auto-freezing in test environment
if (typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test') {
  setAutoFreeze(false);
}

// ============================================================================
// STATE TYPES
// ============================================================================

/**
 * Loading state type for granular loading tracking
 */
export interface LoadingState {
  isLoading?: boolean;
  message?: string;
  operations?: Record<string, boolean>;
  modal?: boolean;
  connection?: boolean;
  discovery?: boolean;
  transaction?: boolean;
}

/**
 * Normalized WalletMesh state structure
 *
 * State is normalized with:
 * - entities: Normalized data storage
 * - ui: Minimal UI state (non-derived)
 * - active: Active entity references (IDs only)
 * - meta: Metadata and timestamps
 */
export interface WalletMeshState {
  // Normalized entity storage
  entities: {
    // Wallet entities indexed by ID
    wallets: Record<string, WalletInfo>;
    // Session entities indexed by session ID
    sessions: Record<string, SessionState>;
    // Transaction entities indexed by transaction ID
    transactions: Record<string, TransactionResult>;
  };

  // Minimal UI state (non-derived data only)
  ui: {
    // Modal visibility
    modalOpen: boolean;
    // Current view in the modal
    currentView: ModalView;
    // Navigation history for back functionality
    viewHistory: ModalView[];
    // Granular loading states
    loading: LoadingState;
    // Errors indexed by context (e.g., 'connection', 'discovery', 'transaction')
    errors: Record<string, ModalError>;
    // Target chain type for filtering
    targetChainType?: ChainType;
    // Chain switching UI data
    switchingChainData?: {
      fromChain?: { chainId: string; name?: string };
      toChain?: { chainId: string; name?: string };
    };
    // Wallet filter function (not serializable, won't be persisted)
    walletFilter?: (wallet: WalletInfo) => boolean;
  };

  // Active entity references (just IDs)
  active: {
    // Currently active wallet ID
    walletId: string | null;
    // Currently active session ID
    sessionId: string | null;
    // Currently active transaction ID
    transactionId: string | null;
    // Currently selected wallet for connection (before session created)
    selectedWalletId: string | null;
  };

  // Metadata and timestamps
  meta: {
    // Last discovery scan timestamp
    lastDiscoveryTime: number | null;
    // Connection timestamps indexed by wallet ID
    connectionTimestamps: Record<string, number>;
    // Available wallet IDs (for quick lookup)
    availableWalletIds: string[];
    // Discovery error messages
    discoveryErrors: string[];
    // Transaction status
    transactionStatus: TransactionStatus;
    // Background transaction IDs (async mode transactions)
    backgroundTransactionIds: string[];
  };
}

// ============================================================================
// SELECTORS FOR COMPUTED/DERIVED STATE
// ============================================================================

/**
 * Get active wallet from normalized state
 */
export const getActiveWallet = (state: WalletMeshState): WalletInfo | null => {
  const walletId = state.active.walletId;
  return walletId ? state.entities.wallets[walletId] || null : null;
};

/**
 * Get active session from normalized state
 */
export const getActiveSession = (state: WalletMeshState): SessionState | null => {
  const sessionId = state.active.sessionId;
  return sessionId ? state.entities.sessions[sessionId] || null : null;
};

/**
 * Get active transaction from normalized state
 */
export const getActiveTransaction = (state: WalletMeshState): TransactionResult | null => {
  const transactionId = state.active.transactionId;
  return transactionId ? state.entities.transactions[transactionId] || null : null;
};

/**
 * Get selected wallet (before connection)
 */
export const getSelectedWallet = (state: WalletMeshState): WalletInfo | null => {
  const walletId = state.active.selectedWalletId;
  return walletId ? state.entities.wallets[walletId] || null : null;
};

/**
 * Get all wallets as array
 */
export const getAllWallets = (state: WalletMeshState): WalletInfo[] => Object.values(state.entities.wallets);

/**
 * Get available wallets
 */
export const getAvailableWallets = (state: WalletMeshState): WalletInfo[] => {
  return state.meta.availableWalletIds
    .map((id) => state.entities.wallets[id])
    .filter(Boolean) as WalletInfo[];
};

/**
 * Get filtered wallets based on current filter
 */
export const getFilteredWallets = (state: WalletMeshState): WalletInfo[] => {
  const wallets = getAvailableWallets(state);

  if (!state.ui.walletFilter) {
    return wallets;
  }

  return wallets.filter(state.ui.walletFilter);
};

/**
 * Get sessions for a specific wallet
 */
export const getSessionsByWallet = (state: WalletMeshState, walletId: string): SessionState[] =>
  Object.values(state.entities.sessions).filter((s) => s.walletId === walletId);

/**
 * Get all sessions as array
 */
export const getAllSessions = (state: WalletMeshState): SessionState[] =>
  Object.values(state.entities.sessions);

/**
 * Get all transactions as array
 */
export const getAllTransactions = (state: WalletMeshState): TransactionResult[] =>
  Object.values(state.entities.transactions);

/**
 * Get transaction history (sorted by timestamp, newest first)
 */
export const getTransactionHistory = (state: WalletMeshState): TransactionResult[] => {
  return getAllTransactions(state).sort((a, b) => {
    const timeA = a.startTime || 0;
    const timeB = b.startTime || 0;
    return timeB - timeA;
  });
};

/**
 * Check if wallet is available
 */
export const isWalletAvailable = (state: WalletMeshState, walletId: string): boolean =>
  state.meta.availableWalletIds.includes(walletId);

/**
 * Get connection status for UI
 */
export const getConnectionStatus = (state: WalletMeshState): 'connected' | 'connecting' | 'disconnected' => {
  if (state.ui.loading.connection) return 'connecting';
  const activeSession = getActiveSession(state);
  if (activeSession?.status === 'connected') return 'connected';
  return 'disconnected';
};

/**
 * Get connection timestamp for a wallet
 */
export const getConnectionTimestamp = (state: WalletMeshState, walletId: string): number | null =>
  state.meta.connectionTimestamps[walletId] || null;

/**
 * Check if discovery is in progress
 */
export const isDiscovering = (state: WalletMeshState): boolean => state.ui.loading.discovery || false;

/**
 * Get error by context
 */
export const getError = (state: WalletMeshState, context: string): ModalError | undefined =>
  state.ui.errors[context];

/**
 * Check if modal is open
 */
export const isModalOpen = (state: WalletMeshState): boolean => state.ui.modalOpen;

/**
 * Get current modal view
 */
export const getCurrentView = (state: WalletMeshState): ModalView => state.ui.currentView;

/**
 * Can navigate back in modal
 */
export const canGoBack = (state: WalletMeshState): boolean => state.ui.viewHistory.length > 0;

/**
 * Get all background transactions
 */
export const getBackgroundTransactions = (state: WalletMeshState): TransactionResult[] => {
  return state.meta.backgroundTransactionIds
    .map((id) => state.entities.transactions[id])
    .filter(Boolean) as TransactionResult[];
};

/**
 * Get count of active background transactions
 */
export const getBackgroundTransactionCount = (state: WalletMeshState): number => {
  return getBackgroundTransactions(state).filter((tx) => tx.status !== 'confirmed' && tx.status !== 'failed')
    .length;
};

/**
 * Check if a transaction is running in background mode
 */
export const isBackgroundTransaction = (state: WalletMeshState, txId: string): boolean => {
  return state.meta.backgroundTransactionIds.includes(txId);
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const createInitialState = (): WalletMeshState => ({
  entities: {
    wallets: {},
    sessions: {},
    transactions: {},
  },
  ui: {
    modalOpen: false,
    currentView: 'walletSelection',
    viewHistory: [],
    loading: {
      discovery: false,
      connection: false,
      transaction: false,
      modal: false,
    },
    errors: {},
    // targetChainType and switchingChainData are optional
  },
  active: {
    walletId: null,
    sessionId: null,
    transactionId: null,
    selectedWalletId: null,
  },
  meta: {
    lastDiscoveryTime: null,
    connectionTimestamps: {},
    availableWalletIds: [],
    discoveryErrors: [],
    transactionStatus: 'idle',
    backgroundTransactionIds: [],
  },
});

// ============================================================================
// UNIFIED STORE CREATION
// ============================================================================

/**
 * Create the unified Zustand store
 *
 * Uses normalized state with selectors for computed values.
 * All mutations happen via external action functions.
 */
export const useStore = create<WalletMeshState>()(
  devtools(
    persist(immer(createInitialState), {
      name: 'walletmesh-store',
      storage: createJSONStorage(() => localStorage, {
        reviver: (_, value) => value,
        replacer: (_, value) => {
          // Exclude non-serializable values during JSON.stringify
          if (typeof value === 'function') {
            return undefined;
          }
          // Exclude circular references and other problematic objects
          if (value && typeof value === 'object') {
            try {
              JSON.stringify(value);
            } catch (error) {
              // Skip objects that can't be serialized
              return undefined;
            }
          }
          return value;
        },
      }),
      version: 2,
      partialize: (state) => ({
        // Only persist specific parts of state
        entities: {
          sessions: state.entities.sessions,
          // Don't persist wallets or transactions
        },
        active: {
          sessionId: state.active.sessionId,
          // Don't persist other active references
        },
        ui: {
          targetChainType: state.ui.targetChainType,
          // Don't persist modal state, errors, loading states, or walletFilter function
        },
        meta: {
          connectionTimestamps: state.meta.connectionTimestamps,
          // Don't persist discovery info or transaction status
        },
      }),
      // Merge persisted state with initial state to ensure all properties exist
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<WalletMeshState>;
        const merged: WalletMeshState = {
          ...currentState,
          entities: {
            ...currentState.entities,
            sessions: persisted?.entities?.sessions || currentState.entities.sessions,
          },
          active: {
            ...currentState.active,
            sessionId: persisted?.active?.sessionId || currentState.active.sessionId,
          },
          ui: {
            ...currentState.ui,
            ...(persisted?.ui?.targetChainType && { targetChainType: persisted.ui.targetChainType }),
          },
          meta: {
            ...currentState.meta,
            connectionTimestamps:
              persisted?.meta?.connectionTimestamps || currentState.meta.connectionTimestamps,
          },
        };
        return merged;
      },
    }),
    { name: 'WalletMeshStore' },
  ),
);

// ============================================================================
// STORE INSTANCE FOR EXTERNAL ACCESS
// ============================================================================

/**
 * Get the store instance for external access
 * Useful for calling actions outside of React components
 */
export const getStoreInstance = () => useStore;

/**
 * Get the WalletMesh store instance
 * Alias for getStoreInstance for compatibility
 */
export const getWalletMeshStore = () => useStore;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { ModalView };
export type StoreApi = typeof useStore;
