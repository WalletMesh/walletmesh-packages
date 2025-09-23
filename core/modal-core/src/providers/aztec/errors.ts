/**
 * Aztec-specific error handling utilities
 *
 * Provides error classes and utilities for handling Aztec-specific
 * errors in a consistent way throughout the application.
 *
 * @module providers/aztec/errors
 * @packageDocumentation
 */

/**
 * Base class for Aztec-specific errors
 *
 * @public
 */
export class AztecError extends Error {
  /** Error code for programmatic handling */
  public readonly code: string;
  /** Additional error details */
  public readonly details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.name = 'AztecError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Alias for AztecError to match expected naming convention
 * @public
 */
export class AztecProviderError extends AztecError {
  constructor(message: string, code = 'PROVIDER_ERROR', details?: unknown) {
    super(message, code, details);
    this.name = 'AztecProviderError';
  }
}

/**
 * Error thrown when contract operations fail
 *
 * @public
 */
export class AztecContractError extends AztecError {
  /** The contract address involved */
  public readonly contractAddress?: unknown;
  /** The method that failed */
  public readonly methodName: string | undefined;

  constructor(
    message: string,
    code = 'CONTRACT_ERROR',
    details?: unknown,
    contractAddress?: unknown,
    methodName?: string,
  ) {
    super(message, code, details);
    this.name = 'AztecContractError';
    this.contractAddress = contractAddress;
    if (methodName) {
      this.methodName = methodName;
    }
  }
}

/**
 * Error thrown when account operations fail
 *
 * @public
 */
export class AztecAccountError extends AztecError {
  /** The account address involved */
  public readonly accountAddress?: unknown;

  constructor(message: string, code = 'ACCOUNT_ERROR', details?: unknown, accountAddress?: unknown) {
    super(message, code, details);
    this.name = 'AztecAccountError';
    this.accountAddress = accountAddress;
  }
}

/**
 * Error thrown when event operations fail
 *
 * @public
 */
export class AztecEventError extends AztecError {
  /** The event name that caused the error */
  public readonly eventName: string | undefined;

