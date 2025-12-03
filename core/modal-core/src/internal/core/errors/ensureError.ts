/**
 * Utility functions to convert unknown values to proper Error instances
 *
 * These utilities implement Commandment #5 from "The 5 Commandments of Clean Error Handling in TypeScript":
 * Use an ensureError utility to create Error instances with stack traces as early as possible.
 *
 * @module ensureError
 * @internal
 */

import { ErrorFactory } from './errorFactory.js';
import type { ErrorContext, ModalError } from './types.js';
import { ERROR_CODES } from './types.js';
import { ModalErrorImpl } from './types.js';

/**
 * Convert unknown values to proper Error instances with stack traces
 *
 * This function ensures that any value thrown or caught can be converted to a proper
 * Error instance with a stack trace. This is critical for debugging as it captures
 * the stack trace at the point of conversion.
 *
 * @param value - Unknown value that might be an error
 * @returns Error instance with preserved information and stack trace
 *
 * @example
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (error) {  // error is 'unknown'
 *   const properError = ensureError(error);
 *   console.error(properError.message);
 *   console.error(properError.stack);
 * }
 * ```
 *
 * @public
 */
export function ensureError(value: unknown): Error {
  // Already an Error - return as-is with its original stack trace
  if (value instanceof Error) {
    return value;
  }

  // String message - create Error with it
  if (typeof value === 'string') {
    return new Error(value);
  }

  // Object with message property - extract message and preserve original as cause
  if (value && typeof value === 'object' && 'message' in value) {
    const message = typeof value.message === 'string' ? value.message : String(value);
    const error = new Error(message);
    // Preserve original as cause for full error chain
    error.cause = value;
    return error;
  }

  // Fallback - stringify the value and preserve original as cause
  const message = String(value);
  const error = new Error(message);
  error.cause = value;
  return error;
}

/**
 * Convert unknown values to ModalError with stack traces preserved
 *
 * This function is similar to ensureError but returns a ModalError instance with
 * all the rich metadata that modal-core uses for error handling, recovery, and UI display.
 *
 * @param value - Unknown value that might be an error
 * @param context - Optional context for the error
 * @returns ModalError instance with preserved stack trace
 *
 * @example
 * ```typescript
 * try {
 *   await wallet.connect();
 * } catch (error) {  // error is 'unknown'
 *   const modalError = ensureModalError(error, {
 *     component: 'WalletConnector',
 *     operation: 'connect',
 *     walletId: 'metamask'
 *   });
 *   throw modalError;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // In a catch block with automatic recovery
 * catch (error) {
 *   const modalError = ensureModalError(error);
 *   if (modalError.recoveryStrategy === 'retry') {
 *     await retry(operation);
 *   }
 * }
 * ```
 *
 * @public
 */
export function ensureModalError(value: unknown, context?: ErrorContext): ModalError {
  // Already a ModalError - return as-is (possibly with added context)
  if (ErrorFactory.isModalError(value)) {
    if (context) {
      // Add context to existing ModalError
      return new ModalErrorImpl({
        ...value,
        data: { ...value.data, ...context },
      });
    }
    return value;
  }

  // Ensure we have an Error instance first (this captures stack trace if needed)
  const error = ensureError(value);

  // Create ModalError with the Error as cause to preserve stack trace
  return new ModalErrorImpl({
    code: ERROR_CODES.UNKNOWN_ERROR,
    message: error.message,
    category: 'general',
    cause: error, // ✅ Preserve the Error chain and stack trace
    ...(context && { data: context }),
  });
}
