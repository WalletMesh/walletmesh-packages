/**
 * Chain-specific provider interfaces for type safety and API consistency
 *
 * These interfaces define the standard provider APIs for each blockchain type
 * that wallet adapters must implement, ensuring consistent behavior across
 * different wallet implementations.
 *
 * This is separate from providers.ts which handles JSON-RPC method mapping.
 *
 * @remarks
 * As of 2025-01-20, all provider interfaces extend CommonProviderInterface for consistency.
 * The standardized method for retrieving accounts is `getAccounts()`.
 *
 * @see CommonProviderInterface for the base interface all providers extend
 * @packageDocumentation
 */

import type { SupportedChain } from '../../core/types.js';
import type { CommonProviderInterface } from './commonProvider.js';

/**
 * Common base interface for all blockchain providers
 *
 * This interface extends CommonProviderInterface to ensure consistency with
 * the WalletProvider system.
 */
export interface BlockchainProvider extends CommonProviderInterface {
  // All common methods inherited from CommonProviderInterface:
  // - getAccounts(): Promise<string[]>
  // - getChainId(): Promise<string | number>
  // - disconnect(): Promise<void>
  // - on(event: string, listener: (...args: unknown[]) => void): void
  // - off(event: string, listener: (...args: unknown[]) => void): void
  // - removeAllListeners(event?: string): void

  /** Request method call for JSON-RPC communication */
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
}

/**
 * EVM-compatible provider interface following EIP-1193 standard
 */
export interface EVMProvider extends BlockchainProvider {
  /** Send transaction */
  sendTransaction(transaction: EVMTransactionRequest): Promise<string>;

  /** Sign message */
  signMessage(message: string): Promise<string>;

  /** Sign typed data (EIP-712) */
  signTypedData(typedData: unknown): Promise<string>;

  /** Switch to a different chain */
  switchChain(chainId: string): Promise<void>;

  /** Add a new chain to the wallet */
  addChain(chain: EVMChainConfig): Promise<void>;

  /** Watch for asset changes */
  watchAsset(asset: EVMAssetConfig): Promise<boolean>;
}

/**
 * EVM transaction request structure
 */
export interface EVMTransactionRequest {
  to?: string;
  from?: string;
  value?: string;
  data?: string;
  gas?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string;
  type?: string;
}

/**
 * EVM chain configuration for adding new chains
 */
export interface EVMChainConfig {
  chainId: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}

/**
 * EVM asset configuration for wallet_watchAsset
 */
export interface EVMAssetConfig {
  type: 'ERC20';
  options: {
    address: string;
    symbol: string;
    decimals: number;
    image?: string;
  };
}

/**
 * Solana provider interface following Solana Wallet Standard
 */
export interface SolanaProvider extends BlockchainProvider {
  /** Get wallet capabilities */
  getCapabilities(): Promise<SolanaCapabilities>;

  /** Connect to wallet */
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: string }>;

  /** Sign transaction */
  signTransaction(transaction: unknown): Promise<unknown>;

  /** Sign multiple transactions */
  signAllTransactions(transactions: unknown[]): Promise<unknown[]>;

  /** Sign and send transaction */
  signAndSendTransaction(transaction: unknown, options?: unknown): Promise<{ signature: string }>;

  /** Sign message */
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array; publicKey: string }>;

  /** Switch to different Solana cluster */
  switchCluster?(cluster: 'mainnet-beta' | 'testnet' | 'devnet'): Promise<void>;
}

/**
 * Solana wallet capabilities
 */
export interface SolanaCapabilities {
  supportedTransactionVersions?: 0[];
  maxTransactionsPerRequest?: number;
  supportedMethods?: string[];
}

/**
 * Union type of all provider interfaces
 * Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
 */
export type ChainProvider = EVMProvider | SolanaProvider;

/**
 * Type mapping from chain type to provider interface
 * Note: For Aztec, use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
 */
export interface ProviderTypeMap {
  evm: EVMProvider;
  solana: SolanaProvider;
  // Note: aztec removed - use AztecRouterProvider from @walletmesh/aztec-rpc-wallet
}

/**
 * Helper type to get provider type from chain type
 */
export type GetProviderType<T extends keyof ProviderTypeMap> = ProviderTypeMap[T];

/**
 * Provider factory interface for creating chain-specific providers
 */
export interface ProviderFactory<T extends keyof ProviderTypeMap> {
  /** Create a provider instance for the given chain */
  createProvider(chain: SupportedChain, config?: unknown): Promise<ProviderTypeMap[T]>;

  /** Check if provider is available in current environment */
  isAvailable(): boolean;

  /** Get supported chains for this provider type */
  getSupportedChains(): SupportedChain[];
}

/**
 * Provider registry for managing multiple provider factories
 */
export interface ProviderRegistry {
  /** Register a provider factory */
  register<T extends keyof ProviderTypeMap>(
    chainType: T,
    walletId: string,
    factory: ProviderFactory<T>,
  ): void;

  /** Get provider factory */
  getFactory<T extends keyof ProviderTypeMap>(chainType: T, walletId: string): ProviderFactory<T> | null;

  /** Get all registered wallet IDs for a chain type */
  getWalletIds<T extends keyof ProviderTypeMap>(chainType: T): string[];

  /** Check if a wallet supports a specific chain */
  supportsChain(walletId: string, chain: SupportedChain): boolean;
}

/**
 * Type aliases for compatibility and clarity
 * @public
 */

/**
 * Alias for SolanaProvider used in wallet adapters
 * @public
 */
export type SolanaWallet = SolanaProvider;

/**
 * Generic wallet standard event for all chains
 * @public
 */
export interface WalletStandardEvent {
  /** Event type identifier */
  type: string;
  /** Event data payload */
  data: unknown;
  /** Timestamp when event was emitted */
  timestamp: number;
}
