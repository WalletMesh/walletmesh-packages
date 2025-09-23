/**
 * Error utility functions for fatal/recoverable error handling
 * @internal
 */

import type { ModalError } from './types.js';

/**
 * Type guard to check if an error is a ModalError
 *
 * @param {unknown} error - Error to check
 * @returns true if error is a ModalError
 *
 * @example
 * ```typescript
 * const error = { code: 'USER_REJECTED', category: 'user', message: 'User cancelled' };
 * console.log(isModalError(error)); // true
 *
 * const plainError = new Error('Something went wrong');
 * console.log(isModalError(plainError)); // false
 * ```
 */
export function isModalError(error: unknown): error is ModalError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'category' in error
  );
}

/**
 * Check if an error is fatal (should not be retried)
 *
 * @param {ModalError | Error | unknown} error - Error to check
 * @returns true if error is fatal and should not be retried
 *
 * @example
 * ```typescript
 * const error = { code: 'USER_REJECTED', category: 'user', isRecoverable: false };
 * console.log(isFatalError(error)); // true
 *
 * const networkError = { code: 'CONNECTION_FAILED', category: 'network' };
 * console.log(isFatalError(networkError)); // false (recoverable by default)
 * ```
 */
export function isFatalError(error: ModalError | Error | unknown): boolean {
  if (!isModalError(error)) {
    // Non-modal errors are considered not fatal by default
    return false;
  }

  // Fatal if no recovery strategy or explicitly 'none'
  return !error.recoveryStrategy || error.recoveryStrategy === 'none';
}

/**
 * Check if an error is recoverable (can be retried)
 *
 * @param {ModalError | Error | unknown} error - Error to check
 * @returns true if error can be retried
 *
 * @example
 * ```typescript
 * const error = { code: 'CONNECTION_FAILED', category: 'network', recoveryStrategy: 'wait_and_retry' };
 * console.log(isRecoverableError(error)); // true
 *
 * const userError = { code: 'USER_REJECTED', category: 'user', recoveryStrategy: 'none' };
 * console.log(isRecoverableError(userError)); // false
 * ```
 */
export function isRecoverableError(error: ModalError | Error | unknown): boolean {
  if (!isModalError(error)) {
    // Non-modal errors are considered recoverable by default
    return true;
  }

  // Recoverable if has a recovery strategy other than 'none'
  return error.recoveryStrategy !== undefined && error.recoveryStrategy !== 'none';
}

/**
 * Mark an error as fatal (not retryable)
 *
 * @param {ModalError} error - ModalError to mark as fatal
 * @returns New ModalError with recoveryStrategy set to 'none'
 *
 * @example
 * ```typescript
 * const error = { code: 'CUSTOM_ERROR', category: 'general', message: 'Something went wrong' };
 * const fatalError = markAsFatal(error);
 * console.log(fatalError.recoveryStrategy); // 'none'
 * ```
 */
export function markAsFatal(error: ModalError): ModalError {
  return { ...error, recoveryStrategy: 'none' };
}
