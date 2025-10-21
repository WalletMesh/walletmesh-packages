/**
 * Aztec blockchain type definitions
 *
 * Type definitions for Aztec blockchain functionality. These types are
 * separated from the implementation to allow importing types without
 * triggering dynamic imports of the Aztec dependencies.
 *
 * @module providers/aztec/types
 * @packageDocumentation
 */

import { z } from 'zod';
import type { AztecSendOptions } from '@walletmesh/aztec-rpc-wallet';

// Re-export for convenience
export type { AztecSendOptions };

/**
 * Aztec wallet interface for dApp interactions
 *
 * Provides methods for deploying contracts, executing transactions,
 * and managing Aztec accounts.
 *
 * @public
 */
export interface AztecDappWallet {
  /** Deploy a contract to the Aztec network */
  deployContract(artifact: unknown, args: unknown[], constructorName?: string): Promise<DeploySentTx>;
  /** Deploy a contract via WalletMesh helper - returns txHash, contractAddress, and txStatusId for tracking */
  wmDeployContract?(
    artifact: unknown,
    args: unknown[],
    constructorName?: string,
  ): Promise<{ txHash: unknown; contractAddress: unknown; txStatusId: string }>;
  /** Execute a transaction via WalletMesh helper - returns both txHash and txStatusId */
  wmExecuteTx?(interaction: ContractFunctionInteraction): Promise<{ txHash: unknown; txStatusId: string }>;
  /**
   * Execute multiple contract interactions as a single atomic batch via WalletMesh helper.
   * Returns txHash, receipt, and txStatusId for tracking the unified batch transaction.
   */
  wmBatchExecute?(
    executionPayloads: unknown[],
    sendOptions?: AztecSendOptions,
  ): Promise<{ txHash: unknown; receipt: TxReceipt; txStatusId: string }>;
  /** Simulate a transaction via WalletMesh helper */
  wmSimulateTx?(interaction: ContractFunctionInteraction): Promise<unknown>;
  /** Prove a transaction */
  proveTx(txRequest: unknown, fee?: unknown): Promise<unknown>;
  /** Send a proven transaction */
  sendTx(tx: unknown): Promise<unknown>;
  /** Simulate a transaction without executing */
  simulateTx(txRequest: unknown, simulatePublic?: boolean, msgSender?: unknown): Promise<unknown>;
  /** Get transaction receipt by hash */
  getTxReceipt(txHash: unknown): Promise<TxReceipt | null>;
  /** Register a contract class */
  registerContractClass(artifact: unknown): Promise<void>;
  /** Get the current account address */
  getAddress(): unknown;
  /** Get the complete address with public keys */
  getCompleteAddress(): unknown;
  /** Create an auth witness */
  createAuthWit(messageHash: unknown | Buffer): Promise<unknown>;
  /** Get the current block number */
  getBlockNumber(): Promise<number>;
}

/**
 * Contract artifact definition shared by Aztec helpers.
 *
 * @public
 */
export interface AztecContractArtifact {
  name: string;
  functions: unknown[];
  events?: unknown[];
  notes?: unknown;
  [key: string]: unknown;
}

/**
 * Result of deploying a contract
 *
 * @public
 */
export interface DeploySentTx {
  /** Wait for the contract to be deployed and return the contract instance */
  deployed(): Promise<{ address: unknown }>;
  /** Wait for the transaction receipt */
  wait(): Promise<TxReceipt>;
  /** Transaction hash */
  txHash: string;
}

/**
 * Result of sending a transaction
 *
 * @public
 */
export interface SentTx {
  /** Wait for the transaction receipt */
  wait(): Promise<TxReceipt>;
  /** Transaction hash */
  txHash: string;
}

/**
 * Transaction receipt
 *
 * @public
 */
export interface TxReceipt {
  /** Transaction status */
  status: string;
  /** Error message if failed */
  error?: string;
  /** Transaction hash */
  txHash: string;
}

/**
 * Contract function interaction
 *
 * Represents a prepared contract method call that can be sent as a transaction
 * or simulated. This is the type returned by contract.methods.methodName(...).
 *
 * @public
 */

