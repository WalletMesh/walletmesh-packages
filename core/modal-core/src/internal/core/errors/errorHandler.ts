/**
 * ErrorHandler for modal-core
 * Single service for all error handling needs
 * @module errorHandler
 * @internal
 */

import type { Disposable } from '../../../types.js';
import type { Logger } from '../logger/logger.js';
import { ErrorFactory } from './errorFactory.js';
import type { ErrorContext, ModalError } from './types.js';
import { ModalErrorImpl } from './types.js';
import { isFatalError, isModalError } from './utils.js';

/**
 * Centralized error handler service
 * @class ErrorHandler
 */
export class ErrorHandler implements Disposable {
  /**
   * Create a new ErrorHandler instance
   * @param {Logger} logger - Logger instance for error logging
   */
  constructor(private logger: Logger) {}

  /**
   * Convert any error to standardized ModalError
   * @param {unknown} error - Error to handle
   * @param {ErrorContext} [context] - Optional error context
   * @returns {ModalError} Standardized modal error
   * @public
   */
  handleError(error: unknown, context?: ErrorContext): ModalError {
    if (isModalError(error)) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);

    // Pattern-based categorization using ErrorFactory
    let modalError: ModalError;

    if (this.isUserRejection(message)) {
      modalError = ErrorFactory.userRejected(context?.operation);
    } else if (this.isWalletNotFound(message)) {
      modalError = ErrorFactory.walletNotFound(context?.walletId);
    } else if (this.isNetworkError(message)) {
      // Create network error directly to ensure all properties are preserved
      modalError = new ModalErrorImpl({
        code: 'network_error',
        message: 'Connection failed. Please try again.',
        category: 'network',
        recoveryStrategy: 'wait_and_retry',
        retryDelay: 3000,
        maxRetries: 3,
        classification: 'network',
      });
    } else {
      // Default case
      modalError = ErrorFactory.unknownError('An unexpected error occurred');
    }

    // ✅ Preserve original error as cause and add context (Commandment #4)
    const shouldPreserveCause = error instanceof Error || (error !== null && typeof error === 'object');

    if (context || shouldPreserveCause) {
      const existingData = modalError.data || {};
      const mergedData = context ? { ...existingData, ...context } : existingData;

      // Use toJSON to get a plain object with all properties including message
      const errorData = modalError instanceof ModalErrorImpl ? modalError.toJSON() : modalError;

      return new ModalErrorImpl({
        ...errorData,
        data: mergedData,
        ...(shouldPreserveCause && { cause: error }), // Preserve the entire error chain
      });
    }

    // Return the ModalErrorImpl instance directly to preserve all properties
    return modalError;
  }

  /**
   * Check if error is fatal (not recoverable)
   * @param {unknown} error - Error to check
   * @returns {boolean} True if error is fatal
   * @public
   */
  isFatal(error: unknown): boolean {
    return isFatalError(this.handleError(error));
  }

  /**
   * Get user-friendly error message
   * @param {unknown} error - Error to get message from
   * @returns {string} User-friendly error message
   * @public
   */
  getUserMessage(error: unknown): string {
    return this.handleError(error).message;
  }

  /**
   * Log error with appropriate level
   * @param {unknown} error - Error to log
   * @param {string} [operation] - Operation context for the error
   * @public
   */
  logError(error: unknown, operation?: string): void {
    const modalError = isModalError(error) ? error : this.handleError(error);

    const logData = {
      code: modalError.code,
      category: modalError.category,
      operation: operation || 'unknown',
      ...(modalError.data && { data: modalError.data }),
    };

    switch (modalError.category) {
      case 'user':
        // User actions are informational, not errors
        this.logger.debug('User action:', logData);
        break;
      case 'network':
        if (modalError.recoveryStrategy && modalError.recoveryStrategy !== 'none') {
          this.logger.info('Recoverable network error:', logData);
        } else {
          this.logger.warn('Non-recoverable network error:', logData);
        }
        break;
      case 'wallet':
        this.logger.warn('Wallet error:', logData);
        break;
      default:
        this.logger.error('Unexpected error:', logData);
    }
  }

  /**
   * Clean up error handler resources
   * @public
   */
  dispose(): void {
    // Clear any error queues, close connections, etc.
    if (this.logger) {
      this.logger.debug('ErrorHandler disposing');
    }

    // Could clear error reporting connections, flush error queues, etc.
  }

  /**
   * Check if error message indicates user rejection
   * @private
   * @param {string} message - Error message to check
   * @returns {boolean} True if user rejection
   */
  private isUserRejection(message: string): boolean {
    const patterns = [
      'user rejected',
      'user denied',
      'cancelled',
      'user cancelled',
      'rejected by user',
      'denied by user',
      'user declined',
    ];

    const lowerMessage = message.toLowerCase();
    return patterns.some((pattern) => lowerMessage.includes(pattern));
  }

  /**
   * Check if error message indicates wallet not found
   * @private
   * @param {string} message - Error message to check
   * @returns {boolean} True if wallet not found
   */
  private isWalletNotFound(message: string): boolean {
    const patterns = [
      'not found',
      'not installed',
      'not detected',
      'not available',
      'wallet not found',
      'metamask not found',
      'not connected',
    ];

    const lowerMessage = message.toLowerCase();
    return patterns.some((pattern) => lowerMessage.includes(pattern));
  }

  /**
   * Check if error message indicates network error
   * @private
   * @param {string} message - Error message to check
   * @returns {boolean} True if network error
   */
  private isNetworkError(message: string): boolean {
    const patterns = [
      'network',
      'timeout',
      'connection failed',
      'fetch failed',
      'request failed',
      'unable to connect',
      'connectivity',
    ];

    const lowerMessage = message.toLowerCase();
    return patterns.some((pattern) => lowerMessage.includes(pattern));
  }
}
