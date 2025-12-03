/**
 * Aztec batch transaction hook for managing multiple transactions
 *
 * Provides a React hook for executing multiple Aztec transactions in batch,
 * with progress tracking and error handling for each transaction.
 *
 * @module hooks/useAztecBatch
 */

import {
  ErrorFactory,
  type AztecTransactionManager,
  ChainType,
  aztecTransactionActions,
} from '@walletmesh/modal-core';
import type { ContractFunctionInteraction, TxReceipt } from '@walletmesh/modal-core/providers/aztec/lazy';
import type { AztecSendOptions } from '@walletmesh/modal-core/providers/aztec';
import { executeAtomicBatch } from '@walletmesh/modal-core/providers/aztec';
import { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { useAztecWallet } from './useAztecWallet.js';
import { useStoreInstance } from './internal/useStore.js';
import { createComponentLogger } from '../utils/logger.js';

/**
 * Batch transaction status for individual transactions
 *
 * @public
 */
export interface BatchTransactionStatus {
  /** Index of the transaction in the batch */
  index: number;
  /** Current status of the transaction */
  status: 'pending' | 'sending' | 'confirming' | 'success' | 'error';
  /** Transaction hash if available */
  hash?: string;
  /** Receipt if transaction completed */
  receipt?: TxReceipt;
  /** Error if transaction failed */
  error?: Error;
}

/**
 * Options for batch transaction execution.
 *
 * @public
 */
export interface BatchSendOptions extends AztecSendOptions {
  /**
   * Enable atomic batch execution using Aztec's native BatchCall.
   *
   * When enabled:
   * - All operations execute as a single transaction with one proof
   * - All operations succeed together or all fail together (atomicity)
   * - More efficient than sequential execution
   * - Single transaction status instead of multiple
   *
   * When disabled (default):
   * - Operations execute sequentially one-by-one
   * - Each operation has its own transaction and proof
   * - Individual operations can fail independently
   * - Progress tracking for each transaction
   *
   * @default false
   */
  atomic?: boolean;
}

/**
 * Batch transaction hook return type
 *
 * @public
 */
export interface UseAztecBatchReturn {
  /** Execute a batch of transactions */
  executeBatch: (
    interactions: ContractFunctionInteraction[],
    options?: BatchSendOptions,
  ) => Promise<TxReceipt[]>;
  /** Status of each transaction in the current/last batch */
  transactionStatuses: BatchTransactionStatus[];
  /** Whether a batch is currently executing */
  isExecuting: boolean;
  /** Current batch execution mode (null when not executing) */
  batchMode: 'atomic' | 'sequential' | null;
  /** Overall batch progress (0-100) */
  progress: number;
  /** Total number of transactions in current batch */
  totalTransactions: number;
  /** Number of completed transactions */
  completedTransactions: number;
  /** Number of failed transactions */
  failedTransactions: number;
  /** Clear transaction statuses */
  clearStatuses: () => void;
  /** Any overall batch error */
  error: Error | null;
}

/**
 * Hook for executing multiple Aztec transactions in batch
 *
 * This hook provides functionality for executing multiple contract
 * interactions together, with individual progress tracking and error
 * handling for each transaction. Transactions are executed sequentially
 * but tracked as a batch.
 *
 * @returns Batch transaction functions and state
 *
 * @since 1.0.0
 *
 * @remarks
 * The hook provides two execution modes:
 *
 * **Sequential Mode (default)**:
 * - Transactions execute one-by-one
 * - Each transaction gets its own proof
 * - Individual transactions can fail independently
 * - Detailed progress tracking for each transaction
 *
 * **Atomic Mode** (via `{ atomic: true }` option):
 * - All transactions execute as a single atomic batch
 * - Single proof for all operations (more efficient)
 * - All operations succeed together or all fail together
 * - Uses Aztec's native BatchCall functionality
 *
 * Features:
 * - Batch transaction execution
 * - Individual/unified transaction status tracking
 * - Progress calculation
 * - Error handling
 * - Success/failure counting
 *
 * @example
 * ```tsx
 * import { useAztecBatch, useAztecContract } from '@walletmesh/modal-react';
 *
 * function BatchTransfer({ tokenAddress, TokenArtifact }) {
 *   const { executeBatch, transactionStatuses, progress } = useAztecBatch();
 *   const { contract: tokenContract } = useAztecContract(tokenAddress, TokenArtifact);
 *
 *   const handleBatchTransfer = async () => {
 *     if (!tokenContract) return;
 *
 *     const interactions = [
 *       tokenContract.methods.transfer(address1, amount1),
 *       tokenContract.methods.transfer(address2, amount2),
 *       tokenContract.methods.transfer(address3, amount3),
 *     ];
 *
 *     try {
 *       const receipts = await executeBatch(interactions);
 *       console.log('All transfers completed:', receipts);
 *     } catch (error) {
 *       console.error('Some transfers failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleBatchTransfer} disabled={!tokenContract}>
 *         Send Batch Transfers
 *       </button>
 *
 *       {transactionStatuses.length > 0 && (
 *         <div>
 *           <progress value={progress} max={100} />
 *           <p>{progress}% complete</p>
 *
 *           {transactionStatuses.map((status) => (
 *             <div key={status.index}>
 *               Transaction {status.index + 1}: {status.status}
 *               {status.error && <span> - {status.error.message}</span>}
 *             </div>
 *           ))}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Atomic batch execution (all succeed or all fail together)
 * function AtomicBatchTransfer({ tokenAddress, TokenArtifact }) {
 *   const { executeBatch, progress, error } = useAztecBatch();
 *   const { contract: tokenContract } = useAztecContract(tokenAddress, TokenArtifact);
 *
 *   const handleAtomicBatch = async () => {
 *     if (!tokenContract) return;
 *
 *     const interactions = [
 *       tokenContract.methods.transfer(address1, amount1),
 *       tokenContract.methods.transfer(address2, amount2),
 *       tokenContract.methods.transfer(address3, amount3),
 *     ];
 *
 *     try {
 *       // Execute as atomic batch - single transaction with one proof
 *       const receipts = await executeBatch(interactions, { atomic: true });
 *       console.log('All transfers completed atomically:', receipts);
 *     } catch (error) {
 *       console.error('Entire batch failed:', error);
 *       // If any operation fails, ALL operations are reverted
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleAtomicBatch} disabled={!tokenContract}>
 *         Send Atomic Batch (All or Nothing)
 *       </button>
 *       {error && <p>Batch failed: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Complex batch with different contract interactions
 * function ComplexBatch() {
 *   const { executeBatch, completedTransactions, failedTransactions } = useAztecBatch();
 *
 *   const { contract: token1 } = useAztecContract(token1Address, TokenArtifact);
 *   const { contract: token2 } = useAztecContract(token2Address, TokenArtifact);
 *   const { contract: dex } = useAztecContract(dexAddress, DexArtifact);
 *
 *   const handleComplexBatch = async () => {
 *     if (!token1 || !token2 || !dex) return;
 *
 *     const interactions = [
 *       // Approve tokens for DEX
 *       token1.methods.approve(dexAddress, amount1),
 *       token2.methods.approve(dexAddress, amount2),
 *       // Add liquidity
 *       dex.methods.addLiquidity(token1Address, token2Address, amount1, amount2),
 *       // Stake LP tokens
 *       dex.methods.stakeLPTokens(lpAmount),
 *     ];
 *
 *     const receipts = await executeBatch(interactions);
 *
 *     console.log(`Completed: ${completedTransactions}, Failed: ${failedTransactions}`);
 *   };
 *
 *   return (
 *     <button onClick={handleComplexBatch}>
 *       Execute Complex Batch
 *     </button>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecBatch(): UseAztecBatchReturn {
  const { aztecWallet, isAvailable, isReady, chain } = useAztecWallet();
  const store = useStoreInstance();
  const logger = useMemo(() => createComponentLogger('useAztecBatch'), []);
  const [transactionStatuses, setTransactionStatuses] = useState<BatchTransactionStatus[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [batchMode, setBatchMode] = useState<'atomic' | 'sequential' | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Get or create transaction manager instance
  const getTransactionManager = useCallback(async (): Promise<AztecTransactionManager> => {
    if (!isReady || !aztecWallet) {
      throw ErrorFactory.connectionFailed('Aztec wallet is not ready. Please connect a wallet first.');
    }

    if (!chain) {
      throw ErrorFactory.configurationError('No chain information available');
    }

    // Dynamically import the AztecTransactionManager
    const { createAztecTransactionManager } = await import('@walletmesh/modal-core');

    return createAztecTransactionManager({
      store,
      chainId: chain.chainId,
      wallet: aztecWallet,
    });
  }, [isReady, aztecWallet, chain, store]);

  // Calculate derived values
  const totalTransactions = transactionStatuses.length;
  const completedTransactions = transactionStatuses.filter(
    (s) => s.status === 'success' || s.status === 'error',
  ).length;
  const failedTransactions = transactionStatuses.filter((s) => s.status === 'error').length;
  const progress = totalTransactions > 0 ? Math.round((completedTransactions / totalTransactions) * 100) : 0;

  // Execute batch function
  const executeBatchTransactions = useCallback(
    async (
      interactions: ContractFunctionInteraction[],
      options: BatchSendOptions = {},
    ): Promise<TxReceipt[]> => {
      if (!aztecWallet || !isAvailable) {
        throw ErrorFactory.connectionFailed('No Aztec wallet connected');
      }

      if (!Array.isArray(interactions) || interactions.length === 0) {
        throw ErrorFactory.invalidParams('No interactions provided');
      }

      const { atomic, ...sendOptions } = options;

      if (isMountedRef.current) {
        setIsExecuting(true);
        setBatchMode(atomic ? 'atomic' : 'sequential');
        setError(null);

        // Initialize statuses
        const initialStatuses: BatchTransactionStatus[] = interactions.map((_, index) => ({
          index,
          status: 'pending' as const,
        }));
        setTransactionStatuses(initialStatuses);
      }

      try {
        // ATOMIC MODE: Execute all as single transaction in background with tracking
        if (atomic) {
          logger.debug('Executing atomic batch in background', { count: interactions.length });

          // Generate transaction status ID
          const txStatusId = `batch-${Date.now()}-${Math.random().toString(16).slice(2)}`;

          // Create initial transaction entry in store
          const initialTransaction = {
            txStatusId,
            txHash: '',
            chainId: chain?.chainId || 'aztec-sandbox',
            chainType: ChainType.Aztec,
            walletId: 'aztec-wallet',
            status: 'idle' as const,
            from: '',
            request: {} as never,
            startTime: Date.now(),
            mode: 'async' as const,
            stages: {},
            // biome-ignore lint/suspicious/noExplicitAny: Placeholder wait function
            wait: async () => ({}) as any,
          };

          // Add to background transactions
          aztecTransactionActions.addAztecTransaction(store, initialTransaction);

          // Set initial status to 'sending' for all local statuses
          if (isMountedRef.current) {
            setTransactionStatuses((prev) =>
              prev.map((status) => ({
                ...status,
                status: 'sending',
              })),
            );
          }

          // Update transaction status to proving
          aztecTransactionActions.updateAztecTransactionStatus(store, txStatusId, 'proving');
          aztecTransactionActions.startTransactionStage(store, txStatusId, 'proving');

          // Execute atomic batch
          const sentTx = await executeAtomicBatch(aztecWallet, interactions, sendOptions);
          const hash = sentTx.txHash;

          // Update transaction hash
          if (hash) {
            aztecTransactionActions.updateAztecTransaction(store, txStatusId, {
              txHash: hash,
            });
          }

          // Update local statuses with hash (status updates driven by wallet notifications)
          if (isMountedRef.current && hash) {
            setTransactionStatuses((prev) =>
              prev.map((status) => ({
                ...status,
                ...(hash && { hash }),
              })),
            );
          }

          // Wait for receipt (status transitions handled by wallet notifications)
          const receipt = await sentTx.wait();

          // Update to confirmed status
          aztecTransactionActions.updateAztecTransactionStatus(store, txStatusId, 'confirmed');
          aztecTransactionActions.endTransactionStage(store, txStatusId, 'confirming');

          // Mark all local statuses as successful
          if (isMountedRef.current) {
            setTransactionStatuses((prev) =>
              prev.map((status) => ({
                ...status,
                status: 'success',
                ...(hash && { hash }),
                receipt,
              })),
            );
          }

          // Return the same receipt for all interactions since they were atomic
          return Array(interactions.length).fill(receipt);
        }

        // SEQUENTIAL MODE: Execute one-by-one using background transaction manager
        logger.debug('Executing sequential batch in background', { count: interactions.length });

        // Get transaction manager
        const manager = await getTransactionManager();

        // Track transaction IDs and results
        const txIds: string[] = [];
        const receipts: TxReceipt[] = [];
        const errors: Array<{ index: number; error: Error }> = [];

        // Execute each interaction sequentially in the background
        for (let index = 0; index < interactions.length; index++) {
          const interaction = interactions[index];
          if (!interaction) continue;

          try {
            // Set status to 'sending' for this transaction
            if (isMountedRef.current) {
              setTransactionStatuses((prev) => {
                const updated = [...prev];
                const current = updated[index];
                if (current) {
                  updated[index] = {
                    ...current,
                    status: 'sending',
                  };
                }
                return updated;
              });
            }

            // Execute transaction in background
            const txId = await manager.executeAsync(interaction, {
              onSuccess: (tx) => {
                if (!isMountedRef.current) return;
                logger.debug('Sequential transaction completed', { index, txHash: tx.txHash });

                // Update local status to success
                setTransactionStatuses((prev) => {
                  const updated = [...prev];
                  const current = updated[index];
                  if (current) {
                    updated[index] = {
                      ...current,
                      status: 'success',
                      hash: tx.txHash,
                      receipt: tx.receipt as unknown as TxReceipt,
                    };
                  }
                  return updated;
                });
              },
              onError: (error) => {
                if (!isMountedRef.current) return;
                logger.error('Sequential transaction failed', { index, error });

                // Update local status to error
                setTransactionStatuses((prev) => {
                  const updated = [...prev];
                  const current = updated[index];
                  if (current) {
                    updated[index] = {
                      ...current,
                      status: 'error',
                      error,
                    };
                  }
                  return updated;
                });
              },
            });

            txIds.push(txId);

            // Wait for this transaction to complete before starting the next
            const getTransaction = (id: string) => manager.getTransaction(id);
            // biome-ignore lint/suspicious/noExplicitAny: Transaction type inferred from manager
            const tx = await new Promise<any>((resolve, reject) => {
              const checkStatus = () => {
                const currentTx = getTransaction(txId);
                if (!currentTx) {
                  reject(new Error('Transaction not found'));
                  return;
                }

                if (currentTx.status === 'confirmed') {
                  resolve(currentTx);
                } else if (currentTx.status === 'failed') {
                  reject(currentTx.error || new Error('Transaction failed'));
                } else {
                  // Check again after a delay
                  setTimeout(checkStatus, 500);
                }
              };
              checkStatus();
            });

            receipts.push(tx.receipt);
          } catch (error) {
            errors.push({ index, error: error as Error });
            // biome-ignore lint/suspicious/noExplicitAny: Null receipt for failed transaction
            receipts.push(null as any); // Placeholder for failed transaction
          }
        }

        // Check if all failed
        if (errors.length === interactions.length) {
          const batchError = ErrorFactory.transactionFailed(
            `All ${interactions.length} transactions failed. First error: ${errors[0]?.error.message}`,
          );
          if (isMountedRef.current) {
            setError(batchError);
          }
          throw batchError;
        }

        // Warn about partial failures
        if (errors.length > 0) {
          logger.warn(
            `Batch execution partially failed. Failed transactions: ${errors.map((e) => e.index + 1).join(', ')}`,
          );
        }

        return receipts;
      } catch (err) {
        // Handle unexpected errors
        const batchError =
          err instanceof Error ? err : ErrorFactory.transactionFailed('Batch execution failed');
        if (isMountedRef.current) {
          setError(batchError);
        }
        throw batchError;
      } finally {
        if (isMountedRef.current) {
          setIsExecuting(false);
          setBatchMode(null);
        }
      }
    },
    [aztecWallet, isAvailable, logger, getTransactionManager, chain?.chainId, store],
  );

  // Clear statuses function
  const clearStatuses = useCallback(() => {
    setTransactionStatuses([]);
    setError(null);
  }, []);

  return {
    executeBatch: executeBatchTransactions,
    transactionStatuses,
    isExecuting,
    batchMode,
    progress,
    totalTransactions,
    completedTransactions,
    failedTransactions,
    clearStatuses,
    error,
  };
}
