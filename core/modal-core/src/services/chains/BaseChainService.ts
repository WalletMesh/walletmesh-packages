/**
 * Base Chain Service Abstraction
 *
 * This abstraction layer sits between services and providers, enabling
 * lazy loading of chain-specific implementations while maintaining a
 * unified interface for balance queries, transactions, etc.
 *
 * @module services/chains/BaseChainService
 */

import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { ChainType } from '../../types.js';

/**
 * Balance information returned by chain services
 */
export interface ChainBalanceInfo {
  /** Raw balance value in smallest unit */
  value: string;
  /** Formatted balance as decimal string */
  formatted: string;
  /** Token/currency symbol */
  symbol: string;
  /** Number of decimal places */
  decimals: number;
  /** Chain-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Token information for chain-specific queries
 */
export interface ChainTokenInfo {
  /** Token contract address */
  address: string;
  /** Token symbol (fetched if not provided) */
  symbol?: string;
  /** Token name (fetched if not provided) */
  name?: string;
  /** Token decimals (fetched if not provided) */
  decimals?: number;
  /** Chain-specific token metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Transaction parameters for chain services
 */
export interface ChainTransactionParams {
  /** Sender address */
  from: string;
  /** Recipient address (optional for contract creation) */
  to?: string;
  /** Transaction value */
  value?: string;
  /** Transaction data */
  data?: string;
  /** Gas limit */
  gasLimit?: string;
  /** Chain-specific parameters */
  chainSpecific?: Record<string, unknown>;
}

/**
 * Transaction result from chain services
 */
export interface ChainTransactionResult {
  /** Transaction hash */
  hash: string;
  /** Whether transaction was successful */
  success: boolean;
  /** Block number (if mined) */
  blockNumber?: number;
  /** Gas used */
  gasUsed?: string;
  /** Chain-specific result data */
  chainSpecific?: Record<string, unknown>;
}

/**
 * Abstract base class for chain-specific service implementations
 *
 * Each blockchain gets its own implementation that handles the specific
 * RPC calls, data structures, and behaviors for that chain.
 */
export abstract class BaseChainService {
  protected logger: Logger;
  protected chainType: ChainType;

  constructor(chainType: ChainType, logger: Logger) {
    this.chainType = chainType;
    this.logger = logger;
  }

  /**
   * Get native balance for an address
   */
  abstract getNativeBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string,
  ): Promise<ChainBalanceInfo>;

  /**
   * Get token balance for an address
   */
  abstract getTokenBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string,
    token: ChainTokenInfo,
  ): Promise<ChainBalanceInfo>;

  /**
   * Get token metadata (symbol, decimals, name)
   */
  abstract getTokenMetadata(
    provider: BlockchainProvider,
    tokenAddress: string,
    chainId: string,
  ): Promise<{ symbol: string; name: string; decimals: number }>;

  /**
   * Send a transaction
   */
  abstract sendTransaction(
    provider: BlockchainProvider,
    params: ChainTransactionParams,
    chainId: string,
  ): Promise<ChainTransactionResult>;

  /**
   * Get transaction receipt
   */
  abstract getTransactionReceipt(
    provider: BlockchainProvider,
    hash: string,
    chainId: string,
  ): Promise<ChainTransactionResult | null>;

  /**
   * Estimate gas for a transaction
   */
  abstract estimateGas(
    provider: BlockchainProvider,
    params: ChainTransactionParams,
    chainId: string,
  ): Promise<string>;

  /**
   * Get current gas price
   */
  abstract getGasPrice(provider: BlockchainProvider, chainId: string): Promise<string>;

  /**
   * Format balance for display
   */
  protected formatBalance(value: bigint, decimals: number): string {
    const divisor = BigInt(10 ** decimals);
    const quotient = value / divisor;
    const remainder = value % divisor;

    if (remainder === 0n) {
      return `${quotient}.0`;
    }

    const remainderStr = remainder.toString().padStart(decimals, '0');
    const trimmedRemainder = remainderStr.replace(/0+$/, '');

    return `${quotient}.${trimmedRemainder}`;
  }

  /**
   * Get chain type
   */
  getChainType(): ChainType {
    return this.chainType;
  }

  /**
   * Check if this service supports the given chain
   */
  abstract supportsChain(chainId: string): boolean;
}

/**
 * Chain service factory function type
 */
export type ChainServiceFactory = (logger: Logger) => Promise<BaseChainService>;

/**
 * Chain service loader function type for dynamic imports
 */
export type ChainServiceLoader = () => Promise<{
  default?: ChainServiceFactory;
  createEVMChainService?: ChainServiceFactory;
  createSolanaChainService?: ChainServiceFactory;
  createAztecChainService?: ChainServiceFactory;
}>;
