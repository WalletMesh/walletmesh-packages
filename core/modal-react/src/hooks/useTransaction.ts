/**
 * Transaction management hook for WalletMesh React integration
 *
 * Provides a comprehensive interface for sending transactions across multiple blockchain networks
 * using TanStack Query's useMutation for state management. Features automatic chain validation,
 * gas estimation, transaction tracking, and error handling throughout the entire transaction lifecycle.
 *
 * @module hooks/useTransaction
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  BlockchainProvider,
  EVMTransactionParams,
  SolanaTransactionParams,
  SupportedChain,
  TransactionRequest,
  TransactionResult,
  TransactionStatus,
} from '@walletmesh/modal-core';
import { ErrorFactory, queryKeys, transactionActions } from '@walletmesh/modal-core';
import { useCallback, useMemo } from 'react';
import { useWalletMeshContext } from '../WalletMeshContext.js';
import { createComponentLogger } from '../utils/logger.js';
import { useService } from './internal/useService.js';
import { useWalletMeshStore, useWalletMeshStoreInstance } from './internal/useStore.js';
import { useAccount } from './useAccount.js';
import { useSwitchChain } from './useSwitchChain.js';
import { useWalletProvider } from './useWalletProvider.js';

// Extended transaction request with React-specific options
type ReactTransactionRequest = TransactionRequest & {
  chain?: SupportedChain;
  autoSwitchChain?: boolean;
};

// Re-export types from modal-core for convenience
export type {
  TransactionRequest,
  TransactionResult,
  TransactionStatus,
  EVMTransactionParams,
  SolanaTransactionParams,
} from '@walletmesh/modal-core';

// Define TransactionError locally for React usage
export interface TransactionError extends Error {
  stage?: 'validation' | 'preparation' | 'proving' | 'signing' | 'broadcasting' | 'confirmation';
  transactionId?: string;
  transactionHash?: string;
}

/**
 * Hook return type
 */
export interface UseTransactionReturn {
  /** Send a transaction */
  sendTransaction: (params: TransactionRequest) => Promise<TransactionResult>;

  /** Mutate async for direct access to mutation */
  sendTransactionAsync: (params: TransactionRequest) => Promise<TransactionResult>;

  /** Current transaction being processed */
  currentTransaction: TransactionResult | null;

  /** Transaction history for this session */
  transactions: TransactionResult[];

  /** Whether a transaction is in progress */
  isLoading: boolean;

  /** Whether a transaction is pending (from mutation) */
  isPending: boolean;

  /** Current transaction status */
  status: TransactionStatus;

  /** Error from last transaction */
  error: TransactionError | null;

  /** Reset error state */
  reset: () => void;

  /** Get transaction by hash */
  getTransaction: (hash: string) => TransactionResult | undefined;

  /** Get transaction by ID */
  getTransactionById: (txId: string) => TransactionResult | undefined;

  /** Wait for transaction confirmation */
  waitForConfirmation: (hash: string, confirmations?: number) => Promise<TransactionResult>;

  /** Estimate gas for transaction (EVM only) */
  estimateGas: (params: EVMTransactionParams) => Promise<string>;

  /** Simulate transaction (Solana only) */
  simulateTransaction: (params: SolanaTransactionParams) => Promise<unknown>;
}

