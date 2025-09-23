/**
 * Simplified view navigation for modal
 *
 * Provides hooks and utilities for managing modal view transitions
 * in a simplified, direct navigation system.
 *
 * @module modal/views/navigation
 * @internal
 */

import type { z } from 'zod';
import type { modalViewSchema } from '../../../schemas/connection.js';
import { uiActions } from '../../../state/actions/ui.js';
import { useStore } from '../../../state/store.js';

type ModalView = z.infer<typeof modalViewSchema>;

/**
 * Hook for view navigation
 *
 * Provides navigation functions and current view state for managing
 * modal view transitions. Uses the unified store for state management.
 *
 * @returns {Object} Navigation functions and current view state
 * @returns {ModalView} returns.currentView - Current modal view
 * @returns {function(): void} returns.navigateToWalletSelection - Navigate to wallet selection
 * @returns {function(): void} returns.navigateToProviderSelection - Navigate to provider selection
 * @returns {function(string): void} returns.navigateToConnecting - Navigate to connecting view
 * @returns {function(string, string?): void} returns.navigateToConnected - Navigate to connected view
 * @returns {function(string): void} returns.navigateToError - Navigate to error view
 * @public
 */
export function useViewNavigation() {
  const state = useStore.getState();
  const currentView = state.ui.currentView;

  const navigateToWalletSelection = () => uiActions.setView(useStore, 'walletSelection');
  const navigateToProviderSelection = () => {
    // Provider selection is handled as part of wallet selection
    uiActions.setView(useStore, 'walletSelection');
  };
  const navigateToConnecting = (_walletId: string) => {
    uiActions.setView(useStore, 'connecting');
    uiActions.setLoading(useStore, 'modal', true);
    // The actual connection is handled by session actions
  };
  const navigateToConnected = (_address: string, _chainId?: string) => {
    uiActions.setView(useStore, 'connected');
    uiActions.setLoading(useStore, 'modal', false);
  };
  const navigateToError = (error: string) => {
    uiActions.setView(useStore, 'error');
    uiActions.setError(useStore, 'ui', {
      code: 'UNKNOWN_ERROR',
      message: error,
      category: 'general',
      recoveryStrategy: 'retry',
    });
  };

  return {
    currentView,
    navigateToWalletSelection,
    navigateToProviderSelection,
    navigateToConnecting,
    navigateToConnected,
    navigateToError,
  };
}

/**
 * Validate if a view transition is valid
 *
 * Simple validation for view transitions to prevent invalid state changes.
 * Most transitions are valid in a modal context, but some direct transitions
 * are blocked for logical consistency.
 *
 * @param {ModalView} from - Source view
 * @param {ModalView} to - Target view
 * @returns {boolean} True if transition is valid
 * @public
 */
export function isValidViewTransition(from: ModalView, to: ModalView): boolean {
  // Define all valid modal views
  const validViews = ['walletSelection', 'providerSelection', 'connecting', 'connected', 'error'] as const;
  type ValidView = (typeof validViews)[number];

  // Check if views are valid
  if (!validViews.includes(from as ValidView) || !validViews.includes(to as ValidView)) {
    return true; // Allow transitions for unknown views
  }

  const invalidTransitions: Partial<Record<ValidView, ValidView[]>> = {
    connected: [], // Connected can go anywhere (disconnect, error, etc.)
    error: [], // Error can go anywhere (retry, back, etc.)
    walletSelection: ['connected'], // Can't go directly to connected
    providerSelection: ['connected'], // Can't go directly to connected
    connecting: [], // Connecting can go anywhere (success, error, cancel)
  };

  return !invalidTransitions[from as ValidView]?.includes(to as ValidView);
}
