/**
 * Solana Provider Interface - Solana Wallet Standard Compliant with WalletMesh Extensions
 *
 * This interface provides perfect Solana Wallet Standard compliance while extending
 * the standard with additional WalletMesh capabilities for enhanced wallet integration.
 *
 * @see https://github.com/solana-labs/wallet-standard
 * @module providers/types/SolanaProvider
 */

import type { EventEmitter } from 'node:events';

/**
 * Solana Wallet Standard Events
 */
export interface SolanaWalletEventMap {
  /** Emitted when wallet connects */
  connect: (publicKey: PublicKey) => void;
  /** Emitted when wallet disconnects */
  disconnect: () => void;
  /** Emitted when account changes */
  accountChanged: (publicKey: PublicKey | null) => void;
  /** Emitted on wallet errors */
  error: (error: WalletError) => void;
}

/**
 * Solana Public Key representation
 */
export interface PublicKey {
  /** Base58 encoded public key */
  toBase58(): string;
  /** Buffer representation */
  toBuffer(): Buffer;
  /** Bytes representation */
  toBytes(): Uint8Array;
  /** String representation */
  toString(): string;
  /** Check equality */
  equals(publicKey: PublicKey): boolean;
}

/**
 * Solana Transaction versions
 */
export type TransactionVersion = 'legacy' | 0;

/**
 * Solana Connection commitment levels
 */
export type Commitment =
  | 'processed'
  | 'confirmed'
  | 'finalized'
  | 'recent'
  | 'single'
  | 'singleGossip'
  | 'root'
  | 'max';

/**
 * Solana Transaction signature
 */
export type TransactionSignature = string;

/**
 * Wallet capabilities as per Solana Wallet Standard
 */
export interface SolanaWalletCapabilities {
  /** Supported transaction versions */
  supportedTransactionVersions?: TransactionVersion[];
  /** Maximum transactions per signing request */
  maxTransactionsPerRequest?: number;
  /** Maximum messages per signing request */
  maxMessagesPerRequest?: number;
  /** Supported features */
  features?: SolanaWalletFeature[];
}

/**
 * Solana Wallet Features
 */
export type SolanaWalletFeature =
  | 'solana:signTransaction'
  | 'solana:signAllTransactions'
  | 'solana:signAndSendTransaction'
  | 'solana:signMessage'
  | 'solana:signIn'
  | 'standard:connect'
  | 'standard:disconnect'
  | 'standard:events';

/**
 * Sign and Send Transaction Options
 */
export interface SignAndSendTransactionOptions {
  /** Commitment level for confirming transaction */
  commitment?: Commitment;
  /** Whether to skip preflight simulation */
  skipPreflight?: boolean;
  /** Maximum number of retries */
  maxRetries?: number;
  /** Whether to wait for confirmation */
  waitForConfirmation?: boolean;
}

/**
 * Sign In Input (Solana Wallet Standard)
 */
export interface SolanaSignInInput {
  /** Domain requesting sign in */
  domain?: string;
  /** Sign in statement */
  statement?: string;
  /** URI of the dApp */
  uri?: string;
  /** Version of the sign-in request */
  version?: string;
  /** Chain ID */
  chainId?: string;
  /** Nonce for replay protection */
  nonce?: string;
  /** Issued at timestamp */
  issuedAt?: string;
  /** Expiration time */
  expirationTime?: string;
  /** Not before timestamp */
  notBefore?: string;
  /** Request ID */
  requestId?: string;
  /** Resources */
  resources?: string[];
}

/**
 * Sign In Output
 */
export interface SolanaSignInOutput {
  /** Signed message */
  signature: Uint8Array;
  /** Signed message (base64) */
  signedMessage: Uint8Array;
  /** Account that signed */
  account: {
    address: string;
    publicKey: Uint8Array;
    chains: string[];
    features: string[];
  };
}

/**
 * Wallet Error types
 */
export class WalletError extends Error {
  error: unknown;

  constructor(message?: string, error?: unknown) {
    super(message);
    this.error = error;
  }
}

export class WalletConnectionError extends WalletError {
  override name = 'WalletConnectionError';
}

export class WalletDisconnectedError extends WalletError {
  override name = 'WalletDisconnectedError';
}

export class WalletAccountError extends WalletError {
  override name = 'WalletAccountError';
}

export class WalletPublicKeyError extends WalletError {
  override name = 'WalletPublicKeyError';
}

export class WalletNotConnectedError extends WalletError {
  override name = 'WalletNotConnectedError';
}

export class WalletSendTransactionError extends WalletError {
  override name = 'WalletSendTransactionError';
}

export class WalletSignTransactionError extends WalletError {
  override name = 'WalletSignTransactionError';
}

export class WalletSignMessageError extends WalletError {
  override name = 'WalletSignMessageError';
}

/**
 * Connect options
 */
export interface SolanaConnectOptions {
  /** Only connect if already trusted */
  onlyIfTrusted?: boolean;
  /** Silent connection (no UI) */
  silent?: boolean;
  /** Connection timeout in ms */
  timeout?: number;
}

/**
 * WalletMesh Solana Provider State
 */
export interface SolanaProviderState {
  /** Connected public key */
  publicKey: string | null;
  /** Connection status */
  isConnected: boolean;
  /** Current cluster */
  cluster: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
  /** Wallet capabilities */
  capabilities: SolanaWalletCapabilities;
}

/**
 * Transaction or VersionedTransaction interface
 * (simplified - actual implementation should use @solana/web3.js types)
 */
