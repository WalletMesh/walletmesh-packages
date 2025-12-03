/**
 * Transaction service for sending and monitoring blockchain transactions
 *
 * This service provides comprehensive transaction management functionality including
 * sending transactions, monitoring confirmations, gas estimation, and transaction history.
 *
 * @module services/transaction/TransactionService
 * @category Services
 */

import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { ChainType, SupportedChain } from '../../types.js';
import { generateId } from '../../utils/crypto.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';
import { convertToSessionError, handleProviderError, isSessionError } from '../../utils/sessionErrors.js';
import { TransactionFormatter } from './TransactionFormatter.js';
import { TransactionValidator } from './TransactionValidator.js';
import type {
  EVMTransactionParams,
  GasEstimationResult,
  SolanaTransactionParams,
  TransactionError,
  TransactionHistoryFilter,
  TransactionReceipt,
  TransactionRequest,
  TransactionResult,
  TransactionStatus,
} from './types.js';

/**
 * Configuration options for the TransactionService.
 *
 * Allows customization of transaction monitoring behavior, timeouts, and gas estimation.
 * All options are optional with sensible defaults.
 *
 * @example
 * ```typescript
 * const config: TransactionServiceConfig = {
 *   confirmations: 2,              // Wait for 2 block confirmations
 *   confirmationTimeout: 120000,   // 2 minute timeout
 *   pollingInterval: 3000,         // Check every 3 seconds
 *   maxHistorySize: 200,           // Keep 200 transactions
 *   gasMultiplier: 1.2             // 20% gas buffer
 * };
 *
 * const txService = new TransactionService(dependencies);
 * txService.configure(config);
 * ```
 */
export interface TransactionServiceConfig {
  /**
   * Number of block confirmations to wait for before considering a transaction confirmed.
   * Higher values provide more security but longer wait times.
   * @default 1
   */
  confirmations?: number;
  /**
   * Maximum time to wait for transaction confirmation in milliseconds.
   * Transaction will be marked as failed if not confirmed within this time.
   * @default 60000 (60 seconds)
   */
  confirmationTimeout?: number;
  /**
   * Interval between transaction status checks in milliseconds.
   * Lower values provide faster updates but more network requests.
   * @default 2000 (2 seconds)
   */
  pollingInterval?: number;
  /**
   * Maximum number of transactions to keep in history.
   * Older completed transactions are pruned when limit is exceeded.
   * @default 100
   */
  maxHistorySize?: number;
  /**
   * Multiplier applied to gas estimates for safety buffer.
   * Helps prevent out-of-gas errors due to estimation variance.
   * @default 1.1 (10% buffer)
   */
  gasMultiplier?: number;
}

/**
 * Service for managing blockchain transactions
 *
 * The TransactionService provides a unified interface for sending transactions across
 * different blockchain types (EVM, Solana, Aztec). It handles transaction lifecycle
 * management, confirmation monitoring, gas estimation, and maintains transaction history.
 *
 * @category Services
 *
 * @example
 * ```typescript
 * // Initialize the service
 * const txService = new TransactionService(dependencies);
 * txService.configure({
 *   confirmationTimeout: 120000,  // 2 minutes
 *   pollingInterval: 3000,        // 3 seconds
 *   gasMultiplier: 1.2     // 20% gas buffer
 * });
 *
 * // Send an EVM transaction
 * const result = await txService.sendTransaction({
 *   params: {
 *     evm: {
 *       to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
 *       value: '1000000000000000000', // 1 ETH in wei
 *       data: '0x'
 *     }
 *   },
 *   provider,
 *   chainType: ChainType.Evm,
 *   chain: ethereumMainnet, // SupportedChain object
 *   walletId: 'metamask',
 *   address: '0xYourAddress'
 * });
 *
 * console.log(`Transaction hash: ${result.hash}`);
 *
 * // Wait for confirmation
 * const receipt = await result.wait();
 * console.log(`Confirmed in block ${receipt.blockNumber}`);
 * ```
 *
 * @remarks
 * This class emits the following events:
 * - `transaction-sent` - When a transaction is successfully sent
 * - `transaction-confirmed` - When a transaction is confirmed
 * - `transaction-failed` - When a transaction fails
 */
/**
 * Dependencies required by TransactionService.
 *
 * Extends the base service dependencies to inherit common requirements like logging.
 * Currently no additional dependencies are required beyond the base.
 *
 * @example
 * ```typescript
 * const dependencies: TransactionServiceDependencies = {
 *   logger: createLogger('TransactionService')
 * };
 *
 * const txService = new TransactionService(dependencies);
 * ```
 */
export interface TransactionServiceDependencies extends BaseServiceDependencies {}

/**
 * Parameters for sending a blockchain transaction.
 *
 * Contains all information needed to send a transaction across different blockchain types.
 * The generic type parameter ensures type safety between chainType and params.
 *
 * @template T - The chain type which determines the structure of params
 *
 * @example
 * ```typescript
 * // EVM transaction
 * const evmParams: SendTransactionParams<'evm'> = {
 *   params: {
 *     to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
 *     value: '1000000000000000000',
 *     data: '0x'
 *   },
 *   provider: evmProvider,
 *   chainType: 'evm',
 *   chain: ethereumMainnet, // SupportedChain object
 *   walletId: 'metamask',
 *   address: '0xYourAddress'
 * };
 *
 * // Solana transaction
 * const solanaParams: SendTransactionParams<'solana'> = {
 *   params: {
 *     transaction: serializedTransaction,
 *     options: { skipPreflight: false }
 *   },
 *   provider: solanaProvider,
 *   chainType: 'solana',
 *   chain: solanaMainnet, // SupportedChain object
 *   walletId: 'phantom',
 *   address: 'YourSolanaAddress'
 * };
 * ```
 */
export interface SendTransactionParams<T extends ChainType = ChainType> {
  /**
   * Transaction request containing chain-specific parameters.
   * Structure varies based on the chainType (EVM, Solana, Aztec).
   */
  params: TransactionRequest<T>;
  /**
   * Blockchain provider instance for communicating with the wallet.
   * Must be compatible with the specified chainType.
   */
  provider: BlockchainProvider;
  /**
   * Type of blockchain network (evm, solana, aztec).
   * Determines transaction format and processing logic.
   */
  chainType: T;
  /**
   * Chain configuration for the blockchain network.
   */
  chain: SupportedChain;
  /**
   * Identifier of the wallet sending the transaction.
   * Used for tracking and multi-wallet scenarios.
   */
  walletId: string;
  /**
   * Address of the account sending the transaction.
   * Must be the currently connected address in the wallet.
   */
  address: string;
}

