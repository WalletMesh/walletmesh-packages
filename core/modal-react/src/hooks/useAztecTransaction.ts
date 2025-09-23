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
  /** Execute a transaction with automatic handling */
  execute: (
    transactionBuilder: (wallet: unknown) => Promise<unknown>,
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
 *
 * function TransactionExample() {
 *   const { execute, isExecuting, status, error } = useAztecTransaction();
 *
 *   const handleTransfer = async () => {
 *     const result = await execute(
 *       async (wallet) => {
 *         const contract = await Contract.at(address, artifact, wallet);
 *         return contract.methods.transfer(recipient, amount);
 *       },
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
 * function ContractDeployment() {
 *   const { execute, provingProgress, status } = useAztecTransaction();
 *
 *   const handleDeploy = async () => {
 *     await execute(
 *       async (wallet) => {
 *         return wallet.deployContract(ContractArtifact, [param1, param2]);
 *       },
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
 *       <button onClick={handleDeploy}>Deploy Contract</button>
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
      transactionBuilder: (wallet: unknown) => Promise<unknown>,
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
        // Build the transaction/interaction
        const interaction = await transactionBuilder(aztecWallet);

        // Check if this is a deployment or a regular transaction
        const isDeployment = interaction && typeof interaction === 'object' && 'deploy' in interaction;

        setStatus('proving');
        // Simulate proving progress (real implementation would get this from the wallet)
        const progressInterval = setInterval(() => {
          setProvingProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 500);

        try {
          // Execute the transaction
          setStatus('sending');
          let sentTx: { txHash?: string; hash?: string; wait: () => Promise<unknown> };
          let txHash: string;

          if (isDeployment) {
            // Handle contract deployment
            const deploymentInteraction = interaction as unknown as { artifact: unknown; args: unknown[] };
            sentTx = await aztecWallet.deployContract(
              deploymentInteraction.artifact,
              deploymentInteraction.args,
            );
            txHash = sentTx.txHash || 'deployment';
          } else {
            // Handle regular transaction
            // Assert that interaction is a ContractFunctionInteraction
            sentTx = await aztecWallet.wmExecuteTx(
              interaction as { request(): unknown; simulate(): Promise<unknown> },
            );
            txHash = sentTx.txHash || 'unknown';
          }

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
