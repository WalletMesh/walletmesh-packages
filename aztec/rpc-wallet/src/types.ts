import type { AztecAddress } from '@aztec/aztec.js/addresses';
import type { AuthWitness, CallIntent, IntentInnerHash } from '@aztec/aztec.js/authorization';
import type { Fr } from '@aztec/aztec.js/fields';
import type { Tx, TxHash, TxProfileResult, TxReceipt } from '@aztec/aztec.js/tx';
import type {
  Aliased,
  BatchableMethods,
  BatchedMethod,
  BatchResults,
  ProfileOptions,
  SendOptions,
  SimulateOptions,
  Wallet,
} from '@aztec/aztec.js/wallet';
import type { ChainInfo } from '@aztec/entrypoints/interfaces';
import type { AbiDecoded, ContractArtifact, EventMetadataDefinition, FunctionCall } from '@aztec/stdlib/abi';
import type {
  ContractClassMetadata,
  ContractInstanceWithAddress,
  ContractMetadata,
} from '@aztec/stdlib/contract';
import type {
  ExecutionPayload,
  SimulationStats,
  TxSimulationResult,
  UtilitySimulationResult,
} from '@aztec/stdlib/tx';
import type { JSONRPCEventMap } from '@walletmesh/jsonrpc';
import type { WalletMethodMap } from '@walletmesh/router';

/**
 * @module @walletmesh/aztec-rpc-wallet/types
 *
 * This module defines core types and interfaces used throughout the Aztec RPC Wallet package.
 * Key definitions include:
 * - {@link AztecChainId}: A type-safe representation of Aztec chain identifiers.
 * - {@link AztecWalletContext}: The context object passed to wallet-side RPC method handlers.
 * - {@link AztecWalletMethodMap}: A comprehensive map detailing all supported Aztec JSON-RPC
 *   methods, their parameters, and return types. This is central to the typed RPC system.
 */

/**
 * Options for sending Aztec transactions.
 *
 * @public
 */
export interface AztecSendOptions {
  from?: unknown;
  fee?: unknown;
  txNonce?: unknown;
  cancellable?: boolean;
}

/**
 * Type-safe Aztec chain ID format following the CAIP-2 standard.
 *
 * Format: `aztec:{reference}` where reference is typically:
 * - "mainnet" for the main Aztec network
 * - A numeric chain ID for test networks (e.g., "31337" for local development)
 *
 * @example
 * ```typescript
 * const mainnetChainId: AztecChainId = "aztec:mainnet";
 * const localChainId: AztecChainId = "aztec:31337";
 * ```
 */
export type AztecChainId = `aztec:${string}`;

/**
 * Discriminated union indicating the type of simulation that was performed.
 *
 * - `'transaction'`: Result from simulating a state-changing transaction (private or public function)
 * - `'utility'`: Result from simulating a read-only utility/view function
 */
export type SimulationType = 'transaction' | 'utility';

/**
 * Unified simulation result that can represent either transaction or utility simulations.
 * This type allows `wmSimulateTx` to handle both utility and transaction functions seamlessly,
 * providing a consistent API for dApps while preserving access to the original simulation results.
 *
 * @example
 * ```typescript
 * const result = await wallet.wmSimulateTx(interaction);
 *
 * // Simple usage - access decoded result regardless of type
 * console.log('Return value:', result.decodedResult);
 *
 * // Type-specific usage with narrowing
 * if (result.simulationType === 'utility') {
 *   const utilityResult = result.originalResult; // Type: UtilitySimulationResult
 *   console.log('Raw result:', utilityResult.result);
 * } else {
 *   const txResult = result.originalResult; // Type: TxSimulationResult
 *   console.log('Gas used:', txResult.gasUsed);
 * }
 * ```
 */
export interface UnifiedSimulationResult {
  /**
   * Indicates which type of simulation was performed.
   * This field acts as a discriminator for TypeScript type narrowing of `originalResult`.
   */
  simulationType: SimulationType;

  /**
   * The decoded return value from the simulation.
   *
   * - For transactions: Decoded from `privateExecutionResult` or `publicOutput`
   * - For utilities: Direct decoded result from execution
   *
   * This provides easy access to the actual return value that dApps typically care about,
   * without needing to know which type of simulation was performed or how to extract values.
   */
  decodedResult?: AbiDecoded;