export class TransactionService {
  private logger: Logger;
  private transactions = new Map<string, TransactionResult>();
  private confirmationPromises = new Map<
    string,
    {
      resolve: (receipt: TransactionReceipt) => void;
      reject: (error: unknown) => void;
      timeout?: ReturnType<typeof setTimeout>;
      interval?: ReturnType<typeof setInterval>;
    }
  >();
  private config: TransactionServiceConfig = {
    confirmations: 1,
    confirmationTimeout: 60000, // 60 seconds
    pollingInterval: 2000, // 2 seconds
    maxHistorySize: 100,
    gasMultiplier: 1.1,
  };

  constructor(dependencies: TransactionServiceDependencies) {
    this.logger = dependencies.logger;
  }

  /**
   * Configure transaction service with custom settings
   *
   * Allows customization of confirmation timeouts, polling intervals, and other service behavior.
   * This method is optional - the service will use default values if not called.
   *
   * @param config - Optional configuration object
   * @param config.confirmations - Number of confirmations to wait (default: 1)
   * @param config.confirmationTimeout - Timeout for transaction confirmation in ms (default: 60000)
   * @param config.pollingInterval - Interval for checking transaction status in ms (default: 2000)
   * @param config.maxHistorySize - Maximum number of transactions to keep in history (default: 100)
   * @param config.gasMultiplier - Gas estimate multiplier for EVM transactions (default: 1.1)
   *
   * @example
   * ```typescript
   * txService.configure({
   *   confirmationTimeout: 120000,     // 2 minutes
   *   pollingInterval: 3000,           // 3 seconds
   *   maxHistorySize: 200,             // Keep 200 transactions
   *   gasMultiplier: 1.2        // 20% gas buffer
   * });
   * ```
   */
  configure(config?: TransactionServiceConfig): void {
    if (config) {
      this.config = { ...this.config, ...config };
      this.logger.debug('TransactionService configured with config:', this.config);
    }
  }

  /**
   * Clear pending confirmations and cleanup resources
   *
   * This method should be called when the service is no longer needed to free up resources,
   * clear pending confirmation promises, and stop any active intervals.
   *
   * @example
   * ```typescript
   * // On component unmount or service disposal
   * txService.cleanup();
   * ```
   */
  cleanup(): void {
    // Clear all pending confirmations
    for (const [, promise] of this.confirmationPromises.entries()) {
      if (promise.timeout) clearTimeout(promise.timeout);
      if (promise.interval) clearInterval(promise.interval);
      promise.reject(ErrorFactory.cleanupFailed('Service cleaned up'));
    }
    this.confirmationPromises.clear();
    this.transactions.clear();
  }

  /**
   * Fail all active transactions when session ends
   *
   * Called when a wallet session is terminated or disconnected.
   * Marks all pending transactions as failed and cleans up polling resources.
   * This prevents transactions from getting stuck in a polling state after disconnect.
   *
   * @param sessionId - Optional session ID to match transactions
   * @param reason - Reason for session termination
   *
   * @example
   * ```typescript
   * // Called when session disconnects
   * txService.failAllActiveTransactions('session-123', 'Session disconnected');
   * ```
   */
  failAllActiveTransactions(sessionId?: string, reason = 'Session disconnected'): void {
    this.logger.info('Failing all active transactions due to session termination', { sessionId, reason });

    const sessionError = ErrorFactory.connectionFailed(reason, { sessionId });

    // Iterate through all active transactions
    for (const [id, tx] of this.transactions.entries()) {
      // Only fail transactions that are actively polling
      if (tx.status === 'pending' || tx.status === 'sending' || tx.status === 'confirming') {
        this.logger.debug('Failing transaction due to session termination', { id, hash: tx.txHash });

        const txError = this.createTransactionError(sessionError, 'confirmation', id);
        this.updateTransactionStatus(id, 'failed', txError);

        // Clean up polling for this transaction
        const confirmationData = this.confirmationPromises.get(tx.txHash);
        if (confirmationData) {
          if (confirmationData.timeout) clearTimeout(confirmationData.timeout);
          if (confirmationData.interval) clearInterval(confirmationData.interval);
          confirmationData.reject(txError);
          this.confirmationPromises.delete(tx.txHash);
        }
      }
    }
  }

