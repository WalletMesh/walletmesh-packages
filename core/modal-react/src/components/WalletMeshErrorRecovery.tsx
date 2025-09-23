/**
 * WalletMeshErrorRecovery Component
 *
 * A comprehensive error recovery component that integrates with ModalError's
 * recoveryStrategy field to provide intelligent error handling and recovery
 * options for blockchain errors.
 *
 * @module components/WalletMeshErrorRecovery
 * @packageDocumentation
 */

import type { ChainType, ModalError } from '@walletmesh/modal-core';
import { useCallback, useEffect, useState } from 'react';
import { useConnect } from '../hooks/useConnect.js';
import styles from './WalletMeshErrorRecovery.module.css';

/**
 * Error action configuration
 */
export interface ErrorAction {
  label: string;
  action: () => void | Promise<void>;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  autoRetry?: {
    attempts: number;
    backoffMs: number;
  };
}

/**
 * Props for WalletMeshErrorRecovery component
 */
export interface WalletMeshErrorRecoveryProps {
  /** The error to display and recover from */
  error: Error | ModalError;

  /** Function to reset/clear the error state */
  resetError: () => void;

  /** Custom retry handler */
  onRetry?: () => Promise<void>;

  /** Custom disconnect handler */
  onDisconnect?: () => Promise<void>;

  /** Show technical error details */
  showTechnicalDetails?: boolean;

  /** Theme mode */
  theme?: 'light' | 'dark' | 'auto';

  /** Locale for internationalization */
  locale?: 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';

  /** Chain type for chain-specific error handling */
  chainType?: ChainType;

  /** Custom recovery actions */
  customActions?: ErrorAction[];

  /** Enable automatic retry for retryable errors */
  enableAutoRetry?: boolean;

  /** Maximum number of automatic retries */
  maxAutoRetries?: number;

  /** Callback when error is tracked */
  onErrorTracked?: (error: Error | ModalError, category: string) => void;

  /** Callback when action is taken */
  onActionTaken?: (action: string, success: boolean) => void;
}

/**
 * Type guard to check if error is a ModalError
 */
function isModalError(error: unknown): error is ModalError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'code' in error &&
    'message' in error &&
    'category' in error
  );
}

/**
 * Convert generic Error to ModalError structure
 */
function convertToModalError(error: Error): ModalError {
  const message = error.message.toLowerCase();

  // Detect common error patterns and assign recovery strategies
  if (message.includes('user rejected') || message.includes('user denied')) {
    return {
      code: 'user_rejected',
      message: error.message,
      category: 'user',
      recoveryStrategy: 'none', // User rejection is not retryable
    };
  }

  if (message.includes('insufficient funds') || message.includes('insufficient balance')) {
    return {
      code: 'insufficient_funds',
      message: error.message,
      category: 'wallet',
      recoveryStrategy: 'manual_action', // Requires user to add funds
    };
  }

  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return {
      code: 'network_error',
      message: error.message,
      category: 'network',
      recoveryStrategy: 'wait_and_retry',
      retryDelay: 5000,
      maxRetries: 3,
    };
  }

  if (message.includes('nonce') || message.includes('replacement')) {
    return {
      code: 'transaction_conflict',
      message: error.message,
      category: 'network',
      recoveryStrategy: 'retry',
    };
  }

  if (message.includes('proving') || message.includes('proof')) {
    return {
      code: 'proving_failed',
      message: error.message,
      category: 'wallet',
      recoveryStrategy: 'wait_and_retry',
      retryDelay: 10000,
      maxRetries: 2,
    };
  }

  // Default to non-retryable error
  return {
    code: 'unknown_error',
    message: error.message,
    category: 'general',
    recoveryStrategy: 'none',
  };
}

/**
 * Get chain-specific error information
 */
