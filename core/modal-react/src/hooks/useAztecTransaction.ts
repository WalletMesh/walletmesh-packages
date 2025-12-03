/**
 * Aztec transaction management hook with Wagmi pattern
 *
 * Provides both synchronous (blocking with overlay) and asynchronous
 * (background) transaction execution modes with full lifecycle tracking
 * from simulation through confirmation.
 *
 * @module hooks/useAztecTransaction
 * @packageDocumentation
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ErrorFactory,
  type AztecTransactionManager,
  type ContractFunctionInteraction,
  type TransactionCallbacks,
  type AztecTransactionResult,
  type TransactionStatus,
} from '@walletmesh/modal-core';
import { createComponentLogger } from '../utils/logger.js';
import { useStore, useStoreInstance } from './internal/useStore.js';
import { useAztecWallet } from './useAztecWallet.js';

// Re-export types for convenience
export type { TransactionCallbacks, AztecTransactionResult };

/**
 * Hook return type following Wagmi pattern
 *
 * @public
 */
export interface UseAztecTransactionReturn {
  // Methods
  /** Execute transaction asynchronously in background (returns immediately with txId) */
  execute: (interaction: ContractFunctionInteraction, callbacks?: TransactionCallbacks) => Promise<string>;
  /** Execute transaction synchronously with blocking overlay (waits for completion) */
  executeSync: (interaction: ContractFunctionInteraction) => Promise<unknown>;

  // Active transaction state (for sync mode)
  /** Currently active transaction (sync mode) */
  activeTransaction: AztecTransactionResult | null;
  /** Whether a sync transaction is currently executing (legacy) */
  isLoading: boolean;
  /** Current transaction status */
  status: TransactionStatus;
  /** Error from last transaction */
  error: Error | null;

  // Execution lock state (defense-in-depth against race conditions)
  /** Whether the hook is currently waiting for wallet interaction (approval/signing) */
  isWalletInteracting: boolean;
  /** Combined execution state - true if any transaction operation is in progress */
  isExecuting: boolean;

  // Background transactions state (for async mode)
  /** All background transactions (async mode) */
  backgroundTransactions: AztecTransactionResult[];
  /** Number of active background transactions */
  backgroundCount: number;

  // Utility
  /** Get transaction by ID */
  getTransaction: (txId: string) => AztecTransactionResult | undefined;
  /** Reset error state */
  reset: () => void;
}

/**
 * Hook for managing Aztec transactions with Wagmi pattern
 *
 * Provides two execution modes:
 * - `executeSync()`: Blocking execution with UI overlay (like wagmi's writeContract)
 * - `execute()`: Background execution with callbacks (like wagmi's writeContractAsync)
 *
 * @returns Transaction management utilities
 *
 * @since 3.0.0
 *
 * @remarks
 * This hook provides full transaction lifecycle tracking:
 * 1. Preparing/Simulation
 * 2. Proving (30-60 seconds for Aztec)
 * 3. Signing
 * 4. Broadcasting
 * 5. Confirming
 * 6. Confirmed/Failed
 *
 * Each stage is tracked with timing information for performance monitoring.
 *
 * @example
 * ```tsx
 * // Sync mode (blocking with overlay)
 * import { useAztecTransaction, useAztecContract } from '@walletmesh/modal-react';
 *
 * function MintToken() {
 *   const { executeSync, isLoading, status } = useAztecTransaction();
 *   const { contract } = useAztecContract(tokenAddress, TokenArtifact);
 *
 *   const handleMint = async () => {
 *     if (!contract) return;
 *
 *     try {
 *       // Blocks until complete, shows overlay with progress
 *       const receipt = await executeSync(
 *         contract.methods.mint(recipient, amount)
 *       );
 *       console.log('Minted!', receipt);
 *     } catch (error) {
 *       console.error('Mint failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleMint} disabled={isLoading}>
 *       {isLoading ? `${status}...` : 'Mint Tokens'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Async mode (background execution)
 * import { useAztecTransaction, useAztecContract } from '@walletmesh/modal-react';
 *
 * function TransferToken() {
 *   const { execute, backgroundCount } = useAztecTransaction();
 *   const { contract } = useAztecContract(tokenAddress, TokenArtifact);
 *
 *   const handleTransfer = async () => {
 *     if (!contract) return;
 *
 *     try {
 *       // Returns immediately with txId, executes in background
 *       const txId = await execute(
 *         contract.methods.transfer(recipient, amount),
 *         {
 *           onSuccess: (tx) => console.log('Transfer complete!', tx),
 *           onError: (error) => console.error('Transfer failed:', error),
 *         }
 *       );
 *       console.log('Transaction started:', txId);
 *       // User can continue working while proving happens
 *     } catch (error) {
 *       console.error('Failed to start transaction:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleTransfer}>
 *         Transfer Tokens
 *       </button>
 *       {backgroundCount > 0 && (
 *         <p>{backgroundCount} background transaction(s) in progress</p>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Monitoring transaction state
 * function TransactionMonitor() {
 *   const {
 *     activeTransaction,
 *     backgroundTransactions,
 *     getTransaction,
 *     status
 *   } = useAztecTransaction();
 *
 *   return (
 *     <div>
 *       {activeTransaction && (
 *         <div>
 *           <h3>Active Transaction</h3>
 *           <p>Status: {activeTransaction.status}</p>
 *           <p>Started: {new Date(activeTransaction.startTime).toLocaleTimeString()}</p>
 *           {activeTransaction.stages.proving && (
 *             <p>
 *               Proving: {
 *                 activeTransaction.stages.proving.end
 *                   ? `${activeTransaction.stages.proving.end - activeTransaction.stages.proving.start}ms`
 *                   : 'in progress...'
 *               }
 *             </p>
 *           )}
 *         </div>
 *       )}
 *
 *       <h3>Background Transactions ({backgroundTransactions.length})</h3>
 *       {backgroundTransactions.map(tx => (
 *         <div key={tx.id}>
 *           <p>{tx.id}: {tx.status}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @public
 */
