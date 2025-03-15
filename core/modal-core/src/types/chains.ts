/**
 * Chain Types Module
 * Defines the core types and interfaces for blockchain network support
 *
 * @module chains
 */

/**
 * Supported blockchain types in the WalletClient system.
 * Designed for future extensibility with additional chains.
 *
 * @enum {string}
 */
export enum ChainType {
  /** Ethereum blockchain and EVM-compatible networks */
  ETHEREUM = 'ethereum',
}

/**
 * Base interface for chain-specific configuration
 * Defines the required properties for each supported blockchain network
 *
 * @interface ChainConfig
 */
export interface ChainConfig {
  /**
   * Unique identifier for the chain
   * For EVM chains, this should be a hex string (e.g., "0x1" for Ethereum mainnet)
   */
  chainId: string;

  /**
   * Display name for the chain
   * Human-readable name shown in the UI
   */
  name: string;

  /**
   * Chain type
   * Category of blockchain this configuration represents
   */
  type: ChainType;
}

/**
 * Error thrown when attempting to use an unsupported chain
 * Used to provide clear error messages for unsupported networks
 *
 * @class ChainNotSupportedError
 * @extends Error
 */
export class ChainNotSupportedError extends Error {
  /**
   * Create a new ChainNotSupportedError
   * @param chainType - The unsupported chain type
   */
  constructor(chainType: ChainType) {
    super(`Chain type ${chainType} is not supported`);
    this.name = 'ChainNotSupportedError';
  }
}

/**
 * Registry of supported chains and their configurations
 * Maps chain IDs to their respective configurations
 *
 * @interface ChainRegistry
 * @example
 * {
 *   "0x1": {
 *     chainId: "0x1",
 *     name: "Ethereum Mainnet",
 *     type: ChainType.ETHEREUM
 *   }
 * }
 */
export interface ChainRegistry {
  /**
   * Chain configuration indexed by chain ID
   * The key should match the chainId in the configuration
   */
  [chainId: string]: ChainConfig;
}
