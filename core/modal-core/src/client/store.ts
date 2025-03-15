import { create } from 'zustand';
import type { WalletClientState } from '../types/client.js';
import type { StoreApi } from 'zustand';

/**
 * Initial state for the wallet client
 */
export const initialState: WalletClientState = {
  status: 'disconnected',
  activeConnector: null,
  activeChain: null,
  activeProviderInterface: null,
  accounts: [],
  error: null,
};

/**
 * Store state interface including actions
 */
export interface WalletStore extends WalletClientState {
  /**
   * Set the state of the store
   */
  setState: StoreApi<WalletClientState>['setState'];
  /**
   * Get the state of the store
   */
  getState: StoreApi<WalletClientState>['getState'];
  /**
   * Subscribe to changes in the store
   */
  subscribe: StoreApi<WalletClientState>['subscribe'];
}

/**
 * Create the wallet store using Zustand
 * @param initialData - Initial data to populate the store with
 * @returns A WalletStore instance
 */
export const createWalletStore = (initialData: Partial<WalletClientState> = {}) => {
  // Create the Zustand store
  const store = create<WalletClientState>(() => ({
    ...initialState,
    ...initialData,
  }));

  // Return store instance with state and methods
  return {
    ...store.getState(),
    setState: store.setState,
    getState: store.getState,
    subscribe: store.subscribe,
  } as WalletStore;
};

/**
 * Type for store selector functions
 */
export type WalletStoreSelector<T> = (state: WalletClientState) => T;

/**
 * Create default store instance
 */
export const defaultStore = createWalletStore();
