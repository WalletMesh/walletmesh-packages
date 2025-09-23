/**
 * Error formatting utilities for displaying errors in UI frameworks
 *
 * Framework-agnostic error formatting that provides user-friendly messages
 * and recovery hints for common wallet connection errors.
 *
 * @module utils/errorFormatter
 * @packageDocumentation
 */

import type { ModalError } from '../internal/core/errors/types.js';

/**
 * Enum for different error types we might encounter
 */
export enum ErrorType {
  /** Error created by ErrorFactory with ModalError structure */
  ModalError = 'modal_error',
  /** Standard JavaScript Error instance */
  JavaScriptError = 'js_error',
  /** Plain string error */
  StringError = 'string_error',
  /** Unknown object that might contain error information */
  UnknownObject = 'unknown_object',
  /** Completely unknown type */
  Unknown = 'unknown',
}

/**
 * Formatted error information for UI display
 */
export interface FormattedError {
  /** Main error message to display */
  message: string;
  /** Error code if available */
  code?: string;
  /** Recovery hint for user actions */
  recoveryHint?: 'install_wallet' | 'unlock_wallet' | 'switch_chain' | 'retry' | 'user_action';
  /** Additional details that might be helpful */
  details?: string;
  /** Original error type for debugging */
  errorType: ErrorType;
}

/**
 * Check if an object is a ModalError created by ErrorFactory
 */
function isModalError(error: unknown): error is ModalError {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const obj = error as Record<string, unknown>;

  // ModalError must have: code (string), message (string), category (string), and optionally recoveryStrategy
  return (
    typeof obj['code'] === 'string' &&
    typeof obj['message'] === 'string' &&
    typeof obj['category'] === 'string' &&
    (obj['recoveryStrategy'] === undefined ||
      ['retry', 'wait_and_retry', 'manual_action', 'none'].includes(obj['recoveryStrategy'] as string))
  );
}

/**
 * Detect the type of error we're dealing with
 */
function detectErrorType(error: unknown): ErrorType {
  if (!error) {
    return ErrorType.Unknown;
  }

  if (isModalError(error)) {
    return ErrorType.ModalError;
  }

  if (error instanceof Error) {
    return ErrorType.JavaScriptError;
  }

  if (typeof error === 'string') {
    return ErrorType.StringError;
  }

  if (typeof error === 'object') {
    return ErrorType.UnknownObject;
  }

  return ErrorType.Unknown;
}

/**
 * Extract recovery hint from error data
 */
function extractRecoveryHint(error: unknown): FormattedError['recoveryHint'] | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const obj = error as Record<string, unknown>;

  // Check in data.recoveryHint (ModalError pattern)
  if (obj['data'] && typeof obj['data'] === 'object') {
    const data = obj['data'] as Record<string, unknown>;
    if (typeof data['recoveryHint'] === 'string') {
      const hint = data['recoveryHint'];
      if (['install_wallet', 'unlock_wallet', 'switch_chain', 'retry', 'user_action'].includes(hint)) {
        return hint as FormattedError['recoveryHint'];
      }
    }
  }

  // Check directly on object
  if (typeof obj['recoveryHint'] === 'string') {
    const hint = obj['recoveryHint'];
    if (['install_wallet', 'unlock_wallet', 'switch_chain', 'retry', 'user_action'].includes(hint)) {
      return hint as FormattedError['recoveryHint'];
    }
  }

  return undefined;
}

/**
 * Extract error code from various error structures
 */
function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  const obj = error as Record<string, unknown>;

  // Direct code property
  if (typeof obj['code'] === 'string') {
    return obj['code'];
  }

  // Nested error.code
  if (obj['error'] && typeof obj['error'] === 'object') {
    const nestedError = obj['error'] as Record<string, unknown>;
    if (typeof nestedError['code'] === 'string') {
      return nestedError['code'];
    }
  }

  return undefined;
}

/**
 * Format an error for display in the UI
 *
 * Takes any error type and converts it to a structured format suitable
 * for display in UI components. Extracts error codes, messages, and
 * recovery hints when available.
 *
 * @param error - The error to format (can be any type)
 * @returns Formatted error information with message, code, recovery hint, etc.
 *
 * @example
 * ```typescript
 * try {
 *   await wallet.connect();
 * } catch (error) {
 *   const formatted = formatError(error);
 *   console.log(formatted.message); // User-friendly error message
 *   if (formatted.recoveryHint) {
 *     console.log(getRecoveryMessage(formatted.recoveryHint));
 *   }
 * }
 * ```
 *
 * @since 3.0.0
 * @category Utilities
 * @public
 */