  /**
   * Performance and execution statistics.
   * Present for both transaction and utility simulations, providing timing and profiling data.
   */
  stats?: SimulationStats;

  /**
   * The original simulation result in its native format.
   *
   * - When `simulationType === 'transaction'`: This is a {@link TxSimulationResult} containing
   *   full execution details including private/public execution, gas usage, and kernel inputs.
   *   DApps can use this for advanced features like gas estimation, proof generation, etc.
   *
   * - When `simulationType === 'utility'`: This is a {@link UtilitySimulationResult} containing
   *   the raw utility execution result.
   *
   * This field preserves backward compatibility and enables advanced use cases while the
   * `decodedResult` field provides a simple, consistent interface for common usage.
   */
  originalResult: TxSimulationResult | UtilitySimulationResult;
}

/**
 * Type guard to check if a UnifiedSimulationResult represents a transaction simulation.
 *
 * @param result - The UnifiedSimulationResult to check
 * @returns True if the result is a transaction simulation, narrowing the originalResult type to TxSimulationResult
 *
 * @example
 * ```typescript
 * if (isTxSimulationResult(result)) {
 *   // TypeScript knows result.originalResult is TxSimulationResult
 *   console.log('Gas used:', result.originalResult.gasUsed);
 * }
 * ```
 */
export function isTxSimulationResult(
  result: UnifiedSimulationResult,
): result is UnifiedSimulationResult & { originalResult: TxSimulationResult } {
  return result.simulationType === 'transaction';
}

/**
 * Type guard to check if a UnifiedSimulationResult represents a utility simulation.
 *
 * @param result - The UnifiedSimulationResult to check
 * @returns True if the result is a utility simulation, narrowing the originalResult type to UtilitySimulationResult
 *
 * @example
 * ```typescript
 * if (isUtilitySimulationResult(result)) {
 *   // TypeScript knows result.originalResult is UtilitySimulationResult
 *   console.log('Raw result:', result.originalResult.result);
 * }
 * ```
 */
export function isUtilitySimulationResult(
  result: UnifiedSimulationResult,
): result is UnifiedSimulationResult & { originalResult: UtilitySimulationResult } {
  return result.simulationType === 'utility';
}

/**
 * Defines the context object provided to all Aztec wallet-side JSON-RPC method handlers.
 * This context aggregates essential dependencies required by handlers to perform their operations.
 *
 * @see {@link createAztecWalletNode} where this context is constructed and provided to handlers.
 */
export interface AztecWalletContext {
  /**
   * The `aztec.js` {@link Account} instance. This wallet holds the user's account keys
   * and provides methods for signing, creating transactions, and interacting with the PXE.
   */
  wallet: Wallet;
}

/**
 * Transaction status values for full lifecycle tracking.
 *
 * Uses Aztec-native terminology:
 * - 'initiated' - transaction has been received and ID generated (backend-only)
 * - 'simulating' aligns with Aztec's simulate() method
 * - 'proving' is unique to zero-knowledge systems
 * - 'sending' aligns with Aztec's send() method
 * - 'pending' is standard for awaiting confirmation
 */
export type TransactionStatus =
  | 'idle'
  | 'initiated'
  | 'simulating'
  | 'proving'
  | 'sending'
  | 'pending'
  | 'confirming'
  | 'confirmed'
  | 'failed';

/**
 * Notification payload for transaction status updates.
 *
 * Sent from the backend wallet to the frontend at each transaction stage.
 * The txStatusId is used to coordinate notifications with the frontend UI state.
 */
export interface AztecTransactionStatusNotification {
  /**
   * Status tracking identifier for coordinating notifications.
   *
   * Generated by the BACKEND at the start of transaction processing.
   * This unique identifier allows the frontend to match status notifications
   * to the correct transaction in the UI. This is NOT the blockchain transaction hash.
   */
  txStatusId: string;

  /**
   * Current status of the transaction lifecycle.
   */
  status: TransactionStatus;

  /**
   * Blockchain transaction hash (available after proving/sending).
   *
   * The actual on-chain identifier, available after the transaction
   * has been broadcast to the network. This is different from txStatusId.
   */
  txHash?: string;

  /**
   * Millisecond timestamp of this status change.
   */
  timestamp: number;

  /**
   * Error message if status is 'failed'.
   */
  error?: string;
}

/**
 * Defines the notification methods that can be sent from the wallet to the client.
 * These are fire-and-forget messages that don't expect a response.
 */
