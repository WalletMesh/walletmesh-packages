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
    const txStatusId = this.generateTxStatusId();
    const transaction = this.createTransaction(txStatusId, 'sync');

    try {
      // Add transaction to store (sync mode)
      aztecTransactionActions.addAztecTransaction(this.store, transaction);

      // Execute transaction with lifecycle tracking
      return await this.executeWithLifecycle(interaction, transaction);
    } catch (error) {
      // Update transaction as failed
      this.updateStatus(txStatusId, 'failed');
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
    const txStatusId = this.generateTxStatusId();
    const transaction = this.createTransaction(txStatusId, 'async');

    // Add transaction to store (async mode - adds to background list)
    aztecTransactionActions.addAztecTransaction(this.store, transaction);

    // Execute in background
    this.executeInBackground(interaction, transaction, callbacks);

    // Return transaction status ID immediately
    return txStatusId;
  }

  /**
   * Execute transaction with full lifecycle tracking
   */
  private async executeWithLifecycle(
    interaction: ContractFunctionInteraction,
    transaction: AztecTransactionResult,
  ): Promise<unknown> {
    // Small delay to ensure React has time to render the initial 'idle' state
    // before transitioning to 'proving'
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Stage 1: Proving - This encompasses simulation, proof generation, and sending
    // The wallet handles these internally during executeTx()
    this.updateStatus(transaction.txStatusId, 'proving');
    aztecTransactionActions.startTransactionStage(this.store, transaction.txStatusId, 'proving');

    // Execute transaction - this is the long operation (60-120 seconds)
    // Handles simulation, proving, and sending internally
    const sentTx = await executeTx(this.wallet, interaction);

    // Update transaction hash (blockchain identifier)
    if (sentTx.txHash) {
      aztecTransactionActions.updateAztecTransaction(this.store, transaction.txStatusId, {
        txHash: sentTx.txHash,
      });
    }

    // Stage 2: Confirming - waiting for network confirmation
    this.updateStatus(transaction.txStatusId, 'confirming');
    aztecTransactionActions.endTransactionStage(this.store, transaction.txStatusId, 'proving');
    aztecTransactionActions.startTransactionStage(this.store, transaction.txStatusId, 'confirming');

    // Wait for confirmation (few seconds)
    const receipt = await sentTx.wait();

    // Stage 3: Confirmed - transaction complete
    this.updateStatus(transaction.txStatusId, 'confirmed');
    aztecTransactionActions.endTransactionStage(this.store, transaction.txStatusId, 'confirming');

    return receipt;
  }

  /**
   * Execute transaction in background with callbacks
   */
  private async executeInBackground(
    interaction: ContractFunctionInteraction,
    transaction: AztecTransactionResult,
    callbacks?: TransactionCallbacks,
  ): Promise<void> {
    try {
      await this.executeWithLifecycle(interaction, transaction);

      // Success callback
      if (callbacks?.onSuccess) {
        const updatedTx = this.getTransaction(transaction.txStatusId);
        if (updatedTx) {
          callbacks.onSuccess(updatedTx);
        }
      }
    } catch (error) {
      // Update status to failed
      this.updateStatus(transaction.txStatusId, 'failed');

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
