import type {
  AuthWitness,
  AztecAddress,
  ContractArtifact,
  ContractClassWithId,
  ContractInstanceWithAddress,
  ExtendedNote,
  Fr,
  PXE,
  TxExecutionRequest,
  TxHash,
  TxReceipt,
  L2Block,
  LogFilter,
  Point,
  SiblingPath,
  PartialAddress,
  CompleteAddress,
  NodeInfo,
  AccountWallet,
  Tx,
} from '@aztec/aztec.js';
import type { IntentAction, IntentInnerHash } from '@aztec/aztec.js/utils';
import type { ExecutionRequestInit } from '@aztec/aztec.js/entrypoint';
import type { AbiDecoded } from '@aztec/foundation/abi';
import type {
  InBlock,
  NotesFilter,
  EventMetadataDefinition,
  PrivateExecutionResult,
  TxEffect,
  TxProvingResult,
  UniqueNote,
  PXEInfo,
  TxSimulationResult,
  GetPublicLogsResponse,
  GetContractClassLogsResponse,
} from '@aztec/circuit-types';
import type { GasFees, L1_TO_L2_MSG_TREE_HEIGHT } from '@aztec/circuits.js';
import type { JSONRPCEventMap, JSONRPCMiddleware } from '@walletmesh/jsonrpc';
import type { JSONRPCWalletClient, WalletMethodMap } from '@walletmesh/router';
import type { ContractArtifactCache } from './contractArtifactCache.js';

/**
 * Represents a single function call to a contract.
 * @public
 */
export type TransactionFunctionCall = {
  /** The address of the contract to interact with */
  contractAddress: string;
  /** The name of the function to call */
  functionName: string;
  /** The arguments to pass to the function */
  args: unknown[];
};

/**
 * Parameters for sending transactions.
 * @public
 */
export type TransactionParams = {
  /** Array of function calls to execute */
  functionCalls: TransactionFunctionCall[];
  /** Optional array of authorization witnesses for the transaction */
  authwits?: string[];
};

export const BASE_WALLET_METHODS: (keyof AztecWalletBaseMethodMap)[] = [
  'wm_getSupportedMethods',
  'aztec_connect',
  'aztec_getAccount',
  'aztec_sendTransaction',
  'aztec_simulateTransaction',
] as const;

/**
 * A mapping of JSON-RPC methods to their parameters and return types for Aztec Wallets.
 *
 * This extends the base WalletMethodMap with Aztec-specific methods.
 * @public
 */
export interface AztecWalletBaseMethodMap extends WalletMethodMap {
  /**
   * Connects to the Aztec network.
   * @returns A boolean indicating if the connection was successful
   */
  aztec_connect: { result: boolean };

  /**
   * Gets the account address from the wallet.
   * @returns The account address as a string
   */
  aztec_getAccount: { result: string };

  /**
   * Sends transactions to the Aztec network.
   * @param params - The transactions to execute and optional authorization witnesses
   * @returns The transaction hash as a string
   */
  aztec_sendTransaction: {
    params: TransactionParams;
    result: string;
  };

  /**
   * Simulates a transaction without executing it.
   * @param params - The transaction to simulate
   * @returns The simulation result
   */
  aztec_simulateTransaction: {
    params: TransactionFunctionCall;
    result: unknown;
  };

  /**
   * Returns the list of supported methods for the wallet.
   * @returns An array of supported methods
   */
  wm_getSupportedMethods: {
    result: string[];
  };
}

export interface AztecWalletEventMap extends JSONRPCEventMap {
  // TODO: What events do we need?
}

/**
 * Holds the context passed through RPC middleware.
 * @public
 */
export type AztecWalletContext = Record<string, unknown> & {
  /** The PXE instance for the wallet */
  pxe: PXE;
  wallet: AccountWallet;
  contractArtifactCache: ContractArtifactCache;
};

/**
 * Type for Aztec Router Wallet middleware.
 * @public
 */
export type AztecWalletMiddleware = JSONRPCMiddleware<AztecWalletBaseMethodMap, AztecWalletContext>;

/**
 * Type for Aztec Chain Wallet middleware.
 */
export type AztecChainWalletMiddleware = JSONRPCMiddleware<AztecWalletMethodMap, AztecWalletContext>;

/**
 * Type for Aztec wallet router client.
 * @public
 */
export type AztecWalletRouterClient = JSONRPCWalletClient<AztecWalletMethodMap>;

/**
 * Type for Aztec wallet RPC method map.
 * This extends the AztecWalletBaseMethodMap with the methods used in by Aztec's `AccountWallet`
 */
export interface AztecWalletMethodMap extends AztecWalletBaseMethodMap {
  /* Chain */
  aztec_getBlock: { params: { number: number }; result: L2Block };
  aztec_getBlockNumber: { result: number };
  aztec_getChainId: { result: number };
  aztec_getVersion: { result: number };
  aztec_getNodeInfo: { result: NodeInfo };
  aztec_getProvenBlockNumber: { result: number };
  aztec_getPXEInfo: { result: PXEInfo };
  aztec_getCurrentBaseFees: { result: GasFees };

  /* Scopes */
  aztec_setScopes: { params: { scopes: AztecAddress[] }; result: boolean };
  aztec_getScopes: { result: AztecAddress[] };

