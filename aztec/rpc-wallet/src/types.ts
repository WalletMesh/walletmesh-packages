import type {
  AuthWitness,
  AztecAddress,
  Fr,
  PXE,
  TxExecutionRequest,
  TxHash,
  TxReceipt,
  L2Block,
  CompleteAddress,
  AccountWallet,
  Tx,
} from '@aztec/aztec.js';
import type { IntentAction, IntentInnerHash } from '@aztec/aztec.js/utils';
import type { ExecutionPayload } from '@aztec/entrypoints/payload';

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

import type {
  PrivateExecutionResult,
  TxProfileResult,
  TxProvingResult,
  TxSimulationResult,
  UtilitySimulationResult,
} from '@aztec/stdlib/tx';

import type { ContractArtifact } from '@aztec/stdlib/abi';

import type {
  ContractClassMetadata,
  ContractMetadata,
  EventMetadataDefinition,
  PXEInfo,
} from '@aztec/stdlib/interfaces/client';

import type { GasFees } from '@aztec/stdlib/gas';
import type { ContractInstanceWithAddress, NodeInfo } from '@aztec/stdlib/contract';

import type { WalletMethodMap } from '@walletmesh/router';
import type { ContractArtifactCache } from './contractArtifactCache.js';

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
 * Defines the context object provided to all Aztec wallet-side JSON-RPC method handlers.
 * This context aggregates essential dependencies required by handlers to perform their operations.
 *
 * @see {@link createAztecWalletNode} where this context is constructed and provided to handlers.
 */
export interface AztecWalletContext {
  /**
   * The `aztec.js` {@link AccountWallet} instance. This wallet holds the user's account keys
   * and provides methods for signing, creating transactions, and interacting with the PXE.
   */
  wallet: AccountWallet;
  /**
   * The `aztec.js` {@link PXE} (Private Execution Environment) client instance.
   * This is used for interacting with the Aztec network, such as simulating transactions,
   * getting node information, fetching blocks, and managing private state.
   */
  pxe: PXE;
  /**
   * An instance of {@link ContractArtifactCache} used for caching contract artifacts.
   * This helps optimize performance by avoiding redundant fetches of artifact data.
   */
  cache: ContractArtifactCache;
}

/**
 * A constant array defining a set of base wallet methods.
 * These methods might be intended for initial wallet discovery or basic connection negotiation.
 * Note: Current connection helpers like `connectAztec` default to `ALL_AZTEC_METHODS`.
 * The `aztec_connect` method listed here is not currently defined in {@link AztecWalletMethodMap}.
 *
 * @readonly
 */
