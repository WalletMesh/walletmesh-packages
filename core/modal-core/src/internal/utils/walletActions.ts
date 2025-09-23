/**
 * Framework-agnostic wallet action utilities
 *
 * This module provides utilities for interacting with wallet providers,
 * including transaction sending, message signing, and gas estimation.
 * Used across all framework packages for consistent wallet interactions.
 *
 * @module walletActions
 * @public
 */

import { ErrorFactory } from '../core/errors/errorFactory.js';

/**
 * Transaction parameters for sending transactions
 * @public
 */
export interface TransactionParams {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

/**
 * Message signing parameters
 * @public
 */
export interface SignMessageParams {
  message: string;
  type?: 'personal' | 'typed';
}

/**
 * Typed data signing parameters (EIP-712)
 * @public
 */
export interface TypedDataParams {
  domain: {
    name?: string;
    version?: string;
    chainId?: number;
    verifyingContract?: string;
    salt?: string;
  };
  types: Record<string, Array<{ name: string; type: string }>>;
  primaryType: string;
  message: Record<string, unknown>;
}

/**
 * Provider interface for wallet interactions
 * @public
 */
export interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  // Optional properties that some providers might have
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean;
}

/**
 * Framework-agnostic wallet action manager
 *
 * Provides utilities for common wallet operations like sending transactions,
 * signing messages, and estimating gas. Handles provider validation and
 * error management consistently across all framework packages.
 *
 * @public
 */
export class WalletActionManager {
  private provider: WalletProvider;
  private currentAddress?: string;

  constructor(provider: unknown, currentAddress?: string) {
    this.provider = this.validateAndCastProvider(provider);
    if (currentAddress) {
      this.currentAddress = currentAddress;
    }
  }

  /**
   * Send a blockchain transaction
   * @param params - Transaction parameters
   * @returns Transaction hash
   * @throws Error if provider doesn't support transactions or transaction fails
   */
  async sendTransaction(params: TransactionParams): Promise<string> {
    this.validateProvider();

    const txParams = this.formatTransactionParams(params);

    try {
      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      if (typeof txHash !== 'string') {
        throw ErrorFactory.validation('Invalid transaction hash returned');
      }

      return txHash;
    } catch (error) {
      throw this.enhanceError(error, 'Transaction failed');
    }
  }

  /**
   * Sign a message using the connected wallet
   * @param params - Message signing parameters
   * @returns Message signature
   * @throws Error if provider doesn't support signing or signing fails
   */
  async signMessage(params: SignMessageParams): Promise<string> {
    this.validateProvider();
    this.validateAddress();

    try {
      const method = params.type === 'typed' ? 'eth_signTypedData_v4' : 'personal_sign';
      const signature = await this.provider.request({
        method,
        params: [params.message, this.currentAddress],
      });

      if (typeof signature !== 'string') {
        throw ErrorFactory.validation('Invalid signature returned');
      }

      return signature;
    } catch (error) {
      throw this.enhanceError(error, 'Message signing failed');
    }
  }

  /**
   * Sign typed data using EIP-712 standard
   * @param params - Typed data parameters
   * @returns Typed data signature
   * @throws Error if provider doesn't support typed data signing or signing fails
   */
  async signTypedData(params: TypedDataParams): Promise<string> {
    this.validateProvider();
    this.validateAddress();

    try {
      const typedData = {
        domain: params.domain,
        types: params.types,
        primaryType: params.primaryType,
        message: params.message,
      };

      const signature = await this.provider.request({
        method: 'eth_signTypedData_v4',
        params: [this.currentAddress, JSON.stringify(typedData)],
      });

      if (typeof signature !== 'string') {
        throw ErrorFactory.validation('Invalid signature returned');
      }

      return signature;
    } catch (error) {
      throw this.enhanceError(error, 'Typed data signing failed');
    }
  }

  /**
   * Estimate gas for a transaction
   * @param params - Transaction parameters
   * @returns Gas estimate in hex format
   * @throws Error if provider doesn't support gas estimation or estimation fails
   */
  async estimateGas(params: TransactionParams): Promise<string> {
    this.validateProvider();

    const txParams = this.formatTransactionParams(params, true); // skipGasFields for estimation

    try {
      const gasEstimate = await this.provider.request({
        method: 'eth_estimateGas',
        params: [txParams],
      });

      if (typeof gasEstimate !== 'string') {
        throw ErrorFactory.validation('Invalid gas estimate returned');
      }

      return gasEstimate;
    } catch (error) {
      throw this.enhanceError(error, 'Gas estimation failed');
    }
  }

  /**
   * Get the current gas price
   * @returns Gas price in hex format
   * @throws Error if provider doesn't support gas price retrieval
   */
  async getGasPrice(): Promise<string> {
    this.validateProvider();

    try {
      const gasPrice = await this.provider.request({
        method: 'eth_gasPrice',
        params: [],
      });

      if (typeof gasPrice !== 'string') {
        throw ErrorFactory.validation('Invalid gas price returned');
      }

      return gasPrice;
    } catch (error) {
      throw this.enhanceError(error, 'Gas price retrieval failed');
    }
  }

  /**
   * Get the current block number
   * @returns Block number in hex format
   * @throws Error if provider doesn't support block number retrieval
   */
  async getBlockNumber(): Promise<string> {
    this.validateProvider();

    try {
      const blockNumber = await this.provider.request({
        method: 'eth_blockNumber',
        params: [],
      });

      if (typeof blockNumber !== 'string') {
        throw ErrorFactory.validation('Invalid block number returned');
      }

      return blockNumber;
    } catch (error) {
      throw this.enhanceError(error, 'Block number retrieval failed');
    }
  }