export function useAztecTransaction(): UseAztecTransactionReturn {
  const { aztecWallet, isReady, chain } = useAztecWallet();
  const store = useStoreInstance();
  const logger = useMemo(() => createComponentLogger('useAztecTransaction'), []);

  // Execution lock - prevents concurrent transaction executions (defense-in-depth)
  // Uses ref for synchronous check to prevent race conditions from rapid clicks
  const executingRef = useRef(false);
  const [isWalletInteracting, setIsWalletInteracting] = useState(false);

  // Subscribe to active transaction (sync mode)
  const activeTransactionId = useStore((state) => state.active?.transactionId);
  const activeTransaction = useStore((state) => {
    if (!activeTransactionId) return null;
    const tx = state.entities.transactions[activeTransactionId];
    return tx as AztecTransactionResult | null;
  });

  // Subscribe to background transactions (async mode)
  const backgroundTransactions = useStore((state) => {
    const backgroundTxIds = state.meta.backgroundTransactionIds || [];
    return backgroundTxIds
      .map((id: string) => state.entities.transactions[id])
      .filter(Boolean) as AztecTransactionResult[];
  });

  // Subscribe to transaction status and error
  const status = useStore((state) => state.meta.transactionStatus || 'idle');
  const error = useStore((state) => state.ui.errors?.['transaction'] || null);

  // Derive loading state - only true when there's an active transaction that's not complete
  const isLoading = useMemo(() => {
    if (!activeTransaction) return false;
    return activeTransaction.status !== 'confirmed' && activeTransaction.status !== 'failed';
  }, [activeTransaction]);

  // Count active background transactions
  const backgroundCount = useMemo(() => {
    return backgroundTransactions.filter((tx) => tx.status !== 'confirmed' && tx.status !== 'failed').length;
  }, [backgroundTransactions]);

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

  // Execute transaction synchronously (blocking with overlay)
  // Includes execution lock to prevent concurrent executions (defense-in-depth)
  const executeSync = useCallback(
    async (interaction: ContractFunctionInteraction): Promise<unknown> => {
      // CRITICAL: Synchronous check prevents race between rapid clicks
      // This check happens BEFORE any async operation
      if (executingRef.current) {
        logger.warn('Transaction already in progress, rejecting concurrent execution');
        throw new Error('Transaction already in progress');
      }

      // Acquire lock immediately (synchronous)
      executingRef.current = true;
      setIsWalletInteracting(true);

      logger.debug('Executing transaction synchronously', { mode: 'sync' });

      try {
        const manager = await getTransactionManager();
        const receipt = await manager.executeSync(interaction);
        logger.debug('Transaction completed successfully', { mode: 'sync' });
        return receipt;
      } catch (err) {
        logger.error('Transaction failed', err);
        throw err;
      } finally {
        // Always release lock, even on error
        executingRef.current = false;
        setIsWalletInteracting(false);
      }
    },
    [getTransactionManager, logger],
  );

  // Execute transaction asynchronously (background)
  const execute = useCallback(
    async (interaction: ContractFunctionInteraction, callbacks?: TransactionCallbacks): Promise<string> => {
      logger.debug('Executing transaction asynchronously', { mode: 'async' });

      try {
        const manager = await getTransactionManager();
        const txId = await manager.executeAsync(interaction, callbacks);
        logger.debug('Transaction started in background', { mode: 'async', txId });
        return txId;
      } catch (err) {
        logger.error('Failed to start transaction', err);
        throw err;
      }
    },
    [getTransactionManager, logger],
  );

  // Get transaction by ID
  const getTransaction = useCallback(
    (txId: string): AztecTransactionResult | undefined => {
      const state = store.getState();
      return state.entities.transactions[txId] as AztecTransactionResult | undefined;
    },
    [store],
  );

  // Reset error state
  const reset = useCallback(() => {
    const { uiActions } = require('./internal/useStore.js');
    uiActions.clearError(store, 'transaction');
  }, [store]);

  // Combined execution state - true if any transaction operation is in progress
  const isExecuting = isLoading || isWalletInteracting;

  return {
    // Methods
    execute,
    executeSync,

    // Active transaction state (sync mode)
    activeTransaction,
    isLoading,
    status,
    error: error ? (error instanceof Error ? error : new Error(error.message || 'Transaction error')) : null,

    // Execution lock state (defense-in-depth)
    isWalletInteracting,
    isExecuting,

    // Background transactions state (async mode)
    backgroundTransactions,
    backgroundCount,

    // Utility
    getTransaction,
    reset,
  };
}
