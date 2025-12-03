/**
 * Factory for creating standardized modal errors
 *
 * This factory provides a centralized way to create consistent error objects
 * throughout the modal-core library. All errors follow a standard structure
 * with categorization, fatal/recoverable classification, and optional data.
 *
 * @remarks
 * - Always use ErrorFactory methods instead of throwing generic Error objects
 * - Fatal errors indicate unrecoverable conditions (e.g., user rejection)
 * - Recoverable errors can be retried (e.g., network timeouts)
 * - Error categories help with error handling strategies
 *
 * @example
 * // Configuration errors (usually fatal)
 * throw ErrorFactory.configurationError('Invalid wallet config', {
 *   missingField: 'apiKey'
 * });
 *
 * @example
 * // Network errors (usually recoverable)
 * throw ErrorFactory.connectionFailed('WebSocket connection lost', {
 *   attempt: 3,
 *   maxRetries: 5
 * });
 *
 * @example
 * // Connector errors with recovery hints
 * throw ErrorFactory.connectorError(
 *   'metamask',
 *   'User rejected the transaction',
 *   'USER_REJECTED',
 *   {
 *     recoveryHint: 'user_action',
 *     operation: 'signTransaction'
 *   }
 * );
 *
 * @internal
 */

import { devMode } from '../development/devMode.js';
import { ERROR_MESSAGES, createDeveloperMessage } from './errorMessages.js';
import type { ModalError, ModalErrorCategory } from './types.js';
import { ERROR_CODES, ModalErrorImpl } from './types.js';

/**
 * Factory class for creating standardized modal errors
 *
 * Error Categories:
 * - 'user': User-initiated errors (usually fatal)
 * - 'wallet': Wallet/provider errors
 * - 'network': Network/connection errors (usually recoverable)
 * - 'general': General application errors
 * - 'validation': Input validation errors
 * - 'sandbox': Icon sandbox errors
 *
 * @class ErrorFactory
 */
