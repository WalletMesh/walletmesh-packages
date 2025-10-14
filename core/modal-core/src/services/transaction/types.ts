import type { ModalError } from '../../internal/core/errors/types.js';
import type { ChainType } from '../../types.js';

/**
 * Transaction status tracking throughout the lifecycle of a blockchain transaction.
 *
 * Uses Aztec-native terminology aligned with the official Aztec.js SDK:
 * - `simulating` maps to Aztec's simulate() method
 * - `proving` is unique to zero-knowledge systems
 * - `sending` maps to Aztec's send() method
 * - `pending` is standard for awaiting confirmation
 *
 * @remarks
 * The transaction lifecycle follows this progression:
 * 1. `idle` - Initial state before any action
 * 2. `simulating` - Transaction is being simulated (maps to Aztec's simulate())
 * 3. `proving` - Zero-knowledge proof is being generated (Aztec only)
 * 4. `sending` - Transaction is being sent to the network (maps to Aztec's send())
 * 5. `pending` - Transaction submitted, awaiting network inclusion
 * 6. `confirming` - Transaction included, awaiting confirmations
 * 7. `confirmed` - Transaction has been confirmed on-chain
 * 8. `failed` - Transaction failed at any stage
 *
 * Note: The `proving` step only occurs for privacy-preserving chains like Aztec
 * where zero-knowledge proofs must be generated before submission.
 *
 * @example
 * ```typescript
 * // Monitor transaction status changes
 * if (transaction.status === 'proving') {
 *   console.log('Generating zero-knowledge proof... This may take 30-60 seconds');
 * } else if (transaction.status === 'simulating') {
 *   console.log('Simulating transaction execution...');
 * } else if (transaction.status === 'sending') {
 *   console.log('Sending transaction to network...');
 * } else if (transaction.status === 'confirmed') {
 *   console.log('Transaction successful!');
 * }
 * ```
 */
export type TransactionStatus =
  | 'idle'
  | 'simulating'
  | 'proving'
  | 'sending'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed';

/**
 * Base transaction parameters common to all blockchain types.
 *
 * These parameters provide chain-agnostic configuration options that apply
 * to all transaction types regardless of the underlying blockchain.
 *
 * @example
 * ```typescript
 * const baseParams: BaseTransactionParams = {
 *   chainId: '1', // Ethereum mainnet
 *   autoSwitchChain: true, // Auto-switch if on wrong chain
 *   metadata: {
 *     description: 'Purchase NFT',
 *     action: 'nft-mint',
 *     data: {
 *       tokenId: '1234',
 *       collection: 'CoolNFTs'
 *     }
 *   }
 * };
 * ```
 */
export interface BaseTransactionParams {
  /**
   * Target chain ID for the transaction.
   * If specified and different from current chain, may trigger chain switch.
   */
  chainId?: string;

  /**
   * Whether to automatically switch chains if the wallet is on a different chain.
   * When true, the service will attempt to switch to the target chainId before sending.
   * Defaults to false if not specified.
   */
  autoSwitchChain?: boolean;

  /**
   * Transaction metadata for tracking and UI purposes.
   * This data is stored with the transaction but not sent on-chain.
   */
  metadata?: {
    /** Human-readable description of the transaction purpose */
    description?: string;
    /** Categorization tag for the transaction (e.g., 'swap', 'transfer', 'nft-mint') */
    action?: string;
    /** Custom application-specific data associated with this transaction */
    data?: Record<string, unknown>;
  };
}

/**
 * EVM (Ethereum Virtual Machine) transaction parameters.
 *
 * Supports EIP-1559 (London fork) transactions.
 * All numeric values should be provided as strings to handle large numbers safely.
 *
 * @remarks
 * - For simple ETH transfers, only `to` and `value` are required
 * - For contract interactions, include `data` with the encoded function call
 * - Gas parameters are optional - the service will estimate if not provided
 *
 * @example
 * ```typescript
 * // Simple ETH transfer
 * const transferParams: EVMTransactionParams = {
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
 *   value: '1000000000000000000' // 1 ETH in wei
 * };
 *
 * // ERC20 token transfer
 * const tokenTransferParams: EVMTransactionParams = {
 *   to: '0xTokenContractAddress',
 *   data: '0xa9059cbb...', // transfer(address,uint256) encoded
 *   gas: '65000' // Manual gas limit
 * };
 *
 * // EIP-1559 transaction with priority fee
 * const eip1559Params: EVMTransactionParams = {
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
 *   value: '1000000000000000000',
 *   maxFeePerGas: '30000000000', // 30 gwei
 *   maxPriorityFeePerGas: '2000000000' // 2 gwei tip
 * };
 * ```
 */
