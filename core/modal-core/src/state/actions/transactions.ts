/**
 * Transaction actions for unified WalletMesh store
 *
 * External action functions for managing transaction state
 * using normalized state structure.
 */

import type { StoreApi } from 'zustand';
import type { ModalError } from '../../internal/core/errors/types.js';
import {
  blockHashSchema,
  blockNumberSchema,
  failureReasonSchema,
  transactionIdSchema,
  transactionStatusSchema,
} from '../../schemas/actions.js';
import type {
  TransactionError,
  TransactionResult,
  TransactionStatus,
} from '../../services/transaction/types.js';
import { parseWithErrorFactory } from '../../utils/zodHelpers.js';
import type { WalletMeshState } from '../store.js';
import { getAllTransactions } from '../store.js';

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
 * Transaction action functions
 */
export const transactionActions = {
  /**
   * Add a transaction to normalized state
   */
  addTransaction: (store: StoreApi<WalletMeshState>, transaction: TransactionResult) => {
    mutateState(store, (state) => {
      // Add or update transaction in normalized entities
      state.entities.transactions[transaction.txStatusId] = transaction;

      // Set as active transaction
      state.active.transactionId = transaction.txStatusId;

      // Keep only the last 100 transactions (cleanup old ones)
      const allTxIds = Object.keys(state.entities.transactions);
      if (allTxIds.length > 100) {
        // Sort by timestamp (assuming transactions have a timestamp field)
        const sortedTxs = allTxIds
          .map((id) => ({ id, tx: state.entities.transactions[id] }))
          .sort((a, b) => {
            const txA = a.tx as TransactionResult | null;
            const txB = b.tx as TransactionResult | null;
            const timeA = txA?.startTime || 0;
            const timeB = txB?.startTime || 0;
            return timeB - timeA;
          });

        // Keep only the most recent 100
        const toKeep = new Set(sortedTxs.slice(0, 100).map((item) => item.id));
        for (const id of Object.keys(state.entities.transactions)) {
          if (!toKeep.has(id)) {
            delete state.entities.transactions[id];
          }
        }
      }
    });
  },

  /**
   * Update an existing transaction in normalized state
   */
  updateTransaction: (
    store: StoreApi<WalletMeshState>,
    txId: string,
    updates: Partial<TransactionResult>,
  ) => {
    // Validate transaction ID
    const validatedTxId = parseWithErrorFactory(transactionIdSchema, txId, 'Invalid transaction ID');

    mutateState(store, (state) => {
      const tx = state.entities.transactions[validatedTxId];
      if (tx) {
        // Filter out undefined values to comply with exactOptionalPropertyTypes
        const definedUpdates = Object.entries(updates).reduce<Partial<TransactionResult>>(
          (acc, [key, value]) => {
            if (value !== undefined) {
              (acc as Record<string, unknown>)[key] = value;
            }
            return acc;
          },
          {},
        );

        state.entities.transactions[validatedTxId] = {
          ...tx,
          ...definedUpdates,
        } as TransactionResult;
      }
    });
  },

  /**
   * Set the current active transaction in normalized state
   */
  setCurrentTransaction: (store: StoreApi<WalletMeshState>, transaction: TransactionResult | null) => {
    if (transaction) {
      mutateState(store, (state) => {
        // Ensure transaction exists in entities
        state.entities.transactions[transaction.txStatusId] = transaction;
        // Set as active
        state.active.transactionId = transaction.txStatusId;
      });
    } else {
      mutateState(store, (state) => {
        state.active.transactionId = null;
      });
    }
  },

  /**
   * Set global transaction status
   */
  setStatus: (store: StoreApi<WalletMeshState>, status: TransactionStatus) => {
    mutateState(store, (state) => {
      state.meta.transactionStatus = status;
    });
  },

  /**
   * Set transaction error in normalized state
   */
  setError: (store: StoreApi<WalletMeshState>, error: TransactionError | null) => {
    mutateState(store, (state) => {
      if (error) {
        // Store error in errors map with transaction context
        state.ui.errors['transaction'] = {
          code: error.code,
          message: error.message,
          category: error.category || 'transaction',
          recoveryStrategy: (error as ModalError).recoveryStrategy,
          data: (error as ModalError).data,
        } as ModalError;
        state.meta.transactionStatus = 'failed';
      } else {
        // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
        delete state.ui.errors['transaction'];
      }
    });
  },

  /**
   * Clear transaction error
   */
  clearError: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.errors['transaction'];
      if (state.meta.transactionStatus === 'failed') {
        state.meta.transactionStatus = 'idle';
      }
    });
  },

  /**
   * Remove a transaction from normalized state
   */
  removeTransaction: (store: StoreApi<WalletMeshState>, txId: string) => {
    // Validate transaction ID
    const validatedTxId = parseWithErrorFactory(transactionIdSchema, txId, 'Invalid transaction ID');

    mutateState(store, (state) => {
      // Remove from normalized entities
      delete state.entities.transactions[validatedTxId];

      // Clear active transaction if it was removed
      if (state.active.transactionId === validatedTxId) {
        state.active.transactionId = null;
      }
    });
  },

  /**
   * Clear all transactions from normalized state
   */
  clearAllTransactions: (store: StoreApi<WalletMeshState>) => {
    mutateState(store, (state) => {
      state.entities.transactions = {};
      state.active.transactionId = null;
      // biome-ignore lint/performance/noDelete: Required for exactOptionalPropertyTypes
      delete state.ui.errors['transaction'];
      state.meta.transactionStatus = 'idle';
    });
  },

  /**
   * Get transaction by ID from normalized state (convenience method)
   */
  getTransaction: (store: StoreApi<WalletMeshState>, txId: string): TransactionResult | undefined => {
    // Validate transaction ID
    const validatedTxId = parseWithErrorFactory(transactionIdSchema, txId, 'Invalid transaction ID');
    const state = store.getState();
    return state.entities.transactions[validatedTxId];
  },

  /**
   * Get all transactions from normalized state (convenience method)
   */
  getTransactionHistory: (store: StoreApi<WalletMeshState>): TransactionResult[] => {
    return getAllTransactions(store.getState());
  },

  /**
   * Get transactions by status from normalized state
   */
  getTransactionsByStatus: (
    store: StoreApi<WalletMeshState>,
    status: TransactionStatus,
  ): TransactionResult[] => {
    // Validate status
    const validatedStatus = parseWithErrorFactory(
      transactionStatusSchema,
      status,
      'Invalid transaction status',
    );

    const state = store.getState();
    return Object.values(state.entities.transactions).filter((tx) => tx.status === validatedStatus);
  },

  /**
   * Get pending transactions from normalized state
   */
  getPendingTransactions: (store: StoreApi<WalletMeshState>): TransactionResult[] => {
    const state = store.getState();
    return Object.values(state.entities.transactions).filter(
      (tx) =>
        tx.status === 'simulating' ||
        tx.status === 'proving' ||
        tx.status === 'sending' ||
        tx.status === 'pending' ||
        tx.status === 'confirming',
    );
  },

  /**
   * Mark transaction as confirmed
   */
  confirmTransaction: (
    store: StoreApi<WalletMeshState>,
    txId: string,
    blockNumber?: number,
    blockHash?: string,
  ) => {
    // Validate transaction ID
    const validatedTxId = parseWithErrorFactory(transactionIdSchema, txId, 'Invalid transaction ID');

    // Validate block number if provided
    if (blockNumber !== undefined) {
      parseWithErrorFactory(blockNumberSchema, blockNumber, 'Invalid block number');
    }

    // Validate block hash if provided
    if (blockHash !== undefined) {
      parseWithErrorFactory(blockHashSchema, blockHash, 'Invalid block hash');
    }

    transactionActions.updateTransaction(store, validatedTxId, {
      status: 'confirmed',
      ...(blockNumber !== undefined && { blockNumber }),
      ...(blockHash !== undefined && { blockHash }),
      endTime: Date.now(),
    });
  },

  /**
   * Mark transaction as failed
   */
  failTransaction: (store: StoreApi<WalletMeshState>, txId: string, reason?: string) => {
    // Validate transaction ID
    const validatedTxId = parseWithErrorFactory(transactionIdSchema, txId, 'Invalid transaction ID');

    // Validate reason if provided
    if (reason !== undefined) {
      parseWithErrorFactory(failureReasonSchema, reason, 'Invalid failure reason');
    }

    transactionActions.updateTransaction(store, validatedTxId, {
      status: 'failed',
      ...(reason && {
        error: { code: 'TRANSACTION_FAILED', message: reason, category: 'wallet' } as TransactionError,
      }),
      endTime: Date.now(),
    });
  },
};