export interface AztecWalletEventMap extends JSONRPCEventMap {
  /**
   * Notification emitted at each stage of the transaction lifecycle.
   *
   * Provides granular status updates from simulation through confirmation.
   */
  aztec_transactionStatus: { params: AztecTransactionStatusNotification; result: undefined };
}

/**
 * A constant array defining a set of base wallet methods.
 * These methods might be intended for initial wallet discovery or basic connection negotiation.
 * Note: Current connection helpers like `connectAztec` default to `ALL_AZTEC_METHODS`.
 * The `aztec_connect` method listed here is not currently defined in {@link AztecWalletMethodMap}.
 *
 * @readonly
 */
export const BASE_WALLET_METHODS = ['wm_getSupportedMethods', 'aztec_connect', 'aztec_getAccounts'] as const;

/**
 * Defines the complete map of all JSON-RPC methods supported by the Aztec RPC Wallet.
 * This interface extends the base {@link WalletMethodMap} from `@walletmesh/router`
 * and specifies the parameter (`params`) and return (`result`) types for each Aztec-specific method.
 *
 * This map is crucial for:
 * - Type safety in both client-side calls and wallet-side handlers.
 * - Guiding the implementation of serializers and deserializers.
 * - Documentation generation, as it serves as a single source of truth for method signatures.
 *
 * Methods are loosely grouped by functionality (Chain/Node, Account, Sender, etc.).
 * "wm_" prefixed methods are typically WalletMesh-specific extensions or conveniences.
 *
 * @see {@link AztecWalletProvider} for the client-side implementation that calls these methods.
 * @see {@link registerAztecWalletHandlers} for the wallet-side implementation that handles these methods.
 */

export interface AztecWalletMethodMap extends WalletMethodMap {
  // Add wm_getSupportedMethods explicitly to ensure its params type is correctly overridden
  // if WalletMethodMap already defines it differently.
  /**
   * Retrieves a list of all JSON-RPC methods supported by this wallet implementation.
   * Allows clients to discover the capabilities of the wallet.
   * @param params - No parameters.
   * @returns result - An array of strings, where each string is a supported method name.
   */
  wm_getSupportedMethods: { params: []; result: string[] };

  aztec_getChainInfo: { params: []; result: ChainInfo };

  aztec_getAccounts: { params: []; result: Aliased<AztecAddress>[] };
  aztec_getAddressBook: { params: []; result: Aliased<AztecAddress>[] };

  /* AuthWitness Methods */
  /**
   * Creates an {@link AuthWitness} (authorization witness) for a given message hash or intent.
   * Used for delegating actions.
   * @param params - A tuple containing the intent to authorize.
   * @param params.0 intent - The message hash ({@link Fr} or `Buffer`), {@link IntentInnerHash}, or {@link IntentAction} to authorize.
   * @returns result - The created {@link AuthWitness}.
   */
  aztec_createAuthWit: {
    params: [AztecAddress, Fr | IntentInnerHash | CallIntent];
    result: AuthWitness;
  };

  /* Sender Methods */
  /**
   * Registers a new authorized sender {@link AztecAddress}.
   * @param params - A tuple containing the sender's address.
   * @param params.0 senderAddress - The {@link AztecAddress} to authorize.
   * @returns result - The registered {@link AztecAddress}.
   */
  aztec_registerSender: {
    params: [AztecAddress];
    result: AztecAddress;
  };

  /* Contract Methods */
  /**
   * Retrieves {@link ContractMetadata} for a specific deployed contract.
   * @param params - A tuple containing the contract's address.
   * @param params.0 contractAddress - The {@link AztecAddress} of the contract.
   * @returns result - The {@link ContractMetadata} for the specified contract.
   */
  aztec_getContractMetadata: {
    params: [AztecAddress];
    result: ContractMetadata;
  };
  /**
   * Retrieves {@link ContractClassMetadata} for a specific contract class.
   * @param params - A tuple containing the class ID and an optional flag.
   * @param params.0 classId - The {@link Fr} ID of the contract class.
   * @param params.1 includeArtifact - Optional: Boolean indicating whether to include the full {@link ContractArtifact}.
   * @returns result - The {@link ContractClassMetadata}.
   */
  aztec_getContractClassMetadata: {
    params: [Fr, boolean | undefined];
    result: ContractClassMetadata;
  };
  /**
   * Registers a deployed contract instance with the wallet.
   * @param params - A tuple containing the instance and optional artifact.
   * @param params.0 instance - The {@link ContractInstanceWithAddress} to register.
   * @param params.1 artifact - Optional: The {@link ContractArtifact} for the instance.
   * @returns result - `true` if registration was successful.
   */
  aztec_registerContract: {
    params: [ContractInstanceWithAddress, ContractArtifact | undefined];
    result: ContractInstanceWithAddress;
  };