  /* L1->L2 Messages */
  aztec_isL1ToL2MessageSynced: { params: { l1ToL2Message: Fr }; result: boolean };
  aztec_getL1ToL2MembershipWitness: {
    params: { contractAddress: AztecAddress; messageHash: Fr; secret: Fr };
    result: [bigint, SiblingPath<typeof L1_TO_L2_MSG_TREE_HEIGHT>];
  };

  /* Capsules */
  aztec_addCapsule: { params: { capsule: Fr[] }; result: boolean };

  /* Accounts */
  aztec_getAddress: { result: AztecAddress };
  aztec_getCompleteAddress: { result: CompleteAddress };
  aztec_registerAccount: {
    params: { secretKey: Fr; partialAddress: PartialAddress };
    result: CompleteAddress;
  };
  aztec_getRegisteredAccounts: { result: CompleteAddress[] };

  /* AuthWitness */
  aztec_addAuthWitness: { params: { authWitness: AuthWitness }; result: boolean };
  aztec_getAuthWitness: { params: { messageHash: Fr }; result: Fr[] };
  aztec_createAuthWit: {
    params: { intent: Fr | Buffer | IntentAction | IntentInnerHash };
    result: AuthWitness;
  };

  /* Senders */

  /**
   * Registers a contact in the user's PXE
   * @param params - The sender (contact) address to register
   * @returns True if registration was successful
   */
  aztec_registerSender: { params: { sender: AztecAddress }; result: AztecAddress };
  aztec_getSenders: { result: AztecAddress[] };
  aztec_removeSender: { params: { sender: AztecAddress }; result: boolean };

  /* Contracts */

  aztec_getContracts: { result: AztecAddress[] };
  aztec_getContractInstance: { params: { address: AztecAddress }; result: ContractInstanceWithAddress };
  aztec_getContractClass: { params: { id: Fr }; result: ContractClassWithId };
  aztec_getContractArtifact: { params: { id: Fr }; result: ContractArtifact };
  aztec_isContractClassPubliclyRegistered: { params: { id: Fr }; result: boolean };
  aztec_isContractPubliclyDeployed: { params: { address: AztecAddress }; result: boolean };
  aztec_isContractInitialized: { params: { address: AztecAddress }; result: boolean };

  /**
   * Registers a contract instance in the user's PXE.
   * @param params - The contract details to register
   * @returns True if registration was successful
   */
  aztec_registerContract: {
    params: { instance: ContractInstanceWithAddress; artifact?: ContractArtifact | undefined };
    result: boolean;
  };

  /**
   * Registers a contract class in the user's PXE.
   * @param params - The contract artifact to register
   * @returns True if registration was successful
   */
  aztec_registerContractClass: { params: { artifact: ContractArtifact }; result: boolean };
  // biome-ignore lint/suspicious/noExplicitAny: return type from aztec.js is `any`
  aztec_getPublicStorageAt: { params: { contract: AztecAddress; storageSlot: Fr }; result: any };

  /* Transactions */
  aztec_sendTx: { params: { tx: Tx }; result: TxHash };
  aztec_createTxExecutionRequest: { params: { exec: ExecutionRequestInit }; result: TxExecutionRequest };
  aztec_proveTx: {
    params: { txRequest: TxExecutionRequest; privateExecutionResult: PrivateExecutionResult };
    result: TxProvingResult;
  };
  aztec_getTxEffect: { params: { txHash: TxHash }; result: InBlock<TxEffect> };
  aztec_getTxReceipt: { params: { txHash: TxHash }; result: TxReceipt };

  aztec_simulateTx: {
    params: {
      txRequest: TxExecutionRequest;
      simulatePublic: boolean;
      msgSender?: AztecAddress;
      skipTxValidation?: boolean;
      enforceFeePayment?: boolean;
      profile?: boolean;
    };
    result: TxSimulationResult;
  };
  aztec_simulateUnconstrained: {
    params: { functionName: string; args: unknown[]; to: AztecAddress; from?: AztecAddress };
    result: AbiDecoded;
  };

  /* Notes */
  aztec_getNotes: { params: { filter: NotesFilter }; result: UniqueNote[] };
  aztec_addNote: { params: { note: ExtendedNote }; result: boolean };
  aztec_addNullifiedNote: { params: { note: ExtendedNote }; result: boolean };

  /* Logs and Events */
  aztec_getPublicLogs: { params: { filter: LogFilter }; result: GetPublicLogsResponse };
  aztec_getContractClassLogs: { params: { filter: LogFilter }; result: GetContractClassLogsResponse };
  aztec_getPrivateEvents: {
    params: { event: EventMetadataDefinition; from: number; limit: number; vpks?: Point[] };
    result: unknown[];
  };
  aztec_getPublicEvents: {
    params: { event: EventMetadataDefinition; from: number; limit: number };
    result: unknown[];
  };
}

export type AztecWalletMethodHandler<
  T extends AztecWalletMethodMap,
  M extends keyof T,
  C extends AztecWalletContext,
> = (
  context: C,
  params: T[M]['params'],
  accountWallet: AccountWallet,
) => Promise<T[M]['result']> | T[M]['result'];

export type AztecChainId = `aztec:${string}`;
