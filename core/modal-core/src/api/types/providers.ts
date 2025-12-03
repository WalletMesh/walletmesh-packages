/**
 * Provider interface types for JSON-RPC communication
 *
 * Defines the WalletProvider system used by provider implementations
 * (EvmProvider, SolanaProvider, etc.) for JSON-RPC method communication.
 *
 * @remarks
 * As of 2025-01-20, all provider interfaces extend CommonProviderInterface for consistency.
 * This ensures compatibility with the BlockchainProvider system used by services.
 *
 * @see CommonProviderInterface for the base interface all providers extend
 * @module types/providers
 * @packageDocumentation
 */

import type { ChainType } from '../../core/types.js';
import type { CommonProviderInterface } from './commonProvider.js';

/**
 * Method map defining wallet JSON-RPC methods for type-safe communication
 *
 * @public
 */
export interface WalletMethodMap {
  // EVM methods
  eth_accounts: { params: undefined; result: string[] };
  eth_sendTransaction: { params: [EvmTransaction]; result: string };
  eth_signMessage: { params: [string, string]; result: string };
  eth_chainId: { params: undefined; result: string };
  wallet_switchEthereumChain: { params: [{ chainId: string }]; result: null };
  eth_requestAccounts: { params: undefined; result: string[] };
  eth_getBalance: { params: [string, string]; result: string };

  // Solana methods
  solana_getAccounts: { params: undefined; result: string[] };
  solana_signTransaction: { params: [SolanaTransaction]; result: string };
  solana_signMessage: { params: [string]; result: string };
  solana_connect: { params: undefined; result: { publicKey: string } };
  solana_disconnect: { params: undefined; result: undefined };

  // Aztec methods (with automatic serialization)
  aztec_getAddress: { params: undefined; result: string };
  aztec_sendTransaction: { params: [AztecTransaction]; result: TxHash };
  aztec_addAuthWitness: { params: [AuthWitness]; result: undefined };
  aztec_getNodeInfo: { params: undefined; result: NodeInfo };
  aztec_getChainId: { params: undefined; result: string };
  aztec_signMessage: { params: [string]; result: string };

  // Generic wallet methods
  wallet_getAccounts: { params: undefined; result: string[] };
  wallet_getChainInfo: { params: undefined; result: BasicChainInfo };
  wallet_switchChain: { params: [{ chainId: string }]; result: null };
  wallet_getState: { params: undefined; result: WalletProviderState };

  // Index signature for extensibility
  [method: string]: { params?: undefined | unknown[] | Record<string, unknown>; result: unknown };
}

/**
 * Event map defining wallet JSON-RPC events for type-safe communication
 *
 * @public
 */
export interface WalletEventMap {
  accountsChanged: string[];
  chainChanged: string;
  disconnect: { code: number; message: string };
  connect: { chainId: string; accounts: string[] };
  message: { type: string; data: unknown };

  // Index signature for extensibility
  [event: string]: unknown;
}

/**
 * EVM transaction interface for JSON-RPC communication
 *
 * @public
 */
export interface EvmTransaction {
  from: string;
  to?: string;
  value?: string;
  gas?: string;
  data?: string;
  nonce?: string;
}

/**
 * Solana transaction interface for JSON-RPC communication
 *
 * @public
 */
export interface SolanaTransaction {
  recentBlockhash: string;
  feePayer: string;
  instructions: SolanaInstruction[];
  signatures?: string[];
}

/**
 * Solana instruction interface
 *
 * @public
 */
export interface SolanaInstruction {
  programId: string;
  keys: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data?: string;
}

/**
 * Aztec account interface
 *
 * @remarks
 * This is a simplified interface. For full Aztec account functionality,
 * use the types from @aztec/aztec.js directly in your application.
 *
 * @public
 */
export interface AztecAccount {
  address: string;
  publicKey: string;
}

/**
 * Aztec transaction interface
 *
 * @remarks
 * This is a simplified interface. For full Aztec transaction functionality,
 * use the types from @aztec/aztec.js directly in your application.
 *
 * @public
 */
export interface AztecTransaction {
  origin: string;
  functionData: unknown;
  txContext: unknown;
}

/**
 * Aztec transaction hash type
 *
 * @public
 */
export type TxHash = string;

/**
 * Aztec authentication witness interface
 *
 * @public
 */
export interface AuthWitness {
  witness: unknown;
  requestId: string;
}

/**
 * Aztec node info interface
 *
 * @public
 */
export interface NodeInfo {
  chainId: number;
  nodeVersion: string;
  l1ChainId: number;
}

