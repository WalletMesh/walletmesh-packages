/**
 * UI actions for unified WalletMesh store
 *
 * External action functions that operate on the normalized store state.
 */

import type { StoreApi } from 'zustand';
import type { ModalError } from '../../internal/core/errors/types.js';
import {
  booleanSchema,
  discoveryErrorSchema,
  modalViewSchema,
  optionalChainTypeSchema,
  uiErrorSchema,
} from '../../schemas/actions.js';
import type { ChainType, WalletInfo } from '../../types.js';
import { parseWithErrorFactory } from '../../utils/zodHelpers.js';
import type { LoadingState, ModalView, WalletMeshState } from '../store.js';
import { getAvailableWallets } from '../store.js';

/**
 * Helper to properly handle immer state mutations
 * When using immer middleware, the state is a draft that can be mutated directly
 */
const mutateState = (store: StoreApi<WalletMeshState>, updater: (state: WalletMeshState) => void) => {
  // Cast to the expected immer type where the updater returns void
  (store.setState as (updater: (state: WalletMeshState) => void) => void)(updater);
};

/**
 * UI action functions
 */
export const uiActions = {
  /**
   * Open the wallet connection modal
   */
  openModal: (store: StoreApi<WalletMeshState>, targetChainType?: ChainType) => {
    // Validate chain type if provided
    if (targetChainType !== undefined) {
      parseWithErrorFactory(optionalChainTypeSchema, targetChainType, 'Invalid chain type');
    }

    // Set filter if targetChainType is provided
    if (targetChainType) {
      // Debug: Log available wallets before filtering
      const state = store.getState();
      const availableWallets = getAvailableWallets(state);
      console.log('[openModal] Target chain type:', targetChainType);
      console.log('[openModal] Available wallets:', availableWallets);
      console.log(
        '[openModal] Wallet chains:',
        availableWallets.map((w) => ({ id: w.id, chains: w.chains })),
      );

      // Create a filter function for the specified chain type
      const chainFilter = (wallet: WalletInfo) => {
        const hasChain = wallet.chains?.includes(targetChainType);
        console.log(
          `[openModal] Wallet ${wallet.id} has chain ${targetChainType}:`,
          hasChain,
          'chains:',
          wallet.chains,
        );
        return hasChain;
      };
      uiActions.setWalletFilter(store, chainFilter);
    }

    mutateState(store, (state) => {
      state.ui.modalOpen = true;
      state.ui.currentView = 'walletSelection';
      // Clear any existing errors
      state.ui.errors = {};
      if (targetChainType) {
        state.ui.targetChainType = targetChainType;
      }
    });
  },

  /**
   * Close the wallet connection modal
   */
  closeModal: (store: StoreApi<WalletMeshState>) => {
    console.log('[uiActions.closeModal] Closing modal');
    mutateState(store, (state) => {
      console.log('[uiActions.closeModal] Before state update - modalOpen:', state.ui.modalOpen);
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
      // Clear targetChainType when closing
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.targetChainType;
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.switchingChainData;
      // Clear wallet filter when closing (direct mutation to avoid circular calls)
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.walletFilter;
      console.log('[uiActions.closeModal] After state update - modalOpen:', state.ui.modalOpen);
    });
    console.log('[uiActions.closeModal] Modal close completed');
  },

  /**
   * Set the current modal view
   */
  setView: (store: StoreApi<WalletMeshState>, view: ModalView) => {
    // Validate modal view
    const validatedView = parseWithErrorFactory(modalViewSchema, view, 'Invalid modal view');
    mutateState(store, (state) => {
      // Add current view to history if different
      if (state.ui.currentView !== validatedView && state.ui.currentView !== 'error') {
        state.ui.viewHistory.push(state.ui.currentView);
        // Limit history to 10 items
        if (state.ui.viewHistory.length > 10) {
          state.ui.viewHistory.shift();
        }
      }
      state.ui.currentView = validatedView;
      // Clear UI error when changing views unless going to error view
      if (view !== 'error' && state.ui.errors['ui']) {
        // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
        delete state.ui.errors['ui'];
      }
    });
  },

  /**
   * Set loading state for a specific context
   */
  setLoading: (store: StoreApi<WalletMeshState>, context: keyof LoadingState, loading: boolean) => {
    // Validate boolean
    const validatedLoading = parseWithErrorFactory(booleanSchema, loading, 'Invalid loading state');
    mutateState(store, (state) => {
      // Type-safe assignment for optional properties
      if (context === 'modal') {
        state.ui.loading.modal = validatedLoading;
      } else if (context === 'connection') {
        state.ui.loading.connection = validatedLoading;
      } else if (context === 'discovery') {
        state.ui.loading.discovery = validatedLoading;
      } else if (context === 'transaction') {
        state.ui.loading.transaction = validatedLoading;
      } else if (context === 'isLoading') {
        state.ui.loading.isLoading = validatedLoading;
      } else if (context === 'message') {
        // message is a string, not boolean - skip
      } else if (context === 'operations') {
        // operations is a Record - skip
      }
    });
  },

  /**
   * Set global modal loading state (convenience method)
   */
  setModalLoading: (store: StoreApi<WalletMeshState>, loading: boolean) => {
    uiActions.setLoading(store, 'modal', loading);
  },

  /**
   * Set error state for a specific context
   */
  setError: (store: StoreApi<WalletMeshState>, context: string, error?: ModalError) => {
    // Validate error object if provided
    if (error !== undefined) {
      parseWithErrorFactory(uiErrorSchema, error, 'Invalid error object');
    }
    mutateState(store, (state) => {
      if (error !== undefined) {
        state.ui.errors[context] = error;
        // Only change view to error for UI context
        if (context === 'ui') {
          state.ui.currentView = 'error';
        }
        // Clear relevant loading state
        if (context === 'connection') state.ui.loading.connection = false;
        if (context === 'discovery') state.ui.loading.discovery = false;
        if (context === 'transaction') state.ui.loading.transaction = false;
      } else {
        delete state.ui.errors[context];
      }
    });
  },

  /**
   * Set UI error (convenience method)
   */
  setUIError: (store: StoreApi<WalletMeshState>, error?: ModalError) => {
    uiActions.setError(store, 'ui', error);
  },

  /**
   * Clear error for a specific context
   */
  clearError: (store: StoreApi<WalletMeshState>, context: string) => {
    mutateState(store, (state) => {
      delete state.ui.errors[context];
      if (context === 'ui' && state.ui.currentView === 'error') {
        state.ui.currentView = 'walletSelection';
      }
    });
  },

  /**
   * Clear all errors
   */
  clearAllErrors: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      state.ui.errors = {};
      if (state.ui.currentView === 'error') {
        state.ui.currentView = 'walletSelection';
      }
    });
  },

  /**
   * Set target chain type for wallet filtering
   */
  setTargetChainType: (store: StoreApi<WalletMeshState>, chainType?: ChainType) => {
    // Validate chain type if provided
    if (chainType !== undefined) {
      parseWithErrorFactory(optionalChainTypeSchema, chainType, 'Invalid chain type');
    }
    mutateState(store, (state) => {
      if (chainType !== undefined) {
        state.ui.targetChainType = chainType;
      } else {
        // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
        delete state.ui.targetChainType;
      }
    });
  },

  /**
   * Start wallet discovery scan
   */
  startDiscovery: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      state.ui.loading.discovery = true;
      state.meta.discoveryErrors = [];
      // Clear discovery error if exists
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.errors['discovery'];
    });
  },

  /**
   * Stop wallet discovery scan
   */
  stopDiscovery: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      state.ui.loading.discovery = false;
      state.meta.lastDiscoveryTime = Date.now();
    });
  },

  /**
   * Add discovery error
   */
  addDiscoveryError: (store: StoreApi<WalletMeshState>, error: string) => {
    // Validate error string
    const validatedError = parseWithErrorFactory(discoveryErrorSchema, error, 'Invalid discovery error');
    mutateState(store, (state) => {
      state.meta.discoveryErrors.push(validatedError);
    });
  },

  /**
   * Clear discovery errors
   */
  clearDiscoveryErrors: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      state.meta.discoveryErrors = [];
    });
  },

  /**
   * Set chain switching data for UI display
   */
  setSwitchingChainData: (
    store: StoreApi<WalletMeshState>,
    data?: { fromChain?: { chainId: string; name?: string }; toChain?: { chainId: string; name?: string } },
  ) => {
    mutateState(store, (state) => {
      if (data) {
        state.ui.switchingChainData = data;
      } else {
        // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
        delete state.ui.switchingChainData;
      }
    });
  },

  /**
   * Set wallet filter function
   *
   * Sets a filter function to limit which wallets are shown in the modal.
   *
   * @param store - The store instance
   * @param filter - Filter function or null to clear the filter
   */
  setWalletFilter: (store: StoreApi<WalletMeshState>, filter: ((wallet: WalletInfo) => boolean) | null) => {
    mutateState(store, (state) => {
      if (filter) {
        state.ui.walletFilter = filter;
      } else {
        // Clear filter
        // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
        delete state.ui.walletFilter;
      }
    });
  },

  /**
   * Clear wallet filter
   *
   * Convenience method to clear the wallet filter.
   *
   * @param store - The store instance
   */
  clearWalletFilter: (store: StoreApi<WalletMeshState>) => {
    uiActions.setWalletFilter(store, null);
  },

  /**
   * Navigate back in modal view history
   */
  goBack: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      if (state.ui.viewHistory.length > 0) {
        const previousView = state.ui.viewHistory.pop();
        if (previousView) {
          state.ui.currentView = previousView;
        }
      }
    });
  },

  /**
   * Clear view history
   */
  clearViewHistory: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      state.ui.viewHistory = [];
    });
  },
};
