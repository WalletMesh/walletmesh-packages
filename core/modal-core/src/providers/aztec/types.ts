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
  /** Execute a transaction using WalletMesh */
  wmExecuteTx(interaction: ContractFunctionInteraction): Promise<SentTx>;
  /** Simulate a transaction without executing */
  wmSimulateTx(interaction: ContractFunctionInteraction): Promise<unknown>;
  /** Get transaction receipt by hash */
  getTxReceipt(txHash: unknown): Promise<TxReceipt | null>;
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
 * @public
 */
export interface ContractFunctionInteraction {
  /** Create the request object */
  request(): unknown;
  /** Simulate the interaction */
  simulate(): Promise<unknown>;
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
  /** Custom chain ID options to request permissions for */
  permissions?: Record<string, string[]>;
}

// Function signatures for lazy loading
export interface AztecProviderFunctions {
  deployContract: (
    wallet: AztecDappWallet | null,
    artifact: unknown,
    args: unknown[],
    constructorName?: string,
  ) => Promise<DeploySentTx>;

  executeTx: (wallet: AztecDappWallet | null, interaction: ContractFunctionInteraction) => Promise<SentTx>;

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
