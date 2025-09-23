/**
 * Framework-agnostic error management utilities
 *
 * This module provides utilities for error categorization, user-friendly
 * error messages, and recovery strategies. Used across all framework
 * packages for consistent error handling.
 *
 * @module errorManager
 * @public
 */

import type { ModalError } from '../../types.js';

/**
 * Error categories for classification
 * @public
 */
export type ErrorCategory = 'user' | 'wallet' | 'network' | 'general' | 'validation' | 'sandbox';

/**
 * Recovery action suggestions
 * @public
 */
export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'switch' | 'install' | 'unlock' | 'approve' | 'manual';
  label: string;
  description: string;
  action?: () => void | Promise<void>;
}

/**
 * Common wallet error codes and their meanings
 * @public
 */
export const WALLET_ERROR_CODES = {
  USER_REJECTED: 4001,
  UNAUTHORIZED: 4100,
  UNSUPPORTED_METHOD: 4200,
  DISCONNECTED: 4900,
  CHAIN_DISCONNECTED: 4901,
  CHAIN_NOT_ADDED: 4902,
  RESOURCE_NOT_FOUND: -32001,
  RESOURCE_UNAVAILABLE: -32002,
  TRANSACTION_REJECTED: -32003,
  METHOD_NOT_SUPPORTED: -32004,
  REQUEST_LIMIT_EXCEEDED: -32005,
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
} as const;

/**
 * Check if an error is a WalletMesh ModalError
 * @param error - Error to check
 * @returns True if error is a ModalError
 */
export function isWalletMeshError(error: unknown): error is ModalError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'category' in error &&
    'message' in error
  );
}
/**
 * Categorize an error based on its characteristics
 * @param error - Error to categorize
 * @returns Error category
 */
export function categorizeError(error: unknown): ErrorCategory {
  if (isWalletMeshError(error)) {
    // Map ModalError categories to our ErrorCategory
    switch (error.category) {
      case 'wallet':
        return 'wallet';
      case 'network':
        return 'network';
      case 'user':
        return 'user';
      case 'validation':
        return 'validation';
      case 'sandbox':
        return 'sandbox';
      default:
        return 'general';
    }
  }

  const errorWithMessage = error as { message?: unknown };
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof errorWithMessage.message === 'string'
  ) {
    const message = errorWithMessage.message.toLowerCase();

    // Check for specific error patterns
    if (isUserRejectionError(error)) {
      return 'user';
    }

    // Check wallet not found before general wallet errors
    if (isWalletNotFoundError(error)) {
      return 'wallet';
    }

    if (isNetworkError(error)) {
      return 'network';
    }

    if (isWalletError(error)) {
      return 'wallet';
    }

    // Check chain errors before provider errors
    if (isChainError(error)) {
      return 'general';
    }

    // Check for connection patterns that might be in provider errors
    if (message.includes('connection') || message.includes('connect')) {
      return 'network';
    }

    if (isProviderError(error)) {
      return 'general';
    }

    if (message.includes('transaction') || message.includes('gas')) {
      return 'general';
    }
  }

  return 'general';
}

/**
 * Get user-friendly error message
 * @param error - Error to process
 * @returns User-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isWalletMeshError(error)) {
    // Use predefined user-friendly messages for ModalErrors
    return getModalErrorMessage(error);
  }

  const errorWithMessage = error as { message?: unknown };
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof errorWithMessage.message === 'string'
  ) {
    // Handle common wallet error patterns
    if (isUserRejectionError(error)) {
      return 'You cancelled the wallet request. Please try again if you want to continue.';
    }

    if (isWalletNotFoundError(error)) {
      return 'Wallet not found. Please make sure your wallet is installed and unlocked.';
    }

    if (isNetworkError(error)) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }

    if (isChainError(error)) {
      return 'Blockchain network error. Please try switching networks or try again later.';
    }

    if (isTransactionError(error)) {
      return 'Transaction failed. Please check your balance and gas settings.';
    }

    if (isProviderError(error)) {
      return 'Wallet provider error. Please try refreshing the page or using a different wallet.';
    }

    // Return the original message if it's already user-friendly
    if (isUserFriendlyMessage(errorWithMessage.message)) {
      return errorWithMessage.message;
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get recovery actions for an error
 * @param error - Error to get recovery actions for
 * @returns Array of recovery actions
 */
