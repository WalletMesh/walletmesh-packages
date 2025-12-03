import type { ChainType } from '../../types.js';
import type {
  AztecTransactionParams,
  EVMTransactionParams,
  SolanaTransactionParams,
  TransactionRequest,
  TransactionValidationResult,
} from './types.js';

// biome-ignore lint/complexity/noStaticOnlyClass: Utility class for transaction validation functions
export class TransactionValidator {
  /**
   * Validate transaction parameters based on chain type
   */
  static validate<T extends ChainType>(
    params: TransactionRequest<T>,
    chainType: T,
  ): TransactionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!chainType) {
      errors.push('Chain type is required');
      return { valid: false, errors, warnings };
    }

    switch (chainType) {
      case 'evm':
        return TransactionValidator.validateEVMTransaction(params as EVMTransactionParams);

      case 'solana':
        return TransactionValidator.validateSolanaTransaction(params as SolanaTransactionParams);

      case 'aztec':
        return TransactionValidator.validateAztecTransaction(params as AztecTransactionParams);

      default:
        errors.push(`Unsupported chain type: ${chainType}`);
        return { valid: false, errors, warnings };
    }
  }

  /**
   * Validate EVM transaction parameters
   */
  private static validateEVMTransaction(params: EVMTransactionParams): TransactionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate to address
    if (!params.to) {
      errors.push('To address is required');
    } else if (!TransactionValidator.isValidEVMAddress(params.to)) {
      errors.push('Invalid EVM address format (must be 0x followed by 40 hex characters)');
    }

    // Validate from address if provided
    if (params.from && !TransactionValidator.isValidEVMAddress(params.from)) {
      errors.push('Invalid from address format');
    }

    // Validate value
    if (params.value !== undefined) {
      if (!TransactionValidator.isValidUint256(params.value)) {
        errors.push('Invalid value format (must be wei as string)');
      }
    }

    // Validate gas parameters
    if (params.gas !== undefined && !TransactionValidator.isValidUint256(params.gas)) {
      errors.push('Invalid gas format (must be number as string)');
    }

    if (params.maxFeePerGas !== undefined && !TransactionValidator.isValidUint256(params.maxFeePerGas)) {
      errors.push('Invalid maxFeePerGas format (must be number as string)');
    }

    if (
      params.maxPriorityFeePerGas !== undefined &&
      !TransactionValidator.isValidUint256(params.maxPriorityFeePerGas)
    ) {
      errors.push('Invalid maxPriorityFeePerGas format (must be number as string)');
    }

    // Validate nonce
    if (params.nonce !== undefined && (!Number.isInteger(params.nonce) || params.nonce < 0)) {
      errors.push('Invalid nonce (must be non-negative integer)');
    }

    // Validate data
    if (params.data && !TransactionValidator.isValidHexString(params.data)) {
      errors.push('Invalid data format (must be hex string starting with 0x)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Solana transaction parameters
   */
  private static validateSolanaTransaction(params: SolanaTransactionParams): TransactionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate transaction data
    if (!params.transaction) {
      errors.push('Solana transaction data is required');
    } else if (typeof params.transaction !== 'string') {
      errors.push('Solana transaction must be a base64-encoded string');
    } else {
      // Try to validate base64 format
      try {
        atob(params.transaction);
      } catch {
        errors.push('Invalid base64 encoding for Solana transaction');
      }
    }

    // Validate options
    if (params.options) {
      if (
        params.options.preflightCommitment &&
        !['processed', 'confirmed', 'finalized'].includes(params.options.preflightCommitment)
      ) {
        errors.push('Invalid preflight commitment level');
      }

      if (
        params.options.maxRetries !== undefined &&
        (!Number.isInteger(params.options.maxRetries) || params.options.maxRetries < 0)
      ) {
        errors.push('Invalid maxRetries (must be non-negative integer)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate Aztec transaction parameters
   */
  private static validateAztecTransaction(params: AztecTransactionParams): TransactionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate contract address
    if (!params.contractAddress) {
      errors.push('Aztec contract address is required');
    } else if (!TransactionValidator.isValidAztecAddress(params.contractAddress)) {
      errors.push('Invalid Aztec contract address format');
    }

    // Validate function name
    if (!params.functionName) {
      errors.push('Aztec function name is required');
    } else if (typeof params.functionName !== 'string' || params.functionName.trim() === '') {
      errors.push('Invalid function name');
    }

    // Validate args
    if (!Array.isArray(params.args)) {
      errors.push('Aztec function args must be an array');
    }

    // Validate fee options
    if (params.fee) {
      if (!['native', 'gasless'].includes(params.fee.paymentMethod)) {
        errors.push('Invalid fee payment method');
      }

      if (params.fee.paymentMethod === 'gasless' && params.fee.payer) {
        if (!TransactionValidator.isValidAztecAddress(params.fee.payer)) {
          errors.push('Invalid fee payer address');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a string is a valid EVM address
   */
  private static isValidEVMAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if a string is a valid Aztec address
   * Note: This is a placeholder - actual Aztec address validation may differ
   */
  private static isValidAztecAddress(address: string): boolean {
    // Aztec addresses are similar to EVM addresses for now
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if a string is a valid uint256 value
   */
  private static isValidUint256(value: string): boolean {
    if (!/^\d+$/.test(value)) {
      return false;
    }

    try {
      const bigIntValue = BigInt(value);
      // Check if it's within uint256 range
      return (
        bigIntValue >= 0n &&
        bigIntValue <= BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
      );
    } catch {
      return false;
    }
  }

  /**
   * Check if a string is a valid hex string
   */
  private static isValidHexString(value: string): boolean {
    return /^0x[a-fA-F0-9]*$/.test(value);
  }
}
