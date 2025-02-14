/**
 * Base class for all wallet-related errors.
 *
 * Provides a standardized error structure for wallet operations
 * with numerical error codes, optional error causes, and detailed
 * error messages.
 *
 * Error Code Ranges:
 * | Range            | Category          | Examples                                |
 * |-----------------|-------------------|----------------------------------------|
 * | -30000 to -30099 | Connection       | Connection refused, timeout, rejected   |
 * | -30100 to -30199 | Session          | Session expired, invalid data          |
 * | -30200 to -30299 | Transaction      | Signing failed, insufficient funds     |
 *
 * @class WalletError
 * @extends Error
 *
 * @example
 * ```typescript
 * try {
 *   await wallet.connect();
 * } catch (err) {
 *   if (err instanceof WalletConnectionError) {
 *     console.error(`Connection failed: ${err.message}`);
 *     console.error(`Error code: ${err.code}`);
 *     if (err.cause) {
 *       console.error('Caused by:', err.cause);
 *     }
 *   }
 * }
 * ```
 */
import { TimeoutError } from './utils/timeout.js';

export class WalletError extends Error {
  override name = 'WalletError';

  /**
   * Creates a new WalletError instance.
   *
   * @param message - Human-readable error description
   * @param code - Numeric error code from defined ranges
   * @param cause - Optional underlying error that caused this error
   *
   * @remarks
   * Error codes are organized by category to help with:
   * - Error handling and routing
   * - User feedback generation
   * - Debugging and logging
   * - Error analytics
   *
   * @example
   * ```typescript
   * // Creating a generic wallet error
   * throw new WalletError(
   *   'Failed to process request',
   *   -30099,
   *   originalError
   * );
   *
   * // Handling wallet errors
   * try {
   *   await wallet.connect();
   * } catch (error) {
   *   if (error instanceof WalletError) {
   *     console.log(`Error ${error.code}: ${error.message}`);
   *     if (error.cause) {
   *       console.log('Caused by:', error.cause);
   *     }
   *   }
   * }
   * ```
   */
  constructor(
    message: string,
    public readonly code: number,
    public override readonly cause?: unknown,
  ) {
    super(message);
  }

  /**
   * Formats error details as a string.
   *
   * @returns Formatted error message with code and optional cause
   *
   * @remarks
   * The formatted string includes:
   * - Error name and code
   * - Error message
   * - Cause information if available
   *
   * @example
   * ```typescript
   * const error = new WalletError('Connection failed', -30001);
   * console.log(error.toString());
   * // Output: "WalletError(-30001): Connection failed"
   *
   * const errorWithCause = new WalletError(
   *   'Connection failed',
   *   -30001,
   *   new Error('Network offline')
   * );
   * console.log(errorWithCause.toString());
   * // Output: "WalletError(-30001): Connection failed, Cause: Error: Network offline"
   * ```
   */
  override toString(): string {
    const msg = `${this.name}(${this.code}): ${this.message}`;
    if (this.cause) {
      return `${msg}, Cause: ${this.cause}`;
    }
    return msg;
  }
}

/**
 * Error thrown when wallet connection fails.
 *
 * Indicates issues establishing a connection with the wallet, including:
 * - User rejection of connection request
 * - Connection timeout
 * - Wallet unavailability
 * - Network connectivity issues
 * - Invalid configuration
 *
 * @class WalletConnectionError
 * @extends WalletError
 *
 * @example
 * ```typescript
 * try {
 *   await connectWallet(config);
 * } catch (error) {
 *   if (error instanceof WalletConnectionError) {
 *     // Handle connection-specific error
 *     showConnectionErrorUI(error.message);
 *   }
 * }
 * ```
 */
export class WalletConnectionError extends WalletError {
  override name = 'WalletConnectionError';

  constructor(message: string, cause?: unknown) {
    super(message, -30000, cause); // Start wallet error codes at -30000
  }
}

/**
 * Error thrown when wallet disconnection fails.
 *
 * Indicates issues during wallet disconnection, including:
 * - Connection cleanup failures
 * - Resource release problems
 * - State synchronization issues
 * - Session termination failures
 *
 * @class WalletDisconnectionError
 * @extends WalletError
 *
 * @example
 * ```typescript
 * try {
 *   await disconnectWallet();
 * } catch (error) {
 *   if (error instanceof WalletDisconnectionError) {
 *     // Handle disconnection error
 *     console.error('Disconnection failed:', error.message);
 *   }
 * }
 * ```
 */