export interface EVMTransactionParams extends BaseTransactionParams {
  /**
   * Target address for the transaction.
   * Must be a valid Ethereum address (0x-prefixed, 40 hex characters).
   */
  to: string;

  /**
   * Value to send in wei (as string to handle large numbers).
   * Use web3 utilities to convert from ether: web3.utils.toWei('1', 'ether')
   */
  value?: string;

  /**
   * Transaction data for contract interactions.
   * Hex-encoded function call or deployment bytecode.
   */
  data?: string;

  /**
   * Gas limit override (as string).
   * If not provided, will be estimated automatically with a safety buffer.
   */
  gas?: string;

  /**
   * Maximum fee per gas for EIP-1559 transactions (as string in wei).
   * Total fee = (base fee + priority fee) * gas used, capped at this value.
   */
  maxFeePerGas?: string;

  /**
   * Maximum priority fee (tip) per gas for EIP-1559 transactions (as string in wei).
   * This is paid to miners/validators as an incentive.
   */
  maxPriorityFeePerGas?: string;

  /**
   * Transaction nonce override.
   * Useful for replacing stuck transactions or ensuring order.
   */
  nonce?: number;

  /**
   * From address (optional, defaults to current connected account).
   * Must match the connected wallet's address if provided.
   */
  from?: string;
}

/**
 * Solana transaction parameters.
 *
 * Solana transactions must be pre-built and serialized before sending.
 * The transaction should include all required signatures except for the wallet's signature.
 *
 * @remarks
 * - Transactions must be serialized to base64 format
 * - Use Solana web3.js or similar libraries to construct transactions
 * - The wallet will add its signature when sending
 * - Preflight simulation helps catch errors before submission
 *
 * @example
 * ```typescript
 * // Using @solana/web3.js to build a transfer
 * const transaction = new Transaction().add(
 *   SystemProgram.transfer({
 *     fromPubkey: publicKey,
 *     toPubkey: new PublicKey('RecipientAddress...'),
 *     lamports: 1000000000 // 1 SOL
 *   })
 * );
 *
 * // Serialize for sending
 * const serialized = transaction.serialize({
 *   requireAllSignatures: false
 * }).toString('base64');
 *
 * const solanaParams: SolanaTransactionParams = {
 *   transaction: serialized,
 *   options: {
 *     skipPreflight: false, // Simulate first
 *     preflightCommitment: 'confirmed',
 *     maxRetries: 3
 *   }
 * };
 * ```
 */
export interface SolanaTransactionParams extends BaseTransactionParams {
  /**
   * Serialized transaction in base64 format.
   * Must be a valid Solana transaction with all required fields except wallet signature.
   */
  transaction: string;

  /**
   * Options for sending the transaction.
   * Controls simulation and retry behavior.
   */
  options?: {
    /**
     * Skip preflight transaction simulation.
     * When false (default), transaction is simulated before sending to catch errors early.
     */
    skipPreflight?: boolean;
    /**
     * Commitment level for preflight simulation.
     * - `processed`: Lowest latency, least reliable
     * - `confirmed`: Medium latency, more reliable (default)
     * - `finalized`: Highest latency, most reliable
     */
    preflightCommitment?: 'processed' | 'confirmed' | 'finalized';
    /**
     * Maximum number of retry attempts if transaction fails.
     * Useful for handling temporary network issues.
     */
    maxRetries?: number;
  };
}