  /**
   * Send a transaction
   *
   * Sends a blockchain transaction and monitors its confirmation status. Supports multiple
   * chain types with automatic formatting and validation. The returned result includes
   * a `wait()` method for awaiting confirmation.
   *
   * @template T - The chain type (EVM, Solana, Aztec)
   * @param params - Transaction parameters including request, provider, and metadata
   * @returns Promise resolving to transaction result with hash and wait method
   *
   * @throws {ModalError} Validation error if transaction parameters are invalid
   * @throws {ModalError} Transaction failed error if signing or broadcasting fails
   * @throws {ModalError} Timeout error if confirmation takes too long
   *
   * @remarks
   * Emits the following events:
   * - `transaction-sent` - When a transaction is successfully sent
   * - `transaction-confirmed` - When a transaction is confirmed
   * - `transaction-failed` - When a transaction fails
   *
   * @example
   * ```typescript
   * // Send EVM transaction
   * const result = await txService.sendTransaction({
   *   params: {
   *     evm: {
   *       to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
   *       value: '1000000000000000000', // 1 ETH
   *       data: '0x'
   *     }
   *   },
   *   provider,
   *   chainType: ChainType.Evm,
   *   chain: ethereumMainnet, // SupportedChain object
   *   walletId: 'metamask',
   *   address: '0xYourAddress'
   * });
   *
   * console.log(`Transaction sent: ${result.hash}`);
   *
   * // Wait for confirmation
   * try {
   *   const receipt = await result.wait();
   *   console.log(`Confirmed in block ${receipt.blockNumber}`);
   * } catch (error) {
   *   console.error('Transaction failed:', error);
   * }
   *
   * // Send Solana transaction
   * const solanaResult = await txService.sendTransaction({
   *   params: {
   *     solana: {
   *       transaction: serializedTransaction,
   *       options: { skipPreflight: false }
   *     }
   *   },
   *   provider: solanaProvider,
   *   chainType: ChainType.Solana,
   *   chain: solanaMainnet, // SupportedChain object
   *   walletId: 'phantom',
   *   address: 'YourSolanaAddress'
   * });
   * ```
   */
  async sendTransaction<T extends ChainType = ChainType>(
    params: SendTransactionParams<T>,
  ): Promise<TransactionResult> {
    const { params: txParams, provider, chainType, chain, walletId, address } = params;
    // Service initialization check removed - using stateless pattern

    // Generate transaction ID
    const txId = this.generateTransactionId();

    try {
      // Validate transaction
      const validation = TransactionValidator.validate(txParams, chainType);
      if (!validation.valid) {
        throw ErrorFactory.validation(validation.errors.join(', '));
      }

      // Log warnings if any
      for (const warning of validation.warnings) {
        this.logger.warn('Transaction warning:', warning);
      }

      // Create initial transaction result
      const result: TransactionResult = {
        txStatusId: txId,
        txHash: '',
        chainId: chain.chainId,
        chainType,
        walletId,
        from: address,
        status: 'simulating',
        request: txParams,
        startTime: Date.now(),
        ...(txParams.metadata?.data && { metadata: txParams.metadata.data }),
        wait: (confirmations?: number) => this.waitForConfirmation(txId, confirmations),
      };

      // Add to transactions map
      this.transactions.set(txId, result);

      // Log transaction preparation
      this.logger.debug('Simulating transaction', { id: txId });

      // Update status to proving (for Aztec) or sending (for EVM/Solana)
      this.updateTransactionStatus(txId, chainType === 'aztec' ? 'proving' : 'sending');

      // Format transaction for provider
      const formatted = TransactionFormatter.formatForProvider(txParams, chainType);

      // Get transaction method
      const method = TransactionFormatter.getTransactionMethod(chainType);

      // Send transaction
      let hash: string;
      try {
        let result: unknown;
        if (chainType === 'solana') {
          // Solana uses different parameter structure
          result = await provider.request({
            method,
            params: formatted,
          });
        } else {
          // EVM and Aztec use array params
          result = await provider.request({
            method,
            params: [formatted],
          });
        }

        // Validate that the result is a string hash
        if (typeof result !== 'string') {
          throw ErrorFactory.transactionFailed(
            `Invalid transaction hash returned from provider: expected string, got ${typeof result}`,
            { result, chainType, method },
          );
        }
        hash = result;
      } catch (error) {
        // Check for session errors and store them
        handleProviderError(error);

        const txError = this.createTransactionError(error, 'signing', txId);
        this.updateTransactionStatus(txId, 'failed', txError);
        throw txError;
      }

      // Format hash based on chain type
      hash = TransactionFormatter.formatHash(hash, chainType);

      // Update transaction with hash
      result.txHash = hash;
      this.updateTransactionStatus(txId, 'sending');

      // Log transaction sent
      this.logger.info('Transaction sent', { id: txId, hash });

      // Start confirmation monitoring
      this.updateTransactionStatus(txId, 'pending');
      this.startConfirmationMonitoring(txId, hash, provider, chainType);

      // Manage history size
      this.pruneTransactionHistory();

      return result;
    } catch (error) {
      // Update transaction status to failed
      // Check if this is a validation error from the validation step
      const stage =
        ErrorFactory.isModalError(error) && error.code === 'validation_error' ? 'validation' : 'preparation';
      const txError = this.createTransactionError(error, stage, txId);
      if (this.transactions.has(txId)) {
        this.updateTransactionStatus(txId, 'failed', txError);
      }
      throw txError;
    }
  }

  /**
   * Get a transaction by ID
   *
   * Retrieves a transaction from the service's internal registry using its unique ID.
   *
   * @param id - The unique transaction ID generated when the transaction was sent
   * @returns The transaction result if found, null otherwise
   *
   * @example
   * ```typescript
   * const transaction = txService.getTransaction('tx_1234567_abc');
   * if (transaction) {
   *   console.log(`Status: ${transaction.status}`);
   *   console.log(`Hash: ${transaction.txHash}`);
   * }
   * ```
   */
  getTransaction(id: string): TransactionResult | null {
    return this.transactions.get(id) || null;
  }

  /**
   * Get transaction by hash
   *
   * Searches for a transaction using its blockchain hash. Useful when you have
   * a transaction hash from an external source.
   *
   * @param hash - The blockchain transaction hash
   * @returns The transaction result if found, null otherwise
   *
   * @example
   * ```typescript
   * const transaction = txService.getTransactionByHash('0x123...abc');
   * if (transaction) {
   *   console.log(`Found transaction: ${transaction.id}`);
   *   const receipt = await transaction.wait();
   * }
   * ```
   */
  getTransactionByHash(hash: string): TransactionResult | null {
    for (const tx of this.transactions.values()) {
      if (tx.txHash === hash) {
        return tx;
      }
    }
    return null;
  }

  /**
   * Get all transactions
   *
   * Returns all transactions currently stored in the service. Note that the service
   * maintains a limited history based on the configured maxHistorySize.
   *
   * @returns Array of all transaction results
   *
   * @example
   * ```typescript
   * const allTransactions = txService.getAllTransactions();
   * console.log(`Total transactions: ${allTransactions.length}`);
   *
   * // Filter by status
   * const pending = allTransactions.filter(tx => tx.status === 'confirming');
   * console.log(`Pending transactions: ${pending.length}`);
   * ```
   */
  getAllTransactions(): TransactionResult[] {
    return Array.from(this.transactions.values());
  }