  constructor(message: string, code = 'EVENT_ERROR', details?: unknown, eventName?: string) {
    super(message, code, details);
    this.name = 'AztecEventError';
    if (eventName) {
      this.eventName = eventName;
    }
  }
}

/**
 * Error thrown when auth witness operations fail
 *
 * @public
 */
export class AztecAuthError extends AztecError {
  constructor(message: string, code = 'AUTH_ERROR', details?: unknown) {
    super(message, code, details);
    this.name = 'AztecAuthError';
  }
}

/**
 * Common Aztec error codes
 *
 * @public
 */
export const AZTEC_ERROR_CODE = {
  // Contract errors
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  CONTRACT_NOT_DEPLOYED: 'CONTRACT_NOT_DEPLOYED',
  METHOD_NOT_FOUND: 'METHOD_NOT_FOUND',
  INVALID_ARGUMENTS: 'INVALID_ARGUMENTS',
  EXECUTION_FAILED: 'EXECUTION_FAILED',
  SIMULATION_FAILED: 'SIMULATION_FAILED',

  // Account errors
  ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
  ACCOUNT_NOT_REGISTERED: 'ACCOUNT_NOT_REGISTERED',
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  UNAUTHORIZED: 'UNAUTHORIZED',

  // Event errors
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  INVALID_BLOCK_RANGE: 'INVALID_BLOCK_RANGE',
  SUBSCRIPTION_FAILED: 'SUBSCRIPTION_FAILED',

  // Auth errors
  AUTH_WITNESS_FAILED: 'AUTH_WITNESS_FAILED',
  INVALID_AUTH_WITNESS: 'INVALID_AUTH_WITNESS',
  AUTH_WITNESS_EXPIRED: 'AUTH_WITNESS_EXPIRED',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  RPC_ERROR: 'RPC_ERROR',
} as const;

/**
 * Check if an error is recoverable
 *
 * Some errors are temporary and can be retried, while others
 * indicate permanent failures that require user intervention.
 *
 * @param error - The error to check
 * @returns True if the error is potentially recoverable
 *
 * @example
 * ```typescript
 * try {
 *   await someAztecOperation();
 * } catch (error) {
 *   if (isRecoverableError(error)) {
 *     // Retry the operation
 *     await retry(someAztecOperation);
 *   } else {
 *     // Show error to user
 *     showError(error);
 *   }
 * }
 * ```
 *
 * @public
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof AztecError) {
    // Network and timeout errors are usually recoverable
    if (
      error.code === AZTEC_ERROR_CODE.NETWORK_ERROR ||
      error.code === AZTEC_ERROR_CODE.TIMEOUT ||
      error.code === AZTEC_ERROR_CODE.RPC_ERROR
    ) {
      return true;
    }

    // Simulation failures might be recoverable with different parameters
    if (error.code === AZTEC_ERROR_CODE.SIMULATION_FAILED) {
      return true;
    }
  }

  // Check for common network error patterns
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Get a user-friendly error message with recovery hints
 *
 * This function analyzes an error and provides helpful guidance
 * on how to resolve it.
 *
 * @param error - The error to analyze
 * @returns A user-friendly message with recovery hints
 *
 * @example
 * ```typescript
 * catch (error) {
 *   const hint = getErrorRecoveryHint(error);
 *   console.log('Error:', hint);
 * }
 * ```
 *
 * @public
 */
export function getErrorRecoveryHint(error: unknown): string {
  if (error instanceof AztecContractError) {
    switch (error.code) {
      case AZTEC_ERROR_CODE.CONTRACT_NOT_FOUND:
        return 'The contract was not found. Please check the contract address and ensure it is deployed.';
      case AZTEC_ERROR_CODE.METHOD_NOT_FOUND:
        return `The method "${error.methodName}" was not found. Please check the method name and contract ABI.`;
      case AZTEC_ERROR_CODE.INVALID_ARGUMENTS:
        return 'Invalid arguments provided. Please check the function parameters match the expected types.';
      case AZTEC_ERROR_CODE.EXECUTION_FAILED:
        return 'Transaction execution failed. Check your account balance and transaction parameters.';
      case AZTEC_ERROR_CODE.SIMULATION_FAILED:
        return 'Transaction simulation failed. The transaction would likely fail if submitted.';
      default:
        return `Contract operation failed: ${error.message}`;
    }
  }

  if (error instanceof AztecAccountError) {
    switch (error.code) {
      case AZTEC_ERROR_CODE.ACCOUNT_NOT_FOUND:
        return 'Account not found. Please ensure the account is registered with the wallet.';
      case AZTEC_ERROR_CODE.UNAUTHORIZED:
        return 'Unauthorized. Please ensure you have the necessary permissions for this operation.';
      case AZTEC_ERROR_CODE.INVALID_SIGNATURE:
        return 'Invalid signature. The message could not be verified with this account.';
      default:
        return `Account operation failed: ${error.message}`;
    }
  }

  if (error instanceof AztecEventError) {
    switch (error.code) {
      case AZTEC_ERROR_CODE.EVENT_NOT_FOUND:
        return `Event "${error.eventName}" not found. Check the event name in the contract ABI.`;
      case AZTEC_ERROR_CODE.INVALID_BLOCK_RANGE:
        return 'Invalid block range specified. Ensure fromBlock is less than toBlock.';
      case AZTEC_ERROR_CODE.SUBSCRIPTION_FAILED:
        return 'Event subscription failed. Check your connection and try again.';
      default:
        return `Event operation failed: ${error.message}`;
    }
  }

  if (error instanceof AztecAuthError) {
    switch (error.code) {
      case AZTEC_ERROR_CODE.AUTH_WITNESS_FAILED:
        return 'Failed to create authorization witness. Check wallet connection and permissions.';
      case AZTEC_ERROR_CODE.INVALID_AUTH_WITNESS:
        return 'Invalid authorization witness. The witness may be malformed or from wrong account.';
      case AZTEC_ERROR_CODE.AUTH_WITNESS_EXPIRED:
        return 'Authorization witness has expired. Please create a new one.';
      default:
        return `Authorization failed: ${error.message}`;
    }
  }

  if (error instanceof AztecError) {
    if (error.code === AZTEC_ERROR_CODE.NETWORK_ERROR) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.code === AZTEC_ERROR_CODE.TIMEOUT) {
      return 'Operation timed out. The network may be congested. Please try again.';
    }
    if (error.code === AZTEC_ERROR_CODE.RPC_ERROR) {
      return 'RPC error. The wallet or node may be unavailable. Please try again later.';
    }
  }

  if (error instanceof Error) {
    return `Operation failed: ${error.message}`;
  }

  return 'An unknown error occurred. Please try again.';
}

/**
 * Extract error details for logging
 *
 * This utility extracts relevant information from errors for
 * debugging and logging purposes.
 *
 * @param error - The error to extract details from
 * @returns An object with error details
 *
 * @public
 */
export function extractErrorDetails(error: unknown): Record<string, unknown> {
  const details: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  };

  if (error instanceof AztecError) {
    details['type'] = error.name;
    details['code'] = error.code;
    details['message'] = error.message;
    details['details'] = error.details;

    if (error instanceof AztecContractError) {
      details['contractAddress'] = error.contractAddress;
      details['methodName'] = error.methodName;
    } else if (error instanceof AztecAccountError) {
      details['accountAddress'] = error.accountAddress;
    } else if (error instanceof AztecEventError) {
      details['eventName'] = error.eventName;
    }
  } else if (error instanceof Error) {
    details['type'] = error.name;
    details['message'] = error.message;
    details['stack'] = error.stack;
  } else {
    details['error'] = error;
  }

  return details;
}