/**
 * Aztec transaction parameters.
 *
 * Aztec is a privacy-focused Layer 2 solution for Ethereum.
 * Transactions interact with noir contracts and can optionally use gasless execution.
 *
 * @remarks
 * - Contract addresses must be valid Aztec contract addresses
 * - Function names must match the contract's ABI
 * - Arguments are passed as an array and must match function signature
 * - Supports both native fee payment and gasless transactions
 *
 * @example
 * ```typescript
 * // Simple contract call with native fee payment
 * const aztecParams: AztecTransactionParams = {
 *   contractAddress: '0x1234...abcd',
 *   functionName: 'transfer',
 *   args: [
 *     recipientAddress,
 *     amount,
 *     nonce
 *   ]
 * };
 *
 * // Gasless transaction with fee payer
 * const gaslessParams: AztecTransactionParams = {
 *   contractAddress: '0x1234...abcd',
 *   functionName: 'privateTransfer',
 *   args: [recipient, amount],
 *   fee: {
 *     paymentMethod: 'gasless',
 *     payer: '0xFeePayerAddress'
 *   }
 * };
 * ```
 */
export interface AztecTransactionParams extends BaseTransactionParams {
  /**
   * Target Aztec contract address.
   * Must be a deployed contract on the Aztec network.
   */
  contractAddress: string;

  /**
   * Name of the contract function to call.
   * Must match a function in the contract's ABI.
   */
  functionName: string;

  /**
   * Arguments to pass to the function.
   * Order and types must match the function signature.
   */
  args: unknown[];

  /**
   * Optional fee payment configuration.
   * Allows for gasless transactions where another party pays fees.
   */
  fee?: {
    /**
     * Fee payment method.
     * - `native`: Sender pays fees (default)
     * - `gasless`: Another party pays fees
     */
    paymentMethod: 'native' | 'gasless';
    /**
     * Address of the fee payer for gasless transactions.
     * Required when paymentMethod is 'gasless'.
     */
    payer?: string;
  };
}

/**
 * Transaction request type that maps chain types to their specific parameter interfaces.
 *
 * This conditional type ensures type safety by providing the correct transaction
 * parameter interface based on the chain type specified.
 *
 * @template T - The chain type ('evm', 'solana', 'aztec', or generic)
 *
 * @example
 * ```typescript
 * // Type is automatically inferred based on chain type
 * function sendTransaction<T extends ChainType>(
 *   chainType: T,
 *   params: TransactionRequest<T>
 * ) {
 *   // params will have the correct type based on chainType
 * }
 *
 * // EVM transaction
 * sendTransaction('evm', {
 *   to: '0x...',
 *   value: '1000000000000000000'
 * }); // params is EVMTransactionParams
 *
 * // Solana transaction
 * sendTransaction('solana', {
 *   transaction: 'base64...'
 * }); // params is SolanaTransactionParams
 * ```
 */
export type TransactionRequest<T extends ChainType = ChainType> = T extends 'evm'
  ? EVMTransactionParams
  : T extends 'solana'
    ? SolanaTransactionParams
    : T extends 'aztec'
      ? AztecTransactionParams
      : BaseTransactionParams;

/**
 * Transaction receipt containing confirmation details from the blockchain.
 *
 * Represents the final state of a confirmed transaction, including block information,
 * gas usage, and execution status. The exact fields may vary by blockchain type.
 *
 * @remarks
 * - `status` indicates success (1/'0x1') or failure (0/'0x0')
 * - Gas-related fields are primarily for EVM chains
 * - `logs` contain events emitted during transaction execution
 * - Receipt is only available after transaction is mined/confirmed
 *
 * @example
 * ```typescript
 * // Wait for transaction and check receipt
 * const result = await txService.sendTransaction(params);
 * const receipt = await result.wait();
 *
 * if (receipt.status === '0x1' || receipt.status === 1) {
 *   console.log('Transaction successful!');
 *   console.log(`Gas used: ${receipt.gasUsed}`);
 *   console.log(`Block: ${receipt.blockNumber}`);
 *
 *   // Process events from logs
 *   receipt.logs?.forEach(log => {
 *     console.log('Event emitted:', log);
 *   });
 * } else {
 *   console.error('Transaction failed!');
 * }
 * ```
 */