function getChainSpecificErrorInfo(error: ModalError, chainType?: ChainType) {
  // Aztec-specific errors
  if (chainType === 'aztec') {
    if (error.code === 'proving_failed') {
      return {
        title: 'Proof Generation Failed',
        description: 'Failed to generate zero-knowledge proof. This may be a temporary issue.',
        icon: '🔐',
      };
    }
    if (error.code === 'deploy_failed') {
      return {
        title: 'Contract Deployment Failed',
        description: 'Failed to deploy the contract. Please check the parameters and try again.',
        icon: '📜',
      };
    }
  }

  // EVM-specific errors
  if (chainType === 'evm') {
    if (error.code === 'gas_estimation_failed') {
      return {
        title: 'Gas Estimation Failed',
        description: 'Unable to estimate transaction gas. The network may be congested.',
        icon: '⛽',
      };
    }
    if (error.code === 'transaction_reverted') {
      return {
        title: 'Transaction Reverted',
        description: 'The transaction was reverted by the smart contract.',
        icon: '↩️',
      };
    }
  }

  // Solana-specific errors
  if (chainType === 'solana') {
    if (error.code === 'compute_units_exceeded') {
      return {
        title: 'Compute Units Exceeded',
        description: 'Transaction requires too many compute units.',
        icon: '💻',
      };
    }
    if (error.code === 'account_not_found') {
      return {
        title: 'Account Not Found',
        description: 'The specified account does not exist on the blockchain.',
        icon: '🔍',
      };
    }
  }

  // Default error messages based on category
  return getDefaultErrorInfo(error);
}

/**
 * Get default error information based on error category
 */
function getDefaultErrorInfo(error: ModalError) {
  switch (error.category) {
    case 'user':
      return {
        title: 'Action Cancelled',
        description: error.message || 'You cancelled the action.',
        icon: '🚫',
      };

    case 'wallet':
      return {
        title: 'Wallet Error',
        description: error.message || 'There was an issue with your wallet.',
        icon: '👛',
      };

    case 'network':
      return {
        title: 'Network Error',
        description: error.message || 'There was a network connectivity issue.',
        icon: '🌐',
      };

    case 'validation':
      return {
        title: 'Validation Error',
        description: error.message || 'The request failed validation.',
        icon: '⚠️',
      };

    default:
      return {
        title: 'Something Went Wrong',
        description: error.message || 'An unexpected error occurred.',
        icon: '❌',
      };
  }
}

/**
 * WalletMeshErrorRecovery component
 *
 * Provides intelligent error recovery UI based on ModalError's recoveryStrategy field.
 * Automatically determines if errors are retryable and provides appropriate recovery actions.
 */
