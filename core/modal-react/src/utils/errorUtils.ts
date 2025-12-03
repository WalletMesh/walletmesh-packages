/**
 * Error utility wrappers for React components
 *
 * This module provides wrappers around the modal-core error management utilities
 * that are not publicly exported. This ensures consistent error handling across
 * the React package while maintaining proper encapsulation.
 *
 * @module errorUtils
 * @internal
 */

import type { ModalError } from '@walletmesh/modal-core';

/**
 * Recovery action suggestions
 * @internal
 */
export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'switch' | 'install' | 'unlock' | 'approve' | 'manual';
  label: string;
  description: string;
  action?: () => void | Promise<void>;
}

/**
 * Check if an error is a WalletMesh ModalError
 * @param error - Error to check
 * @returns True if error is a ModalError
 * @internal
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
 * Get user-friendly error message
 * @param error - Error to process
 * @returns User-friendly error message
 * @internal
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
 * @internal
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

// Helper functions

type ErrorCategory = 'user' | 'wallet' | 'network' | 'general' | 'validation' | 'sandbox';

function categorizeError(error: unknown): ErrorCategory {
  if (isWalletMeshError(error)) {
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

    if (isUserRejectionError(error)) {
      return 'user';
    }

    if (isWalletNotFoundError(error)) {
      return 'wallet';
    }

    if (isNetworkError(error)) {
      return 'network';
    }

    if (isWalletError(error)) {
      return 'wallet';
    }

    if (isChainError(error)) {
      return 'general';
    }

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

  const USER_REJECTED = 4001;
  return (
    code === USER_REJECTED ||
    message.includes('user rejected') ||
    message.includes('user denied') ||
    message.includes('cancelled') ||
    message.includes('rejected')
  );
}

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

  if (message.includes('connect')) {
    return false;
  }

  return message.includes('provider') || message.includes('rpc') || message.includes('method not supported');
}

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

  const CHAIN_DISCONNECTED = 4901;
  const CHAIN_NOT_ADDED = 4902;

  return (
    code === CHAIN_DISCONNECTED ||
    code === CHAIN_NOT_ADDED ||
    message.includes('chain') ||
    message.includes('network')
  );
}

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

function isUserFriendlyMessage(message: string): boolean {
  const lowerMessage = message.toLowerCase();

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
    message.length < 200 &&
    message.indexOf('\n') === -1
  );
}

function getModalErrorMessage(error: ModalError): string {
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