export interface TransactionReceipt {
  /**
   * The transaction hash (0x-prefixed hex string).
   * Unique identifier for this transaction on the blockchain.
   */
  transactionHash: string;
  /**
   * Hash of the block containing this transaction.
   * Can be used to verify block inclusion.
   */
  blockHash: string;
  /**
   * Block number where the transaction was included.
   * Higher numbers indicate more recent blocks.
   */
  blockNumber: number;
  /**
   * Address that sent the transaction.
   * Always present in receipts.
   */
  from: string;
  /**
   * Recipient address (if applicable).
   * May be undefined for contract creation transactions.
   */
  to?: string;
  /**
   * Total gas consumed by the transaction (as string).
   * Actual cost depends on gas price at execution time.
   */
  gasUsed: string;
  /**
   * Execution status of the transaction.
   * - 1/'0x1': Success - transaction executed without reverting
   * - 0/'0x0': Failure - transaction reverted
   */
  status: '0x0' | '0x1' | 0 | 1;
  /**
   * Array of log entries/events emitted during execution.
   * Contains decoded events from smart contracts.
   */
  logs?: unknown[];
  /**
   * Actual gas price paid (EVM chains with EIP-1559).
   * May differ from original gas price due to base fee changes.
   */
  effectiveGasPrice?: string;
  /**
   * Total gas used in the block up to this transaction (EVM).
   * Useful for calculating gas usage patterns.
   */
  cumulativeGasUsed?: string;
}

/**
 * Complete transaction result with tracking information and helper methods.
 *
 * Provides comprehensive information about a transaction's lifecycle, from submission
 * to confirmation. Includes a `wait()` method for awaiting confirmation.
 *
 * @remarks
 * - The `txStatusId` is for internal tracking/notifications, while `txHash` is the blockchain identifier
 * - `txStatusId` is generated by frontend and used to match backend notifications to UI state
 * - `txHash` becomes available after transaction is broadcast to the network
 * - Status updates as the transaction progresses through its lifecycle
 * - The `wait()` method provides a convenient way to await confirmation
 * - Error details are included if the transaction fails at any stage
 *
 * @example
 * ```typescript
 * // Send and track a transaction
 * const result = await txService.sendTransaction(params);
 *
 * console.log(`Status Tracking ID: ${result.txStatusId}`);  // Internal tracking
 * console.log(`Blockchain Hash: ${result.txHash}`);         // On-chain identifier
 * console.log(`Status: ${result.status}`);
 *
 * // Monitor status
 * if (result.status === 'broadcasting') {
 *   console.log('Transaction is being broadcast...');
 * }
 *
 * // Wait for confirmation
 * try {
 *   const receipt = await result.wait();
 *   console.log('Transaction confirmed!');
 *   console.log(`Gas used: ${result.gasUsed}`);
 *   console.log(`View on explorer: https://explorer.com/tx/${result.txHash}`);
 * } catch (error) {
 *   console.error('Transaction failed:', result.error);
 * }
 *
 * // Access metadata
 * if (result.metadata?.description) {
 *   console.log(`Transaction: ${result.metadata.description}`);
 * }
 * ```
 */
export interface TransactionResult {
  /**
   * Internal status tracking ID for coordinating notifications between backend and frontend.
   *
   * Generated by the frontend, passed to backend to ensure status notifications
   * can be matched to the correct transaction in the UI. This is NOT the blockchain
   * transaction hash - see `txHash` for the on-chain identifier.
   *
   * @remarks
   * Unique per session, not persisted, not sent to blockchain.
   */
  txStatusId: string;

  /**
   * Blockchain transaction hash/signature.
   *
   * The actual identifier on the blockchain, available after the transaction
   * has been successfully broadcast to the network. This is the permanent,
   * on-chain identifier that can be used to look up the transaction.
   *
   * @remarks
   * Available after transaction is broadcast (status >= 'broadcasting').
   * Use this for blockchain explorers and on-chain lookups.
   */
  txHash: string;

  /**
   * Chain ID where the transaction was sent.
   * Matches the connected chain at time of sending.
   */
  chainId: string;

  /**
   * Type of blockchain (evm, solana, aztec).
   * Determines how the transaction is processed.
   */
  chainType: ChainType;

  /**
   * ID of the wallet that sent the transaction.
   * Useful for multi-wallet applications.
   */
  walletId: string;

  /**
   * Current status of the transaction.
   * Updates as transaction progresses through lifecycle.
   */
  status: TransactionStatus;

