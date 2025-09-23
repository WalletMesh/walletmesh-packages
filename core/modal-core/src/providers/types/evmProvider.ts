/**
 * EVM Provider Interface - EIP-1193 Compliant with WalletMesh Extensions
 *
 * This interface provides perfect EIP-1193 compliance while extending
 * the standard with additional WalletMesh capabilities for enhanced
 * wallet integration and multi-chain support.
 *
 * @module providers/types/EVMProvider
 */

import type { EventEmitter } from 'node:events';

/**
 * EIP-1193 Provider Events
 *
 * Standard events defined by EIP-1193 and common extensions
 */
export interface EIP1193EventMap {
  /** Emitted when accounts change */
  accountsChanged: (accounts: string[]) => void;
  /** Emitted when chain changes */
  chainChanged: (chainId: string) => void;
  /** Emitted when provider connects */
  connect: (connectInfo: { chainId: string }) => void;
  /** Emitted when provider disconnects */
  disconnect: (error: { code: number; message: string }) => void;
  /** Emitted when a message is received (for wallet communication) */
  message: (message: { type: string; data: unknown }) => void;
}

/**
 * EIP-1193 Request Arguments
 */
export interface EIP1193RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

/**
 * EIP-1193 Provider Error
 */
export interface EIP1193ProviderError extends Error {
  code: number;
  data?: unknown;
}

/**
 * EIP-1193 Provider RPC Error Codes
 */
export enum EIP1193ErrorCode {
  UserRejectedRequest = 4001,
  Unauthorized = 4100,
  UnsupportedMethod = 4200,
  Disconnected = 4900,
  ChainDisconnected = 4901,
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  InvalidInput = -32000,
  ResourceNotFound = -32001,
  ResourceUnavailable = -32002,
  TransactionRejected = -32003,
  MethodNotSupported = -32004,
  LimitExceeded = -32005,
  JsonRpcVersionNotSupported = -32006,
}

/**
 * EVM Transaction Request (EIP-1559 Compatible)
 */
export interface EVMTransactionRequest {
  /** Transaction sender address */
  from?: string;
  /** Transaction recipient address */
  to?: string;
  /** Value to transfer in wei (hex string) */
  value?: string;
  /** Transaction data (hex string) */
  data?: string;
  /** Gas limit (hex string) */
  gas?: string;
  /** Max fee per gas for EIP-1559 (hex string) */
  maxFeePerGas?: string;
  /** Max priority fee per gas for EIP-1559 (hex string) */
  maxPriorityFeePerGas?: string;
  /** Transaction nonce (hex string) */
  nonce?: string;
  /** Chain ID (hex string) */
  chainId?: string;
  /** Transaction type (0x2 for EIP-1559) */
  type?: string;
  /** Access list for EIP-2930 */
  accessList?: Array<{
    address: string;
    storageKeys: string[];
  }>;
}

/**
 * EVM Typed Data (EIP-712)
 */
export interface EVMTypedData {
  /** Domain separator */
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
  };
  /** Type definitions */
  types: {
    [key: string]: Array<{
      name: string;
      type: string;
    }>;
  };
  /** Primary type */
  primaryType: string;
  /** Message to sign */
  message: Record<string, unknown>;
}

/**
 * Chain Configuration for wallet_addEthereumChain
 */
export interface AddEthereumChainParameter {
  /** Chain ID as hex string */
  chainId: string;
  /** Chain name */
  chainName: string;
  /** Native currency configuration */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  /** RPC URLs */
  rpcUrls: string[];
  /** Block explorer URLs */
  blockExplorerUrls?: string[];
  /** Icon URLs */
  iconUrls?: string[];
}

/**
 * Asset Configuration for wallet_watchAsset
 */
export interface WatchAssetParams {
  /** Asset type (currently only ERC20) */
  type: 'ERC20';
  /** Asset options */
  options: {
    /** Token contract address */
    address: string;
    /** Token symbol */
    symbol: string;
    /** Token decimals */
    decimals: number;
    /** Token image URL */
    image?: string;
  };
}

/**
 * Switch Chain Parameters
 */
export interface SwitchEthereumChainParameter {
  /** Target chain ID as hex string */
  chainId: string;
}

/**
 * WalletMesh EVM Provider State
 */
export interface EVMProviderState {
  /** Connected accounts */
  accounts: string[];
  /** Current chain ID */
  chainId: string;
  /** Connection status */
  isConnected: boolean;
  /** Whether provider is unlocked */
  isUnlocked: boolean;
  /** Network version */
  networkVersion: string;
}

/**
 * WalletMesh EVM Connection Options
 */
export interface EVMConnectOptions {
  /** Request specific accounts */
  requiredAccounts?: string[];
  /** Silent connection (no UI) */
  silent?: boolean;
  /** Connection timeout in ms */
  timeout?: number;
}

/**
 * EIP-1193 Compliant Provider with WalletMesh Extensions
 *
 * This interface provides perfect EIP-1193 compliance while adding
 * WalletMesh-specific extensions for enhanced functionality.
 */
