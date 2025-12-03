/**
 * Aztec Transaction Manager
 *
 * Provides sync (blocking with overlay) and async (background) transaction execution
 * with full lifecycle tracking from simulation through confirmation.
 */

import type { StoreApi } from 'zustand';
import { ChainType } from '../../types.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { aztecTransactionActions } from '../../state/actions/aztecTransactions.js';
import type { WalletMeshState } from '../../state/store.js';
import type {
  AztecTransactionResult,
  TransactionCallbacks,
  TransactionMode,
} from '../../state/types/aztecTransactions.js';
import type { TransactionStatus } from './types.js';
import type { AztecDappWallet, ContractFunctionInteraction } from '../../providers/aztec/types.js';
import { executeTx } from '../../providers/aztec/utils.js';

// Re-export ContractFunctionInteraction for convenience
export type { ContractFunctionInteraction };

/**
 * Configuration options for the Aztec Transaction Manager
 */
export interface AztecTransactionManagerConfig {
  /** Zustand store for state management */
  store: StoreApi<WalletMeshState>;
  /** Chain ID for Aztec network */
  chainId: string;
  /** Aztec wallet instance */
  wallet: AztecDappWallet;
}

/**
 * Aztec Transaction Manager
 *
 * Orchestrates transaction lifecycle with support for sync and async modes.
 * Integrates with state management for real-time status updates.
 */
export class AztecTransactionManager {
  private store: StoreApi<WalletMeshState>;
  private chainId: string;
  private wallet: AztecDappWallet;
  private txCounter = 0;

  constructor(config: AztecTransactionManagerConfig) {
    this.store = config.store;
    this.chainId = config.chainId;
    this.wallet = config.wallet;
  }

  /**
   * Execute transaction synchronously (blocking with overlay)
   *
   * This method blocks until the transaction is confirmed or fails.
   * The UI will show a status overlay during execution.
   *
   * @param interaction - Contract function interaction from Aztec.js
   * @returns Transaction receipt
   */
  async executeSync(interaction: ContractFunctionInteraction): Promise<unknown> {
    console.log('[AztecTransactionManager:executeSync] Starting executeSync');

    // Create placeholder transaction IMMEDIATELY (before wallet call)
    // This ensures the overlay appears during wallet approval
    const placeholderTxStatusId = this.generateTxStatusId();
    const placeholderTransaction = this.createTransaction(placeholderTxStatusId, 'sync');
    aztecTransactionActions.addAztecTransaction(this.store, placeholderTransaction);

    console.log('[AztecTransactionManager:executeSync] Created placeholder transaction:', placeholderTxStatusId);

    try {
      // Execute transaction - wallet will send notifications
      // Notification handler will detect our placeholder and update it (via walletTxStatusId mapping)
      const { txStatusId, receipt } = await this.executeWithLifecycle(interaction, 'sync');

      // Clean up placeholder if wallet returned a different txStatusId
      // This handles the case where wallet notifications already created the transaction
      if (placeholderTxStatusId !== txStatusId) {
        console.log('[AztecTransactionManager:executeSync] Cleaning up placeholder:', placeholderTxStatusId, 'actual:', txStatusId);
        aztecTransactionActions.removeAztecTransaction(this.store, placeholderTxStatusId);
      }

      console.log('[AztecTransactionManager:executeSync] Completed successfully');
      return receipt;
    } catch (error) {
      console.log('[AztecTransactionManager:executeSync] Failed with error:', error);
      // Mark placeholder as failed
      aztecTransactionActions.updateAztecTransactionStatus(this.store, placeholderTxStatusId, 'failed');
      throw error;
    }
  }