export class WalletDisconnectionError extends WalletError {
  override name = 'WalletDisconnectionError';

  constructor(message: string, cause?: unknown) {
    super(message, -30001, cause);
  }
}

/**
 * Error thrown when a wallet operation times out.
 *
 * Indicates that an operation exceeded its configured timeout duration.
 * Provides additional context about the specific operation and duration.
 *
 * Common timeout scenarios:
 * - Initial connection establishment
 * - Transaction signing requests
 * - Network operations
 * - Session restoration
 *
 * @class WalletTimeoutError
 * @extends WalletError
 *
 * @example
 * ```typescript
 * try {
 *   await wallet.connect();
 * } catch (error) {
 *   if (error instanceof WalletTimeoutError) {
 *     console.error(`Operation timed out after ${error.timeout}ms`);
 *     // Handle timeout-specific error
 *   }
 * }
 * ```
 */
export class WalletTimeoutError extends WalletError {
  override name = 'WalletTimeoutError';

  constructor(
    operation: string,
    public readonly timeout: number,
    cause?: unknown,
  ) {
    super(`${operation} timed out after ${timeout}ms`, -30003, cause);
  }
}

/**
 * Error thrown when wallet session operations fail.
 *
 * Indicates issues with wallet session management, including:
 * - Session expiration
 * - Invalid session data
 * - Session restoration failures
 * - Session state conflicts
 * - Storage/persistence issues
 *
 * @class WalletSessionError
 * @extends WalletError
 *
 * @example
 * ```typescript
 * try {
 *   await wallet.resumeSession(sessionId);
 * } catch (error) {
 *   if (error instanceof WalletSessionError) {
 *     // Handle session error
 *     if (error.code === -30002) {
 *       // Session expired, prompt for new connection
 *       showReconnectPrompt();
 *     }
 *   }
 * }
 * ```
 */
export class WalletSessionError extends WalletError {
  override name = 'WalletSessionError';

  constructor(message: string, cause?: unknown) {
    super(message, -30002, cause);
  }
}

/**
 * Type guard to check if an error is a WalletTimeoutError.
 *
 * Provides type safety when handling timeout-specific errors
 * and accessing timeout-specific properties.
 *
 * @param error - The error object to check
 * @returns True if the error is a WalletTimeoutError instance
 *
 * @example
 * ```typescript
 * try {
 *   await wallet.connect();
 * } catch (error) {
 *   if (isWalletTimeoutError(error)) {
 *     // Handle timeout-specific error
 *     console.error(`Operation timed out after ${error.timeout}ms`);
 *   }
 * }
 * ```
 */
export const isWalletTimeoutError = (error: unknown): error is WalletTimeoutError => {
  return error instanceof WalletTimeoutError;
};

/**
 * Utility function to standardize wallet error handling.
 *
 * Maps various error types to specific WalletError instances,
 * providing consistent error handling across the application.
 * Includes logging and optional error transformation.
 *
 * Error Mapping:
 * - TimeoutError -> WalletTimeoutError
 * - Connection actions -> WalletConnectionError
 * - Session actions -> WalletSessionError
 * - Disconnection actions -> WalletDisconnectionError
 * - Other actions -> Generic WalletError
 *
 * @param err - Original error or error-like object
 * @param action - Action being performed (e.g., 'connect wallet')
 * @returns Appropriate WalletError subclass instance
 *
 * @example
 * ```typescript
 * try {
 *   await someWalletOperation();
 * } catch (err) {
 *   const error = handleWalletError(err, 'perform operation');
 *   console.error(error.toString());
 *   // WalletError(-30099): Failed to perform operation
 * }
 * ```
 */
export const handleWalletError = (err: unknown, action: string): WalletError => {
  console.error(`${action} error:`, err);

  // Handle timeout errors
  if (err instanceof TimeoutError) {
    const timeoutError = err as TimeoutError;
    return new WalletTimeoutError(action, 30000, timeoutError);
  }

  const message = err instanceof Error ? err.message : `Failed to ${action.toLowerCase()}`;

  // Map to specific error types based on action
  switch (action) {
    case 'connect wallet':
      return new WalletConnectionError(message, err);
    case 'resume session':
      return new WalletSessionError(message, err);
    case 'disconnect wallet':
      return new WalletDisconnectionError(message, err);
    default:
      return new WalletError(message, -30099, err); // Generic wallet error
  }
};
