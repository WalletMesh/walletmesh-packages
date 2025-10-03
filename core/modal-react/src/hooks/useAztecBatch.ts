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
import { useCallback, useState } from 'react';
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
 * Batch transaction hook return type
 *
 * @public
 */
/**
 * Options forwarded to each interaction's send() call during batch execution.
 */
export interface BatchSendOptions {
  from?: unknown;
  fee?: unknown;
  txNonce?: unknown;
  cancellable?: boolean;
}

export interface UseAztecBatchReturn {
  /** Execute a batch of transactions */
  executeBatch: (interactions: ContractFunctionInteraction[], options?: BatchSendOptions) => Promise<TxReceipt[]>;
  /** Status of each transaction in the current/last batch */
  transactionStatuses: BatchTransactionStatus[];
  /** Whether a batch is currently executing */
  isExecuting: boolean;
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
 * The hook provides:
 * - Batch transaction execution
 * - Individual transaction status tracking
 * - Progress calculation
 * - Error handling per transaction
 * - Success/failure counting
 *
 * Transactions are executed sequentially to avoid nonce issues,
 * but the entire batch is tracked as a single operation.
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
  const [error, setError] = useState<Error | null>(null);

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

      setIsExecuting(true);
      setError(null);

      // Initialize statuses
      const initialStatuses: BatchTransactionStatus[] = interactions.map((_, index) => ({
        index,
        status: 'pending' as const,
      }));
      setTransactionStatuses(initialStatuses);

      const receipts: TxReceipt[] = [];
      const errors: Array<{ index: number; error: Error }> = [];

      try {
        // Execute each transaction sequentially
        for (let i = 0; i < interactions.length; i++) {
          try {
            // Update status to sending
            setTransactionStatuses((prev) => {
              const updated = [...prev];
              const current = updated[i];
              if (current) {
                updated[i] = {
                  index: current.index,
                  status: 'sending',
                  ...(current.hash !== undefined && { hash: current.hash }),
                  ...(current.receipt !== undefined && { receipt: current.receipt }),
                  ...(current.error !== undefined && { error: current.error }),
                };
              }
              return updated;
            });

            // Execute the transaction using native Aztec.js
            if (!aztecWallet) {
              throw ErrorFactory.connectionFailed('Wallet disconnected during batch execution');
            }
            const interaction = interactions[i];
            if (!interaction) {
              throw ErrorFactory.notFound(`No interaction found at index ${i}`);
            }

            // Use native Aztec.js transaction flow
            const sentTx = await (interaction as any).send(options);
            const txHash = await sentTx.getTxHash();
            const hash = txHash.toString();

            setTransactionStatuses((prev) => {
              const updated = [...prev];
              const current = updated[i];
              if (current) {
                updated[i] = {
                  index: current.index,
                  status: 'confirming',
                  ...(hash !== undefined && { hash }),
                  ...(current.receipt !== undefined && { receipt: current.receipt }),
                  ...(current.error !== undefined && { error: current.error }),
                };
              }
              return updated;
            });

            // Wait for confirmation
            const receipt = await sentTx.wait();
            receipts.push(receipt as TxReceipt);

            // Update to success
            setTransactionStatuses((prev) => {
              const updated = [...prev];
              const current = updated[i];
              if (current) {
                updated[i] = {
                  index: current.index,
                  status: 'success',
                  ...(current.hash !== undefined && { hash: current.hash }),
                  receipt: receipt as TxReceipt,
                  ...(current.error !== undefined && { error: current.error }),
                };
              }
              return updated;
            });
          } catch (err) {
            const txError = err instanceof Error ? err : ErrorFactory.transactionFailed('Transaction failed');
            errors.push({ index: i, error: txError });

            // Update to error
            setTransactionStatuses((prev) => {
              const updated = [...prev];
              const current = updated[i];
              if (current) {
                updated[i] = {
                  index: current.index,
                  status: 'error',
                  ...(current.hash !== undefined && { hash: current.hash }),
                  ...(current.receipt !== undefined && { receipt: current.receipt }),
                  error: txError,
                };
              }
              return updated;
            });
          }
        }

        // Check if all failed
        if (errors.length === interactions.length) {
          const batchError = ErrorFactory.transactionFailed(
            `All ${interactions.length} transactions failed. First error: ${errors[0]?.error.message}`,
          );
          setError(batchError);
          throw batchError;
        }

        // Warn about partial failures
        if (errors.length > 0) {
          console.warn(
            `Batch execution partially failed. Failed transactions: ${errors.map((e) => e.index + 1).join(', ')}`,
          );
        }

        return receipts;
      } catch (err) {
        // Handle unexpected errors
        if (!error) {
          const batchError = err instanceof Error ? err : ErrorFactory.transactionFailed('Batch execution failed');
          setError(batchError);
        }
        throw err;
      } finally {
        setIsExecuting(false);
      }
    },
    [aztecWallet, isAvailable, error],
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
    progress,
    totalTransactions,
    completedTransactions,
    failedTransactions,
    clearStatuses,
    error,
  };
}