  /**
   * Execute transaction asynchronously (background)
   *
   * This method returns immediately with the transaction status ID.
   * Transaction proceeds in background while user continues working.
   * Callbacks are invoked as transaction progresses.
   *
   * @param interaction - Contract function interaction from Aztec.js
   * @param callbacks - Optional callbacks for lifecycle events
   * @returns Transaction status ID for tracking
   */
  async executeAsync(
    interaction: ContractFunctionInteraction,
    callbacks?: TransactionCallbacks,
  ): Promise<string> {
    // Create placeholder transaction with temporary ID
    const tempTxStatusId = this.generateTxStatusId();
    const transaction = this.createTransaction(tempTxStatusId, 'async');

    // Add transaction to store (async mode - adds to background list)
    aztecTransactionActions.addAztecTransaction(this.store, transaction);

    // Execute in background
    this.executeInBackground(interaction, 'async', tempTxStatusId, callbacks);

    // Return transaction status ID immediately
    // Note: The actual wallet txStatusId may be different and will replace this
    return tempTxStatusId;
  }

  /**
   * Execute transaction with full lifecycle tracking
   *
   * @returns Object with txStatusId and receipt
   */
  private async executeWithLifecycle(
    interaction: ContractFunctionInteraction,
    mode: TransactionMode,
  ): Promise<{ txStatusId: string; receipt: unknown }> {
    console.log('[AztecTransactionManager:executeWithLifecycle] Called executeTx, awaiting...');

    // Execute transaction to get wallet's txStatusId
    // The wallet will send notifications ('initiated', 'proving', 'sending', etc.)
    // with its own txStatusId, which will create/update the transaction in the store
    const sentTx = await executeTx(this.wallet, interaction);

    console.log('[AztecTransactionManager:executeWithLifecycle] executeTx returned:', {
      txHash: sentTx.txHash,
      txStatusId: sentTx.txStatusId,
      hasTxStatusId: !!sentTx.txStatusId,
    });

    // Determine which txStatusId to use:
    // 1. If wallet returned a txStatusId, use that
    // 2. If not, check if notifications already created an active transaction
    // 3. Only generate a new ID as last resort
    let txStatusId: string;
    if (sentTx.txStatusId) {
      txStatusId = sentTx.txStatusId;
      console.log('[AztecTransactionManager:executeWithLifecycle] Using txStatusId from wallet:', txStatusId);
    } else {
      // Check if notifications already created a transaction that's now active
      const activeId = this.store.getState().active.transactionId;
      if (activeId) {
        // Use the existing active transaction created by notifications
        txStatusId = activeId;
        console.log('[AztecTransactionManager:executeWithLifecycle] Using active transaction from notifications:', txStatusId);
      } else {
        // No active transaction, generate new ID (fallback for edge cases)
        txStatusId = this.generateTxStatusId();
        console.log('[AztecTransactionManager:executeWithLifecycle] Generated new txStatusId (no active transaction):', txStatusId);
      }
    }

    // Create transaction in store ONLY if wallet hasn't already (via notifications)
    // This handles the case where notifications haven't arrived yet
    const existingTx = this.getTransaction(txStatusId);

    console.log('[AztecTransactionManager:executeWithLifecycle] existingTx:', existingTx ? 'FOUND' : 'NOT FOUND');

    if (!existingTx) {
      console.log('[AztecTransactionManager:executeWithLifecycle] Creating new transaction with status idle');
      const transaction = this.createTransaction(txStatusId, mode);
      aztecTransactionActions.addAztecTransaction(this.store, transaction);
    } else {
      console.log('[AztecTransactionManager:executeWithLifecycle] Using existing transaction with status:', existingTx.status);
    }

    // Update transaction hash (blockchain identifier)
    if (sentTx.txHash) {
      aztecTransactionActions.updateAztecTransaction(this.store, txStatusId, {
        txHash: sentTx.txHash,
      });
    }

    // Wait for confirmation
    // The wallet will send 'confirming' and 'confirmed' notifications
    console.log('[AztecTransactionManager:executeWithLifecycle] Calling sentTx.wait()...');
    const receipt = await sentTx.wait();
    console.log('[AztecTransactionManager:executeWithLifecycle] sentTx.wait() returned receipt');

    return { txStatusId, receipt };
  }

