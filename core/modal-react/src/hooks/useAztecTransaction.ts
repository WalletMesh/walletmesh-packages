/**
 * Aztec transaction management hook
 *
 * Provides a simplified interface for managing Aztec transactions with
 * automatic loading states, error handling, and optional notifications.
 *
 * @module hooks/useAztecTransaction
 * @packageDocumentation
 */

import { useCallback, useState } from 'react';
import { useAztecWallet } from './useAztecWallet.js';
import type { TxStatus } from '@aztec/aztec.js';
import type { ContractFunctionInteraction } from '@walletmesh/modal-core/providers/aztec';

/**
 * Transaction execution options
 *
 * @public
 */
export interface TransactionOptions {
  /** Callback when transaction is sent */
  onSent?: (txHash: string) => void;
  /** Callback when transaction succeeds */
  onSuccess?: (receipt: unknown) => void;
  /** Callback when transaction fails */
  onError?: (error: Error) => void;
  /** Callback for proving progress */
  onProvingProgress?: (progress: number) => void;
  /** Whether to automatically check status */
  autoCheckStatus?: boolean;
}

/**
 * Transaction execution result
 *
 * @public
 */
export interface TransactionResult {
  /** Transaction hash */
  hash: string;
  /** Transaction receipt */
  receipt: unknown;
  /** Transaction status */
  status: TxStatus | string;
}

/**
 * Transaction hook return type
 *
 * @public
 */
export interface UseAztecTransactionReturn {
  /** Execute a transaction with automatic handling. Pass a ContractFunctionInteraction from contract.methods.methodName(...) */
  execute: (
    interaction: ContractFunctionInteraction,
    options?: TransactionOptions,
  ) => Promise<TransactionResult>;
  /** Whether a transaction is currently executing */
  isExecuting: boolean;
  /** Current transaction status */
  status: 'idle' | 'preparing' | 'proving' | 'sending' | 'confirming' | 'success' | 'error';
  /** Any error that occurred */
  error: Error | null;
  /** Reset the transaction state */
  reset: () => void;
  /** Last transaction result */
  lastResult: TransactionResult | null;
  /** Current proving progress (0-100) */
  provingProgress: number;
}

/**
 * Hook for managing Aztec transactions
 *
 * This hook provides a simplified way to execute transactions with
 * automatic state management, error handling, and progress tracking.
 *
 * @returns Transaction management utilities
 *
 * @since 1.0.0
 *
 * @remarks
 * The hook automatically handles:
 * - Loading states for each transaction phase
 * - Error handling with user-friendly messages
 * - Proving progress tracking
 * - Transaction receipt checking
 * - Success/failure callbacks
 *
 * @example
 * ```tsx
 * import { useAztecTransaction } from '@walletmesh/modal-react';
 * import { useAztecContract } from '@walletmesh/modal-react';
 *
 * function TransactionExample({ tokenAddress, TokenArtifact }) {
 *   const { execute, isExecuting, status, error } = useAztecTransaction();
 *   const { contract } = useAztecContract(tokenAddress, TokenArtifact);
 *
 *   const handleTransfer = async () => {
 *     if (!contract) return;
 *
 *     const result = await execute(
 *       contract.methods.transfer(recipient, amount),
 *       {
 *         onSent: (hash) => console.log('Transaction sent:', hash),
 *         onSuccess: (receipt) => console.log('Success:', receipt),
 *         onError: (err) => console.error('Failed:', err),
 *       }
 *     );
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleTransfer} disabled={isExecuting}>
 *         {isExecuting ? `${status}...` : 'Send Transaction'}
 *       </button>
 *       {error && <div>Error: {error.message}</div>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With proving progress tracking
 * function ContractInteraction() {
 *   const { execute, provingProgress, status } = useAztecTransaction();
 *   const { contract } = useAztecContract(contractAddress, ContractArtifact);
 *
 *   const handleMethod = async () => {
 *     if (!contract) return;
 *
 *     await execute(
 *       contract.methods.someMethod(param1, param2),
 *       {
 *         onProvingProgress: (progress) => {
 *           console.log(`Proving: ${progress}%`);
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <div>
 *       {status === 'proving' && (
 *         <progress value={provingProgress} max={100} />
 *       )}
 *       <button onClick={handleMethod}>Execute Method</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecTransaction(): UseAztecTransactionReturn {
  const { aztecWallet, isReady } = useAztecWallet();
  const [isExecuting, setIsExecuting] = useState(false);
  const [status, setStatus] = useState<UseAztecTransactionReturn['status']>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [lastResult, setLastResult] = useState<TransactionResult | null>(null);
  const [provingProgress, setProvingProgress] = useState(0);

  const reset = useCallback(() => {
    setIsExecuting(false);
    setStatus('idle');
    setError(null);
    setProvingProgress(0);
  }, []);

  const execute = useCallback(
    async (
      interaction: ContractFunctionInteraction,
      options: TransactionOptions = {},
    ): Promise<TransactionResult> => {
      if (!isReady || !aztecWallet) {
        const error = new Error('Aztec wallet is not ready');
        setError(error);
        if (options.onError) {
          options.onError(error);
        }
        throw error;
      }

      setIsExecuting(true);
      setStatus('preparing');
      setError(null);
      setProvingProgress(0);

      try {
        setStatus('proving');
        // Simulate proving progress (real implementation would get this from the wallet)
        const progressInterval = setInterval(() => {
          setProvingProgress((prev) => {
            const newProgress = prev >= 90 ? 90 : prev + 10;
            if (options.onProvingProgress) {
              options.onProvingProgress(newProgress);
            }
            if (newProgress >= 90) {
              clearInterval(progressInterval);
            }
            return newProgress;
          });
        }, 500);

        try {
          // Execute the transaction using native Aztec.js
          setStatus('sending');
          const sentTx = await interaction.send();
          const txHash = sentTx.txHash.toString();

          if (options.onSent) {
            options.onSent(txHash);
          }

          // Wait for confirmation
          setStatus('confirming');
          clearInterval(progressInterval);
          setProvingProgress(100);

          const receipt = await sentTx.wait();

          // Check status - Aztec transactions may not have a status field
          // Consider the transaction successful unless there's an explicit error
          const txReceipt = receipt as { status?: string | number; error?: string };

          // Check for explicit failure conditions
          if (txReceipt.error) {
            throw new Error(`Transaction failed: ${txReceipt.error}`);
          }

          // Get the status, defaulting to 'SUCCESS' if not present (common in Aztec)
          const txStatus =
            typeof txReceipt.status === 'number'
              ? txReceipt.status.toString()
              : txReceipt.status || 'SUCCESS';

          // Only throw if explicitly failed (status is 0 or FAILED)
          if (txStatus === '0' || txStatus === '0x0' || txStatus === 'FAILED') {
            throw new Error(`Transaction failed with status: ${txStatus}`);
          }

          const result: TransactionResult = {
            hash: txHash,
            receipt,
            status: txStatus,
          };

          setLastResult(result);
          setStatus('success');
          setIsExecuting(false);

          if (options.onSuccess) {
            options.onSuccess(receipt);
          }

          return result;
        } finally {
          clearInterval(progressInterval);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err : new Error('Transaction failed');
        setError(errorMessage);
        setStatus('error');
        setIsExecuting(false);

        if (options.onError) {
          options.onError(errorMessage);
        }

        throw errorMessage;
      }
    },
    [aztecWallet, isReady],
  );

  return {
    execute,
    isExecuting,
    status,
    error,
    reset,
    lastResult,
    provingProgress,
  };
}
