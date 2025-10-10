import type { StoreApi } from 'zustand';
import type {
  AztecProvingEntry,
  AztecProvingState,
  AztecProvingStatusNotification,
} from '../../providers/aztec/types.js';
import type { WalletMeshState } from '../store.js';

const CLEANUP_THRESHOLD_MS = 2 * 60 * 1000; // Remove finished entries after 2 minutes

type Store = StoreApi<WalletMeshState>;

const mutateState = (store: Store, updater: (state: WalletMeshState) => void) => {
  store.setState((state) => {
    updater(state);
    return state;
  });
};

const normaliseId = (payload: AztecProvingStatusNotification): string => {
  if (payload.provingId) {
    return payload.provingId;
  }
  if (payload.txHash) {
    return payload.txHash;
  }
  return `unknown-${Date.now()}`;
};

const getEntries = (state: WalletMeshState): Record<string, AztecProvingEntry> =>
  state.meta.aztecProving.entries;

export const provingActions = {
  /**
   * Handle a proving status notification from the Aztec wallet.
   */
  handleNotification: (store: Store, payload: AztecProvingStatusNotification) => {
    const timestamp = payload.timestamp ?? Date.now();
    const id = normaliseId(payload);

    mutateState(store, (state) => {
      const entries = getEntries(state);
      const existing = entries[id];

      if (payload.status === 'started') {
        const entry: AztecProvingEntry = {
          provingId: id,
          status: 'started',
          startedAt: timestamp,
          lastUpdatedAt: timestamp,
          ...(payload.txHash && { txHash: payload.txHash }),
        };
        entries[id] = entry;
      } else {
        const entry: AztecProvingEntry = existing
          ? {
              ...existing,
              status: payload.status,
              lastUpdatedAt: timestamp,
              ...(payload.txHash && { txHash: payload.txHash }),
            }
          : {
              provingId: id,
              status: payload.status,
              startedAt: timestamp,
              lastUpdatedAt: timestamp,
              ...(payload.txHash && { txHash: payload.txHash }),
            };

        if (payload.status === 'completed') {
          entry.completedAt = timestamp;
        } else if (payload.status === 'failed') {
          entry.completedAt = timestamp;
          entry.error = payload.error ?? 'Proof generation failed';
        }

        entries[id] = entry;
      }

      // Drop completed entries after the cleanup threshold to avoid unbounded growth
      const cleanupBefore = timestamp - CLEANUP_THRESHOLD_MS;
      for (const [entryId, entry] of Object.entries(entries)) {
        if (entry.status !== 'started' && entry.completedAt && entry.completedAt < cleanupBefore) {
          delete entries[entryId];
        }
      }
    });
  },

  /**
   * Force clear of all proving entries (primarily for tests).
   */
  clearAll: (store: Store) => {
    mutateState(store, (state) => {
      (state.meta.aztecProving as AztecProvingState).entries = {};
    });
  },
};
