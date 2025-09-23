/**
 * Initial modal state constants
 *
 * These constants provide the initial state structure for modal initialization
 * and can be used by framework adapters for SSR-safe initial values.
 *
 * @module constants/modalState
 */

import type { ModalState } from '../../types.js';

// No separate UI state in headless architecture - UI state is derived from connection state

/**
 * Initial connection state for headless modal
 */
export const INITIAL_CONNECTION_STATE = {
  state: 'idle' as const,
};

// No separate error state in headless architecture - errors are part of connection state

/**
 * Complete initial modal state for headless architecture
 *
 * This constant provides a complete initial state structure that can be used
 * for initialization in both client and server environments. Framework adapters
 * can use this for SSR-safe initial values.
 *
 * @type {ModalState}
 */
export const INITIAL_MODAL_STATE: ModalState = {
  connection: INITIAL_CONNECTION_STATE,
  wallets: [],
  selectedWalletId: undefined,
  isOpen: false,
};

/**
 * Create a fresh copy of the modal state
 *
 * This function returns a new instance of the initial state to prevent
 * accidental mutations of the shared constant.
 *
 * @returns {ModalState} Fresh copy of initial modal state
 */
export function createModalState(): ModalState {
  return {
    connection: { ...INITIAL_CONNECTION_STATE },
    wallets: [],
    selectedWalletId: undefined,
    isOpen: false,
  };
}
