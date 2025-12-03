/**
 * Simplified store hook utility for WalletMesh React integration
 *
 * Updated to work with the simplified store structure that has:
 * - External actions instead of embedded actions
 * - 3 slices instead of 5
 * - Arrays instead of Maps
 * - Helper functions for data access
 *
 * @module hooks/internal/useStore
 * @category Utilities
 */

import {
  ErrorFactory,
  type WalletMeshState,
  // Import actions
  connectionActions,
  getActiveSession,
  getActiveWallet,
  getConnectionStatus,
  getFilteredWallets,
  getSessionsByWallet,
  isWalletAvailable,
  uiActions,
  useStore as useModalCoreStore,
} from '@walletmesh/modal-core';
import { useMemo, useRef, useSyncExternalStore } from 'react';

// Re-export types and helper functions for convenience
export type { WalletMeshState };
export {
  getActiveSession,
  getSessionsByWallet,
  getActiveWallet,
  isWalletAvailable,
  getConnectionStatus,
  getFilteredWallets,
};

// Helper to find wallet by ID
export const findWalletById = (state: WalletMeshState, walletId: string) => {
  return state.entities.wallets[walletId] || null;
};

/**
 * Internal hook to access the simplified WalletMesh store
 *
 * @returns The simplified store instance
 * @internal
 */
export function useWalletMeshStoreInstance() {
  return useModalCoreStore;
}

/**
 * Hook to subscribe to simplified WalletMesh store state
 *
 * Uses React's useSyncExternalStore for optimal performance with
 * concurrent rendering and automatic subscription management.
 *
 * @param selector - Function to select specific state slice
 * @returns The selected state slice
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Select specific state using helper functions
 *   const activeSession = useStore(state => getActiveSession(state));
 *   const isConnected = useStore(state => getConnectionStatus(state) === 'connected');
 *
 *   // Select multiple values efficiently
 *   const { isOpen, currentView } = useStore(state => ({
 *     isOpen: state.ui.isOpen,
 *     currentView: state.ui.currentView
 *   }));
 * }
 * ```
 *
 * @internal
 */
export function useStore<T>(selector: (state: WalletMeshState) => T): T {
  const store = useWalletMeshStoreInstance();

  // The store should always be available since it's global
  if (!store) {
    throw ErrorFactory.configurationError(
      'WalletMesh store not available. This may indicate the store was not properly initialized.',
    );
  }

  // Use a ref to maintain cache across renders
  const cache = useRef<{
    result?: T;
    state?: WalletMeshState;
  }>({});

  const getSnapshot = () => {
    const currentState = store.getState();

    // Only re-compute if the state reference has changed
    if (currentState !== cache.current.state) {
      cache.current.result = selector(currentState);
      cache.current.state = currentState;
    }

    return cache.current.result as T;
  };

  return useSyncExternalStore(
    (callback) => {
      // Subscribe to store changes
      const unsubscribe = store.subscribe(() => {
        // Don't clear cache here - let getSnapshot handle it
        callback();
      });
      return unsubscribe;
    },
    getSnapshot,
    // Server snapshot for SSR
    getSnapshot,
  );
}

/**
 * Hook to get simplified store actions
 *
 * Returns action functions that operate on the store.
 * Actions are stable references and don't need to be included in effect dependencies.
 *
 * @returns Object containing all action functions
 *
 * @example
 * ```tsx
 * function ConnectButton() {
 *   const { ui, connections } = useStoreActions();
 *   const store = useWalletMeshStoreInstance();
 *
 *   const handleConnect = async () => {
 *     // Open modal
 *     store.setState(state => {
 *       ui.openModal(state);
 *     });
 *
 *     // Add wallet (example)
 *     store.setState(state => {
 *       connections.addWallet(state, {
 *         id: 'metamask',
 *         name: 'MetaMask',
 *         // ... other wallet properties
 *       });
 *     });
 *   };
 *
 *   return <button onClick={handleConnect}>Connect</button>;
 * }
 * ```
 *
 * @internal
 */
export function useStoreActions(): { ui: typeof uiActions; connections: typeof connectionActions } {
  // Memoize to provide stable action references across renders
  return useMemo(
    () => ({
      ui: uiActions,
      connections: connectionActions,
    }),
    [],
  );
}

/**
 * Hook to get the store instance
 *
 * Useful when you need to pass the store to action functions.
 *
 * @returns The store instance
 * @internal
 */
