import type { SessionState } from '../api/types/sessionState.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type { ModalView, WalletInfo } from '../types.js';
import { connectionActions } from './actions/connections.js';
import { useStore } from './store.js';
import type { WalletMeshState } from './store.js';

// Subscription creators for different state slices
export const subscriptions = {
  // Session subscriptions
  session: (walletId: string) => ({
    subscribe: (callback: (sessions: SessionState[]) => void) => {
      let previousValue = connectionActions.getWalletSessions(useStore, walletId);
      return useStore.subscribe(() => {
        const currentValue = connectionActions.getWalletSessions(useStore, walletId);
        if (JSON.stringify(previousValue) !== JSON.stringify(currentValue)) {
          previousValue = currentValue;
          callback(currentValue);
        }
      });
    },
  }),

  // All sessions subscription
  sessions: () => ({
    subscribe: (callback: (sessions: SessionState[]) => void) => {
      let previousSessions = Object.values(useStore.getState().entities.sessions);
      return useStore.subscribe((state) => {
        const currentSessions = Object.values(state.entities.sessions);
        if (JSON.stringify(previousSessions) !== JSON.stringify(currentSessions)) {
          previousSessions = currentSessions;
          callback(currentSessions);
        }
      });
    },
  }),

  // Active wallet subscription
  activeWallet: () => ({
    subscribe: (callback: (walletId: string | null) => void) => {
      let previousSessionId = useStore.getState().active.sessionId;
      return useStore.subscribe((state) => {
        const currentSessionId = state.active.sessionId;
        if (previousSessionId !== currentSessionId) {
          previousSessionId = currentSessionId;
          const activeSession = currentSessionId ? state.entities.sessions[currentSessionId] : null;
          callback(activeSession?.walletId || null);
        }
      });
    },
  }),

  // UI subscriptions
  ui: {
    isOpen: (callback: (isOpen: boolean) => void) => {
      let previousValue = useStore.getState().ui.modalOpen;
      return useStore.subscribe((state) => {
        const currentValue = state.ui.modalOpen;
        if (previousValue !== currentValue) {
          previousValue = currentValue;
          callback(currentValue);
        }
      });
    },

    view: (callback: (view: ModalView) => void) => {
      let previousValue = useStore.getState().ui.currentView;
      return useStore.subscribe((state) => {
        const currentValue = state.ui.currentView;
        if (previousValue !== currentValue) {
          previousValue = currentValue;
          callback(currentValue);
        }
      });
    },

    loading: (callback: (loading: { isLoading: boolean; message?: string }) => void) => {
      let previousLoading = useStore.getState().ui.loading;
      return useStore.subscribe((state) => {
        const currentLoading = state.ui.loading;
        if (JSON.stringify(previousLoading) !== JSON.stringify(currentLoading)) {
          previousLoading = currentLoading;
          callback({
            isLoading: currentLoading.isLoading || false,
            ...(currentLoading.message !== undefined && { message: currentLoading.message }),
          });
        }
      });
    },

    error: (callback: (error: import('../internal/core/errors/types.js').ModalError | undefined) => void) => {
      let previousErrors = useStore.getState().ui.errors;
      return useStore.subscribe((state) => {
        const currentErrors = state.ui.errors;
        if (JSON.stringify(previousErrors) !== JSON.stringify(currentErrors)) {
          previousErrors = currentErrors;
          // Return the first error if any exist
          const errorKeys = Object.keys(currentErrors);
          const firstErrorKey = errorKeys[0];
          callback(firstErrorKey ? currentErrors[firstErrorKey] : undefined);
        }
      });
    },
  },

  // Available wallets subscription
  availableWallets: (callback: (wallets: WalletInfo[]) => void) => {
    let previousWalletIds = Object.keys(useStore.getState().entities.wallets);
    return useStore.subscribe((state) => {
      const currentWalletIds = Object.keys(state.entities.wallets);
      // Deep comparison for array
      if (JSON.stringify(previousWalletIds) !== JSON.stringify(currentWalletIds)) {
        previousWalletIds = currentWalletIds;
        callback(Object.values(state.entities.wallets));
      }
    });
  },

  // Discovery state subscription
  discovery: {
    isScanning: (callback: (scanning: boolean) => void) => {
      // isScanning doesn't exist in the new state structure, use loading state instead
      let previousValue = useStore.getState().ui.loading.discovery;
      return useStore.subscribe((state) => {
        const currentValue = state.ui.loading.discovery;
        if (previousValue !== currentValue) {
          previousValue = currentValue;
          callback(currentValue || false);
        }
      });
    },

    wallets: (callback: (wallets: WalletInfo[]) => void) => {
      let previousWalletIds = Object.keys(useStore.getState().entities.wallets);
      return useStore.subscribe((state) => {
        const currentWalletIds = Object.keys(state.entities.wallets);
        if (JSON.stringify(previousWalletIds) !== JSON.stringify(currentWalletIds)) {
          previousWalletIds = currentWalletIds;
          callback(Object.values(state.entities.wallets));
        }
      });
    },
  },
};

// Helper function to wait for specific state
export async function waitForState<T>(
  selector: (state: WalletMeshState) => T,
  predicate: (value: T) => boolean,
  timeout = 10000,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(ErrorFactory.timeoutError('Timeout waiting for state'));
    }, timeout);

    const unsubscribe = useStore.subscribe((state) => {
      const value = selector(state);
      if (predicate(value)) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(value);
      }
    });

    // Check initial state
    const currentValue = selector(useStore.getState());
    if (predicate(currentValue)) {
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(currentValue);
    }
  });
}

// Utility to wait for connection
export async function waitForConnection(walletId: string, timeout = 10000): Promise<SessionState> {
  const session = await waitForState(
    (state) => {
      const sessions = Object.values(state.entities.sessions).filter((s) => s.walletId === walletId);
      return sessions.find((s) => s.status === 'connected');
    },
    (session) => !!session,
    timeout,
  );

  if (!session) {
    throw ErrorFactory.notFound(`Session for wallet ${walletId} not found`, { walletId });
  }

  return session;
}

// Utility to wait for modal to close
export async function waitForModalClose(timeout = 10000): Promise<void> {
  await waitForState(
    (state) => state.ui.modalOpen,
    (isOpen) => !isOpen,
    timeout,
  );
}

// Utility to subscribe to session changes
export function subscribeToConnectionChanges(
  walletId: string,
  handlers: {
    onConnecting?: () => void;
    onConnected?: (data: { address: string; chainId: string }) => void;
    onDisconnected?: () => void;
    onError?: (error: Error) => void;
    onReconnecting?: () => void;
  },
): () => void {
  return subscriptions.session(walletId).subscribe((sessions) => {
    const session = sessions.find((s) => s.status === 'connected');
    if (!session) return;

    switch (session.status) {
      case 'connecting':
        handlers.onConnecting?.();
        break;
      case 'connected':
        handlers.onConnected?.({
          address: session.activeAccount.address,
          chainId: session.chain.chainId.toString(),
        });
        break;
      case 'disconnected':
        handlers.onDisconnected?.();
        break;
      case 'error': {
        const modalError = ErrorFactory.unknownError('Session error');
        const error = new Error(modalError.message);
        error.name = modalError.code;
        handlers.onError?.(error);
        break;
      }
    }
  });
}

// Utility to subscribe to all state changes (for debugging)
export function subscribeToAllChanges(callback: (state: WalletMeshState) => void): () => void {
  return useStore.subscribe(callback);
}
