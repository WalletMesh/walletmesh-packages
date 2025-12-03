/**
 * Aztec transaction lifecycle actions
 *
 * Actions for managing Aztec transactions with sync/async modes and stage timing
 */

import type { StoreApi } from 'zustand';
import type { WalletMeshState } from '../store.js';
import type { AztecTransactionResult, StageTiming } from '../types/aztecTransactions.js';
import type { TransactionStatus } from '../../services/transaction/types.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';

/**
 * Helper to properly handle immer state mutations
 * When using immer middleware, the state is a draft that can be mutated directly
 */
const mutateState = (store: StoreApi<WalletMeshState>, updater: (state: WalletMeshState) => void) => {
  // Cast to the expected immer type where the updater returns void
  (store.setState as (updater: (state: WalletMeshState) => void) => void)(updater);
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
      console.log('[aztecTransactionActions:addAztecTransaction] Adding transaction:', {
        txStatusId: transaction.txStatusId,
        status: transaction.status,
        mode: transaction.mode,
      });

      const existing = state.entities.transactions[transaction.txStatusId];
      if (existing) {
        console.log('[aztecTransactionActions:addAztecTransaction] OVERWRITING existing transaction:', {
          existingStatus: existing.status,
          newStatus: transaction.status,
        });
      }

      // Add transaction to entities (keyed by status tracking ID)
      state.entities.transactions[transaction.txStatusId] = transaction;

      // If it's async mode, add to background transactions
      if (transaction.mode === 'async') {
        if (!state.meta.backgroundTransactionIds.includes(transaction.txStatusId)) {
          state.meta.backgroundTransactionIds.push(transaction.txStatusId);
        }
      } else {
        // If it's sync mode, set as active transaction
        console.log('[aztecTransactionActions:addAztecTransaction] Setting active.transactionId to:', transaction.txStatusId, '(was:', state.active.transactionId, ')');
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
      if (tx?.stages?.[stage]) {
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

        // If transaction is complete (confirmed or failed), remove from background list immediately
        // The UI component (BackgroundTransactionIndicator) handles the visual delay before hiding
        if (status === 'confirmed' || status === 'failed') {
          if (!tx.endTime) {
            tx.endTime = now;
          }
          const bgIndex = state.meta.backgroundTransactionIds.indexOf(txStatusId);
          if (bgIndex !== -1) {
            // Remove immediately - UI handles display timing via completedDuration prop
            state.meta.backgroundTransactionIds.splice(bgIndex, 1);
          }
          // NOTE: Don't clear active.transactionId here - let the hooks handle it
          // with a 2.5 second delay so users can see the success/failure state.
          // Both useAztecDeploy.ts and LazyAztecRouterProvider.ts have their own
          // setTimeout(..., 2500) to clear the overlay after showing the result.
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
   * Remove an Aztec transaction from the store
   */
  removeAztecTransaction: (store: StoreApi<WalletMeshState>, txStatusId: string) => {
    mutateState(store, (state) => {
      // Remove from entities
      delete state.entities.transactions[txStatusId];

      // Remove from background list if present
      const bgIndex = state.meta.backgroundTransactionIds.indexOf(txStatusId);
      if (bgIndex !== -1) {
        state.meta.backgroundTransactionIds.splice(bgIndex, 1);
      }

      // Clear active transaction if it was the removed one
      if (state.active.transactionId === txStatusId) {
        state.active.transactionId = null;
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

  /**
   * Fail all active Aztec transactions when session ends
   *
   * Called when a wallet session is terminated or disconnected.
   * Marks all non-complete transactions as failed and removes them from background list.
   *
   * @param store - Zustand store instance
   * @param reason - Reason for session termination
   */
  failAllActiveTransactions: (store: StoreApi<WalletMeshState>, reason = 'Session disconnected') => {
    mutateState(store, (state) => {
      const now = Date.now();

      // Iterate through all transactions
      for (const [txStatusId, tx] of Object.entries(state.entities.transactions)) {
        const aztecTx = tx as AztecTransactionResult | undefined;

        // Fail transactions that aren't already complete
        if (aztecTx && aztecTx.status !== 'confirmed' && aztecTx.status !== 'failed') {
          aztecTx.status = 'failed';
          aztecTx.endTime = now;
          aztecTx.error = ErrorFactory.connectionFailed(reason);

          // Remove from background list
          const bgIndex = state.meta.backgroundTransactionIds.indexOf(txStatusId);
          if (bgIndex !== -1) {
            state.meta.backgroundTransactionIds.splice(bgIndex, 1);
          }

          // Clear active transaction if it matches
          if (state.active.transactionId === txStatusId) {
            state.active.transactionId = null;
          }
        }
      }

      // Clear transaction status
      state.meta.transactionStatus = 'idle';
    });
  },
};

/**
 * Helper to map transaction status to stage name
 */
function getStageFromStatus(status: TransactionStatus): keyof AztecTransactionResult['stages'] | null {
  const stageMap: Record<TransactionStatus, keyof AztecTransactionResult['stages'] | null> = {
    idle: null,
    initiated: null,
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