export function useStoreInstance() {
  return useWalletMeshStoreInstance();
}

/**
 * Shallow equality check for store selectors
 *
 * Same implementation as before - useful for preventing
 * unnecessary re-renders when selecting multiple values from store.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are shallowly equal, false otherwise
 *
 * @public
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!Object.hasOwn(b, key) || !Object.is(a[key as keyof T], b[key as keyof T])) {
      return false;
    }
  }

  return true;
}

/**
 * Hook to access the simplified WalletMesh store state
 *
 * Main hook for accessing store state in React components.
 * Provides direct access to the simplified store state and automatically
 * handles subscriptions and re-renders.
 *
 * @param selector - Function to select specific state slice
 * @returns The selected state slice
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   // Use helper functions for common operations
 *   const activeSession = useWalletMeshStore(getActiveSession);
 *   const connectionStatus = useWalletMeshStore(getConnectionStatus);
 *
 *   // Access state directly
 *   const isModalOpen = useWalletMeshStore(state => state.ui.isOpen);
 *   const wallets = useWalletMeshStore(state => state.connections.wallets);
 * }
 * ```
 *
 * @public
 */
export function useWalletMeshStore<T>(selector: (state: WalletMeshState) => T): T {
  return useStore(selector);
}

/**
 * Hook to subscribe to specific store slice with custom equality
 *
 * Advanced hook for fine-grained control over subscriptions and re-renders.
 *
 * @param selector - Function to select state slice
 * @param equalityFn - Custom equality function (defaults to Object.is)
 * @returns The selected state slice
 *
 * @internal
 */
export function useStoreWithEquality<T>(
  selector: (state: WalletMeshState) => T,
  equalityFn: (a: T, b: T) => boolean = Object.is,
): T {
  const store = useWalletMeshStoreInstance();

  if (!store) {
    throw ErrorFactory.configurationError('WalletMesh store not available');
  }

  // Use a ref to maintain cache across renders
  const cache = useRef<{
    result?: T;
    state?: WalletMeshState;
  }>({});

  const getSnapshot = () => {
    const currentState = store.getState();

    // Only re-compute if the state reference has changed
    if (currentState !== cache.current.state) {
      const newResult = selector(currentState);

      // Use equality function to determine if we should update
      if (!cache.current.result || !equalityFn(cache.current.result, newResult)) {
        cache.current.result = newResult;
      }
      cache.current.state = currentState;
    }

    return cache.current.result as T;
  };

  return useSyncExternalStore(
    (callback) => {
      let previousValue = cache.current.result;

      const unsubscribe = store.subscribe(() => {
        const currentState = store.getState();
        const nextValue = selector(currentState);

        if (!previousValue || !equalityFn(previousValue, nextValue)) {
          previousValue = nextValue;
          callback();
        }
      });

      return unsubscribe;
    },
    getSnapshot,
    getSnapshot,
  );
}

/**
 * Convenience hook for common connection state
 *
 * Returns commonly needed connection state in a single hook
 *
 * @returns Object with connection state
 * @public
 */
export function useConnectionState() {
  return useStore((state) => {
    const activeSession = getActiveSession(state);
    return {
      isConnected: getConnectionStatus(state) === 'connected',
      isConnecting: getConnectionStatus(state) === 'connecting',
      activeSession,
      walletId: activeSession?.walletId ?? null,
      address: activeSession?.activeAccount?.address ?? null,
      chain: activeSession?.chain ?? null,
      chainType: activeSession?.chain.chainType ?? null,
    };
  });
}

/**
 * Convenience hook for UI state
 *
 * @returns Object with UI state
 * @public
 */
export function useUIState(): {
  isOpen: boolean;
  currentView: string;
  isLoading: boolean;
  connectionError?: import('@walletmesh/modal-core').ModalError;
  targetChainType?: import('@walletmesh/modal-core').ChainType;
  isDiscovering: boolean;
} {
  return useStore((state) => ({
    isOpen: state.ui.modalOpen,
    currentView: state.ui.currentView,
    isLoading: state.ui.loading?.connection || false,
    ...(state.ui.errors?.['connection'] && { connectionError: state.ui.errors['connection'] }),
    ...(state.ui.targetChainType && { targetChainType: state.ui.targetChainType }),
    isDiscovering: state.ui.loading?.discovery || false,
  }));
}
