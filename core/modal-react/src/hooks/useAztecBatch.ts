/**
 * Aztec batch transaction hook for managing multiple transactions
 *
 * Provides a React hook for executing multiple Aztec transactions in batch,
 * with progress tracking and error handling for each transaction.
 *
 * @module hooks/useAztecBatch
 */

import { ErrorFactory } from '@walletmesh/modal-core';
import type { ContractFunctionInteraction, TxReceipt } from '@walletmesh/modal-core/providers/aztec/lazy';
import type { AztecSendOptions } from '@walletmesh/modal-core/providers/aztec';
import {
  executeBatchInteractions,
  executeAtomicBatch,
  type ExecuteInteractionResult,
} from '@walletmesh/modal-core/providers/aztec';
import { useCallback, useState, useRef, useEffect } from 'react';
import { useAztecWallet } from './useAztecWallet.js';

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
  const { aztecWallet, isAvailable } = useAztecWallet();
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
        // ATOMIC MODE: Execute all as single transaction
        if (atomic) {
          if (isMountedRef.current) {
            // Set all transactions to 'sending' since they're in a single batch
            setTransactionStatuses((prev) =>
              prev.map((status) => ({
                ...status,
                status: 'sending',
              })),
            );
          }

          // Execute atomic batch
          const sentTx = await executeAtomicBatch(aztecWallet, interactions, sendOptions);
          const hash = sentTx.txHash;

          if (isMountedRef.current) {
            // All transactions now confirming as single batch
            setTransactionStatuses((prev) =>
              prev.map((status) => ({
                ...status,
                status: 'confirming',
                hash,
              })),
            );
          }

          // Wait for receipt
          const receipt = await sentTx.wait();

          if (isMountedRef.current) {
            // Mark all as successful
            setTransactionStatuses((prev) =>
              prev.map((status) => ({
                ...status,
                status: 'success',
                hash,
                receipt,
              })),
            );
          }

          // Return the same receipt for all interactions since they were atomic
          return Array(interactions.length).fill(receipt);
        }

        // SEQUENTIAL MODE: Execute one-by-one (existing behavior)
        // Use modal-core batch execution with callbacks for React state updates
        const { receipts, errors } = await executeBatchInteractions(aztecWallet, interactions, {
          sendOptions,
          callbacks: {
            onSending: (index: number) => {
              if (!isMountedRef.current) return;
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
            },
            onSent: (index: number, hash: string) => {
              if (!isMountedRef.current) return;
              setTransactionStatuses((prev) => {
                const updated = [...prev];
                const current = updated[index];
                if (current) {
                  updated[index] = {
                    ...current,
                    status: 'confirming',
                    hash,
                  };
                }
                return updated;
              });
            },
            onSuccess: (index: number, result: ExecuteInteractionResult) => {
              if (!isMountedRef.current) return;
              setTransactionStatuses((prev) => {
                const updated = [...prev];
                const current = updated[index];
                if (current) {
                  updated[index] = {
                    ...current,
                    status: 'success',
                    hash: result.hash,
                    receipt: result.receipt,
                  };
                }
                return updated;
              });
            },
            onError: (index: number, txError: Error) => {
              if (!isMountedRef.current) return;
              setTransactionStatuses((prev) => {
                const updated = [...prev];
                const current = updated[index];
                if (current) {
                  updated[index] = {
                    ...current,
                    status: 'error',
                    error: txError,
                  };
                }
                return updated;
              });
            },
          },
        });

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
          console.warn(
            `Batch execution partially failed. Failed transactions: ${errors.map((e: { index: number; error: Error }) => e.index + 1).join(', ')}`,
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
    [aztecWallet, isAvailable],
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