export function formatError(error: unknown): FormattedError {
  const errorType = detectErrorType(error);

  switch (errorType) {
    case ErrorType.ModalError: {
      const modalError = error as ModalError;
      const hint = extractRecoveryHint(modalError);
      const result: FormattedError = {
        message: modalError.message,
        code: modalError.code,
        errorType,
      };

      if (hint) {
        result.recoveryHint = hint;
      }

      if (modalError.data && typeof modalError.data === 'object') {
        result.details = JSON.stringify(modalError.data, null, 2);
      }

      return result;
    }

    case ErrorType.JavaScriptError: {
      const jsError = error as Error;
      const code = extractErrorCode(jsError);
      const hint = extractRecoveryHint(jsError);
      const result: FormattedError = {
        message: jsError.message,
        errorType,
      };

      if (code) {
        result.code = code;
      }

      if (hint) {
        result.recoveryHint = hint;
      }

      return result;
    }

    case ErrorType.StringError: {
      return {
        message: error as string,
        errorType,
      };
    }

    case ErrorType.UnknownObject: {
      const obj = error as Record<string, unknown>;
      let message = 'Connection error occurred';

      // Try various message extraction patterns
      if (typeof obj['message'] === 'string') {
        message = obj['message'];
      } else if (obj['error'] && typeof obj['error'] === 'object') {
        const nestedError = obj['error'] as Record<string, unknown>;
        if (typeof nestedError['message'] === 'string') {
          message = nestedError['message'];
        }
      } else if (typeof obj['details'] === 'string') {
        message = obj['details'];
      } else if (typeof obj['reason'] === 'string') {
        message = obj['reason'];
      }

      // If we still have a generic message, try to make it more specific
      if (message === 'Connection error occurred') {
        const code = extractErrorCode(error);
        if (code) {
          message = `Error: ${code}`;
        } else {
          // As a last resort, stringify the object but avoid [object Object]
          try {
            const stringified = JSON.stringify(obj, null, 2);
            if (stringified && stringified !== '{}') {
              message = `Error details: ${stringified.substring(0, 200)}${stringified.length > 200 ? '...' : ''}`;
            }
          } catch {
            // If JSON.stringify fails, keep the generic message
          }
        }
      }

      const code = extractErrorCode(error);
      const hint = extractRecoveryHint(error);
      const result: FormattedError = {
        message,
        errorType,
      };

      if (code) {
        result.code = code;
      }

      if (hint) {
        result.recoveryHint = hint;
      }

      return result;
    }

    default: {
      // Handle null/undefined specifically
      if (error === null || error === undefined) {
        return {
          message: 'An unknown error occurred',
          errorType,
        };
      }

      // Try to convert to string as last resort
      const stringValue = String(error);
      const message = stringValue !== '[object Object]' ? stringValue : 'An unknown error occurred';

      return {
        message,
        errorType,
      };
    }
  }
}

/**
 * Get user-friendly recovery message based on recovery hint
 *
 * Provides actionable instructions for users to resolve common wallet errors.
 *
 * @param hint - The recovery hint from the formatted error
 * @returns User-friendly recovery message or undefined if no hint
 *
 * @example
 * ```typescript
 * const formatted = formatError(error);
 * const recoveryMessage = getRecoveryMessage(formatted.recoveryHint);
 * if (recoveryMessage) {
 *   showToast(recoveryMessage);
 * }
 * ```
 *
 * @since 3.0.0
 * @category Utilities
 * @public
 */
export function getRecoveryMessage(hint: FormattedError['recoveryHint']): string | undefined {
  const recoveryMessages: Record<NonNullable<FormattedError['recoveryHint']>, string> = {
    user_action: 'Please check your browser settings and allow popups for this site.',
    retry: 'Please check your internet connection and try again.',
    install_wallet: 'Please install the wallet extension and try again.',
    unlock_wallet: 'Please unlock your wallet and try again.',
    switch_chain: 'Please switch to a supported chain in your wallet.',
  };

  return hint ? recoveryMessages[hint] : undefined;
}

/**
 * Get user-friendly error title based on error type
 *
 * Provides a concise, user-friendly title for common error codes.
 *
 * @param error - The formatted error
 * @returns User-friendly error title
 *
 * @example
 * ```typescript
 * const formatted = formatError(error);
 * const title = getErrorTitle(formatted);
 * showErrorDialog(title, formatted.message);
 * ```
 *
 * @since 3.0.0
 * @category Utilities
 * @public
 */
export function getErrorTitle(error: FormattedError): string {
  if (error.code) {
    switch (error.code) {
      case 'USER_REJECTED':
      case 'WALLET_REQUEST_CANCELLED':
        return 'Request Cancelled';
      case 'WALLET_LOCKED':
        return 'Wallet Locked';
      case 'NOT_INSTALLED':
      case 'WALLET_NOT_FOUND':
        return 'Wallet Not Found';
      case 'CHAIN_MISMATCH':
      case 'UNSUPPORTED_CHAIN':
        return 'Wrong Network';
      case 'CONNECTION_TIMEOUT':
        return 'Connection Timeout';
      case 'CONNECTION_FAILED':
        return 'Connection Failed';
      default:
        return 'Something Went Wrong';
    }
  }

  return 'Something Went Wrong';
}

/**
 * Check if error is due to user action and not a system failure
 *
 * Helps distinguish between user-initiated cancellations and actual errors.
 * Useful for deciding whether to show error UI or silently handle the rejection.
 *
 * @param error - The formatted error
 * @returns True if user initiated the error (e.g., rejection)
 *
 * @example
 * ```typescript
 * const formatted = formatError(error);
 * if (!isUserInitiatedError(formatted)) {
 *   // Only show error UI for non-user-initiated errors
 *   showErrorNotification(formatted);
 * }
 * ```
 *
 * @since 3.0.0
 * @category Utilities
 * @public
 */
export function isUserInitiatedError(error: FormattedError): boolean {
  return (
    error.code === 'USER_REJECTED' ||
    error.code === 'WALLET_REQUEST_CANCELLED' ||
    error.recoveryHint === 'user_action'
  );
}