  /**
   * Address that sent the transaction.
   * The connected wallet's active address.
   */
  from: string;

  /**
   * Original transaction request parameters.
   * Preserves the input for reference.
   */
  request: TransactionRequest;

  /**
   * Transaction receipt after confirmation.
   * Only available when status is 'confirmed'.
   */
  receipt?: TransactionReceipt;

  /**
   * Error details if transaction failed.
   * Includes stage and error message.
   */
  error?: ModalError;

  /**
   * Unix timestamp when transaction started.
   * Useful for calculating transaction duration.
   */
  startTime: number;

  /**
   * Unix timestamp when transaction completed.
   * Set when status becomes 'confirmed' or 'failed'.
   */
  endTime?: number;

  /**
   * Block number where transaction was included.
   * Copied from receipt for convenience.
   */
  blockNumber?: number;

  /**
   * Hash of the block containing the transaction.
   * Copied from receipt for convenience.
   */
  blockHash?: string;

  /**
   * Gas consumed by the transaction (EVM only).
   * Copied from receipt for convenience.
   */
  gasUsed?: string;

  /**
   * Actual gas price paid (EVM with EIP-1559).
   * Copied from receipt for convenience.
   */
  effectiveGasPrice?: string;

  /**
   * Application-specific metadata.
   * Custom data passed in transaction request.
   */
  metadata?: Record<string, unknown>;

  /**
   * Wait for transaction confirmation.
   * Returns a promise that resolves with the receipt when confirmed.
   *
   * @param confirmations - Number of block confirmations to wait for (default: 1)
   * @returns Promise resolving to the transaction receipt
   * @throws TransactionError if the transaction fails or times out
   */
  wait: (confirmations?: number) => Promise<TransactionReceipt>;
}

/**
 * Transaction error with detailed context about failure stage.
 *
 * Extends the base ModalError with transaction-specific information to help
 * diagnose where and why a transaction failed.
 *
 * @remarks
 * - The `stage` indicates at which point in the lifecycle the error occurred
 * - Transaction ID and hash may not be available for early-stage failures
 * - Error messages should be user-friendly when possible
 *
 * @example
 * ```typescript
 * try {
 *   const result = await txService.sendTransaction(params);
 *   await result.wait();
 * } catch (error) {
 *   if (isTransactionError(error)) {
 *     console.error(`Transaction failed at ${error.stage}`);
 *     console.error(`Error: ${error.message}`);
 *
 *     if (error.stage === 'signing') {
 *       console.log('User may have rejected the transaction');
 *     } else if (error.stage === 'confirmation') {
 *       console.log('Transaction may have been reverted');
 *     }
 *   }
 * }
 * ```
 */
export interface TransactionError extends ModalError {
  /**
   * Transaction lifecycle stage where the error occurred.
   * - `validation`: Parameters failed validation before sending
   * - `preparation`: Error while preparing transaction data
   * - `proving`: Failed to generate zero-knowledge proof (Aztec)
   * - `signing`: User rejected or wallet failed to sign
   * - `broadcasting`: Failed to send to the network
   * - `confirmation`: Transaction reverted or timed out
   */
  stage: 'validation' | 'preparation' | 'proving' | 'signing' | 'broadcasting' | 'confirmation';

  /**
   * Internal transaction ID if available.
   * May be undefined for validation/preparation errors.
   */
  transactionId?: string;

  /**
   * Blockchain transaction hash if available.
   * Only present if transaction was successfully broadcast.
   */
  transactionHash?: string;
}

/**
 * Result of transaction parameter validation.
 *
 * Provides detailed feedback about transaction validity, including both
 * blocking errors and non-blocking warnings.
 *
 * @remarks
 * - If `valid` is false, the transaction cannot proceed
 * - Warnings indicate potential issues but don't block execution
 * - All errors should be addressed before retrying
 *
 * @example
 * ```typescript
 * const validation = TransactionValidator.validate(params, chainType);
 *
 * if (!validation.valid) {
 *   console.error('Transaction invalid:');
 *   validation.errors.forEach(error => console.error(`- ${error}`));
 *   return;
 * }
 *
 * if (validation.warnings.length > 0) {
 *   console.warn('Transaction warnings:');
 *   validation.warnings.forEach(warning => console.warn(`- ${warning}`));
 * }
 * ```
 */