  /**
   * Execute transaction in background with callbacks
   */
  private async executeInBackground(
    interaction: ContractFunctionInteraction,
    mode: TransactionMode,
    tempTxStatusId: string,
    callbacks?: TransactionCallbacks,
  ): Promise<void> {
    try {
      const { txStatusId } = await this.executeWithLifecycle(interaction, mode);

      // Remove the temporary transaction if it's different from the wallet's
      if (tempTxStatusId !== txStatusId) {
        // Remove temp transaction from store
        const state = this.store.getState();
        if (state.entities.transactions[tempTxStatusId]) {
          delete state.entities.transactions[tempTxStatusId];
          this.store.setState(state);
        }
      }

      // Success callback - get the transaction using the wallet's txStatusId
      if (callbacks?.onSuccess) {
        const transaction = this.getTransaction(txStatusId);
        if (transaction) {
          callbacks.onSuccess(transaction);
        }
      }
    } catch (error) {
      // Clean up temporary transaction if it exists
      const tempTx = this.getTransaction(tempTxStatusId);
      if (tempTx) {
        this.updateStatus(tempTxStatusId, 'failed');
      }

      // Error callback
      if (callbacks?.onError) {
        callbacks.onError(error as Error);
      }
    }
  }

  /**
   * Update transaction status and trigger callbacks
   */
  private updateStatus(txStatusId: string, status: TransactionStatus): void {
    aztecTransactionActions.updateAztecTransactionStatus(this.store, txStatusId, status);

    // Get updated transaction and trigger status change callback
    const transaction = this.getTransaction(txStatusId);
    if (transaction) {
      // Callbacks would be stored separately if needed
      // For now, callbacks are only available in executeAsync context
    }
  }

  /**
   * Get transaction by status tracking ID
   */
  getTransaction(txStatusId: string): AztecTransactionResult | undefined {
    const state = this.store.getState();
    return state.entities.transactions[txStatusId] as AztecTransactionResult | undefined;
  }

  /**
   * Generate unique transaction status tracking ID
   *
   * Uses crypto.randomUUID() when available for collision-resistant IDs.
   * This ID is used internally for coordinating status notifications between
   * backend and frontend - it is NOT the blockchain transaction hash.
   */
  private generateTxStatusId(): string {
    try {
      const globalObj = globalThis as typeof globalThis & {
        crypto?: { randomUUID?: () => string };
      };
      const cryptoObj = globalObj?.crypto;
      if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
        return cryptoObj.randomUUID();
      }
    } catch {
      // Ignore and fall back to timestamp-based ID
    }
    // Fallback: timestamp + counter + random for collision resistance
    return `aztec-status-${Date.now().toString(16)}-${++this.txCounter}-${Math.random().toString(16).slice(2)}`;
  }

  /**
   * Create initial transaction result
   */
  private createTransaction(txStatusId: string, mode: TransactionMode): AztecTransactionResult {
    return {
      txStatusId,
      txHash: '', // Will be populated when available (blockchain identifier)
      chainId: this.chainId,
      chainType: ChainType.Aztec,
      walletId: 'aztec-wallet', // TODO: Get from context
      status: 'idle',
      from: '', // TODO: Get from wallet
      request: {} as never, // TODO: Proper request object
      startTime: Date.now(),
      mode,
      stages: {},
      wait: async () => {
        // Wait for transaction to complete
        return new Promise((resolve, reject) => {
          const checkStatus = () => {
            const tx = this.getTransaction(txStatusId);
            if (!tx) {
              reject(ErrorFactory.configurationError('Transaction not found', { txStatusId }));
              return;
            }

            if (tx.status === 'confirmed' && tx.receipt) {
              resolve(tx.receipt);
            } else if (tx.status === 'failed') {
              reject(tx.error || ErrorFactory.configurationError('Transaction failed'));
            } else {
              // Check again after a delay
              setTimeout(checkStatus, 500);
            }
          };

          checkStatus();
        });
      },
    };
  }
}

/**
 * Create an Aztec Transaction Manager instance
 *
 * @param config - Manager configuration
 * @returns Configured transaction manager
 */
export function createAztecTransactionManager(
  config: AztecTransactionManagerConfig,
): AztecTransactionManager {
  return new AztecTransactionManager(config);
}