/**
 * Basic chain identifier for provider methods
 *
 * @remarks
 * A minimal chain representation used in provider method responses.
 * For full chain information including metadata, use ChainInfo from services.
 *
 * @public
 */
export interface BasicChainInfo {
  chainType: ChainType;
  chainId: string;
  name?: string;
}

/**
 * Generic wallet provider state interface
 * Renamed from WalletState to avoid confusion with modal state management
 *
 * @public
 */
export interface WalletProviderState {
  accounts: string[];
  chainId: string;
  chainType: ChainType;
  isConnected: boolean;
}

/**
 * Provider class constructor type for lazy loading
 *
 * @public
 */
export type ProviderClass = new (
  chainType: ChainType,
  transport: import('@walletmesh/jsonrpc').JSONRPCTransport,
  initialChainId: string | undefined,
  logger: import('../../internal/core/logger/logger.js').Logger,
) => WalletProvider;

/**
 * Public provider interface for read-only blockchain operations
 *
 * Public providers use dApp-specified RPC endpoints for read operations,
 * allowing applications to control their infrastructure and costs.
 *
 * @public
 */
export interface PublicProvider {
  /**
   * Make a read-only JSON-RPC request
   */
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;

  /**
   * Get the chain ID this provider is connected to
   */
  chainId: string;

  /**
   * Get the chain type (evm, solana, aztec)
   */
  chainType: ChainType;
}

/**
 * Base wallet provider interface
 *
 * Wallet providers use the wallet's RPC endpoints for both read and write operations,
 * enabling transaction signing and other privileged operations.
 *
 * This interface extends CommonProviderInterface to ensure consistency with
 * the BlockchainProvider system.
 *
 * @public
 */
export interface BaseWalletProvider extends CommonProviderInterface {
  // All common methods inherited from CommonProviderInterface:
  // - getAccounts(): Promise<string[]>
  // - getChainId(): Promise<string>
  // - disconnect(): Promise<void>
  // - on(event: string, listener: (...args: unknown[]) => void): void
  // - off(event: string, listener: (...args: unknown[]) => void): void
  // - removeAllListeners(event?: string): void
}

/**
 * EVM-specific wallet provider following EIP-1193 standard
 *
 * @public
 */
export interface EvmWalletProvider extends BaseWalletProvider {
  /**
   * Make an EIP-1193 compliant JSON-RPC request
   */
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;

  /**
   * Check if the provider is connected (EIP-1193)
   */
  isConnected?(): boolean;
}

/**
 * Solana-specific wallet provider following Solana Wallet Standard
 *
 * @public
 */
export interface SolanaWalletProvider extends BaseWalletProvider {
  /**
   * Connect to the wallet
   */
  connect(options?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: string }>;

  /**
   * Sign a message
   */
  signMessage(message: string): Promise<string>;

  /**
   * Sign a transaction
   */
  signTransaction(transaction: unknown): Promise<string>;

  /**
   * Update the public key (called by adapter when wallet events occur)
   * @internal
   */
  updatePublicKey(publicKey: string | null): void;

  /**
   * Check if the wallet is connected (Solana Wallet Standard)
   */
  readonly connected?: boolean;
}

/**
 * Aztec-specific wallet provider
 *
 * @public
 */
export interface AztecWalletProvider extends BaseWalletProvider {
  /**
   * Call an Aztec wallet method
   */
  call<T = unknown>(method: string, params?: unknown[]): Promise<T>;

  /**
   * Get the Aztec account address
   */
  getAddress(): Promise<string>;
}

/**
 * Unified wallet provider type
 * This is a discriminated union of all blockchain-specific providers
 *
 * @public
 */
export type WalletProvider =
  | EvmWalletProvider
  | SolanaWalletProvider
  | AztecWalletProvider
  | BaseWalletProvider;

/**
 * Type guard for EVM wallet provider
 */
export function isEvmWalletProvider(provider: WalletProvider): provider is EvmWalletProvider {
  return 'request' in provider && typeof (provider as EvmWalletProvider).request === 'function';
}

/**
 * Type guard for Solana wallet provider
 */
export function isSolanaWalletProvider(provider: WalletProvider): provider is SolanaWalletProvider {
  return (
    'signTransaction' in provider && typeof (provider as SolanaWalletProvider).signTransaction === 'function'
  );
}

/**
 * Type guard for Aztec wallet provider
 */
export function isAztecWalletProvider(provider: WalletProvider): provider is AztecWalletProvider {
  return 'call' in provider && typeof (provider as AztecWalletProvider).call === 'function';
}