export interface SolanaTransaction {
  /** Serialized transaction */
  serialize(): Buffer;
  /** Add signature */
  addSignature(pubkey: PublicKey, signature: Buffer): void;
  /** Verify signatures */
  verifySignatures(): boolean;
}

/**
 * Solana Wallet Standard Compliant Provider with WalletMesh Extensions
 *
 * This interface provides perfect Solana Wallet Standard compliance while adding
 * WalletMesh-specific extensions for enhanced functionality.
 */
export interface SolanaProvider extends EventEmitter {
  // ===== Solana Wallet Standard Properties =====

  /**
   * Wallet name
   */
  readonly name: string;

  /**
   * Wallet icon URL
   */
  readonly icon: string;

  /**
   * Public key of connected account (null if not connected)
   */
  readonly publicKey: PublicKey | null;

  /**
   * Connection state
   */
  readonly connected: boolean;

  /**
   * Wallet readiness state
   */
  readonly readyState: 'Installed' | 'NotDetected' | 'Loadable' | 'Unsupported';

  // ===== Solana Wallet Standard Methods =====

  /**
   * Connect to wallet
   */
  connect(options?: SolanaConnectOptions): Promise<{ publicKey: PublicKey }>;

  /**
   * Disconnect from wallet
   */
  disconnect(): Promise<void>;

  /**
   * Sign a transaction
   */
  signTransaction<T extends SolanaTransaction>(transaction: T): Promise<T>;

  /**
   * Sign multiple transactions
   */
  signAllTransactions<T extends SolanaTransaction>(transactions: T[]): Promise<T[]>;

  /**
   * Sign and send a transaction
   */
  signAndSendTransaction<T extends SolanaTransaction>(
    transaction: T,
    options?: SignAndSendTransactionOptions,
  ): Promise<{ signature: TransactionSignature }>;

  /**
   * Sign a message
   */
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;

  /**
   * Sign in with Solana (SIWS)
   */
  signIn?(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;

  // ===== Solana Wallet Standard Events =====

  /**
   * Type-safe event emitter
   */
  on<K extends keyof SolanaWalletEventMap>(event: K, listener: SolanaWalletEventMap[K]): this;
  once<K extends keyof SolanaWalletEventMap>(event: K, listener: SolanaWalletEventMap[K]): this;
  removeListener<K extends keyof SolanaWalletEventMap>(event: K, listener: SolanaWalletEventMap[K]): this;
  off<K extends keyof SolanaWalletEventMap>(event: K, listener: SolanaWalletEventMap[K]): this;
  emit<K extends keyof SolanaWalletEventMap>(event: K, ...args: Parameters<SolanaWalletEventMap[K]>): boolean;

  // ===== WalletMesh Extensions =====

  /**
   * Get wallet capabilities
   */
  getCapabilities(): Promise<SolanaWalletCapabilities>;

  /**
   * Get provider state
   */
  getState(): Promise<SolanaProviderState>;

  /**
   * Switch to different cluster
   */
  switchCluster?(cluster: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet'): Promise<void>;

  /**
   * Get all accounts (for multi-account wallets)
   */
  getAccounts?(): Promise<PublicKey[]>;

  /**
   * Request account change
   */
  requestAccountChange?(): Promise<PublicKey>;

  /**
   * Get balance of account
   */
  getBalance?(publicKey?: PublicKey): Promise<number>;

  /**
   * Get recent blockhash
   */
  getRecentBlockhash?(): Promise<{ blockhash: string; lastValidBlockHeight: number }>;

  /**
   * Simulate transaction
   */
  simulateTransaction?<T extends SolanaTransaction>(
    transaction: T,
    options?: { commitment?: Commitment },
  ): Promise<unknown>;

  /**
   * Provider identification
   */
  readonly isWalletMesh: true;
  readonly providerType: 'solana';
  readonly walletId?: string;
}

/**
 * Solana Provider Factory
 */
export interface SolanaProviderFactory {
  /**
   * Create a Solana provider instance
   */
  createProvider(config?: {
    cluster?: 'mainnet-beta' | 'testnet' | 'devnet' | 'localnet';
    transport?: unknown;
    logger?: unknown;
  }): Promise<SolanaProvider>;

  /**
   * Check if provider is available
   */
  isAvailable(): boolean;
}

/**
 * Type guard for Solana Provider
 */
export function isSolanaProvider(provider: unknown): provider is SolanaProvider {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'connect' in provider &&
    'disconnect' in provider &&
    'signTransaction' in provider &&
    typeof (provider as { connect?: unknown }).connect === 'function' &&
    typeof (provider as { disconnect?: unknown }).disconnect === 'function' &&
    typeof (provider as { signTransaction?: unknown }).signTransaction === 'function'
  );
}

/**
 * Type guard for Solana Wallet errors
 */
export function isSolanaWalletError(error: unknown): error is WalletError {
  return error instanceof WalletError;
}

/**
 * Check if wallet supports a feature
 */
export function walletSupportsFeature(
  capabilities: SolanaWalletCapabilities,
  feature: SolanaWalletFeature,
): boolean {
  return capabilities.features?.includes(feature) ?? false;
}

/**
 * Create a mock PublicKey for testing
 * (In production, use @solana/web3.js PublicKey)
 */
export function createMockPublicKey(address: string): PublicKey {
  return {
    toBase58: () => address,
    toBuffer: () => Buffer.from(address),
    toBytes: () => new Uint8Array(Buffer.from(address)),
    toString: () => address,
    equals: (other: PublicKey) => other.toString() === address,
  };
}
