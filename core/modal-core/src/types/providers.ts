import type { ChainType } from './chains.js';

/**
 * Provider Types Module
 * Defines interfaces and types for different wallet provider implementations
 *
 * @module providers
 */

/**
 * Supported wallet provider interface types
 * Defines the different standards and formats for wallet communication
 *
 * @enum {string}
 */
export enum ProviderInterface {
  /** Standard Ethereum provider interface (EIP-1193) */
  EIP1193 = 'eip1193',
  /** Multi-provider detection interface (EIP-6963) */
  EIP6963 = 'eip6963',
  /** Ethers.js compatible provider interface */
  ETHERS = 'ethers',
  /** Built-in native wallet provider */
  NATIVE = 'native',
}

/**
 * Provider capability descriptor
 * Describes what features a provider supports
 *
 * @interface ProviderCapability
 */
export interface ProviderCapability {
  /** Provider interface type */
  interface: ProviderInterface;
  /** Provider interface version */
  version: string;
  /** Supported provider methods (e.g., 'eth_requestAccounts') */
  methods: string[];
  /** Supported provider events (e.g., 'accountsChanged') */
  events: string[];
}

/**
 * Base provider interface
 * Common functionality that all providers must implement
 *
 * @interface BaseProvider
 */
export interface BaseProvider {
  /** Provider interface type */
  type: ProviderInterface;
  /**
   * Request method to interact with the provider
   * @param args - Request arguments including method name and parameters
   * @returns Promise resolving to the request result
   */
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  /**
   * Check if provider supports a specific method
   * @param method - Method name to check
   */
  supportsMethod?(method: string): boolean;
  /**
   * Configure provider for a specific chain
   * @param chain - Chain to configure provider for
   */
  setChain?(chain: ChainType): void;
  /**
   * Get current chain configuration
   * @returns Current chain type or null if not set
   */
  getChain?(): ChainType | null;
}

/**
 * EIP-1193 Ethereum Provider interface
 * Standard interface for Ethereum providers
 * @see https://eips.ethereum.org/EIPS/eip-1193
 *
 * @interface EIP1193Provider
 * @extends {BaseProvider}
 */
export interface EIP1193Provider extends BaseProvider {
  type: ProviderInterface.EIP1193;
  /** Add event listener */
  on(event: string, listener: (...args: unknown[]) => void): void;
  /** Remove event listener */
  removeListener(event: string, listener: (...args: unknown[]) => void): void;
}

/**
 * EIP-6963 Provider Info interface
 * Metadata about a provider implementation
 * @see https://eips.ethereum.org/EIPS/eip-6963
 *
 * @interface EIP6963ProviderInfo
 */
export interface EIP6963ProviderInfo {
  /** Unique identifier for the provider instance */
  uuid: string;
  /** Display name of the provider */
  name: string;
  /** Provider icon URL */
  icon: string;
  /** Reverse domain name identifier */
  rdns: string;
}

/**
 * EIP-6963 Provider interface
 * Enhanced provider interface with metadata
 *
 * @interface EIP6963Provider
 * @extends {BaseProvider}
 */
export interface EIP6963Provider extends BaseProvider {
  type: ProviderInterface.EIP6963;
  /** Provider metadata */
  info: EIP6963ProviderInfo;
}

/**
 * Ethers.js Provider interface
 * Compatible with ethers.js library
 *
 * @interface EthersProvider
 * @extends {BaseProvider}
 */
export interface EthersProvider extends BaseProvider {
  type: ProviderInterface.ETHERS;
  /** Get signer instance */
  getSigner(): Promise<unknown>;
}

/**
 * Native (built-in) wallet provider interface
 * For wallets that are part of the browser or environment
 *
 * @interface NativeProvider
 * @extends {BaseProvider}
 */
export interface NativeProvider extends BaseProvider {
  type: ProviderInterface.NATIVE;
  /** Flag indicating this is a native provider */
  isNative: true;
}

/**
 * Provider-specific errors
 */

/**
 * Error thrown when attempting to use an unsupported provider interface
 *
 * @class ProviderNotSupportedError
 * @extends Error
 */
export class ProviderNotSupportedError extends Error {
  /**
   * Create a new ProviderNotSupportedError
   * @param type - The unsupported provider interface type
   */
  constructor(type: ProviderInterface) {
    super(`Provider interface ${type} is not supported`);
    this.name = 'ProviderNotSupportedError';
  }
}

/**
 * Error thrown when attempting to use an unsupported provider method
 *
 * @class ProviderMethodNotSupportedError
 * @extends Error
 */
export class ProviderMethodNotSupportedError extends Error {
  /**
   * Create a new ProviderMethodNotSupportedError
   * @param method - The unsupported method name
   * @param type - The provider interface type
   */
  constructor(method: string, type: ProviderInterface) {
    super(`Method ${method} is not supported by provider ${type}`);
    this.name = 'ProviderMethodNotSupportedError';
  }
}
