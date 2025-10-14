/**
 * Aztec transaction lifecycle actions
 *
 * Actions for managing Aztec transactions with sync/async modes and stage timing
 */

import type { StoreApi } from 'zustand';
import type { WalletMeshState } from '../store.js';
import type { AztecTransactionResult, StageTiming } from '../types/aztecTransactions.js';
import type { TransactionStatus } from '../../services/transaction/types.js';

/**
 * Helper to properly handle immer state mutations
 */
const mutateState = (store: StoreApi<WalletMeshState>, updater: (state: WalletMeshState) => void) => {
  store.setState((state) => {
    updater(state);
    return state;
  });
};

/**
 * Aztec transaction action functions
 */
export const aztecTransactionActions = {
  /**
   * Add an Aztec transaction to the store
   */
  addAztecTransaction: (store: StoreApi<WalletMeshState>, transaction: AztecTransactionResult) => {
    mutateState(store, (state) => {
      // Add transaction to entities (keyed by status tracking ID)
      state.entities.transactions[transaction.txStatusId] = transaction;

      // If it's async mode, add to background transactions
      if (transaction.mode === 'async') {
        if (!state.meta.backgroundTransactionIds.includes(transaction.txStatusId)) {
          state.meta.backgroundTransactionIds.push(transaction.txStatusId);
        }
      } else {
        // If it's sync mode, set as active transaction
        state.active.transactionId = transaction.txStatusId;
      }

      // Keep only the last 100 transactions (cleanup old ones)
      const allTxIds = Object.keys(state.entities.transactions);
      if (allTxIds.length > 100) {
        // Sort by timestamp
        const sortedTxs = allTxIds
          .map((id) => ({ id, tx: state.entities.transactions[id] }))
          .sort((a, b) => {
            const txA = a.tx;
            const txB = b.tx;
            if (!txA || !txB) return 0;
            const timeA = txA.startTime || 0;
            const timeB = txB.startTime || 0;
            return timeB - timeA;
          });

        // Keep only the most recent 100
        const toKeep = new Set(sortedTxs.slice(0, 100).map((item) => item.id));
        for (const id of Object.keys(state.entities.transactions)) {
          if (!toKeep.has(id)) {
            delete state.entities.transactions[id];
            // Also remove from background list if present
            const bgIndex = state.meta.backgroundTransactionIds.indexOf(id);
            if (bgIndex !== -1) {
              state.meta.backgroundTransactionIds.splice(bgIndex, 1);
            }
          }
        }
      }
    });
  },

  /**
   * Update stage timing for a transaction
   */
  updateTransactionStage: (
    store: StoreApi<WalletMeshState>,
    txStatusId: string,
    stage: keyof AztecTransactionResult['stages'],
    timing: StageTiming | { timestamp: number },
  ) => {
    mutateState(store, (state) => {
      const tx = state.entities.transactions[txStatusId] as AztecTransactionResult | undefined;
      if (tx) {
        if (!tx.stages) {
          tx.stages = {};
        }
        // Type assertion is safe here because the caller is responsible for providing the correct type
        if (stage === 'confirmed') {
          tx.stages[stage] = timing as { timestamp: number };
        } else {
          tx.stages[stage] = timing as StageTiming;
        }
      }
    });
  },

  /**
   * Start a transaction stage (set start time)
   */
  startTransactionStage: (
    store: StoreApi<WalletMeshState>,
    txStatusId: string,
    stage: keyof AztecTransactionResult['stages'],
  ) => {
    aztecTransactionActions.updateTransactionStage(store, txStatusId, stage, {
      start: Date.now(),
    });
  },

  /**
   * End a transaction stage (set end time)
   */
  endTransactionStage: (
    store: StoreApi<WalletMeshState>,
    txStatusId: string,
    stage: keyof AztecTransactionResult['stages'],
  ) => {
    mutateState(store, (state) => {
      const tx = state.entities.transactions[txStatusId] as AztecTransactionResult | undefined;
      if (tx && tx.stages && tx.stages[stage]) {
        const stageTiming = tx.stages[stage] as StageTiming;
        stageTiming.end = Date.now();
      }
    });
  },

  /**
   * Update transaction status and stage timing
   */
  updateAztecTransactionStatus: (
    store: StoreApi<WalletMeshState>,
    txStatusId: string,
    status: TransactionStatus,
  ) => {
    mutateState(store, (state) => {
      const tx = state.entities.transactions[txStatusId] as AztecTransactionResult | undefined;
      if (tx) {
        const now = Date.now();

        // End the previous stage
        const previousStage = getStageFromStatus(tx.status);
        if (previousStage && tx.stages && tx.stages[previousStage]) {
          const stageTiming = tx.stages[previousStage] as StageTiming;
          if (!stageTiming.end) {
            stageTiming.end = now;
          }
        }

        // Update status
        tx.status = status;
        state.meta.transactionStatus = status;

        // Start the new stage
        const newStage = getStageFromStatus(status);
        if (newStage) {
          if (!tx.stages) {
            tx.stages = {};
          }
          if (newStage === 'confirmed') {
            tx.stages[newStage] = { timestamp: now };
            tx.endTime = now;
          } else {
            // For other stages, they use StageTiming format
            const stageKey = newStage as Exclude<keyof typeof tx.stages, 'confirmed'>;
            tx.stages[stageKey] = { start: now };
          }
        }

        // If transaction is complete (confirmed or failed), remove from background list if needed
        if (status === 'confirmed' || status === 'failed') {
          if (!tx.endTime) {
            tx.endTime = now;
          }
          const bgIndex = state.meta.backgroundTransactionIds.indexOf(txStatusId);
          if (bgIndex !== -1) {
            // Keep in background list briefly for UI to show completion
            // The cleanup will happen on next transaction or after timeout
            setTimeout(() => {
              const currentState = store.getState();
              const index = currentState.meta.backgroundTransactionIds.indexOf(txStatusId);
              if (index !== -1) {
                mutateState(store, (s) => {
                  s.meta.backgroundTransactionIds.splice(index, 1);
                });
              }
            }, 5000); // Remove after 5 seconds
          }
          // Clear active transaction if it's the one that completed
          if (state.active.transactionId === txStatusId) {
            state.active.transactionId = null;
          }
        }
      }
    });
  },

  /**
   * Update arbitrary transaction fields (txHash, receipt, etc.)
   */
  updateAztecTransaction: (
    store: StoreApi<WalletMeshState>,
    txStatusId: string,
    updates: Partial<AztecTransactionResult>,
  ) => {
    mutateState(store, (state) => {
      const tx = state.entities.transactions[txStatusId] as AztecTransactionResult | undefined;
      if (tx) {
        Object.assign(tx, updates);
      }
    });
  },

  /**
   * Add a transaction to background mode
   */
  addToBackgroundTransactions: (store: StoreApi<WalletMeshState>, txStatusId: string) => {
    mutateState(store, (state) => {
      if (!state.meta.backgroundTransactionIds.includes(txStatusId)) {
        state.meta.backgroundTransactionIds.push(txStatusId);
      }
    });
  },

  /**
   * Remove a transaction from background mode
   */
  removeFromBackgroundTransactions: (store: StoreApi<WalletMeshState>, txStatusId: string) => {
    mutateState(store, (state) => {
      const index = state.meta.backgroundTransactionIds.indexOf(txStatusId);
      if (index !== -1) {
        state.meta.backgroundTransactionIds.splice(index, 1);
      }
    });
  },

  /**
   * Clear all completed background transactions
   */
  clearCompletedBackgroundTransactions: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      state.meta.backgroundTransactionIds = state.meta.backgroundTransactionIds.filter((txStatusId) => {
        const tx = state.entities.transactions[txStatusId];
        return tx && tx.status !== 'confirmed' && tx.status !== 'failed';
      });
    });
  },
};

/**
 * Helper to map transaction status to stage name
 */
function getStageFromStatus(
  status: TransactionStatus,
): keyof AztecTransactionResult['stages'] | null {
  const stageMap: Record<TransactionStatus, keyof AztecTransactionResult['stages'] | null> = {
    idle: null,
    simulating: 'simulating',
    proving: 'proving',
    sending: 'sending',
    pending: 'pending',
    confirming: 'confirming',
    confirmed: 'confirmed',
    failed: null,
  };
  return stageMap[status];
}