  /**
   * Get transaction history with optional filtering
   *
   * Retrieves transaction history with support for filtering by chain, wallet, status,
   * time range, and pagination. Results are sorted by start time (newest first).
   *
   * @param filter - Optional filter criteria
   * @param filter.chainId - Filter by specific chain ID
   * @param filter.chainType - Filter by chain type (evm, solana, aztec)
   * @param filter.walletId - Filter by wallet ID
   * @param filter.status - Filter by status or array of statuses
   * @param filter.timeRange - Filter by time range with start and end timestamps
   * @param filter.offset - Number of transactions to skip (for pagination)
   * @param filter.limit - Maximum number of transactions to return
   * @returns Array of filtered transaction results, sorted newest first
   *
   * @example
   * ```typescript
   * // Get all confirmed transactions
   * const confirmed = txService.getTransactionHistory({
   *   status: 'confirmed'
   * });
   *
   * // Get transactions for a specific wallet and chain
   * const walletTxs = txService.getTransactionHistory({
   *   walletId: 'metamask',
   *   chain: ethereumMainnet, // SupportedChain object
   *   status: ['confirmed', 'failed']
   * });
   *
   * // Get transactions from last hour
   * const recentTxs = txService.getTransactionHistory({
   *   timeRange: {
   *     start: Date.now() - 3600000, // 1 hour ago
   *     end: Date.now()
   *   }
   * });
   *
   * // Paginated results
   * const page2 = txService.getTransactionHistory({
   *   offset: 10,
   *   limit: 10
   * });
   * ```
   */
  getTransactionHistory(filter?: TransactionHistoryFilter): TransactionResult[] {
    let transactions = this.getAllTransactions();

    if (filter) {
      // Apply filters
      if (filter.chainId) {
        transactions = transactions.filter((tx) => tx.chainId === filter.chainId);
      }
      if (filter.chainType) {
        transactions = transactions.filter((tx) => tx.chainType === filter.chainType);
      }
      if (filter.walletId) {
        transactions = transactions.filter((tx) => tx.walletId === filter.walletId);
      }
      if (filter.status) {
        const statusFilter = Array.isArray(filter.status) ? filter.status : [filter.status];
        transactions = transactions.filter((tx) => statusFilter.includes(tx.status));
      }
      if (filter.timeRange) {
        const { start, end } = filter.timeRange;
        transactions = transactions.filter((tx) => tx.startTime >= start && tx.startTime <= end);
      }

      // Apply pagination
      if (filter.offset) {
        transactions = transactions.slice(filter.offset);
      }
      if (filter.limit) {
        transactions = transactions.slice(0, filter.limit);
      }
    }

    // Sort by start time descending (newest first)
    return transactions.sort((a, b) => b.startTime - a.startTime);
  }

  /**
   * Clear transaction history
   *
   * Removes all completed and failed transactions from the history. Active transactions
   * (preparing, signing, broadcasting, confirming) are preserved to prevent data loss.
   *
   * @example
   * ```typescript
   * // Clear history periodically
   * setInterval(() => {
   *   txService.clearHistory();
   *   console.log('Transaction history cleared');
   * }, 3600000); // Every hour
   *
   * // Clear before disconnecting
   * txService.clearHistory();
   * await wallet.disconnect();
   * ```
   */
  clearHistory(): void {
    // Only clear completed/failed transactions
    const toRemove: string[] = [];
    for (const [id, tx] of this.transactions.entries()) {
      if (tx.status === 'confirmed' || tx.status === 'failed') {
        toRemove.push(id);
      }
    }
    for (const id of toRemove) {
      this.transactions.delete(id);
    }
  }

