import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { ChainType } from '../../types.js';
import type {
  AztecTransactionParams,
  EVMTransactionParams,
  SolanaTransactionParams,
  TransactionRequest,
} from './types.js';

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class for transaction formatting functions
export class TransactionFormatter {
  /**
   * Format transaction parameters for provider based on chain type
   */
  static formatForProvider<T extends ChainType>(
    params: TransactionRequest<T>,
    chainType: T,
  ): Record<string, unknown> {
    switch (chainType) {
      case 'evm':
        return TransactionFormatter.formatEVMTransaction(params as EVMTransactionParams);
      case 'solana':
        return TransactionFormatter.formatSolanaTransaction(params as SolanaTransactionParams);
      case 'aztec':
        return TransactionFormatter.formatAztecTransaction(params as AztecTransactionParams);
      default:
        throw ErrorFactory.configurationError(`Unsupported chain type: ${chainType}`);
    }
  }

  /**
   * Format EVM transaction for provider
   */
  private static formatEVMTransaction(params: EVMTransactionParams): Record<string, unknown> {
    const formatted: Record<string, unknown> = {
      to: params.to,
    };

    // Add from if specified
    if (params.from) {
      formatted['from'] = params.from;
    }

    // Format value to hex
    if (params.value !== undefined) {
      formatted['value'] = TransactionFormatter.toHex(params.value);
    }

    // Add data if present
    if (params.data) {
      formatted['data'] = params.data;
    }

    // Format gas parameters to hex
    if (params.gas !== undefined) {
      formatted['gas'] = TransactionFormatter.toHex(params.gas);
    }

    if (params.maxFeePerGas !== undefined) {
      formatted['maxFeePerGas'] = TransactionFormatter.toHex(params.maxFeePerGas);
    }

    if (params.maxPriorityFeePerGas !== undefined) {
      formatted['maxPriorityFeePerGas'] = TransactionFormatter.toHex(params.maxPriorityFeePerGas);
    }

    // Format nonce to hex
    if (params.nonce !== undefined) {
      formatted['nonce'] = `0x${params.nonce.toString(16)}`;
    }

    return formatted;
  }

  /**
   * Format Solana transaction for provider
   */
  private static formatSolanaTransaction(params: SolanaTransactionParams): Record<string, unknown> {
    const formatted: Record<string, unknown> = {
      transaction: params.transaction,
    };

    if (params.options) {
      formatted['options'] = params.options;
    }

    return formatted;
  }

  /**
   * Format Aztec transaction for provider
   */
  private static formatAztecTransaction(params: AztecTransactionParams): Record<string, unknown> {
    const formatted: Record<string, unknown> = {
      contractAddress: params.contractAddress,
      functionName: params.functionName,
      args: params.args,
    };

    if (params.fee) {
      formatted['fee'] = params.fee;
    }

    return formatted;
  }

  /**
   * Convert a decimal string to hex string
   */
  private static toHex(value: string): string {
    if (value.startsWith('0x')) {
      return value;
    }
    return `0x${BigInt(value).toString(16)}`;
  }

  /**
   * Format transaction hash based on chain type
   */
  static formatHash(hash: string, chainType: ChainType): string {
    if (!hash) return hash; // Handle null/undefined hash

    switch (chainType) {
      case 'evm':
        // Ensure 0x prefix for EVM
        return hash.startsWith('0x') ? hash : `0x${hash}`;
      case 'aztec':
        // Aztec hashes don't use 0x prefix
        return hash.replace(/^0x/, '');
      case 'solana':
        // Solana hashes don't use 0x prefix
        return hash.replace(/^0x/, '');
      default:
        return hash;
    }
  }

  /**
   * Get the method name for sending transactions based on chain type
   */
  static getTransactionMethod(chainType: ChainType): string {
    switch (chainType) {
      case 'evm':
        return 'eth_sendTransaction';
      case 'solana':
        return 'sendTransaction';
      case 'aztec':
        return 'aztec_sendTransaction';
      default:
        throw ErrorFactory.configurationError(`Unsupported chain type: ${chainType}`);
    }
  }

  /**
   * Get the method name for getting transaction receipt based on chain type
   */
  static getReceiptMethod(chainType: ChainType): string {
    switch (chainType) {
      case 'evm':
        return 'eth_getTransactionReceipt';
      case 'solana':
        return 'getTransaction';
      case 'aztec':
        return 'aztec_getTransactionReceipt';
      default:
        throw ErrorFactory.configurationError(`Unsupported chain type: ${chainType}`);
    }
  }

  /**
   * Format receipt parameters based on chain type
   */
  static formatReceiptParams(hash: string, chainType: ChainType): unknown[] | Record<string, unknown> {
    switch (chainType) {
      case 'evm':
      case 'aztec':
        return [hash];
      case 'solana':
        return [hash, { commitment: 'confirmed' }];
      default:
        return [hash];
    }
  }
}
