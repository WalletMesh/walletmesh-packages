/**
 * Public error types and factory functions for the modal core package
 *
 * This module exports error-related types and utilities for handling
 * errors in the WalletMesh modal system. It provides a structured way to create,
 * identify, and handle various types of errors that may occur during operation.
 *
 * @module errors
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { ErrorHandler } from '../../internal/core/errors/errorHandler.js';
import {
  ModalErrorImpl,
  isModalError as internalIsModalError,
  ensureError as internalEnsureError,
  ensureModalError as internalEnsureModalError,
} from '../../internal/core/errors/index.js';
import type { ErrorContext, ModalError, ModalErrorCategory } from '../../internal/core/errors/types.js';
import { ERROR_CODES } from '../../internal/core/errors/types.js';

/**
 * Re-export error types
 * @public
 */
export type { ModalError, ModalErrorCategory, ErrorContext, ErrorHandler };

/**
 * Re-export error codes
 * @public
 */
export { ERROR_CODES };

/**
 * Error data for custom error information
 * @public
 * @interface ErrorData
 */
export interface ErrorData {
  /**
   * Error message
   * @type {string}
   */
  message: string;

  /**
   * Additional error details
   * @type {Record<string, unknown>}
   */
  details?: Record<string, unknown>;

  /**
   * Original error that caused this error
   * @type {Error}
   */
  cause?: Error;
}

/**
 * Check if an error is a ModalError
 *
 * @function isModalError
 * @param {unknown} error - Error to check
 * @returns {boolean} True if the error is a ModalError
 *
 * @example
 * // Check if an error is a ModalError
 * try {
 *   await wallet.connect();
 * } catch (error) {
 *   if (isModalError(error)) {
 *     console.log('Modal error code:', error.code);
 *     console.log('Error category:', error.category);
 *   } else {
 *     console.error('Unknown error:', error);
 *   }
 * }
 *
 * @example
 * // Handle specific error types
 * catch (error) {
 *   if (isModalError(error)) {
 *     switch (error.category) {
 *       case 'user':
 *         // Handle user errors (cancelled, rejected)
 *         break;
 *       case 'wallet':
 *         // Handle wallet errors
 *         break;
 *       case 'network':
 *         // Handle network errors
 *         break;
 *       case 'general':
 *         // Handle general errors
 *         break;
 *     }
 *   }
 * }
 *
 * @public
 */
export function isModalError(error: unknown): error is ModalError {
  return internalIsModalError(error);
}

/**
 * Convert unknown values to proper Error instances with stack traces
 *
 * This utility implements best practices for error handling by ensuring that any
 * value thrown or caught can be converted to a proper Error instance with a stack trace.
 *
 * @function ensureError
 * @param {unknown} value - Unknown value that might be an error
 * @returns {Error} Error instance with preserved information and stack trace
 *
 * @example
 * ```typescript
 * try {
 *   riskyOperation();
 * } catch (error) {  // error is 'unknown'
 *   const properError = ensureError(error);
 *   logger.error(properError.message, properError.stack);
 * }
 * ```
 *
 * @public
 */
export function ensureError(value: unknown): Error {
  return internalEnsureError(value);
}

/**
 * Convert unknown values to ModalError with stack traces preserved
 *
 * This utility ensures that errors have proper ModalError structure with all
 * the rich metadata used by modal-core for error handling, recovery, and UI display.
 *
 * @function ensureModalError
 * @param {unknown} value - Unknown value that might be an error
 * @param {ErrorContext} [context] - Optional context for the error
 * @returns {ModalError} ModalError instance with preserved stack trace
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
 * @public
 */
export function ensureModalError(value: unknown, context?: ErrorContext): ModalError {
  return internalEnsureModalError(value, context);
}

/**
 * Re-export ErrorFactory for direct use
 * @public
 */
export { ErrorFactory };

/**
 * Re-export ModalErrorImpl class for TypeDoc documentation
 * @internal
 */
export { ModalErrorImpl };