/**
 * Hook for managing cross-chain transactions
 *
 * Provides a comprehensive interface for sending transactions across multiple blockchain networks
 * using TanStack Query's useMutation for efficient state management. Features automatic chain
 * validation, gas estimation, transaction tracking, and error handling.
 *
 * @returns Transaction methods and state including send functionality, status tracking, and utilities
 *
 * @since 1.0.0
 *
 * @see {@link useAccount} - For wallet connection state and address information
 * @see {@link useSwitchChain} - For switching chains before transactions
 * @see {@link useBalance} - For checking balances before sending transactions
 * @see {@link useConnect} - For establishing wallet connections
 *
 * @remarks
 * ## Benefits of TanStack Query Integration
 *
 * - **Automatic State Management**: Loading, error, and success states handled automatically
 * - **Optimistic Updates**: Update UI before transaction confirms
 * - **Error Recovery**: Built-in retry logic with exponential backoff
 * - **Cache Integration**: Transaction results cached and queryable
 * - **Mutation Lifecycle**: Access to onMutate, onSuccess, onError callbacks
 *
 * ## Supported Blockchain Types
 *
 * This hook provides a unified interface for transactions across different blockchain types:
 *
 * - **EVM Chains**: Ethereum, Polygon, BSC, Arbitrum, etc.
 * - **Solana**: Solana mainnet and devnet
 * - **Aztec**: Privacy-preserving transactions
 *
 * ## Transaction Lifecycle
 *
 * Each transaction goes through the following stages:
 *
 * 1. **Validation** (`preparing`): Parameter validation and chain compatibility checks
 * 2. **Preparation** (`preparing`): Gas estimation, balance checks, and transaction building
 * 3. **Signing** (`signing`): User approval and transaction signing in wallet
 * 4. **Broadcasting** (`broadcasting`): Submission to the blockchain network
 * 5. **Confirmation** (`confirming`): Waiting for network confirmation
 * 6. **Completed** (`confirmed`): Transaction successfully included in a block
 *
 * @example
 * ```tsx
 * // Basic EVM transaction with TanStack Query
 * import { useTransaction } from '@walletmesh/modal-react';
 *
 * function TransferForm() {
 *   const { sendTransaction, isPending, error, status } = useTransaction();
 *
 *   const handleTransfer = async () => {
 *     try {
 *       const result = await sendTransaction({
 *         to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E123',
 *         value: '1000000000000000000', // 1 ETH in wei
 *         chain: { chainId: '1', chainType: 'evm', name: 'Ethereum', required: false, label: 'Ethereum', interfaces: [], group: 'mainnet' } // Ethereum mainnet
 *       });
 *
 *       console.log('Transaction hash:', result.hash);
 *
 *       // Wait for confirmation
 *       const confirmed = await result.wait();
 *       console.log('Confirmed in block:', confirmed.blockNumber);
 *     } catch (err) {
 *       console.error('Transaction failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleTransfer} disabled={isPending}>
 *         {isPending ? `${status}...` : 'Send ETH'}
 *       </button>
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using mutation callbacks for UI updates
 * import { useTransaction, useBalance } from '@walletmesh/modal-react';
 * import { useState } from 'react';
 *
 * function TransactionWithCallbacks() {
 *   const { sendTransactionAsync } = useTransaction();
 *   const { invalidate } = useBalance();
 *   const [txHash, setTxHash] = useState<string>();
 *
 *   const handleSend = async () => {
 *     try {
 *       const result = await sendTransactionAsync({
 *         to: '0x...',
 *         value: '1000000000000000000'
 *       });
 *
 *       // Transaction sent successfully
 *       setTxHash(result.hash);
 *
 *       // Invalidate balance to refetch
 *       await invalidate();
 *
 *       // Wait for confirmation
 *       await result.wait();
 *       console.log('Transaction confirmed!');
 *     } catch (error) {
 *       console.error('Transaction failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleSend}>Send Transaction</button>
 *       {txHash && <p>Transaction: {txHash}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Cross-chain transaction with automatic chain switching
 * import { useTransaction, useAccount } from '@walletmesh/modal-react';
 *
 * function CrossChainTransfer() {
 *   const { sendTransaction, isPending } = useTransaction();
 *   const { chain: currentChain } = useAccount();
 *
 *   const handleCrossChainTransfer = async () => {
 *     try {
 *       // Send transaction on Polygon (will auto-switch from current chain)
 *       const result = await sendTransaction({
 *         to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E123',
 *         value: '1000000000000000000',
 *         chain: { chainId: '137', chainType: 'evm', name: 'Polygon', required: false, label: 'Polygon', interfaces: [], group: 'mainnet' }, // Polygon
 *         autoSwitchChain: true // Automatically switch chains if needed
 *       });
 *
 *       console.log('Cross-chain transaction sent:', result.hash);
 *     } catch (err) {
 *       console.error('Cross-chain transaction failed:', err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <p>Current chain: {currentChain?.name}</p>
 *       <button onClick={handleCrossChainTransfer} disabled={isPending}>
 *         Send to Polygon
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTransaction(): UseTransactionReturn {
  const { isConnected, chain: currentChain, chainType: currentChainType, wallet, address } = useAccount();
  const { provider } = useWalletProvider();
  const { switchChain } = useSwitchChain();
  const { client } = useWalletMeshContext();
  const { service: transactionService } = useService('transaction', 'useTransaction');
  const logger = useMemo(() => createComponentLogger('useTransaction'), []);
  const queryClient = useQueryClient();

  // Use store selectors for state
  // TODO: Transactions are not tracked in the new state structure
  // These will need to be managed through the transaction service
  const currentTransaction = null;
  const status = useWalletMeshStore((state) => state.meta.transactionStatus) || 'idle';
  // Get all transactions
  const transactions = useWalletMeshStore((state) =>
    Object.values(state.entities.transactions),
  ) as TransactionResult[];
  const connectionState = useWalletMeshStore((state) => ({
    activeSessionId: state.active?.sessionId,
    sessions: state.entities?.sessions || {},
  }));
  const error = useWalletMeshStore((state) => {
    const transactionError = state.ui?.errors?.['transaction'];
    if (!transactionError) return null;

    // Convert core error to React-friendly error
    const reactError = new Error(transactionError.message) as TransactionError;
    // TODO: Add transaction-specific error properties when available
    return reactError;
  });

  // Get store instance
  const store = useWalletMeshStoreInstance();

  /**
   * Core transaction sending logic
   */
  const sendTransactionCore = useCallback(
    async (params: ReactTransactionRequest): Promise<TransactionResult> => {
      if (!isConnected) {
        throw ErrorFactory.connectionFailed('Wallet not connected');
      }

      if (!client) {
        throw ErrorFactory.configurationError('WalletMesh client not available');
      }

      if (!transactionService) {
        throw ErrorFactory.configurationError(
          'Transaction service not available. Services are still initializing.',
        );
      }

      // Validate connection state
      const connectionValidation = transactionService.validateConnectionState(
        isConnected,
        currentChain?.chainId || null,
        currentChainType,
        wallet,
      );
      if (!connectionValidation.isValid) {
        throw ErrorFactory.validation(connectionValidation.error || 'Invalid connection state');
      }

      // Validate transaction parameters
      const paramValidation = transactionService.validateTransactionParams(params, currentChainType);
      if (!paramValidation.isValid) {
        throw ErrorFactory.invalidParams(paramValidation.error || 'Invalid transaction parameters');
      }

      // Check chain compatibility and handle switching
      const targetChain = params.chain || currentChain;
      if (targetChain && targetChain.chainId !== currentChain?.chainId) {
        const chainValidation = transactionService.validateChainCompatibility(
          targetChain.chainId,
          currentChain?.chainId || null,
          wallet,
        );

        if (!chainValidation.isValid) {
          throw ErrorFactory.validation(chainValidation.error || 'Chain not compatible');
        }

        if (params.autoSwitchChain) {
          await switchChain(targetChain);
        } else {
          throw ErrorFactory.validation(
            `Wrong chain. Expected ${targetChain.chainId}, got ${currentChain?.chainId || 'null'}`,
          );
        }
      }

      // Send transaction using the transaction service
      if (!transactionService) {
        throw ErrorFactory.configurationError('Transaction service not available');
      }

      if (!wallet) {
        throw ErrorFactory.connectionFailed('No wallet connected');
      }

      if (!currentChain || !currentChainType) {
        throw ErrorFactory.configurationError('No chain information available');
      }

      if (!provider) {
        throw ErrorFactory.connectionFailed('No provider available');
      }

      if (!address) {
        throw ErrorFactory.connectionFailed('No address available');
      }

      try {
        // Construct parameters for the transaction service
        const sendParams = {
          params: params, // ReactTransactionRequest extends TransactionRequest
          provider: provider as BlockchainProvider, // Cast WalletProvider to BlockchainProvider
          chainType: currentChainType,
          chain: targetChain || currentChain,
          walletId: wallet.id,
          address,
        };

        const result = await transactionService.sendTransaction(sendParams);
        logger.debug('Transaction sent successfully', { txHash: result.txHash });
        return result;
      } catch (error) {
        logger.error('Transaction failed', error);
        throw error;
      }
    },
    [
      isConnected,
      client,
      currentChain,
      currentChainType,
      wallet,
      address,
      provider,
      switchChain,
      transactionService,
      logger,
    ],
  );

  // Use TanStack Query mutation
  const mutation = useMutation({
    mutationFn: sendTransactionCore,
    onMutate: async (params) => {
      logger.debug('Starting transaction', params);
      // Could add optimistic updates here
    },
    onSuccess: async (result) => {
      logger.debug('Transaction sent successfully', result);

      // Invalidate related queries
      await queryClient.invalidateQueries({
        queryKey: queryKeys.balance.all(),
      });

      // You could also invalidate specific balance queries if you know the addresses
      if (currentChain) {
        const activeSession = connectionState.activeSessionId
          ? connectionState.sessions[connectionState.activeSessionId]
          : undefined;
        const address = activeSession?.activeAccount?.address;
        if (address) {
          await queryClient.invalidateQueries({
            queryKey: queryKeys.balance.native(currentChain.chainId, address),
          });
        }
      }
    },
    onError: (error) => {
      logger.error('Transaction failed', error);
    },
  });

  /**
   * Send a transaction (wrapper for mutation)
   */
  const sendTransaction = useCallback(
    async (params: ReactTransactionRequest): Promise<TransactionResult> => {
      return mutation.mutateAsync(params);
    },
    [mutation],
  );

  /**
   * Direct access to mutateAsync for advanced use cases
   */
  const sendTransactionAsync = mutation.mutateAsync;

  /**
   * Get transaction by hash
   */
  const getTransaction = useCallback(
    (hash: string): TransactionResult | undefined => {
      return transactions.find((tx: TransactionResult) => tx.txHash === hash);
    },
    [transactions],
  );

  /**
   * Get transaction by ID
   */
  const getTransactionById = useCallback((txId: string): TransactionResult | undefined => {
    const store = useWalletMeshStoreInstance();
    if (!store) return undefined;

    const state = store.getState();
    return state.entities.transactions[txId];
  }, []);

  /**
   * Wait for transaction confirmation
   */
  const waitForConfirmation = useCallback(
    async (hash: string, _confirmations = 1): Promise<TransactionResult> => {
      const transaction = getTransaction(hash);
      if (!transaction) {
        throw ErrorFactory.notFound('Transaction not found');
      }

      // Use the transaction's wait method
      await transaction.wait?.();

      // Return the updated transaction from store
      const updatedTransaction = getTransaction(hash);
      return updatedTransaction || transaction;
    },
    [getTransaction],
  );

  /**
   * Estimate gas for EVM transaction
   */
  const estimateGas = useCallback(
    async (params: EVMTransactionParams): Promise<string> => {
      if (!client) {
        throw ErrorFactory.configurationError('WalletMesh client not available');
      }

      if (!transactionService) {
        throw ErrorFactory.configurationError(
          'Transaction service not available. Services are still initializing.',
        );
      }

      // Validate parameters before estimation
      const validation = transactionService.validateGasEstimationParams(params, currentChainType);
      if (!validation.isValid) {
        throw ErrorFactory.invalidParams(validation.error || 'Invalid gas estimation parameters');
      }

      // Check chain compatibility
      if (currentChainType !== 'evm') {
        throw ErrorFactory.configurationError(
          `Gas estimation only supported for EVM chains, current chain type: ${currentChainType}`,
        );
      }

      // Get provider from active session
      const activeSession = connectionState.activeSessionId
        ? connectionState.sessions[connectionState.activeSessionId]
        : undefined;
      const provider = activeSession?.provider?.instance;
      if (!provider) {
        throw ErrorFactory.connectionFailed('No provider available for gas estimation');
      }

      try {
        const gasResult = await transactionService.estimateGas(params, provider);
        return gasResult.gasLimit;
      } catch (error) {
        logger.error('Gas estimation failed:', error);
        throw ErrorFactory.gasEstimationFailed(
          `Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [client, transactionService, currentChainType, logger, connectionState],
  );

  /**
   * Simulate Solana transaction
   */
  const simulateTransaction = useCallback(
    async (params: SolanaTransactionParams): Promise<unknown> => {
      if (!client) {
        throw ErrorFactory.configurationError('WalletMesh client not available');
      }

      if (!transactionService) {
        throw ErrorFactory.configurationError(
          'Transaction service not available. Services are still initializing.',
        );
      }

      // Validate parameters before simulation
      const validation = transactionService.validateSimulationParams(params, currentChainType);
      if (!validation.isValid) {
        throw ErrorFactory.invalidParams(validation.error || 'Invalid simulation parameters');
      }

      // Check chain compatibility
      if (currentChainType !== 'solana') {
        throw ErrorFactory.configurationError(
          `Transaction simulation only supported for Solana chains, current chain type: ${currentChainType}`,
        );
      }

      // Get provider from active session
      const activeSession = connectionState.activeSessionId
        ? connectionState.sessions[connectionState.activeSessionId]
        : undefined;
      const provider = activeSession?.provider?.instance;
      if (!provider) {
        throw ErrorFactory.connectionFailed('No provider available for transaction simulation');
      }

      try {
        return await transactionService.simulateTransaction(params, provider);
      } catch (error) {
        logger.error('Transaction simulation failed:', error);
        throw ErrorFactory.simulationFailed(
          `Transaction simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    },
    [client, transactionService, currentChainType, logger, connectionState],
  );

  /**
   * Reset transaction error state
   */
  const reset = useCallback(() => {
    if (!store) return;

    // Reset mutation state
    mutation.reset();

    // Clear store error
    transactionActions.clearError(store);
  }, [store, mutation]);

  // Determine if loading (either from mutation or store status)
  const isLoading = useMemo(() => {
    return mutation.isPending || (status !== 'idle' && status !== 'confirmed' && status !== 'failed');
  }, [mutation.isPending, status]);

  return {
    sendTransaction,
    sendTransactionAsync,
    currentTransaction,
    transactions,
    isLoading,
    isPending: mutation.isPending,
    status,
    error: (mutation.error as TransactionError) || error,
    reset,
    getTransaction,
    getTransactionById,
    waitForConfirmation,
    estimateGas,
    simulateTransaction,
  };
}