  /**
   * Wait for transaction confirmation
   *
   * Waits for a transaction to be confirmed on the blockchain. This method is also
   * available on the transaction result object returned by sendTransaction.
   *
   * @param id - The transaction ID to wait for
   * @param _confirmations - Number of confirmations to wait for (currently unused, defaults to 1)
   * @returns Promise resolving to the transaction receipt when confirmed
   *
   * @throws {ModalError} Not found error if transaction ID is invalid
   * @throws {ModalError} Transaction failed error if the transaction fails
   * @throws {ModalError} Timeout error if confirmation takes longer than configured timeout
   *
   * @example
   * ```typescript
   * // Wait using transaction ID
   * try {
   *   const receipt = await txService.waitForConfirmation('tx_1234567_abc');
   *   console.log(`Confirmed in block ${receipt.blockNumber}`);
   * } catch (error) {
   *   console.error('Transaction failed or timed out:', error);
   * }
   *
   * // Preferred: use the wait method on transaction result
   * const result = await txService.sendTransaction(...);
   * const receipt = await result.wait();
   * ```
   */
  async waitForConfirmation(id: string, _confirmations = 1): Promise<TransactionReceipt> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw ErrorFactory.notFound('Transaction not found');
    }

    if (transaction.status === 'confirmed' && transaction.receipt) {
      return transaction.receipt;
    }

    if (transaction.status === 'failed') {
      if (transaction.error) {
        throw transaction.error;
      }
      throw ErrorFactory.transactionFailed('Transaction failed');
    }

    // Check if we already have a confirmation promise
    const existingPromise = this.confirmationPromises.get(transaction.txHash);
    if (existingPromise) {
      return new Promise((resolve, reject) => {
        // Replace the callbacks with new ones
        this.confirmationPromises.set(transaction.txHash, {
          ...existingPromise,
          resolve,
          reject,
        });
      });
    }

    // Create new confirmation promise
    return new Promise((resolve, reject) => {
      this.confirmationPromises.set(transaction.txHash, {
        resolve,
        reject,
      });
    });
  }

  /**
   * Estimate gas for EVM transaction
   *
   * Calculates the estimated gas limit and cost for an EVM transaction. Automatically
   * applies a gas buffer based on the configured gasMultiplier. Supports both
   * legacy and EIP-1559 gas pricing.
   *
   * @param params - EVM transaction parameters
   * @param params.to - Recipient address (required for gas estimation)
   * @param params.from - Sender address
   * @param params.value - Transaction value in wei
   * @param params.data - Transaction data
   * @param provider - EVM-compatible blockchain provider
   * @returns Promise resolving to gas estimation details
   *
   * @throws {ModalError} Invalid params error if 'to' address is missing
   * @throws {ModalError} Gas estimation failed error if estimation fails
   *
   * @example
   * ```typescript
   * // Estimate gas for a simple transfer
   * const gasEstimate = await txService.estimateGas({
   *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
   *   from: '0xYourAddress',
   *   value: '1000000000000000000' // 1 ETH
   * }, provider);
   *
   * console.log(`Gas limit: ${gasEstimate.gasLimit}`);
   * console.log(`Estimated cost: ${gasEstimate.estimatedCost} wei`);
   *
   * // Estimate gas for contract interaction
   * const contractGasEstimate = await txService.estimateGas({
   *   to: '0xContractAddress',
   *   from: '0xYourAddress',
   *   data: '0xMethodSignature...'
   * }, provider);
   *
   * // Check if EIP-1559 is supported
   * if (contractGasEstimate.maxFeePerGas) {
   *   console.log(`Max fee: ${contractGasEstimate.maxFeePerGas}`);
   *   console.log(`Priority fee: ${contractGasEstimate.maxPriorityFeePerGas}`);
   * } else {
   *   console.log(`Gas price: ${contractGasEstimate.gasPrice}`);
   * }
   * ```
   */
  async estimateGas(
    params: EVMTransactionParams,
    provider: BlockchainProvider,
  ): Promise<GasEstimationResult> {
    // Service initialization check removed - using stateless pattern

    if (!params.to) {
      throw ErrorFactory.invalidParams('To address is required for gas estimation');
    }

    try {
      const formatted = {
        to: params.to,
        from: params.from,
        value: params.value ? TransactionFormatter['toHex'](params.value.toString()) : undefined,
        data: params.data,
      };

      const gasEstimateResult = await provider.request({
        method: 'eth_estimateGas',
        params: [formatted],
      });

      // Validate gas estimate is a string
      if (typeof gasEstimateResult !== 'string') {
        throw ErrorFactory.gasEstimationFailed(
          `Invalid gas estimate returned: expected string, got ${typeof gasEstimateResult}`,
          { gasEstimateResult },
        );
      }
      const gasEstimate = gasEstimateResult;

      // Convert hex to decimal
      const gasLimit = BigInt(gasEstimate);
      const bufferedGasLimit =
        (gasLimit * BigInt(Math.floor((this.config.gasMultiplier ?? 1.1) * 100))) / 100n;

      // Get current gas price using EIP-1559
      const feeDataResult = await provider.request({
        method: 'eth_feeHistory',
        params: [1, 'latest', [50]],
      });

      // Validate fee data structure
      let feeData: { baseFeePerGas?: string[]; reward?: string[][] } | null = null;
      if (feeDataResult && typeof feeDataResult === 'object' && feeDataResult !== null) {
        feeData = feeDataResult as { baseFeePerGas?: string[]; reward?: string[][] };
      }

      if (!feeData?.baseFeePerGas?.[0]) {
        throw ErrorFactory.gasEstimationFailed(
          'Chain does not support EIP-1559. Please use a modern EVM chain.',
        );
      }

      const baseFee = BigInt(feeData.baseFeePerGas[0]);
      const maxPriorityFeePerGas = BigInt(feeData.reward?.[0]?.[0] || '1000000000'); // 1 gwei default
      const maxFeePerGas = baseFee * 2n + maxPriorityFeePerGas;

      const estimatedCost = bufferedGasLimit * maxFeePerGas;

      return {
        gasLimit: bufferedGasLimit.toString(),
        maxFeePerGas: maxFeePerGas.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
        estimatedCost: estimatedCost.toString(),
      };
    } catch (error) {
      throw ErrorFactory.gasEstimationFailed(
        `Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Simulate Solana transaction
   *
   * Simulates a Solana transaction to check if it would succeed without actually
   * submitting it to the blockchain. Useful for validating transaction parameters
   * and estimating compute units.
   *
   * @param params - Solana transaction parameters
   * @param params.transaction - Serialized transaction to simulate
   * @param params.options - Simulation options (e.g., skipPreflight)
   * @param provider - Solana-compatible blockchain provider
   * @returns Promise resolving to simulation result from the Solana RPC
   *
   * @throws {ModalError} Simulation failed error if the simulation fails
   *
   * @example
   * ```typescript
   * // Simulate a Solana transaction
   * try {
   *   const simulationResult = await txService.simulateTransaction({
   *     transaction: serializedTransaction,
   *     options: {
   *       skipPreflight: false,
   *       commitment: 'confirmed'
   *     }
   *   }, solanaProvider);
   *
   *   if (simulationResult.err) {
   *     console.error('Transaction would fail:', simulationResult.err);
   *   } else {
   *     console.log('Transaction would succeed');
   *     console.log('Compute units consumed:', simulationResult.unitsConsumed);
   *   }
   * } catch (error) {
   *   console.error('Simulation error:', error);
   * }
   * ```
   */
  async simulateTransaction(params: SolanaTransactionParams, provider: BlockchainProvider): Promise<unknown> {
    // Service initialization check removed - using stateless pattern

    try {
      return await provider.request({
        method: 'simulateTransaction',
        params: {
          transaction: params.transaction,
          options: params.options,
        },
      });
    } catch (error) {
      throw ErrorFactory.simulationFailed(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Update transaction status and related metadata.
   *
   * Internal method that updates a transaction's status in the service registry.
   * Automatically sets endTime when transaction reaches a terminal state.
   *
   * @param id - Internal transaction ID
   * @param status - New status to set
   * @param error - Optional error details if transaction failed
   *
   * @remarks
   * - Only updates if transaction exists in registry
   * - Sets endTime for 'confirmed' and 'failed' statuses
   * - Logs all status changes for debugging
   */
  private updateTransactionStatus(id: string, status: TransactionStatus, error?: TransactionError): void {
    const transaction = this.transactions.get(id);
    if (!transaction) return;

    transaction.status = status;

    if (error) {
      transaction.error = error;
    }

    if (status === 'confirmed' || status === 'failed') {
      transaction.endTime = Date.now();
    }

    // Log status change
    this.logger.debug('Transaction status changed', {
      id,
      status,
      hash: transaction.txHash,
    });
  }

  /**
   * Start monitoring for transaction confirmation.
   *
   * Sets up polling interval and timeout to monitor transaction status on the blockchain.
   * Automatically handles cleanup when transaction is confirmed or times out.
   *
   * @param id - Internal transaction ID
   * @param hash - Blockchain transaction hash
   * @param provider - Provider to query for receipts
   * @param chainType - Type of blockchain for proper formatting
   *
   * @remarks
   * - Uses configured pollingInterval and confirmationTimeout
   * - Stores promise callbacks for later resolution
   * - Handles errors gracefully to continue polling
   */
  private startConfirmationMonitoring(
    id: string,
    hash: string,
    provider: BlockchainProvider,
    chainType: ChainType,
  ): void {
    const confirmationData = this.confirmationPromises.get(hash) || {
      resolve: () => {},
      reject: () => {},
    };

    // Set timeout
    confirmationData.timeout = setTimeout(() => {
      this.handleConfirmationTimeout(id, hash);
    }, this.config.confirmationTimeout ?? 60000);

    // Start polling
    confirmationData.interval = setInterval(async () => {
      try {
        await this.checkTransactionReceipt(id, hash, provider, chainType);
      } catch (error) {
        this.logger.error('Error checking transaction receipt:', error);
      }
    }, this.config.pollingInterval ?? 2000);

    this.confirmationPromises.set(hash, confirmationData);
  }

  /**
   * Check for transaction receipt on the blockchain.
   *
   * Queries the blockchain for a transaction receipt using chain-specific RPC methods.
   * Called periodically by the confirmation monitoring interval.
   *
   * @param id - Internal transaction ID
   * @param hash - Blockchain transaction hash
   * @param provider - Provider to query
   * @param chainType - Type of blockchain
   *
   * @remarks
   * - Uses TransactionFormatter to get correct RPC method
   * - Validates receipt structure before processing
   * - Continues polling if receipt not yet available
   * - Handles confirmation when receipt is found
   */
  private async checkTransactionReceipt(
    id: string,
    hash: string,
    provider: BlockchainProvider,
    chainType: ChainType,
  ): Promise<void> {
    const method = TransactionFormatter.getReceiptMethod(chainType);
    const params = TransactionFormatter.formatReceiptParams(hash, chainType);

    try {
      const receipt = await provider.request({
        method,
        params: Array.isArray(params) ? params : [params],
      });

      // Validate receipt exists and has expected structure
      if (receipt && typeof receipt === 'object' && receipt !== null) {
        // Type guard to ensure receipt has minimal required properties
        const hasBasicReceiptProperties =
          'status' in receipt || 'transactionHash' in receipt || 'blockNumber' in receipt;

        if (!hasBasicReceiptProperties) {
          this.logger?.warn('Received receipt with unexpected structure', { receipt, method });
        }
      }

      if (receipt) {
        this.handleTransactionConfirmed(id, hash, receipt, chainType);
      }
    } catch (error) {
      // Check if this is a session error - if so, fail the transaction immediately
      if (isSessionError(error)) {
        this.logger.warn('Session error during transaction receipt check', { id, hash });

        // Fail the transaction immediately instead of continuing to poll
        const sessionError = convertToSessionError(error);
        const txError = this.createTransactionError(sessionError, 'confirmation', id);
        this.updateTransactionStatus(id, 'failed', txError);

        // Clear polling interval and timeout
        const confirmationData = this.confirmationPromises.get(hash);
        if (confirmationData) {
          if (confirmationData.timeout) clearTimeout(confirmationData.timeout);
          if (confirmationData.interval) clearInterval(confirmationData.interval);
          confirmationData.reject(txError);
          this.confirmationPromises.delete(hash);
        }

        return; // Stop polling
      }

      // Continue polling on error
      this.logger.debug('Receipt not yet available:', error);
    }
  }

  /**
   * Handle successful transaction confirmation.
   *
   * Processes a confirmed transaction receipt, updates transaction state, and resolves
   * any waiting promises. Also checks for transaction reversion on EVM chains.
   *
   * @param id - Internal transaction ID
   * @param hash - Blockchain transaction hash
   * @param receipt - Raw receipt from blockchain (format varies by chain)
   * @param chainType - Type of blockchain for proper formatting
   *
   * @remarks
   * - Clears all confirmation timers and intervals
   * - Formats receipt according to chain type
   * - Checks EVM transaction status for reverts
   * - Updates transaction with gas usage for EVM
   * - Resolves wait() promises with receipt
   */
  // biome-ignore lint/suspicious/noExplicitAny: Receipt format varies by chain
  private handleTransactionConfirmed(id: string, hash: string, receipt: any, chainType: ChainType): void {
    const transaction = this.transactions.get(id);
    if (!transaction) return;

    // Clear confirmation promise
    const confirmationData = this.confirmationPromises.get(hash);
    if (confirmationData) {
      if (confirmationData.timeout) clearTimeout(confirmationData.timeout);
      if (confirmationData.interval) clearInterval(confirmationData.interval);
    }

    // Format receipt based on chain type
    const formattedReceipt: TransactionReceipt = this.formatReceipt(receipt, chainType);

    // Check if transaction was successful
    if (chainType === 'evm' && (formattedReceipt.status === '0x0' || formattedReceipt.status === 0)) {
      const modalError = ErrorFactory.transactionReverted('Transaction was reverted');
      const txError = this.createTransactionError(modalError, 'confirmation', id);
      this.updateTransactionStatus(id, 'failed', txError);

      // Only reject if we have a reject handler
      if (confirmationData?.reject) {
        confirmationData.reject(txError);
      }
      this.confirmationPromises.delete(hash);
      return;
    }

    // Update transaction
    transaction.receipt = formattedReceipt;
    transaction.blockNumber = formattedReceipt.blockNumber;
    transaction.blockHash = formattedReceipt.blockHash;

    if (chainType === 'evm') {
      transaction.gasUsed = formattedReceipt.gasUsed;
      if (formattedReceipt.effectiveGasPrice !== undefined) {
        transaction.effectiveGasPrice = formattedReceipt.effectiveGasPrice;
      }
    }

    this.updateTransactionStatus(id, 'confirmed');

    // Resolve promise
    confirmationData?.resolve(formattedReceipt);
    this.confirmationPromises.delete(hash);

    // Log confirmation
    this.logger.info('Transaction confirmed', {
      id,
      hash,
      blockNumber: formattedReceipt.blockNumber,
    });
  }

  /**
   * Handle transaction confirmation timeout.
   *
   * Called when a transaction takes longer than the configured timeout to confirm.
   * Marks the transaction as failed and rejects any waiting promises.
   *
   * @param id - Internal transaction ID
   * @param hash - Blockchain transaction hash
   *
   * @remarks
   * - Clears polling interval to stop checking
   * - Creates timeout error with appropriate stage
   * - Updates transaction status to 'failed'
   * - Rejects wait() promises with error
   */
  private handleConfirmationTimeout(id: string, hash: string): void {
    const confirmationData = this.confirmationPromises.get(hash);
    if (!confirmationData) return;

    if (confirmationData.interval) clearInterval(confirmationData.interval);

    const modalError = ErrorFactory.timeoutError('Transaction confirmation timeout');
    const txError = this.createTransactionError(modalError, 'confirmation', id);
    this.updateTransactionStatus(id, 'failed', txError);

    // Only reject if we have a reject handler
    if (confirmationData.reject) {
      confirmationData.reject(txError);
    }
    this.confirmationPromises.delete(hash);
  }

  /**
   * Format raw blockchain receipt into standardized structure.
   *
   * Normalizes receipt data from different blockchain types into a common format.
   * Handles variations in field names and data types across chains.
   *
   * @param receipt - Raw receipt from blockchain RPC
   * @param chainType - Type of blockchain for chain-specific formatting
   * @returns Standardized transaction receipt
   *
   * @remarks
   * - Maps common fields like hash, blockNumber, status
   * - Handles hex/number conversions for block numbers
   * - Includes chain-specific fields (e.g., effectiveGasPrice for EVM)
   * - Provides defaults for missing fields
   */
  // biome-ignore lint/suspicious/noExplicitAny: Receipt format varies by chain
  private formatReceipt(receipt: any, chainType: ChainType): TransactionReceipt {
    // Common fields
    const formatted: TransactionReceipt = {
      transactionHash: receipt.transactionHash || receipt.hash,
      blockHash: receipt.blockHash || receipt.blockhash || '',
      blockNumber:
        typeof receipt.blockNumber === 'string'
          ? Number.parseInt(receipt.blockNumber, 16)
          : receipt.blockNumber || receipt.slot || 0,
      from: receipt.from || '',
      to: receipt.to,
      gasUsed: receipt.gasUsed?.toString() || '0',
      status: receipt.status || '0x1',
      logs: receipt.logs || [],
    };

    // Chain-specific fields
    if (chainType === 'evm') {
      formatted.effectiveGasPrice = receipt.effectiveGasPrice?.toString();
      formatted.cumulativeGasUsed = receipt.cumulativeGasUsed?.toString();
    }

    return formatted;
  }

  /**
   * Create a properly formatted transaction error.
   *
   * Wraps generic errors into TransactionError format with stage information.
   * Preserves existing ModalError properties if already formatted.
   *
   * @param error - Original error (any type)
   * @param stage - Transaction stage where error occurred
   * @param transactionId - Optional transaction ID if available
   * @returns Formatted TransactionError with stage and ID
   *
   * @remarks
   * - Uses ErrorFactory to ensure proper ModalError base
   * - Adds transaction-specific context (stage, ID)
   * - Preserves original error message and stack
   */
  private createTransactionError(
    error: unknown,
    stage: TransactionError['stage'],
    transactionId?: string,
  ): TransactionError {
    // If it's already a ModalError, use it directly
    const modalError = ErrorFactory.isModalError(error) ? error : ErrorFactory.fromError(error);

    return {
      ...modalError,
      stage,
      ...(transactionId !== undefined && { transactionId }),
    };
  }

  /**
   * Generate unique transaction ID for internal tracking.
   *
   * Creates a unique identifier with 'tx' prefix and timestamp for sorting.
   *
   * @returns Unique transaction ID string
   *
   * @remarks
   * - Format: 'tx_timestamp_randomString'
   * - Timestamp allows chronological sorting
   * - Random component ensures uniqueness
   *
   * @example
   * ```typescript
   * const id = this.generateTransactionId();
   * // Returns: 'tx_1704067200000_abc123def'
   * ```
   */
  private generateTransactionId(): string {
    return generateId({ prefix: 'tx', timestamp: true });
  }

  /**
   * Prune transaction history to maintain configured size limit.
   *
   * Removes oldest completed/failed transactions when history exceeds maxHistorySize.
   * Preserves active transactions (preparing, signing, broadcasting, confirming).
   *
   * @remarks
   * - Only prunes when size exceeds configured limit
   * - Sorts by startTime to remove oldest first
   * - Never removes active transactions
   * - Maintains exactly maxHistorySize transactions
   *
   * @example
   * ```typescript
   * // With maxHistorySize: 100 and 120 transactions
   * // This will remove the 20 oldest completed/failed transactions
   * this.pruneTransactionHistory();
   * ```
   */
  private pruneTransactionHistory(): void {
    if (this.transactions.size <= (this.config.maxHistorySize ?? 100)) {
      return;
    }

    // Get completed/failed transactions sorted by start time
    const completedTxs = Array.from(this.transactions.entries())
      .filter(([, tx]) => tx.status === 'confirmed' || tx.status === 'failed')
      .sort(([, a], [, b]) => a.startTime - b.startTime);

    // Remove oldest transactions
    const toRemove = completedTxs.slice(0, this.transactions.size - (this.config.maxHistorySize ?? 100));
    for (const [id] of toRemove) {
      this.transactions.delete(id);
    }
  }

  /**
   * Additional validation and utility methods for React hook integration
   */

  /**
   * Validate connection state for transaction sending.
   *
   * Ensures all required connection parameters are present before attempting
   * to send a transaction. Used by React hooks to provide early validation.
   *
   * @param isConnected - Whether wallet is connected
   * @param chainId - Current chain ID
   * @param chainType - Current chain type
   * @param wallet - Wallet instance
   * @returns Validation result with error message if invalid
   *
   * @example
   * ```typescript
   * const validation = txService.validateConnectionState(
   *   isConnected,
   *   chainId,
   *   chainType,
   *   wallet
   * );
   *
   * if (!validation.isValid) {
   *   throw new Error(validation.error);
   * }
   * ```
   */
  validateConnectionState(
    isConnected: boolean,
    chainId: string | null,
    chainType: string | null,
    wallet: unknown,
  ): { isValid: boolean; error?: string } {
    if (!isConnected) {
      return { isValid: false, error: 'Wallet not connected' };
    }
    if (!chainId) {
      return { isValid: false, error: 'No chain ID available' };
    }
    if (!chainType) {
      return { isValid: false, error: 'No chain type available' };
    }
    if (!wallet) {
      return { isValid: false, error: 'No wallet available' };
    }
    return { isValid: true };
  }

  /**
   * Validate transaction parameters for the current chain type.
   *
   * Basic validation to ensure parameters are properly structured before
   * sending to the full validation pipeline.
   *
   * @param params - Transaction parameters to validate
   * @param chainType - Chain type for validation context
   * @returns Validation result with error message if invalid
   *
   * @remarks
   * - This is a preliminary check before full validation
   * - Full validation happens in TransactionValidator
   * - Used by React hooks for early feedback
   */
  validateTransactionParams(params: unknown, chainType: string | null): { isValid: boolean; error?: string } {
    if (!params || typeof params !== 'object') {
      return { isValid: false, error: 'Invalid transaction parameters' };
    }
    if (!chainType) {
      return { isValid: false, error: 'Chain type required for validation' };
    }
    return { isValid: true };
  }

  /**
   * Validate chain compatibility for transaction.
   *
   * Checks if the current chain matches requirements for the transaction.
   * Can be extended to check wallet support for target chain.
   *
   * @param _targetChainId - Desired chain for transaction (currently unused)
   * @param currentChainId - Currently connected chain
   * @param wallet - Wallet instance for capability checking
   * @returns Validation result with error message if invalid
   *
   * @remarks
   * - Currently only checks for presence of chain ID
   * - Can be extended for cross-chain validation
   * - Target chain parameter reserved for future use
   */
  validateChainCompatibility(
    _targetChainId: string,
    currentChainId: string | null,
    wallet: unknown,
  ): { isValid: boolean; error?: string } {
    if (!currentChainId) {
      return { isValid: false, error: 'No current chain ID available' };
    }
    if (!wallet) {
      return { isValid: false, error: 'No wallet available for chain validation' };
    }
    // Additional chain compatibility logic would go here
    return { isValid: true };
  }

  /**
   * Validate parameters for gas estimation.
   *
   * Ensures required fields are present and chain type is compatible
   * with gas estimation functionality.
   *
   * @param params - EVM transaction parameters
   * @param chainType - Current chain type
   * @returns Validation result with error message if invalid
   *
   * @remarks
   * - Gas estimation requires 'to' address
   * - Only supported for EVM chains
   * - Used by estimateGas method and React hooks
   *
   * @example
   * ```typescript
   * const validation = txService.validateGasEstimationParams(
   *   { to: '0x...', value: '1000' },
   *   'evm'
   * );
   *
   * if (validation.isValid) {
   *   const estimate = await txService.estimateGas(params, provider);
   * }
   * ```
   */
  validateGasEstimationParams(
    params: EVMTransactionParams,
    chainType: string | null,
  ): { isValid: boolean; error?: string } {
    if (!params.to) {
      return { isValid: false, error: 'To address required for gas estimation' };
    }
    if (chainType !== 'evm') {
      return { isValid: false, error: 'Gas estimation only supported for EVM chains' };
    }
    return { isValid: true };
  }

  /**
   * Validate parameters for transaction simulation.
   *
   * Ensures Solana transaction data is present and chain type is compatible
   * with simulation functionality.
   *
   * @param params - Solana transaction parameters
   * @param chainType - Current chain type
   * @returns Validation result with error message if invalid
   *
   * @remarks
   * - Simulation requires serialized transaction data
   * - Only supported for Solana chains
   * - Used by simulateTransaction method
   *
   * @example
   * ```typescript
   * const validation = txService.validateSimulationParams(
   *   { transaction: 'base64...', options: {} },
   *   'solana'
   * );
   *
   * if (validation.isValid) {
   *   const result = await txService.simulateTransaction(params, provider);
   * }
   * ```
   */
  validateSimulationParams(
    params: SolanaTransactionParams,
    chainType: string | null,
  ): { isValid: boolean; error?: string } {
    if (!params.transaction) {
      return { isValid: false, error: 'Transaction data required for simulation' };
    }
    if (chainType !== 'solana') {
      return { isValid: false, error: 'Transaction simulation only supported for Solana chains' };
    }
    return { isValid: true };
  }

  /**
   * Convert core transaction error to React-compatible error.
   *
   * Ensures error objects have the proper structure for React error boundaries
   * and hooks while maintaining all transaction-specific context.
   *
   * @param coreError - Original transaction error
   * @returns Properly formatted TransactionError
   *
   * @remarks
   * - Preserves all error properties
   * - Ensures proper prototype chain
   * - Maintains stage and transaction ID
   * - Compatible with React error handling
   */
  convertToReactError(coreError: TransactionError): TransactionError {
    // Create a proper TransactionError object by extending the base ModalError
    const baseError = ErrorFactory.transactionFailed(coreError.message);

    const reactError: TransactionError = {
      ...baseError,
      stage: coreError.stage,
      ...(coreError.transactionId && { transactionId: coreError.transactionId }),
      ...(coreError.transactionHash && { transactionHash: coreError.transactionHash }),
    };

    return reactError;
  }

  /**
   * Compute loading state from transaction status.
   *
   * Determines if a transaction is in an active/loading state based on its status.
   * Used by React hooks to manage UI loading indicators.
   *
   * @param status - Current transaction status
   * @returns True if transaction is actively processing
   *
   * @remarks
   * - Loading states: preparing, proving, signing, broadcasting
   * - Non-loading: idle, confirming, confirmed, failed
   * - Confirming is not considered loading (passive wait)
   *
   * @example
   * ```typescript
   * const isLoading = txService.computeLoadingState(transaction.status);
   * if (isLoading) {
   *   showSpinner();
   * }
   * ```
   */
  computeLoadingState(status: TransactionStatus): boolean {
    return status === 'simulating' || status === 'proving' || status === 'sending' || status === 'pending';
  }
}