  /**
   * Get the balance of an address
   * @param address - Address to get balance for (defaults to current address)
   * @param blockTag - Block tag (defaults to 'latest')
   * @returns Balance in hex format (wei)
   * @throws Error if provider doesn't support balance retrieval
   */
  async getBalance(address?: string, blockTag = 'latest'): Promise<string> {
    this.validateProvider();

    const targetAddress = address || this.currentAddress;
    if (!targetAddress) {
      throw ErrorFactory.invalidParams('No address provided and no current address available');
    }

    try {
      const balance = await this.provider.request({
        method: 'eth_getBalance',
        params: [targetAddress, blockTag],
      });

      if (typeof balance !== 'string') {
        throw ErrorFactory.validation('Invalid balance returned');
      }

      return balance;
    } catch (error) {
      throw this.enhanceError(error, 'Balance retrieval failed');
    }
  }

  /**
   * Update the current address
   * @param address - New current address
   */
  setCurrentAddress(address: string): void {
    this.currentAddress = address;
  }

  /**
   * Get the current address
   * @returns Current address or undefined
   */
  getCurrentAddress(): string | undefined {
    return this.currentAddress;
  }

  /**
   * Check if provider supports a specific method
   * @param method - Method name to check
   * @returns True if method is likely supported
   */
  supportsMethod(method: string): boolean {
    // This is a basic check - in practice, you might want to try the method
    const commonMethods = [
      'eth_sendTransaction',
      'personal_sign',
      'eth_signTypedData_v4',
      'eth_estimateGas',
      'eth_gasPrice',
      'eth_blockNumber',
      'eth_getBalance',
      'wallet_switchEthereumChain',
      'wallet_addEthereumChain',
    ];

    return commonMethods.includes(method);
  }

  /**
   * Validate that provider supports required methods
   * @throws Error if provider is invalid
   */
  private validateProvider(): void {
    if (!this.provider) {
      throw ErrorFactory.connectionFailed('No wallet provider available');
    }

    if (!this.provider.request || typeof this.provider.request !== 'function') {
      throw ErrorFactory.configurationError('Provider does not support request method');
    }
  }

  /**
   * Validate that current address is available
   * @throws Error if no current address
   */
  private validateAddress(): void {
    if (!this.currentAddress) {
      throw ErrorFactory.connectionFailed('No wallet address available');
    }
  }

  /**
   * Validate and cast provider to expected interface
   * @param provider - Provider to validate
   * @returns Validated provider
   * @throws Error if provider is invalid
   */
  private validateAndCastProvider(provider: unknown): WalletProvider {
    if (!provider || typeof provider !== 'object') {
      throw ErrorFactory.invalidParams('Provider must be an object');
    }

    const providerObj = provider as Record<string, unknown>;
    if (!providerObj['request'] || typeof providerObj['request'] !== 'function') {
      throw ErrorFactory.configurationError('Provider must have a request method');
    }

    return provider as WalletProvider;
  }

  /**
   * Format transaction parameters for provider
   * @param params - Raw transaction parameters
   * @param skipGasFields - Whether to skip gas-related fields (for estimation)
   * @returns Formatted parameters
   */
  private formatTransactionParams(params: TransactionParams, skipGasFields = false): Record<string, string> {
    const formatted: Record<string, string> = {
      to: params.to,
    };

    // Add value if provided
    if (params.value !== undefined) {
      formatted['value'] = this.formatHexValue(params.value);
    }

    // Add data if provided
    if (params.data !== undefined) {
      formatted['data'] = params.data;
    }

    // Skip gas fields for estimation calls
    if (!skipGasFields) {
      if (params.gasLimit !== undefined) {
        formatted['gas'] = this.formatHexValue(params.gasLimit);
      }

      if (params.gasPrice !== undefined) {
        formatted['gasPrice'] = this.formatHexValue(params.gasPrice);
      }

      if (params.maxFeePerGas !== undefined) {
        formatted['maxFeePerGas'] = this.formatHexValue(params.maxFeePerGas);
      }

      if (params.maxPriorityFeePerGas !== undefined) {
        formatted['maxPriorityFeePerGas'] = this.formatHexValue(params.maxPriorityFeePerGas);
      }
    }

    return formatted;
  }

  /**
   * Format a value to hex format if it's not already
   * @param value - Value to format
   * @returns Hex-formatted value
   */
  private formatHexValue(value: string): string {
    if (value.startsWith('0x')) {
      return value;
    }

    const numValue = Number.parseInt(value, 10);
    if (Number.isNaN(numValue)) {
      throw ErrorFactory.validation(`Invalid numeric value: ${value}`);
    }

    return `0x${numValue.toString(16)}`;
  }

  /**
   * Enhance error with additional context
   * @param error - Original error
   * @param context - Additional context
   * @returns Enhanced error
   */
  private enhanceError(error: unknown, context: string): Error {
    if (error instanceof Error) {
      // For ModalError, create a new Error with the enhanced message
      // to avoid mutating the original error object
      const enhancedMessage = `${context}: ${error.message}`;
      const enhancedError = new Error(enhancedMessage);
      enhancedError.name = error.name;
      if (error.stack) {
        enhancedError.stack = error.stack;
      }
      return enhancedError;
    }

    // Handle ModalError objects by extracting their message
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return new Error(`${context}: ${error.message}`);
    }

    // Handle other objects by stringifying them
    const errorMessage = typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error);
    return new Error(`${context}: ${errorMessage}`);
  }
}

/**
 * Create a wallet action manager instance
 * @param provider - Wallet provider
 * @param currentAddress - Current wallet address
 * @returns WalletActionManager instance
 * @public
 */
export function createWalletActionManager(provider: unknown, currentAddress?: string): WalletActionManager {
  return new WalletActionManager(provider, currentAddress);
}
