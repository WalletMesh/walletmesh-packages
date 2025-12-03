/**
 * Global error handler for production environments
 *
 * Provides centralized handling of unhandled promise rejections and errors
 * to prevent silent failures and ensure proper error logging and recovery.
 *
 * @example
 * ```typescript
 * import { initializeGlobalErrorHandler } from './globalErrorHandler';
 *
 * // Initialize at application startup
 * initializeGlobalErrorHandler({
 *   logger: myLogger,
 *   onError: (error, context) => {
 *     // Custom error handling
 *     trackError(error, context);
 *   }
 * });
 * ```
 *
 * @packageDocumentation
 * @internal
 */

import { createLogger } from '../logger/logger.js';

/**
 * Options for configuring the global error handler
 *
 * @internal
 * @interface GlobalErrorHandlerOptions
 */
export interface GlobalErrorHandlerOptions {
  /** Logger instance for error reporting */
  logger?: ReturnType<typeof createLogger>;
  /** Custom error handler callback */
  onError?: (error: Error, context: GlobalErrorContext) => void;
  /** Whether to prevent default browser error handling */
  preventDefault?: boolean;
  /** Whether to enable debug logging */
  debug?: boolean;
}

/**
 * Context information for global errors
 *
 * @internal
 * @interface GlobalErrorContext
 */
export interface GlobalErrorContext {
  /** Type of error source */
  source: 'unhandledRejection' | 'error' | 'resourceError';
  /** Operation that was being performed */
  operation?: string;
  /** Severity level of the error */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Additional context data */
  metadata?: Record<string, unknown>;
}

/**
 * Global error handler state
 *
 * @internal
 * @interface GlobalErrorHandlerState
 */
interface GlobalErrorHandlerState {
  initialized: boolean;
  options: GlobalErrorHandlerOptions;
  errorCount: number;
  recentErrors: Array<{ error: Error; context: GlobalErrorContext; timestamp: number }>;
}

const state: GlobalErrorHandlerState = {
  initialized: false,
  options: {},
  errorCount: 0,
  recentErrors: [],
};

/**
 * Initialize the global error handler
 *
 * Sets up event listeners for unhandled promise rejections and errors.
 * Should be called once during application initialization.
 *
 * @param options - Configuration options
 *
 * @example
 * ```typescript
 * initializeGlobalErrorHandler({
 *   logger: createLogger({ level: 'error' }),
 *   onError: (error, context) => {
 *     if (context.severity === 'critical') {
 *       // Send to error tracking service
 *       errorTracker.captureException(error, context);
 *     }
 *   },
 *   debug: process.env.NODE_ENV === 'development'
 * });
 * ```
 *
 * @internal
 */
export function initializeGlobalErrorHandler(options: GlobalErrorHandlerOptions = {}): void {
  if (state.initialized) {
    if (options.debug) {
      const logger = options.logger || createLogger({ level: 'error' });
      logger.warn('Global error handler already initialized');
    }
    return;
  }

  state.options = {
    logger: options.logger || createLogger({ level: 'error' }),
    preventDefault: options.preventDefault ?? false,
    debug: options.debug ?? false,
    ...options,
  };

  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
  } else if (typeof process !== 'undefined') {
    // Node.js environment
    process.on('unhandledRejection', handleUnhandledRejection);
    process.on('uncaughtException', handleGlobalError);
  }

  state.initialized = true;

  if (state.options.debug) {
    state.options.logger?.info('Global error handler initialized');
  }
}

/**
 * Clean up the global error handler
 *
 * Removes event listeners and resets state. Useful for testing
 * or when the application is shutting down.
 *
 * @internal
 */
export function cleanupGlobalErrorHandler(): void {
  if (!state.initialized) {
    return;
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    window.removeEventListener('error', handleGlobalError);
  } else if (typeof process !== 'undefined') {
    process.off('unhandledRejection', handleUnhandledRejection);
    process.off('uncaughtException', handleGlobalError);
  }

  state.initialized = false;
  state.errorCount = 0;
  state.recentErrors = [];

  if (state.options.debug) {
    state.options.logger?.info('Global error handler cleaned up');
  }
}