export function getRecoveryActions(error: unknown): RecoveryAction[] {
  const category = categorizeError(error);

  switch (category) {
    case 'user':
      return [
        {
          type: 'retry',
          label: 'Try Again',
          description: 'Attempt the wallet request again',
        },
      ];

    case 'general':
      return [
        {
          type: 'retry',
          label: 'Try Again',
          description: 'Attempt the wallet request again',
        },
        {
          type: 'refresh',
          label: 'Refresh Page',
          description: 'Refresh the page to reset',
        },
      ];

    case 'network':
      return [
        {
          type: 'retry',
          label: 'Retry',
          description: 'Check your connection and try again',
        },
        {
          type: 'refresh',
          label: 'Refresh Page',
          description: 'Refresh the page to reset the connection',
        },
      ];

    case 'wallet':
      if (isWalletNotFoundError(error)) {
        return [
          {
            type: 'install',
            label: 'Install Wallet',
            description: 'Install the required wallet extension',
          },
          {
            type: 'refresh',
            label: 'Refresh Page',
            description: 'Refresh after installing the wallet',
          },
        ];
      }

      return [
        {
          type: 'unlock',
          label: 'Unlock Wallet',
          description: 'Make sure your wallet is unlocked',
        },
        {
          type: 'retry',
          label: 'Try Again',
          description: 'Retry the wallet connection',
        },
      ];

    default:
      return [
        {
          type: 'retry',
          label: 'Try Again',
          description: 'Attempt the operation again',
        },
        {
          type: 'refresh',
          label: 'Refresh Page',
          description: 'Refresh the page to reset',
        },
      ];
  }
}

/**
 * Create a standardized ModalError
 * @param code - Error code
 * @param message - Error message
 * @param category - Error category
 * @param data - Additional error data
 * @returns ModalError object
 */
export function createModalError(
  code: string,
  message: string,
  category: ErrorCategory = 'general',
  isRecoverable?: boolean,
  data?: Record<string, unknown>,
): ModalError {
  // Default isRecoverable based on category if not provided
  // Most errors are recoverable by default except validation and sandbox
  const defaultRecoverable = category !== 'validation' && category !== 'sandbox';

  return {
    code,
    message,
    category,
    ...(isRecoverable !== undefined ? { isRecoverable } : { isRecoverable: defaultRecoverable }),
    ...(data && { data }),
  };
}

/**
 * Transform a generic error into a ModalError
 * @param error - Original error
 * @param context - Additional context
 * @returns ModalError
 */
export function toModalError(error: unknown, context?: string): ModalError {
  if (isWalletMeshError(error)) {
    return error;
  }

  const category = categorizeError(error);
  const errorWithMessage = error as { message?: unknown; name?: unknown; code?: unknown };
  const message =
    error && typeof error === 'object' && 'message' in error && typeof errorWithMessage.message === 'string'
      ? errorWithMessage.message
      : String(error);
  const contextMessage = context ? `${context}: ${message}` : message;

  // Extract error code if available
  let code = 'UNKNOWN_ERROR';
  if (error && typeof error === 'object' && 'code' in error) {
    code = String(errorWithMessage.code);
  }

  // Determine if error is recoverable based on category
  const isRecoverable = category === 'network' || category === 'user';

  return createModalError(code, contextMessage, category, isRecoverable, {
    originalError:
      error && typeof error === 'object' && 'name' in error && typeof errorWithMessage.name === 'string'
        ? errorWithMessage.name
        : undefined,
    timestamp: Date.now(),
  });
}

/**
 * Check if error indicates user rejection
 */