/**
 * Deployment lifecycle stages.
 *
 * @public
 */
export type AztecDeploymentStage =
  | 'idle'
  | 'preparing'
  | 'computing'
  | 'proving'
  | 'sending'
  | 'confirming'
  | 'success'
  | 'error';

export interface ContractFunctionInteraction {
  /** Create the transaction request object */
  request(): unknown;
  /** Simulate the interaction to see what would happen */
  simulate(): Promise<unknown>;
  /** Send the transaction to the network */
  send(options?: AztecSendOptions): Promise<{
    /** Transaction hash */
    txHash: { toString(): string } | string;
    /** Optional helper to fetch the hash later */
    getTxHash?: () => Promise<{ toString(): string }>;
    /** Wait for transaction confirmation */
    wait(): Promise<unknown>;
  }>;
}

/**
 * Transaction status values
 *
 * @public
 */
export const TX_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

/**
 * Type for transaction status values
 *
 * @public
 */
export type TxStatus = (typeof TX_STATUS)[keyof typeof TX_STATUS];

/**
 * Options for creating an Aztec wallet
 *
 * @public
 */
export interface CreateAztecWalletOptions {
  /** The Aztec chain ID (e.g., 'aztec:sandbox', 'aztec:testnet') */
  chainId?: string;
}

/**
 * Transaction status values for full lifecycle tracking.
 *
 * Uses Aztec-native terminology:
 * - 'idle' - transaction created but not yet started
 * - 'initiated' - transaction has been received and ID generated (backend-only)
 * - 'simulating' aligns with Aztec's simulate() method
 * - 'proving' is unique to zero-knowledge systems
 * - 'sending' aligns with Aztec's send() method
 * - 'pending' is standard for awaiting confirmation
 */
export const TRANSACTION_STATUS_VALUES = [
  'idle',
  'initiated',
  'simulating',
  'proving',
  'sending',
  'pending',
  'confirming',
  'confirmed',
  'failed',
] as const;

/**
 * Transaction status type.
 */
export type TransactionStatus = (typeof TRANSACTION_STATUS_VALUES)[number];

/**
 * Schema for transaction status notification payload.
 *
 * Note the distinction between txStatusId (internal tracking) and
 * txHash (blockchain identifier).
 */
export const aztecTransactionStatusNotificationSchema = z.object({
  txStatusId: z.string().min(1, 'txStatusId is required'), // ← Internal tracking ID
  status: z.enum(TRANSACTION_STATUS_VALUES),
  txHash: z.string().optional(), // ← Blockchain transaction hash
  timestamp: z.number(),
  error: z.string().optional(),
});

/**
 * Parsed transaction status notification payload.
 */
export type AztecTransactionStatusNotification = z.infer<typeof aztecTransactionStatusNotificationSchema>;

/**
 * Attempt to parse a transaction status notification payload.
 *
 * Returns `null` when the payload does not conform to the schema.
 */
export function parseAztecTransactionStatusNotification(
  params: unknown,
): AztecTransactionStatusNotification | null {
  const result = aztecTransactionStatusNotificationSchema.safeParse(params);
  return result.success ? result.data : null;
}

/**
 * Parse result with diagnostic information for debugging.
 *
 * @public
 */
export interface ParseResult {
  success: boolean;
  data?: AztecTransactionStatusNotification;
  error?: string;
  rawParams?: unknown;
}

/**
 * Attempt to parse a transaction status notification with detailed error information.
 *
 * Returns diagnostic information including validation errors for debugging.
 *
 * @public
 */
export function parseAztecTransactionStatusWithDiagnostics(params: unknown): ParseResult {
  const result = aztecTransactionStatusNotificationSchema.safeParse(params);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Extract validation errors from Zod
  const errorMessages = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');

  return {
    success: false,
    error: errorMessages,
    rawParams: params,
  };
}

// Function signatures for lazy loading
export interface AztecProviderFunctions {
  deployContract: (
    wallet: AztecDappWallet | null,
    artifact: unknown,
    args: unknown[],
    constructorName?: string,
  ) => Promise<DeploySentTx>;