export interface TransactionValidationResult {
  /** Whether the transaction parameters are valid and can be sent */
  valid: boolean;
  /** Array of validation errors that must be fixed */
  errors: string[];
  /** Array of warnings about potential issues */
  warnings: string[];
}

/**
 * Gas estimation result for EVM transactions.
 *
 * Provides estimated gas costs using EIP-1559 pricing.
 * All values are returned as strings to safely handle large numbers.
 *
 * @remarks
 * - `gasLimit` includes a safety buffer (configured via gasMultiplier)
 * - `maxFeePerGas` and `maxPriorityFeePerGas` will be present for EIP-1559 chains
 * - `estimatedCost` is calculated as gasLimit * price for quick reference
 * - Values are in wei unless otherwise specified
 *
 * @example
 * ```typescript
 * // Estimate gas for a transaction
 * const estimation = await txService.estimateGas({
 *   to: '0x...',
 *   value: '1000000000000000000',
 *   data: '0x...'
 * }, provider);
 *
 * console.log(`Gas limit: ${estimation.gasLimit}`);
 * console.log(`Estimated cost: ${estimation.estimatedCost} wei`);
 *
 * // EIP-1559 transaction
 * console.log(`Max fee: ${estimation.maxFeePerGas} wei`);
 * console.log(`Priority fee: ${estimation.maxPriorityFeePerGas} wei`);
 *
 * // Convert to more readable units
 * const costInEth = Number(estimation.estimatedCost) / 1e18;
 * console.log(`Estimated cost: ${costInEth} ETH`);
 * ```
 */
export interface GasEstimationResult {
  /** Estimated gas limit with safety buffer applied (in gas units) */
  gasLimit: string;
  /** Maximum total fee per gas in wei (EIP-1559) */
  maxFeePerGas?: string;
  /** Maximum priority fee per gas in wei (EIP-1559) */
  maxPriorityFeePerGas?: string;
  /** Total estimated cost in wei (gasLimit * price) */
  estimatedCost: string;
}

/**
 * Filter options for querying transaction history.
 *
 * Allows flexible filtering by various transaction properties with support
 * for pagination. All filters are optional and can be combined.
 *
 * @remarks
 * - Multiple filters are combined with AND logic
 * - Status can be a single value or array for OR logic
 * - Time range uses Unix timestamps (milliseconds)
 * - Results are sorted by startTime descending (newest first)
 *
 * @example
 * ```typescript
 * // Get all pending transactions
 * const pending = txService.getTransactionHistory({
 *   status: ['signing', 'broadcasting', 'confirming']
 * });
 *
 * // Get failed transactions from last hour on Ethereum
 * const recentFailures = txService.getTransactionHistory({
 *   chainId: '1',
 *   status: 'failed',
 *   timeRange: {
 *     start: Date.now() - 3600000, // 1 hour ago
 *     end: Date.now()
 *   }
 * });
 *
 * // Paginated results for a specific wallet
 * const page1 = txService.getTransactionHistory({
 *   walletId: 'metamask',
 *   limit: 20,
 *   offset: 0
 * });
 *
 * const page2 = txService.getTransactionHistory({
 *   walletId: 'metamask',
 *   limit: 20,
 *   offset: 20
 * });
 * ```
 */
export interface TransactionHistoryFilter {
  /** Filter by specific chain ID (e.g., '1' for Ethereum mainnet) */
  chainId?: string;
  /** Filter by blockchain type (evm, solana, aztec) */
  chainType?: ChainType;
  /** Filter by transaction status (single value or array for multiple) */
  status?: TransactionStatus | TransactionStatus[];
  /** Filter by wallet ID that sent the transaction */
  walletId?: string;
  /** Filter by time range using Unix timestamps in milliseconds */
  timeRange?: {
    /** Start timestamp (inclusive) */
    start: number;
    /** End timestamp (inclusive) */
    end: number;
  };
  /** Maximum number of results to return */
  limit?: number;
  /** Number of results to skip for pagination */
  offset?: number;
}