export function WalletMeshErrorRecovery({
  error,
  resetError,
  onRetry,
  onDisconnect,
  showTechnicalDetails = false,
  theme = 'auto',
  locale: _locale = 'en', // TODO: Implement i18n support in future version
  chainType,
  customActions,
  enableAutoRetry = false,
  maxAutoRetries = 3,
  onErrorTracked,
  onActionTaken,
}: WalletMeshErrorRecoveryProps) {
  const { disconnect } = useConnect();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Convert to ModalError if needed
  const modalError = isModalError(error) ? error : convertToModalError(error as Error);

  // Track error on mount
  useEffect(() => {
    if (onErrorTracked) {
      onErrorTracked(error, modalError.category);
    }
  }, [error, modalError.category, onErrorTracked]);

  // Auto-retry logic for wait_and_retry strategy
  useEffect(() => {
    if (!enableAutoRetry) return;
    if (modalError.recoveryStrategy !== 'wait_and_retry') return;
    if (retryCount >= (modalError.maxRetries || maxAutoRetries)) return;

    const retryDelay = modalError.retryDelay || 5000;
    let timeLeft = retryDelay / 1000;

    setCountdown(timeLeft);

    const countdownTimer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        handleRetry();
      }
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [modalError, retryCount, enableAutoRetry, maxAutoRetries]);

  // Handle retry action
  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      if (onRetry) {
        await onRetry();
      } else {
        resetError();
      }

      if (onActionTaken) {
        onActionTaken('retry', true);
      }
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      if (onActionTaken) {
        onActionTaken('retry', false);
      }
    } finally {
      setIsRetrying(false);
      setCountdown(null);
    }
  }, [onRetry, resetError, onActionTaken]);

  // Handle disconnect action
  const handleDisconnect = useCallback(async () => {
    try {
      if (onDisconnect) {
        await onDisconnect();
      } else {
        await disconnect();
      }
      resetError();

      if (onActionTaken) {
        onActionTaken('disconnect', true);
      }
    } catch (disconnectError) {
      console.error('Disconnect failed:', disconnectError);
      if (onActionTaken) {
        onActionTaken('disconnect', false);
      }
    }
  }, [onDisconnect, disconnect, resetError, onActionTaken]);

  // Determine recovery actions based on recovery strategy
  const getRecoveryActions = (): ErrorAction[] => {
    if (customActions && customActions.length > 0) {
      return customActions;
    }

    const actions: ErrorAction[] = [];

    switch (modalError.recoveryStrategy) {
      case 'retry':
        actions.push({
          label: 'Try Again',
          action: handleRetry,
          variant: 'primary',
          disabled: isRetrying,
        });
        break;

      case 'wait_and_retry':
        actions.push({
          label: countdown !== null ? `Retry in ${countdown}s` : 'Try Again',
          action: handleRetry,
          variant: 'primary',
          disabled: isRetrying || countdown !== null,
        });
        break;

      case 'manual_action':
        // Add specific actions based on error code
        if (modalError.code === 'wallet_locked') {
          actions.push({
            label: 'Unlock Wallet',
            action: () => {
              // This would open wallet extension or app
              console.log('Opening wallet to unlock...');
              resetError();
            },
            variant: 'primary',
          });
        } else if (modalError.code === 'insufficient_funds') {
          actions.push({
            label: 'Add Funds',
            action: () => {
              console.log('Opening funding options...');
              resetError();
            },
            variant: 'primary',
          });
        }
        actions.push({
          label: 'Dismiss',
          action: resetError,
          variant: 'secondary',
        });
        break;

      case 'none':
      case undefined:
        // Fatal error - only allow dismissal or reconnection
        actions.push({
          label: 'Reconnect Wallet',
          action: handleDisconnect,
          variant: 'danger',
        });
        actions.push({
          label: 'Close',
          action: resetError,
          variant: 'secondary',
        });
        break;
    }

    return actions;
  };

  const errorInfo = getChainSpecificErrorInfo(modalError, chainType);
  const recoveryActions = getRecoveryActions();
  const isRetryable = modalError.recoveryStrategy && modalError.recoveryStrategy !== 'none';

  // Apply theme
  const themeClass = theme === 'auto' ? '' : theme === 'dark' ? styles['dark'] : styles['light'];

  return (
    <div className={`${styles['errorContainer']} ${themeClass}`}>
      <div className={styles['errorCard']}>
        <div className={styles['errorIcon']}>{errorInfo.icon}</div>

        <h2 className={styles['errorTitle']}>{errorInfo.title}</h2>

        <p className={styles['errorDescription']}>{errorInfo.description}</p>

        {isRetryable && retryCount > 0 && (
          <p className={styles['retryInfo']}>
            Retry attempt {retryCount} of {modalError.maxRetries || maxAutoRetries}
          </p>
        )}

        <div className={styles['errorActions']}>
          {recoveryActions.map((action, index) => (
            <button
              key={`${action.label}-${index}`}
              type="button"
              onClick={action.action}
              disabled={action.disabled}
              className={`${styles['actionButton']} ${styles[action.variant || 'primary']}`}
            >
              {action.icon && <span className={styles['actionIcon']}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>

        {showTechnicalDetails && (
          <details className={styles['errorDetails']}>
            <summary>Technical Details</summary>
            <div className={styles['technicalInfo']}>
              <p>
                <strong>Error Code:</strong> {modalError.code}
              </p>
              <p>
                <strong>Category:</strong> {modalError.category}
              </p>
              <p>
                <strong>Recovery Strategy:</strong> {modalError.recoveryStrategy || 'none'}
              </p>
              {modalError.classification && (
                <p>
                  <strong>Classification:</strong> {modalError.classification}
                </p>
              )}
              <pre className={styles['errorStack']}>
                {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

export default WalletMeshErrorRecovery;