  executeTx: (
    wallet: AztecDappWallet | null,
    interaction: ContractFunctionInteraction,
    options?: AztecSendOptions,
  ) => Promise<SentTx>;

  simulateTx: (wallet: AztecDappWallet | null, interaction: ContractFunctionInteraction) => Promise<unknown>;

  waitForTxReceipt: (wallet: AztecDappWallet | null, txHash: string) => Promise<TxReceipt>;

  getAddress: (wallet: AztecDappWallet | null) => unknown;

  getCompleteAddress: (wallet: AztecDappWallet | null) => unknown;

  isWalletAvailable: (wallet: AztecDappWallet | null) => wallet is AztecDappWallet;

  withAztecWallet: <T>(
    wallet: AztecDappWallet | null,
    operation: (wallet: AztecDappWallet) => Promise<T>,
    errorMessage?: string,
  ) => Promise<T>;
}

// Contract interaction function signatures
export interface AztecContractFunctions {
  getContractAt: (wallet: AztecDappWallet | null, address: unknown, artifact: unknown) => Promise<unknown>;

  executeBatch: (
    wallet: AztecDappWallet | null,
    interactions: ContractFunctionInteraction[],
    options?: AztecSendOptions,
  ) => Promise<TxReceipt[]>;

  callViewFunction: (
    wallet: AztecDappWallet | null,
    contractAddress: unknown,
    artifact: unknown,
    methodName: string,
    args?: unknown[],
  ) => Promise<unknown>;

  getTxRequest: (interaction: ContractFunctionInteraction) => Promise<unknown>;
}

// Account management function signatures
export interface AztecAccountFunctions {
  getRegisteredAccounts: (wallet: AztecDappWallet | null) => Promise<unknown[]>;

  switchAccount: (wallet: AztecDappWallet | null, address: unknown) => Promise<void>;

  signMessage: (wallet: AztecDappWallet | null, message: string) => Promise<string>;

  getAccountInfo: (
    wallet: AztecDappWallet | null,
    address?: unknown,
  ) => Promise<import('./account.js').AccountInfo>;

  isRegisteredAccount: (wallet: AztecDappWallet | null, address: unknown) => Promise<boolean>;
}

// Event handling function signatures
export interface AztecEventFunctions {
  subscribeToEvents: (
    wallet: AztecDappWallet | null,
    contractAddress: unknown,
    artifact: unknown,
    eventName: string,
    callback: (event: unknown) => void,
  ) => Promise<() => void>;

  queryEvents: (
    wallet: AztecDappWallet | null,
    contractAddress: unknown,
    artifact: unknown,
    eventName: string,
    options?: import('./events.js').EventQueryOptions,
  ) => Promise<unknown[]>;

  queryPrivateEvents: (
    wallet: AztecDappWallet | null,
    contractAddress: unknown,
    artifact: unknown,
    eventName: string,
    recipients: unknown[],
    options?: import('./events.js').EventQueryOptions,
  ) => Promise<unknown[]>;

  getContractEvents: (artifact: unknown) => string[];
}

// Auth witness function signatures
export interface AztecAuthFunctions {
  createAuthWitForInteraction: (
    wallet: AztecDappWallet | null,
    interaction: ContractFunctionInteraction,
    description?: string,
  ) => Promise<import('./auth.js').AuthWitnessWithMetadata>;

  createBatchAuthWit: (
    wallet: AztecDappWallet | null,
    interactions: ContractFunctionInteraction[],
  ) => Promise<import('./auth.js').AuthWitnessWithMetadata[]>;

  createAuthWitForMessage: (
    wallet: AztecDappWallet | null,
    message: string | Buffer,
    description?: string,
  ) => Promise<import('./auth.js').AuthWitnessWithMetadata>;

  verifyAuthWit: (
    wallet: AztecDappWallet | null,
    authWitness: unknown,
    expectedMessage?: unknown,
  ) => Promise<boolean>;

  storeAuthWitnesses: (witnesses: import('./auth.js').AuthWitnessWithMetadata[]) => string;

  getStoredAuthWitnesses: (storageKey: string) => import('./auth.js').AuthWitnessWithMetadata[] | undefined;

  clearStoredAuthWitnesses: (storageKey?: string) => void;
}
