/**
 * Base class for all wallet-related errors
 * @class WalletError
 * @extends Error
 * @description Provides a standardized error structure for wallet operations
 * with error codes and optional error causes.
 *
 * Error codes are in ranges:
 * - -30000 to -30099: Connection errors
 * - -30100 to -30199: Session errors
 * - -30200 to -30299: Transaction errors
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
export class WalletError extends Error {
  override name = 'WalletError';

  /**
   * Create a new WalletError
   * @param {string} message - Human-readable error description
   * @param {number} code - Numeric error code
   * @param {unknown} [cause] - Optional underlying error that caused this error
   */
  constructor(
    message: string,
    public readonly code: number,
    public override readonly cause?: unknown,
  ) {
    super(message);
  }

  /**
   * Get error details as a string
   * @returns {string} Formatted error message with code and optional cause
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
 * Error thrown when wallet connection fails
 * @class WalletConnectionError
 * @extends WalletError
 * @description Indicates issues establishing a connection with the wallet,
 * such as user rejection, timeout, or wallet unavailability.
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
 * Error thrown when wallet disconnection fails
 * @class WalletDisconnectionError
 * @extends WalletError
 * @description Indicates issues during wallet disconnection,
 * such as cleanup failures or connection termination problems.
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
 * Error thrown when wallet session operations fail
 * @class WalletSessionError
 * @extends WalletError
 * @description Indicates issues with wallet session management,
 * such as session expiration, invalid session data, or session restoration failures.
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
 * Utility function to handle wallet-related errors with consistent error types and messages
 * @function handleWalletError
 * @param {unknown} err - The original error or error-like object
 * @param {string} action - The action that was being performed (e.g., 'connect wallet')
 * @returns {WalletError} A specific WalletError subclass instance
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
