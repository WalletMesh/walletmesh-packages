/**
 * Store testing utilities - mock stores and real isolated stores for testing
 */

import { enableMapSet, setAutoFreeze } from 'immer';
import { vi } from 'vitest';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { WalletMeshState } from '../../state/store.js';

// Enable MapSet plugin for Immer (needed for SessionState)
enableMapSet();

// Disable auto-freezing in test environment
if (typeof process !== 'undefined' && process.env['NODE_ENV'] === 'test') {
  setAutoFreeze(false);
}

/**
 * Create a simple mock store with just the methods tests actually use
 */
export function createAutoMockedStore(initialState?: Partial<WalletMeshState>) {
  // Start with a minimal but valid state
  let currentState: WalletMeshState = {
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
        isLoading: false,
        operations: {},
        modal: false,
        connection: false,
        discovery: false,
        transaction: false,
      },
      errors: {},
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
      transactionStatus: 'idle' as const,
    },
    ...initialState,
  };

  // Simple store implementation that tests actually use
  const subscribers = new Set<(state: WalletMeshState) => void>();

  const store = {
    getState: vi.fn().mockImplementation(() => currentState),
    setState: vi.fn().mockImplementation((updater) => {
      if (typeof updater === 'function') {
        const newState = updater(currentState);
        // If the updater returns a value, use it
        if (newState !== undefined) {
          currentState = newState;
        }
      } else {
        currentState = { ...currentState, ...updater };
      }
      // Notify subscribers
      for (const callback of subscribers) {
        callback(currentState);
      }
    }),
    subscribe: vi.fn((callback: (state: WalletMeshState) => void) => {
      subscribers.add(callback);
      // Return unsubscribe function
      return () => {
        subscribers.delete(callback);
      };
    }),
    destroy: vi.fn(),
  };

  return store;
}

/**
 * Configuration for test store creation
 */
export interface TestStoreConfig {
  enableDevtools?: boolean;
  persistOptions?: {
    enabled?: boolean;
    name?: string;
  };
}

/**
 * Create an isolated real Zustand store for testing scenarios
 * This replaces the removed createStore function for test usage only
 */
export function createTestStore(config?: TestStoreConfig) {
  const { enableDevtools = false, persistOptions = { enabled: false } } = config || {};

  // Create initial state factory
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
        isLoading: false,
        operations: {},
        modal: false,
        connection: false,
        discovery: false,
        transaction: false,
      },
      errors: {},
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
      transactionStatus: 'idle' as const,
    },
  });

  // Build the store with proper typing
  if (enableDevtools && persistOptions.enabled) {
    return create<WalletMeshState>()(
      devtools(
        persist(immer(createInitialState), {
          name: persistOptions.name || 'walletmesh-test-store',
          storage: createJSONStorage(() => localStorage),
          version: 2,
          partialize: (state) => ({
            entities: {
              sessions: state.entities.sessions,
              wallets: state.entities.wallets,
              transactions: state.entities.transactions,
            },
            active: state.active,
            ui: {
              targetChainType: state.ui.targetChainType,
            },
          }),
        }),
        { name: 'WalletMeshTestStore' },
      ),
    );
  }

  if (persistOptions.enabled) {
    return create<WalletMeshState>()(
      persist(immer(createInitialState), {
        name: persistOptions.name || 'walletmesh-test-store',
        storage: createJSONStorage(() => localStorage),
        version: 2,
        partialize: (state) => ({
          entities: {
            sessions: state.entities.sessions,
            wallets: state.entities.wallets,
            transactions: state.entities.transactions,
          },
          active: state.active,
          ui: {
            targetChainType: state.ui.targetChainType,
          },
        }),
      }),
    );
  }

  if (enableDevtools) {
    return create<WalletMeshState>()(devtools(immer(createInitialState), { name: 'WalletMeshTestStore' }));
  }

  return create<WalletMeshState>()(immer(createInitialState));
}