// biome-ignore lint/complexity/noStaticOnlyClass: Factory pattern requires static methods
export class ErrorFactory {
  /**
   * Create a user rejection error (not recoverable)
   * @param {string} [operation] - Operation that was rejected
   * @returns {ModalErrorImpl} User rejection error
   */
  static userRejected(operation?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.USER_REJECTED,
      message: 'User cancelled the operation',
      category: 'user',
      recoveryStrategy: 'none', // Not recoverable
      classification: 'permission',
    };
    if (operation) {
      error.data = { operation };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a wallet not found error (not recoverable)
   * @param {string} [walletId] - ID of the wallet that was not found
   * @returns {ModalErrorImpl} Wallet not found error
   */
  static walletNotFound(walletId?: string): ModalErrorImpl {
    let message = 'Wallet not found';

    if (walletId && devMode.isEnabled()) {
      const errorInfo = ERROR_MESSAGES.CONNECTION.WALLET_NOT_FOUND(walletId);
      const messageData: { message: string; suggestion?: string; link?: string; example?: string } = {
        message: errorInfo.message,
        suggestion: errorInfo.suggestion,
      };
      if (errorInfo.link) {
        messageData.link = errorInfo.link;
      }
      message = createDeveloperMessage(messageData);
    } else if (walletId) {
      message = `${walletId} wallet not found`;
    }

    const error: ModalError = {
      code: ERROR_CODES.WALLET_NOT_FOUND,
      message,
      category: 'wallet',
      recoveryStrategy: 'manual_action', // Requires user to install wallet
      classification: 'provider',
    };
    if (walletId) {
      error.data = { walletId };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a network error (recoverable)
   * @param {string} [message='Network error'] - Error message
   * @returns {ModalErrorImpl} Network error
   */
  static networkError(message = 'Network error'): ModalErrorImpl {
    return new ModalErrorImpl({
      code: 'network_error', // Use string literal instead of potentially undefined ERROR_CODES.NETWORK_ERROR
      message,
      category: 'network',
      recoveryStrategy: 'wait_and_retry',
      retryDelay: 3000,
      maxRetries: 3,
      classification: 'network',
    });
  }

  /**
   * Create a connection failed error (recoverable)
   * @param {string} [message='Connection failed'] - Error message
   * @param {Record<string, unknown>} [data] - Additional error data
   * @returns {ModalErrorImpl} Connection failed error
   */
  static connectionFailed(message = 'Connection failed', data?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.CONNECTION_FAILED,
      message,
      category: 'network',
      recoveryStrategy: 'wait_and_retry',
      retryDelay: 2000,
      maxRetries: 5,
      classification: 'network',
    };
    if (data !== undefined) {
      error.data = data;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a request timeout error (recoverable)
   * @param {string} [message='Request timed out'] - Error message
   * @param {Record<string, unknown>} [data] - Additional error data
   * @returns {ModalErrorImpl} Timeout error
   */
  static timeoutError(message = 'Request timed out', data?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.REQUEST_TIMEOUT,
      message,
      category: 'network',
      recoveryStrategy: 'retry',
      retryDelay: 1000,
      maxRetries: 3,
      classification: 'temporary',
    };
    if (data !== undefined) {
      error.data = data;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a general unknown error (not recoverable)
   * @param {string} [message='An unexpected error occurred'] - Error message
   * @returns {ModalErrorImpl} Unknown error
   */
  static unknownError(message = 'An unexpected error occurred'): ModalErrorImpl {
    return new ModalErrorImpl({
      code: ERROR_CODES.UNKNOWN_ERROR,
      message,
      category: 'general',
      recoveryStrategy: 'none', // Explicitly set to make it fatal
    });
  }

  /**
   * Create a configuration error (not recoverable)
   * @param {string} message - Error message
   * @param {unknown} [details] - Additional error details
   * @returns {ModalErrorImpl} Configuration error
   */
  static configurationError(message: string, details?: unknown): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.CONFIGURATION_ERROR,
      message,
      category: 'general',
      recoveryStrategy: 'none', // Configuration errors are typically fatal
    };
    if (details !== undefined) {
      error.data = { details };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a transport unavailable error (recoverable)
   * @param {string} message - Error message
   * @param {string} [transportType] - Type of transport that failed
   * @returns {ModalErrorImpl} Transport error
   */
  static transportError(message: string, transportType?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.TRANSPORT_UNAVAILABLE,
      message,
      category: 'network',
      recoveryStrategy: 'retry',
      retryDelay: 2000,
      maxRetries: 3,
      classification: 'network',
    };
    if (transportType !== undefined) {
      error.data = { transportType };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a message send failed error (recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [data] - Additional error data
   * @returns {ModalErrorImpl} Message failed error
   */
  static messageFailed(message: string, data?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.MESSAGE_FAILED,
      message,
      category: 'network',
      recoveryStrategy: 'retry', // Can retry sending the message
    };
    if (data !== undefined) {
      error.data = data;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a transport disconnected error (recoverable)
   * @param {string} message - Error message
   * @param {string} [reason] - Reason for disconnection
   * @returns {ModalErrorImpl} Transport disconnected error
   */
  static transportDisconnected(message: string, reason?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.TRANSPORT_DISCONNECTED,
      message,
      category: 'network',
      recoveryStrategy: 'wait_and_retry', // Can reconnect after disconnect
    };
    if (reason !== undefined) {
      error.data = { reason };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a render failed error (recoverable)
   * @param {string} message - Error message
   * @param {string} [component] - Component that failed to render
   * @returns {ModalErrorImpl} Render failed error
   */
  static renderFailed(message: string, component?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.RENDER_FAILED,
      message,
      category: 'general',
      recoveryStrategy: 'retry', // Can retry rendering
    };
    if (component !== undefined) {
      error.data = { component };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a mount failed error (recoverable)
   * @param {string} message - Error message
   * @param {string} [target] - Mount target that failed
   * @returns {ModalErrorImpl} Mount failed error
   */
  static mountFailed(message: string, target?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.MOUNT_FAILED,
      message,
      category: 'general',
      recoveryStrategy: 'retry', // Can retry mounting
    };
    if (target !== undefined) {
      error.data = { target };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a cleanup failed error (recoverable)
   * @param {string} message - Error message
   * @param {string} [operation] - Cleanup operation that failed
   * @returns {ModalErrorImpl} Cleanup failed error
   */
  static cleanupFailed(message: string, operation?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.CLEANUP_FAILED,
      message,
      category: 'general',
      recoveryStrategy: 'retry', // Can retry cleanup
    };
    if (operation !== undefined) {
      error.data = { operation };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create an invalid adapter error (fatal)
   * @param {string} message - Error message
   * @param {string} [adapterType] - Type of adapter that is invalid
   * @returns {ModalErrorImpl} Invalid adapter error
   */
  static invalidAdapter(message: string, adapterType?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.INVALID_ADAPTER,
      message,
      category: 'general',
      recoveryStrategy: 'none', // Fatal - invalid configuration
    };
    if (adapterType !== undefined) {
      error.data = { adapterType };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create an invalid transport error (fatal)
   * @param {string} message - Error message
   * @param {string} [transportType] - Type of transport that is invalid
   * @returns {ModalErrorImpl} Invalid transport error
   */
  static invalidTransport(message: string, transportType?: string): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.INVALID_TRANSPORT,
      message,
      category: 'general',
      recoveryStrategy: 'none', // Fatal - invalid configuration
    };
    if (transportType !== undefined) {
      error.data = { transportType };
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a connector error with proper structure for client handling
   *
   * This method creates standardized errors for wallet connectors with recovery hints
   * that help guide users to resolve the issue. The 'component: connector' marker
   * ensures proper client-side error handling.
   *
   * @param walletId - ID of the wallet/connector (e.g., 'metamask', 'phantom')
   * @param message - Human-readable error message for display
   * @param code - Optional specific error code (defaults to 'CONNECTOR_ERROR')
   * @param options - Additional error customization options
   * @param options.recoveryStrategy - Recovery strategy for the error
   * @param options.operation - Operation that failed (e.g., 'connect', 'signTransaction')
   * @param options.originalError - Original error from the wallet for debugging
   * @param options.recoveryHint - Hint for recovery UI:
   *   - 'install_wallet': User needs to install the wallet
   *   - 'unlock_wallet': User needs to unlock their wallet
   *   - 'switch_chain': User needs to switch to supported chain
   *   - 'retry': Temporary issue, can retry
   *   - 'user_action': User needs to take action in wallet
   * @param options.data - Additional error context data
   *
   * @returns Structured connector error with recovery information
   *
   * @example
   * // User rejection (fatal)
   * throw ErrorFactory.connectorError(
   *   'metamask',
   *   'User rejected the connection request',
   *   'USER_REJECTED',
   *   { recoveryHint: 'user_action' }
   * );
   *
   * @example
   * // Unsupported chain (recoverable)
   * throw ErrorFactory.connectorError(
   *   'walletconnect',
   *   'Chain ID 42161 is not supported',
   *   'UNSUPPORTED_CHAIN',
   *   {
   *     recoveryHint: 'switch_chain',
   *     data: { requestedChainId: 42161, supportedChains: [1, 137] }
   *   }
   * );
   */
  static connectorError(
    walletId: string,
    message: string,
    code?: string,
    options: {
      recoveryStrategy?: 'retry' | 'wait_and_retry' | 'manual_action' | 'none';
      classification?: 'network' | 'permission' | 'provider' | 'temporary' | 'permanent' | 'unknown';
      retryDelay?: number;
      maxRetries?: number;
      operation?: string;
      originalError?: unknown;
      recoveryHint?: 'install_wallet' | 'unlock_wallet' | 'switch_chain' | 'retry' | 'user_action';
      data?: Record<string, unknown>;
      cause?: unknown;
    } = {},
  ): ModalErrorImpl {
    const errorData: Record<string, unknown> = {
      component: 'connector', // Key identifier for clients
      walletId,
    };

    if (options.operation) {
      errorData['operation'] = options.operation;
    }

    if (options.recoveryHint) {
      errorData['recoveryHint'] = options.recoveryHint;
    }

    if (options.originalError) {
      errorData['originalError'] = String(options.originalError);
    }

    // Add any additional data from options
    if (options.data && typeof options.data === 'object' && !Array.isArray(options.data)) {
      Object.assign(errorData, options.data);
    }

    // Build error object using a plain object to avoid type issues
    // Use any to bypass exactOptionalPropertyTypes restrictions during construction
    const errorObj: any = {
      code: code || 'CONNECTOR_ERROR',
      message,
      category: 'wallet',
      data: errorData,
    };

    // Add optional properties explicitly
    if (options.recoveryStrategy !== undefined) {
      errorObj.recoveryStrategy = options.recoveryStrategy;
    }
    if (options.classification !== undefined) {
      errorObj.classification = options.classification;
    }
    if (options.retryDelay !== undefined) {
      errorObj.retryDelay = options.retryDelay;
    }
    if (options.maxRetries !== undefined) {
      errorObj.maxRetries = options.maxRetries;
    }
    // ✅ Preserve cause if provided (implements Commandment #4)
    if (options.cause !== undefined) {
      errorObj.cause = options.cause;
    }

    const result = new ModalErrorImpl(errorObj);

    // WORKAROUND: Directly set cause on the instance after construction
    // Note: This works in production but fails in vitest 2.1.8 (both jsdom and happy-dom)
    // The production code is correct; this is a known vitest limitation with Error.cause
    if (options.cause !== undefined) {
      result.cause = options.cause;
    }

    return result;
  }

  /**
   * Transform any external wallet error into a properly structured connector error
   *
   * This method analyzes error messages from wallets to automatically detect
   * common patterns and provide appropriate error codes and recovery hints.
   * It's ideal for wrapping errors from external wallet libraries.
   *
   * @param walletId - ID of the wallet/connector
   * @param error - Original error from wallet (Error object or string)
   * @param operation - Optional operation context (e.g., 'connect', 'sign')
   *
   * @returns Transformed connector error with automatic pattern detection:
   *   - User rejection patterns → USER_REJECTED + user_action hint
   *   - Wallet locked patterns → WALLET_LOCKED + unlock_wallet hint
   *   - Not installed patterns → WALLET_NOT_FOUND + install_wallet hint
   *   - Chain/network patterns → UNSUPPORTED_CHAIN + switch_chain hint
   *   - Connection patterns → CONNECTION_FAILED + retry hint
   *
   * @example
   * // Wrap MetaMask errors
   * try {
   *   await window.ethereum.request({ method: 'eth_requestAccounts' });
   * } catch (error) {
   *   // Automatically detects pattern and sets appropriate code/hint
   *   throw ErrorFactory.fromConnectorError('metamask', error, 'connect');
   * }
   *
   * @example
   * // Wrap WalletConnect errors
   * try {
   *   await walletConnectProvider.enable();
   * } catch (error) {
   *   // Error message analyzed for patterns
   *   throw ErrorFactory.fromConnectorError('walletconnect', error);
   * }
   */
  static fromConnectorError(walletId: string, error: unknown, operation?: string): ModalErrorImpl {
    // Extract a meaningful error message from various error types
    let errorMessage: string;

    // Handle null and undefined explicitly
    if (error === null) {
      errorMessage = 'null';
    } else if (error === undefined) {
      errorMessage = 'undefined';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && typeof error === 'object') {
      // Check for message property first
      const errorObj = error as Record<string, unknown>;
      if ('message' in errorObj && typeof errorObj['message'] === 'string') {
        errorMessage = errorObj['message'];
      } else if ('toString' in errorObj && typeof errorObj.toString === 'function') {
        try {
          const stringValue = String(errorObj.toString());
          // Only use toString if it provides a meaningful value (not [object Object])
          if (stringValue !== '[object Object]') {
            errorMessage = stringValue;
          } else {
            // If toString returns [object Object], try to stringify the object
            try {
              errorMessage = JSON.stringify(error);
            } catch (_stringifyError) {
              // Handle circular references or other stringify errors
              errorMessage = 'Unknown error occurred';
            }
          }
        } catch {
          errorMessage = 'Unknown error occurred';
        }
      } else {
        // Try to stringify the object
        try {
          errorMessage = JSON.stringify(error);
        } catch (_stringifyError) {
          // Handle circular references or other stringify errors
          errorMessage = 'Unknown error occurred';
        }
      }
    } else {
      // For any other type (number, boolean, symbol, etc.)
      errorMessage = String(error);
    }

    const lowerMessage = errorMessage.toLowerCase();

    // Detect common patterns and set appropriate recovery properties
    let code = 'CONNECTOR_ERROR';
    let recoveryStrategy: 'retry' | 'wait_and_retry' | 'manual_action' | 'none' = 'none';
    let classification: 'network' | 'permission' | 'provider' | 'temporary' | 'permanent' | 'unknown' =
      'unknown';
    let retryDelay: number | undefined;
    let maxRetries: number | undefined;

    // Determine recovery hint based on error pattern
    let recoveryHint:
      | 'install_wallet'
      | 'unlock_wallet'
      | 'switch_chain'
      | 'retry'
      | 'user_action'
      | undefined;

    // Check for error codes first if available
    const errorCode = (error as Record<string, unknown>)?.['code'];
    if (errorCode === 4001 || errorCode === 'ACTION_REJECTED') {
      code = 'USER_REJECTED';
      recoveryStrategy = 'none'; // Not recoverable
      classification = 'permission';
      recoveryHint = 'user_action';
    } else if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied')) {
      code = 'USER_REJECTED';
      recoveryStrategy = 'none'; // Not recoverable
      classification = 'permission';
      recoveryHint = 'user_action';
    } else if (lowerMessage.includes('locked') || lowerMessage.includes('unlock')) {
      code = 'WALLET_LOCKED';
      recoveryStrategy = 'manual_action'; // Requires user action
      classification = 'provider';
      recoveryHint = 'unlock_wallet';
    } else if (lowerMessage.includes('not found') || lowerMessage.includes('not installed')) {
      code = 'WALLET_NOT_FOUND';
      recoveryStrategy = 'manual_action'; // Requires installation
      classification = 'provider';
      recoveryHint = 'install_wallet';
    } else if (lowerMessage.includes('chain') || lowerMessage.includes('network')) {
      code = 'UNSUPPORTED_CHAIN';
      recoveryStrategy = 'manual_action'; // Requires chain switch
      classification = 'provider';
      recoveryHint = 'switch_chain';
    } else if (
      lowerMessage.includes('timeout') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('connect')
    ) {
      code = 'CONNECTION_FAILED';
      recoveryStrategy = 'wait_and_retry'; // Recoverable
      classification = 'network';
      retryDelay = 2000;
      maxRetries = 3;
      recoveryHint = 'retry';
    }

    const options: {
      recoveryStrategy?: 'retry' | 'wait_and_retry' | 'manual_action' | 'none';
      classification?: 'network' | 'permission' | 'provider' | 'temporary' | 'permanent' | 'unknown';
      retryDelay?: number;
      maxRetries?: number;
      operation?: string;
      originalError?: unknown;
      recoveryHint?: 'install_wallet' | 'unlock_wallet' | 'switch_chain' | 'retry' | 'user_action';
      data?: Record<string, unknown>;
      cause?: unknown;
    } = {
      recoveryStrategy,
      classification,
      originalError: error,
      cause: error, // ✅ Preserve full error chain with stack trace (Commandment #4)
    };

    if (retryDelay !== undefined) {
      options.retryDelay = retryDelay;
    }

    if (maxRetries !== undefined) {
      options.maxRetries = maxRetries;
    }

    if (operation !== undefined) {
      options.operation = operation;
    }

    if (recoveryHint !== undefined) {
      options.recoveryHint = recoveryHint;
    }

    return ErrorFactory.connectorError(walletId, errorMessage, code, options);
  }

  /**
   * Create a validation error (not recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Additional validation details
   * @returns {ModalErrorImpl} Validation error
   */
  static validation(message: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.VALIDATION_ERROR || 'VALIDATION_ERROR',
      message,
      category: 'general',
      recoveryStrategy: 'none', // Validation errors require fixing the input
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a not found error (not recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Additional details
   * @returns {ModalErrorImpl} Not found error
   */
  static notFound(message: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.NOT_FOUND || 'NOT_FOUND',
      message,
      category: 'general',
      recoveryStrategy: 'none', // Resource not found
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a transaction failed error (recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Transaction details
   * @returns {ModalErrorImpl} Transaction failed error
   */
  static transactionFailed(message: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.TRANSACTION_FAILED || 'TRANSACTION_FAILED',
      message,
      category: 'wallet',
      recoveryStrategy: 'retry', // Can retry transaction
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a transaction reverted error (not recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Transaction details
   * @returns {ModalErrorImpl} Transaction reverted error
   */
  static transactionReverted(message: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.TRANSACTION_REVERTED || 'TRANSACTION_REVERTED',
      message,
      category: 'wallet',
      recoveryStrategy: 'none', // Transaction reverted on-chain
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a gas estimation failed error (recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Gas estimation details
   * @returns {ModalErrorImpl} Gas estimation failed error
   */
  static gasEstimationFailed(message: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.GAS_ESTIMATION_FAILED || 'GAS_ESTIMATION_FAILED',
      message,
      category: 'wallet',
      recoveryStrategy: 'retry', // Can retry with different parameters
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a simulation failed error (not recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Simulation details
   * @returns {ModalErrorImpl} Simulation failed error
   */
  static simulationFailed(message: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.SIMULATION_FAILED || 'SIMULATION_FAILED',
      message,
      category: 'wallet',
      recoveryStrategy: 'none', // Simulation shows transaction would fail
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create an invalid parameters error (not recoverable)
   * @param {string} message - Error message
   * @param {Record<string, unknown>} [details] - Parameter details
   * @returns {ModalErrorImpl} Invalid parameters error
   */
  static invalidParams(message: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: ERROR_CODES.INVALID_PARAMS || 'INVALID_PARAMS',
      message,
      category: 'validation',
      recoveryStrategy: 'none', // Invalid parameters must be fixed
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create an icon validation failed error (not recoverable)
   * @param {string} reason - Reason for validation failure
   * @param {Record<string, unknown>} [details] - Additional validation details
   * @returns {ModalErrorImpl} Icon validation error
   */
  static iconValidationFailed(reason: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: 'ICON_VALIDATION_FAILED',
      message: `Icon validation failed: ${reason}`,
      category: 'validation',
      recoveryStrategy: 'none', // Invalid icon must be fixed
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create a sandbox creation failed error (recoverable)
   * @param {string} reason - Reason for sandbox creation failure
   * @param {Record<string, unknown>} [details] - Additional failure details
   * @returns {ModalErrorImpl} Sandbox creation error
   */
  static sandboxCreationFailed(reason: string, details?: Record<string, unknown>): ModalErrorImpl {
    const error: ModalError = {
      code: 'SANDBOX_CREATION_FAILED',
      message: `Failed to create icon sandbox: ${reason}`,
      category: 'sandbox',
      recoveryStrategy: 'retry', // Can retry sandbox creation
    };
    if (details !== undefined) {
      error.data = details;
    }
    return new ModalErrorImpl(error);
  }

  /**
   * Create an error from another error (preserves original type)
   * @param {unknown} originalError - Original error
   * @param {string} [component] - Component that handled the error
   * @returns {ModalErrorImpl} Wrapped error
   */
  static fromError(originalError: unknown, component?: string): ModalErrorImpl {
    // If it's already a ModalError, just return it (possibly adding component)
    if (ErrorFactory.isModalError(originalError)) {
      if (component && !originalError.data?.['component']) {
        return new ModalErrorImpl({
          ...originalError,
          data: { ...originalError.data, component },
        });
      }
      return new ModalErrorImpl(originalError);
    }

    const message = originalError instanceof Error ? originalError.message : String(originalError);
    const error: ModalError = {
      code: ERROR_CODES.UNKNOWN_ERROR,
      message,
      category: 'general',
      // No recovery strategy - unknown errors are not recoverable
    };

    if (component) {
      error.data = { component, originalError: String(originalError) };
    } else {
      error.data = { originalError: String(originalError) };
    }

    return new ModalErrorImpl(error);
  }

  /**
   * Create a modal error with specific properties
   * @param {string} code - Error code
   * @param {string} message - Error message
   * @param {ModalErrorCategory} [category='general'] - Error category
   * @param {Record<string, unknown>} [data] - Additional error data
   * @returns {ModalErrorImpl} Custom modal error
   */
  static create(
    code: string,
    message: string,
    category: ModalErrorCategory = 'general',
    data?: Record<string, unknown>,
  ): ModalErrorImpl {
    const error: ModalError = {
      code,
      message,
      category,
    };

    if (data !== undefined) {
      // Extract recoveryStrategy if present in data
      if ('recoveryStrategy' in data && typeof data['recoveryStrategy'] === 'string') {
        error.recoveryStrategy = data['recoveryStrategy'] as
          | 'retry'
          | 'wait_and_retry'
          | 'manual_action'
          | 'none';
      }

      // Extract other error properties from data
      if ('classification' in data && typeof data['classification'] === 'string') {
        error.classification = data['classification'] as ModalError['classification'];
      }

      if ('retryDelay' in data && typeof data['retryDelay'] === 'number') {
        error.retryDelay = data['retryDelay'];
      }

      if ('maxRetries' in data && typeof data['maxRetries'] === 'number') {
        error.maxRetries = data['maxRetries'];
      }

      error.data = data;
    }

    return new ModalErrorImpl(error);
  }

  /**
   * Check if an object is a ModalError
   * @param {unknown} error - Error to check
   * @returns {error is ModalError} True if the error is a ModalError
   */
  static isModalError(error: unknown): error is ModalError {
    // Check if it's an instance of ModalErrorImpl
    if (error instanceof ModalErrorImpl) {
      return true;
    }

    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const errorObj = error as Record<string, unknown>;
    return (
      'code' in errorObj &&
      'message' in errorObj &&
      'category' in errorObj &&
      typeof errorObj['code'] === 'string' &&
      typeof errorObj['message'] === 'string' &&
      typeof errorObj['category'] === 'string' &&
      ['general', 'network', 'provider', 'wallet', 'user', 'validation', 'sandbox'].includes(
        errorObj['category'],
      )
    );
  }
}