export interface EVMProvider extends EventEmitter {
  // ===== EIP-1193 Core Methods =====

  /**
   * EIP-1193 Request Method
   *
   * The primary method for interacting with the provider.
   * All RPC calls should go through this method.
   */
  request(args: EIP1193RequestArguments): Promise<unknown>;

  // ===== EIP-1193 Events =====

  /**
   * Type-safe event emitter
   */
  on<K extends keyof EIP1193EventMap>(event: K, listener: EIP1193EventMap[K]): this;
  once<K extends keyof EIP1193EventMap>(event: K, listener: EIP1193EventMap[K]): this;
  removeListener<K extends keyof EIP1193EventMap>(event: K, listener: EIP1193EventMap[K]): this;
  off<K extends keyof EIP1193EventMap>(event: K, listener: EIP1193EventMap[K]): this;
  emit<K extends keyof EIP1193EventMap>(event: K, ...args: Parameters<EIP1193EventMap[K]>): boolean;

  // ===== EIP-1193 Optional Properties =====

  /**
   * Provider connection state (optional but recommended)
   */
  readonly isConnected?: () => boolean;

  // ===== Common Ethereum Methods (via request) =====

  /**
   * Request account access (eth_requestAccounts)
   */
  requestAccounts(): Promise<string[]>;

  /**
   * Get connected accounts (eth_accounts)
   */
  getAccounts(): Promise<string[]>;

  /**
   * Get current chain ID (eth_chainId)
   */
  getChainId(): Promise<string>;

  /**
   * Get network version (net_version)
   */
  getNetworkVersion(): Promise<string>;

  /**
   * Send transaction (eth_sendTransaction)
   */
  sendTransaction(transaction: EVMTransactionRequest): Promise<string>;

  /**
   * Sign message (personal_sign)
   */
  signMessage(message: string, account: string): Promise<string>;

  /**
   * Sign typed data (eth_signTypedData_v4)
   */
  signTypedData(account: string, typedData: EVMTypedData): Promise<string>;

  /**
   * Get balance (eth_getBalance)
   */
  getBalance(address: string, blockTag?: string): Promise<string>;

  /**
   * Get transaction count (eth_getTransactionCount)
   */
  getTransactionCount(address: string, blockTag?: string): Promise<string>;

  /**
   * Estimate gas (eth_estimateGas)
   */
  estimateGas(transaction: EVMTransactionRequest): Promise<string>;

  /**
   * Get gas price (eth_gasPrice)
   */
  getGasPrice(): Promise<string>;

  /**
   * Get block by number (eth_getBlockByNumber)
   */
  getBlockByNumber(blockNumber: string, fullTransactions?: boolean): Promise<unknown>;

  /**
   * Call contract (eth_call)
   */
  call(transaction: EVMTransactionRequest, blockTag?: string): Promise<string>;

  // ===== Wallet Methods =====

  /**
   * Switch to a different chain (wallet_switchEthereumChain)
   */
  switchChain(params: SwitchEthereumChainParameter): Promise<null>;

  /**
   * Add a new chain (wallet_addEthereumChain)
   */
  addChain(params: AddEthereumChainParameter): Promise<null>;

  /**
   * Watch an asset (wallet_watchAsset)
   */
  watchAsset(params: WatchAssetParams): Promise<boolean>;

  // ===== WalletMesh Extensions =====

  /**
   * Get provider state
   */
  getState(): Promise<EVMProviderState>;

  /**
   * Connect with options
   */
  connect(options?: EVMConnectOptions): Promise<{ accounts: string[]; chainId: string }>;

  /**
   * Disconnect provider
   */
  disconnect(): Promise<void>;

  /**
   * Check if chain is supported
   */
  isChainSupported(chainId: string): Promise<boolean>;

  /**
   * Get supported chains
   */
  getSupportedChains(): Promise<string[]>;

  /**
   * Provider identification
   */
  readonly isWalletMesh: true;
  readonly providerType: 'evm';
  readonly walletId?: string;
}

/**
 * EVM Provider Factory
 */
export interface EVMProviderFactory {
  /**
   * Create an EVM provider instance
   */
  createProvider(config?: {
    chainId?: string;
    transport?: unknown;
    logger?: unknown;
  }): Promise<EVMProvider>;

  /**
   * Check if provider is available
   */
  isAvailable(): boolean;
}

/**
 * Type guard for EVM Provider
 */
export function isEVMProvider(provider: unknown): provider is EVMProvider {
  return (
    provider !== null &&
    typeof provider === 'object' &&
    'request' in provider &&
    typeof (provider as { request?: unknown }).request === 'function' &&
    'on' in provider &&
    typeof (provider as { on?: unknown }).on === 'function'
  );
}

/**
 * Type guard for EIP-1193 errors
 */
export function isEIP1193Error(error: unknown): error is EIP1193ProviderError {
  return error instanceof Error && 'code' in error && typeof (error as { code?: unknown }).code === 'number';
}