function isUserRejectionError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }
  const errorWithCode = error as { message: string; code?: number };
  const message = errorWithCode.message.toLowerCase();
  const code = errorWithCode.code;

  return (
    code === WALLET_ERROR_CODES.USER_REJECTED ||
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('cancelled') ||
    message.includes('rejected')
  );
}

/**
 * Check if error indicates wallet not found
 */
function isWalletNotFoundError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }
  const errorWithMessage = error as { message: string };
  const message = errorWithMessage.message.toLowerCase();

  return (
    message.includes('not found') ||
    message.includes('not installed') ||
    message.includes('not available') ||
    message.includes('ethereum is not defined') ||
    message.includes('no provider')
  );
}

/**
 * Check if error is network-related
 */
function isNetworkError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }
  const errorWithName = error as { message: string; name?: string };
  const message = errorWithName.message.toLowerCase();
  const name = errorWithName.name?.toLowerCase() || '';

  return (
    name.includes('network') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('internet')
  );
}

/**
 * Check if error is wallet-related
 */
function isWalletError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }
  const errorWithMessage = error as { message: string };
  const message = errorWithMessage.message.toLowerCase();

  return (
    message.includes('wallet') ||
    message.includes('metamask') ||
    message.includes('coinbase') ||
    message.includes('phantom') ||
    message.includes('locked')
  );
}

/**
 * Check if error is provider-related
 */
function isProviderError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }
  const errorWithMessage = error as { message: string };
  const message = errorWithMessage.message.toLowerCase();

  // Don't categorize as provider if it's primarily a connection error
  if (message.includes('connect')) {
    return false;
  }

  return message.includes('provider') || message.includes('rpc') || message.includes('method not supported');
}

/**
 * Check if error is chain-related
 */
function isChainError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }
  const errorWithCode = error as { message: string; code?: number };
  const message = errorWithCode.message.toLowerCase();
  const code = errorWithCode.code;

  return (
    code === WALLET_ERROR_CODES.CHAIN_DISCONNECTED ||
    code === WALLET_ERROR_CODES.CHAIN_NOT_ADDED ||
    message.includes('chain') ||
    message.includes('network')
  );
}

/**
 * Check if error is transaction-related
 */
function isTransactionError(error: unknown): boolean {
  if (
    !error ||
    typeof error !== 'object' ||
    !('message' in error) ||
    typeof (error as { message: unknown }).message !== 'string'
  ) {
    return false;
  }
  const errorWithMessage = error as { message: string };
  const message = errorWithMessage.message.toLowerCase();

  // Don't categorize user-friendly confirmation messages as transaction errors
  if (message.includes('please confirm') || message.includes('confirm the')) {
    return false;
  }

  return (
    message.includes('transaction') ||
    message.includes('gas') ||
    message.includes('balance') ||
    message.includes('insufficient')
  );
}

/**
 * Check if message is already user-friendly
 */
function isUserFriendlyMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();

  // Check for technical jargon that indicates non-user-friendly message
  const technicalTerms = [
    'undefined',
    'null',
    'exception',
    'stack trace',
    'error code',
    'rpc',
    'json',
    'ethereum',
    'web3',
  ];

  return (
    !technicalTerms.some((term) => lowerMessage.includes(term)) &&
    message.length < 200 && // Reasonable length
    message.indexOf('\n') === -1
  ); // No stack traces
}

/**
 * Get user-friendly message for ModalError
 */
function getModalErrorMessage(error: ModalError): string {
  // If message is empty, return default message
  if (!error.message) {
    return 'An unexpected error occurred with wallet connection.';
  }

  switch (error.category) {
    case 'network':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'wallet':
      return 'Wallet connection failed. Please ensure your wallet is unlocked and try again.';
    case 'user':
      return 'You cancelled the wallet request. Please try again if you want to continue.';
    case 'general':
      return error.message || 'Operation cancelled. Please try again if you want to continue.';
    default:
      return error.message || 'An unexpected error occurred with wallet connection.';
  }
}