/**
 * Handle unhandled promise rejections
 *
 * @param {PromiseRejectionEvent | any} event - Rejection event
 * @private
 */
// biome-ignore lint/suspicious/noExplicitAny: Event type varies across environments
function handleUnhandledRejection(event: PromiseRejectionEvent | any): void {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  const context: GlobalErrorContext = {
    source: 'unhandledRejection',
    operation: 'promise_rejection',
    severity: determineSeverity(error),
    metadata: {
      originalReason: event.reason,
      stack: error.stack,
    },
  };

  handleError(error, context);

  if (state.options.preventDefault && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
}

/**
 * Handle global errors
 *
 * @param {ErrorEvent | Error} event - Error event from global error handler
 * @private
 */
function handleGlobalError(event: ErrorEvent | Error): void {
  const error = event instanceof Error ? event : new Error(String(event));
  const context: GlobalErrorContext = {
    source: 'error',
    operation: 'global_error',
    severity: determineSeverity(error),
    metadata: {
      originalEvent: event,
      stack: error.stack,
    },
  };

  handleError(error, context);
}

/**
 * Process and handle an error
 *
 * @param {Error} error - The error to handle
 * @param {GlobalErrorContext} context - Error context information
 * @private
 */
function handleError(error: Error, context: GlobalErrorContext): void {
  state.errorCount++;

  // Store recent error for analysis
  state.recentErrors.push({
    error,
    context,
    timestamp: Date.now(),
  });

  // Keep only last 10 errors
  if (state.recentErrors.length > 10) {
    state.recentErrors.shift();
  }

  // Log the error
  const logger = state.options.logger;
  if (logger) {
    const logMessage = `Global error [${context.source}]: ${error.message}`;
    const logContext = {
      operation: context.operation,
      severity: context.severity,
      metadata: context.metadata,
      errorCount: state.errorCount,
    };

    switch (context.severity) {
      case 'critical':
        logger.error(logMessage, logContext);
        break;
      case 'high':
        logger.warn(logMessage, logContext);
        break;
      case 'medium':
        logger.info(logMessage, logContext);
        break;
      case 'low':
        if (state.options.debug) {
          logger.debug(logMessage, logContext);
        }
        break;
    }
  }

  // Call custom error handler
  if (state.options.onError) {
    try {
      state.options.onError(error, context);
    } catch (handlerError) {
      // Prevent infinite loops
      if (state.options.debug) {
        console.error('Error in custom error handler:', handlerError);
      }
    }
  }
}

/**
 * Determine error severity based on error type and message
 *
 * @param {Error} error - Error to analyze
 * @returns {GlobalErrorContext['severity']} Severity level
 * @private
 */
function determineSeverity(error: Error): GlobalErrorContext['severity'] {
  const message = error.message.toLowerCase();

  // Critical errors
  if (
    message.includes('out of memory') ||
    message.includes('stack overflow') ||
    message.includes('security') ||
    message.includes('cors')
  ) {
    return 'critical';
  }

  // High severity errors
  if (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('wallet') ||
    message.includes('provider')
  ) {
    return 'high';
  }

  // Medium severity errors
  if (message.includes('validation') || message.includes('parse') || message.includes('format')) {
    return 'medium';
  }

  // Default to medium for unknown errors
  return 'medium';
}

/**
 * Get current error statistics
 *
 * @returns {{
 *   errorCount: number;
 *   recentErrors: Array<{ error: Error; context: GlobalErrorContext; timestamp: number }>;
 *   initialized: boolean;
 * }} Error statistics
 * @internal
 */
export function getErrorStats(): {
  errorCount: number;
  recentErrors: Array<{ error: Error; context: GlobalErrorContext; timestamp: number }>;
  initialized: boolean;
} {
  return {
    errorCount: state.errorCount,
    recentErrors: [...state.recentErrors],
    initialized: state.initialized,
  };
}