  /* Transaction Methods */
  /**
   * Sends a proven {@link Tx} (transaction) to the network.
   * @param params - A tuple containing the proven transaction.
   * @param params.0 tx - The proven {@link Tx} object to send.
   * @returns result - The {@link TxHash} of the sent transaction.
   */
  aztec_sendTx: {
    params: [exec: ExecutionPayload, opts: SendOptions];
    result: TxHash;
  };

  /**
   * Simulates a {@link TxExecutionRequest} without sending it to the network.
   * @param params - A tuple containing the simulation parameters.
   * @param params.0 txRequest - The {@link TxExecutionRequest} to simulate.
   * @param params.1 simulatePublic - Optional: Whether to simulate public parts. Defaults to `false`.
   * @param params.2 skipTxValidation - Optional: Flag to skip validation. Defaults to `false`.
   * @param params.3 skipFeeEnforcement - Optional: Flag to skip fee enforcement. Defaults to `false`.
   * @param params.4 overrides - Optional: {@link SimulationOverrides} for simulation context (includes msgSender).
   * @param params.5 scopes - Optional: Array of {@link AztecAddress} scopes for the simulation.
   * @returns result - The {@link TxSimulationResult}.
   */
  aztec_simulateTx: {
    params: [exec: ExecutionPayload, opts: SimulateOptions];
    result: TxSimulationResult;
  };

  aztec_simulateUtility: {
    params: [call: FunctionCall, authwits?: AuthWitness[]];
    result: UtilitySimulationResult;
  };

  /**
   * Profiles a {@link TxExecutionRequest} for performance analysis.
   * @param params - A tuple containing the profiling parameters.
   * @param params.0 txRequest - The {@link TxExecutionRequest} to profile.
   * @param params.1 profileMode - Optional: Profiling mode ('gates', 'execution-steps', 'full'). Defaults to 'gates'.
   * @param params.2 skipProofGeneration - Optional: Flag to skip proof generation. Defaults to `false`.
   * @param params.3 msgSender - Optional: {@link AztecAddress} for profiling context.
   * @returns result - The {@link TxProfileResult}.
   */
  aztec_profileTx: {
    params: [exec: ExecutionPayload, opts: ProfileOptions];
    result: TxProfileResult;
  };

  aztec_getPrivateEvents: {
    params: [
      AztecAddress, // contractAddress
      EventMetadataDefinition, // eventMetadata
      number, // from
      number, // numBlocks
      AztecAddress[], // recipients
    ];
    result: unknown[];
  };

  aztec_getTxReceipt: {
    params: [txHash: TxHash];
    result: TxReceipt;
  };

  aztec_batch: {
    params: [BatchedMethod<keyof BatchableMethods>[]];
    result: BatchResults<BatchedMethod<keyof BatchableMethods>[]>;
  };

  /**
   * WalletMesh specific: Executes a contract function interaction using a pre-constructed {@link ExecutionPayload}.
   * The wallet handles simulation, proving, and sending.
   *
   * The backend automatically generates a unique `txStatusId` at the start of execution and sends
   * status notifications (initiated, simulating, proving, sending, pending, failed) throughout
   * the transaction lifecycle. The frontend receives notifications via the `aztec_transactionStatus`
   * event and can correlate them using the returned `txStatusId`.
   *
   * @param params - A tuple containing the execution payload and optional send options.
   * @param params.0 executionPayload - The {@link ExecutionPayload} to execute.
   * @param params.1 sendOptions - Optional {@link AztecSendOptions} for fee and transaction configuration.
   * @returns result - An object containing both the blockchain transaction hash and the status tracking ID.
   *
   * TODO: maybe merge with aztec_sendTx ?
   */
  aztec_wmExecuteTx: {
    params: [executionPayload: ExecutionPayload, sendOptions: AztecSendOptions];
    result: {
      txHash: TxHash;
      txStatusId: string;
    };
  };