export const BASE_WALLET_METHODS = ['wm_getSupportedMethods', 'aztec_connect', 'aztec_getAddress'] as const;

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
 * @see {@link AztecDappWallet} for the client-side implementation that calls these methods.
 * @see {@link createAztecHandlers} for the wallet-side implementation that handles these methods.
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

  /* Chain/Node Methods */
  /**
   * Retrieves a specific L2 block by its number.
   * @param params - A tuple containing the block number.
   * @param params.0 blockNumber - The number of the block to retrieve.
   * @returns result - The {@link L2Block} data, or null/undefined if not found (behavior depends on PXE).
   */
  aztec_getBlock: { params: [number]; result: L2Block };
  /**
   * Retrieves the current (latest) L2 block number.
   * @param params - No parameters.
   * @returns result - The current block number.
   */
  aztec_getBlockNumber: { params: []; result: number };
  /**
   * Retrieves the chain ID of the connected Aztec network.
   * @param params - No parameters.
   * @returns result - The chain ID as an {@link Fr}.
   */
  aztec_getChainId: { params: []; result: Fr };
  /**
   * Retrieves the version of the connected PXE (Private Execution Environment) or node.
   * @param params - No parameters.
   * @returns result - The version as an {@link Fr}.
   */
  aztec_getVersion: { params: []; result: Fr };
  /**
   * Retrieves comprehensive information about the connected Aztec node.
   * @param params - No parameters.
   * @returns result - A {@link NodeInfo} object.
   */
  aztec_getNodeInfo: { params: []; result: NodeInfo };
  /**
   * Retrieves the latest L2 block number that has been proven.
   * @param params - No parameters.
   * @returns result - The latest proven block number.
   */
  aztec_getProvenBlockNumber: { params: []; result: number };
  /**
   * Retrieves information about the PXE service, including capabilities and version.
   * @param params - No parameters.
   * @returns result - A {@link PXEInfo} object.
   */
  aztec_getPXEInfo: { params: []; result: PXEInfo };
  /**
   * Retrieves the current base gas fees on the network.
   * @param params - No parameters.
   * @returns result - A {@link GasFees} object.
   */
  aztec_getCurrentBaseFees: { params: []; result: GasFees };

  /* Account Methods */
  /**
   * Retrieves the primary {@link AztecAddress} of the wallet's account.
   * @param params - No parameters.
   * @returns result - The wallet's {@link AztecAddress}.
   */
  aztec_getAddress: { params: []; result: AztecAddress };
  /**
   * Retrieves the {@link CompleteAddress} of the wallet's account, including public keys.
   * @param params - No parameters.
   * @returns result - The wallet's {@link CompleteAddress}.
   */
  aztec_getCompleteAddress: { params: []; result: CompleteAddress };

  /* AuthWitness Methods */
  /**
   * Creates an {@link AuthWitness} (authorization witness) for a given message hash or intent.
   * Used for delegating actions.
   * @param params - A tuple containing the intent to authorize.
   * @param params.0 intent - The message hash ({@link Fr} or `Buffer`), {@link IntentInnerHash}, or {@link IntentAction} to authorize.
   * @returns result - The created {@link AuthWitness}.
   */
  aztec_createAuthWit: {
    params: [Fr | Buffer | IntentAction | IntentInnerHash];
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
  /**
   * Retrieves a list of all currently authorized sender {@link AztecAddress}es.
   * @param params - No parameters.
   * @returns result - An array of authorized {@link AztecAddress}es.
   */
  aztec_getSenders: { params: []; result: AztecAddress[] };
  /**
   * Removes an {@link AztecAddress} from the list of authorized senders.
   * @param params - A tuple containing the sender's address.
   * @param params.0 senderAddress - The {@link AztecAddress} to de-authorize.
   * @returns result - `true` if removal was successful.
   */
  aztec_removeSender: {
    params: [AztecAddress];
    result: boolean;
  };

  /* Contract Methods */
  /**
   * Retrieves a list of all {@link AztecAddress}es of contracts known to the PXE/wallet.
   * @param params - No parameters.
   * @returns result - An array of contract {@link AztecAddress}es.
   */
  aztec_getContracts: { params: []; result: AztecAddress[] };
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
    result: boolean;
  };
  /**
   * Registers a contract class (bytecode and ABI) with the wallet.
   * @param params - A tuple containing the artifact.
   * @param params.0 artifact - The {@link ContractArtifact} to register.
   * @returns result - `true` if registration was successful.
   */
  aztec_registerContractClass: {
    params: [ContractArtifact];
    result: boolean;
  };

  /* Transaction Methods */
  /**
   * Generates proofs for a transaction execution request.
   * @param params - A tuple containing the request and optional private execution result.
   * @param params.0 txRequest - The {@link TxExecutionRequest} to prove.
   * @param params.1 privateExecutionResult - Optional: {@link PrivateExecutionResult} from a prior private simulation.
   * @returns result - The {@link TxProvingResult}, including the proven transaction.
   */
  aztec_proveTx: {
    params: [TxExecutionRequest, (PrivateExecutionResult | undefined)?];
    result: TxProvingResult;
  };
  /**
   * Sends a proven {@link Tx} (transaction) to the network.
   * @param params - A tuple containing the proven transaction.
   * @param params.0 tx - The proven {@link Tx} object to send.
   * @returns result - The {@link TxHash} of the sent transaction.
   */
  aztec_sendTx: {
    params: [Tx];
    result: TxHash;
  };
  /**
   * Retrieves the {@link TxReceipt} for a transaction.
   * @param params - A tuple containing the transaction hash.
   * @param params.0 txHash - The {@link TxHash} of the transaction.
   * @returns result - The {@link TxReceipt}.
   */
  aztec_getTxReceipt: {
    params: [TxHash];
    result: TxReceipt;
  };
  /**
   * Simulates a {@link TxExecutionRequest} without sending it to the network.
   * @param params - A tuple containing the simulation parameters.
   * @param params.0 txRequest - The {@link TxExecutionRequest} to simulate.
   * @param params.1 simulatePublic - Optional: Whether to simulate public parts. Defaults to `false`.
   * @param params.2 msgSender - Optional: {@link AztecAddress} for simulation context.
   * @param params.3 skipTxValidation - Optional: Flag to skip validation. Defaults to `false`.
   * @param params.4 skipFeeEnforcement - Optional: Flag to skip fee enforcement. Defaults to `false`.
   * @returns result - The {@link TxSimulationResult}.
   */
  aztec_simulateTx: {
    params: [
      TxExecutionRequest,
      (boolean | undefined)?, // simulatePublic
      (AztecAddress | undefined)?, // msgSender
      (boolean | undefined)?, // skipTxValidation
      (boolean | undefined)?, // skipFeeEnforcement
    ];
    result: TxSimulationResult;
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
    params: [
      TxExecutionRequest,
      ('gates' | 'execution-steps' | 'full' | undefined)?, // profileMode
      (boolean | undefined)?, // skipProofGeneration
      (AztecAddress | undefined)?, // msgSender
    ];
    result: TxProfileResult;
  };
  /**
   * Simulates a utility (view) function call.
   * @param params - A tuple containing the utility call parameters.
   * @param params.0 functionName - Name of the utility function.
   * @param params.1 args - Arguments for the function.
   * @param params.2 to - {@link AztecAddress} of the contract/account.
   * @param params.3 authWits - Optional: Array of {@link AuthWitness}.
   * @param params.4 from - Optional: Sender {@link AztecAddress}.
   * @returns result - The {@link UtilitySimulationResult}.
   */
  aztec_simulateUtility: {
    params: [
      string, // functionName
      unknown[], // args
      AztecAddress, // to
      (AuthWitness[] | undefined)?, // authWits
      (AztecAddress | undefined)?, // from
    ];
    result: UtilitySimulationResult;
  };

  /* Event Methods */
  /**
   * Retrieves private (encrypted) events from the blockchain.
   * @param params - A tuple containing the query parameters.
   * @param params.0 contractAddress - {@link AztecAddress} of the emitting contract.
   * @param params.1 eventMetadata - {@link EventMetadataDefinition} for the event.
   * @param params.2 fromBlock - Starting block number.
   * @param params.3 numBlocks - Number of blocks to scan.
   * @param params.4 recipients - Array of recipient {@link AztecAddress}es.
   * @returns result - An array of decoded private event data (type `unknown[]`, actual type depends on `eventMetadata`).
   */
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
  /**
   * Retrieves public (unencrypted) events from the blockchain.
   * @param params - A tuple containing the query parameters.
   * @param params.0 eventMetadata - {@link EventMetadataDefinition} for the event.
   * @param params.1 fromBlock - Starting block number.
   * @param params.2 limit - Maximum number of events to return.
   * @returns result - An array of decoded public event data (type `unknown[]`, actual type depends on `eventMetadata`).
   */
  aztec_getPublicEvents: {
    params: [
      EventMetadataDefinition, // eventMetadata
      number, // from
      number, // limit
    ];
    result: unknown[];
  };

  /* Contract Interaction Methods */
  /**
   * WalletMesh specific: Executes a contract function interaction using a pre-constructed {@link ExecutionPayload}.
   * The wallet handles simulation, proving, and sending.
   * @param params - A tuple containing the execution payload.
   * @param params.0 executionPayload - The {@link ExecutionPayload} to execute.
   * @returns result - The {@link TxHash} of the sent transaction.
   */
  aztec_wmExecuteTx: {
    params: [executionPayload: ExecutionPayload];
    result: TxHash;
  };

  /**
   * WalletMesh specific: Deploys a new contract using its artifact and constructor arguments.
   * The wallet handles address computation, proving, and sending the deployment transaction.
   * @param params - A tuple containing the deployment parameters.
   * @param params.0 deploymentParams - Object containing `artifact` ({@link ContractArtifact}), `args` (array),
   *                            and optional `constructorName` (string).
   * @returns result - An object with `txHash` ({@link TxHash}) and `contractAddress` ({@link AztecAddress}).
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
    };
  };

  /**
   * WalletMesh specific: Simulates a contract function interaction using a pre-constructed {@link ExecutionPayload}.
   * @param params - A tuple containing the execution payload.
   * @param params.0 executionPayload - The {@link ExecutionPayload} to simulate.
   * @returns result - The {@link TxSimulationResult}.
   */
  aztec_wmSimulateTx: {
    params: [executionPayload: ExecutionPayload];
    result: TxSimulationResult;
  };
}