  /**
   * WalletMesh specific: Executes multiple contract interactions as a single atomic batch.
   *
   * Uses Aztec's native BatchCall to create one transaction with one proof for all operations.
   * All operations succeed together or all fail together (atomic execution).
   *
   * The wallet receives the complete batch upfront, allowing it to display all operations
   * to the user for approval before execution. This provides better security UX compared
   * to approving operations one-by-one.
   *
   * The backend automatically generates a unique `txStatusId` and sends status notifications
   * (initiated/simulating/proving/sending/pending/failed) throughout the batch lifecycle.
   * The frontend can listen to `aztec_transactionStatus` events and correlate them using the
   * returned `txStatusId`.
   *
   * @param params - Tuple containing array of execution payloads and optional send options
   * @param params.0 executionPayloads - Array of {@link ExecutionPayload} objects to batch
   * @param params.1 sendOptions - Optional {@link AztecSendOptions} for fee configuration
   * @returns result - Object containing transaction hash, receipt, and status tracking ID
   *
   * TODO: maybe merge with aztec_batch ?
   */
  aztec_wmBatchExecute: {
    params: [executionPayloads: ExecutionPayload[], sendOptions?: AztecSendOptions];
    result: {
      txHash: TxHash;
      receipt: TxReceipt;
      txStatusId: string;
    };
  };

  /**
   * WalletMesh specific: Deploys a new contract using its artifact and constructor arguments.
   * The wallet handles address computation, proving, and sending the deployment transaction.
   *
   * The backend automatically generates a unique `txStatusId` at the start of deployment and sends
   * status notifications (initiated, proving, sending, pending, failed) throughout
   * the deployment lifecycle. The frontend receives notifications via the `aztec_transactionStatus`
   * event and can correlate them using the returned `txStatusId`.
   *
   * @param params - A tuple containing the deployment parameters.
   * @param params.0 deploymentParams - Object containing `artifact` ({@link ContractArtifact}), `args` (array),
   *                            and optional `constructorName` (string).
   * @returns result - An object with `txHash` ({@link TxHash}), `contractAddress` ({@link AztecAddress}),
   *                   and `txStatusId` (string) for tracking deployment status.
   *
   * // TODO: convert to using a sendTx rather than special deploy
   *
   */
  aztec_wmDeployContract: {
    params: [
      {
        artifact: ContractArtifact;
        args: unknown[];
        constructorName?: string;
      },
    ];
    result: {
      txHash: TxHash;
      contractAddress: AztecAddress;
      txStatusId: string;
    };
  };

  /**
   * WalletMesh specific: Simulates a contract function interaction using a pre-constructed {@link ExecutionPayload}.
   *
   * This method automatically detects whether the function is a utility (view/pure) function or a
   * state-changing transaction, and performs the appropriate simulation. The result is wrapped in a
   * {@link UnifiedSimulationResult} that provides both a convenient decoded result and access to the
   * original simulation output.
   *
   * @param params - A tuple containing the execution payload.
   * @param params.0 executionPayload - The {@link ExecutionPayload} to simulate.
   * @returns result - A {@link UnifiedSimulationResult} containing the decoded result and original simulation data.
   */
  aztec_wmSimulateTx: {
    params: [ExecutionPayload, SimulateOptions];
    result: UnifiedSimulationResult;
  };
}

/**
 * A constant array containing all supported Aztec wallet method names.
 * Combines base wallet methods with all Aztec-specific RPC methods.
 *
 * @readonly
 */
export const AZTEC_WALLET_METHODS = [
  ...BASE_WALLET_METHODS,
  'aztec_getChainInfo',
  'aztec_getAccounts',
  'aztec_getAddressBook',
  'aztec_createAuthWit',
  'aztec_registerSender',
  'aztec_getContractMetadata',
  'aztec_getContractClassMetadata',
  'aztec_registerContract',
  'aztec_sendTx',
  'aztec_simulateTx',
  'aztec_simulateUtility',
  'aztec_profileTx',
  'aztec_getPrivateEvents',
  'aztec_getTxReceipt',
  'aztec_batch',
  'aztec_wmExecuteTx',
  'aztec_wmBatchExecute',
  'aztec_wmDeployContract',
  'aztec_wmSimulateTx',
] as const satisfies readonly (keyof AztecWalletMethodMap)[];
