/**
 * Enhanced error handling strategy for JSONRPCNode receive errors
 *
 * This module provides a robust error handling system for processing
 * incoming JSON-RPC messages with proper error categorization,
 * recovery strategies, and observability.
 */

import { JSONRPCError } from '../error.js';

/**
 * Error categories for receive errors
 */
export enum ReceiveErrorCategory {
  /** Parse errors - malformed JSON or invalid message structure */
  PARSE = 'PARSE',
  /** Validation errors - invalid JSON-RPC format */
  VALIDATION = 'VALIDATION',
  /** Method errors - method not found or execution failure */
  METHOD = 'METHOD',
  /** Transport errors - communication failures */
  TRANSPORT = 'TRANSPORT',
  /** Unknown errors - unexpected failures */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  /** Low severity - can be ignored or logged */
  LOW = 'LOW',
  /** Medium severity - should be logged and monitored */
  MEDIUM = 'MEDIUM',
  /** High severity - requires immediate attention */
  HIGH = 'HIGH',
  /** Critical severity - system stability at risk */
  CRITICAL = 'CRITICAL',
}

/**
 * Receive error event with detailed context
 */
export interface ReceiveErrorEvent {
  /** Error category */
  category: ReceiveErrorCategory;
  /** Error severity */
  severity: ErrorSeverity;
  /** Original error */
  error: Error;
  /** Raw message that caused the error */
  rawMessage: unknown;
  /** Timestamp of the error */
  timestamp: number;
  /** Optional additional context */
  context?: Record<string, unknown>;
  /** Suggested recovery action */
  recoveryAction?: string;
}

/**
 * Error handler callback type
 */
export type ReceiveErrorHandlerFunction = (event: ReceiveErrorEvent) => void | Promise<void>;

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  /** Maximum retry attempts */
  maxRetries: number;
  /** Backoff multiplier for retries */
  backoffMultiplier: number;
  /** Initial retry delay in ms */
  initialRetryDelay: number;
  /** Maximum retry delay in ms */
  maxRetryDelay: number;
  /** Whether to disconnect on critical errors */
  disconnectOnCritical: boolean;
}

/**
 * Configuration for the receive error handler
 */
export interface ReceiveErrorHandlerConfig {
  /** Custom error handlers by category */
  handlers?: Partial<Record<ReceiveErrorCategory, ReceiveErrorHandlerFunction>>;
  /** Global error handler (called for all errors) */
  globalHandler?: ReceiveErrorHandlerFunction | undefined;
  /** Error recovery strategy */
  recoveryStrategy?: Partial<ErrorRecoveryStrategy>;
  /** Whether to log errors to console */
  logToConsole?: boolean;
  /** Custom logger function */
  logger?: (message: string, data?: unknown) => void;
  /** Whether to emit error events */
  emitErrorEvents?: boolean;
  /** Maximum error rate before circuit breaker activates */
  maxErrorRate?: number;
  /** Time window for error rate calculation (ms) */
  errorRateWindow?: number;
  /** Custom time source for testing (defaults to Date.now) */
  timeSource?: () => number;
  /** Disable circuit breaker check throttling (for testing) */
  disableThrottling?: boolean;
}

/**
 * Recovery strategy configuration
 */
const RECOVERY_STRATEGY: ErrorRecoveryStrategy = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialRetryDelay: 100,
  maxRetryDelay: 5000,
  disconnectOnCritical: true,
};

/**
 * Enhanced receive error handler for JSONRPCNode
 */
export class ReceiveErrorHandler {
  private readonly config: Required<ReceiveErrorHandlerConfig>;
  private readonly errorHandlers: Map<ReceiveErrorCategory, ReceiveErrorHandlerFunction[]>;
  private readonly errorHistory: ReceiveErrorEvent[] = [];
  private readonly retryAttempts: Map<string, number> = new Map();
  private circuitBreakerOpen = false;
  private lastCircuitBreakerCheck = 0;

  constructor(config: ReceiveErrorHandlerConfig = {}) {
    this.config = {
      handlers: config.handlers || {},
      globalHandler: config.globalHandler || undefined,
      recoveryStrategy: { ...RECOVERY_STRATEGY, ...config.recoveryStrategy },
      logToConsole: config.logToConsole ?? true,
      logger: config.logger || console.error,
      emitErrorEvents: config.emitErrorEvents ?? true,
      maxErrorRate: config.maxErrorRate ?? 10, // 10 errors per window
      errorRateWindow: config.errorRateWindow ?? 60000, // 1 minute
      timeSource: config.timeSource || (() => Date.now()),
      disableThrottling: config.disableThrottling ?? false,
    };

    // Initialize error handlers
    this.errorHandlers = new Map();
    for (const category of Object.values(ReceiveErrorCategory)) {
      this.errorHandlers.set(category, []);
      const handler = this.config.handlers[category];
      if (handler) {
        this.errorHandlers.get(category)?.push(handler);
      }
    }
  }

  /**
   * Categorize an error based on its type and content
   */
  private categorizeError(error: unknown): ReceiveErrorCategory {
    if (error instanceof JSONRPCError) {
      switch (error.code) {
        case -32700: // Parse error
          return ReceiveErrorCategory.PARSE;
        case -32600: // Invalid Request
        case -32602: // Invalid params
          return ReceiveErrorCategory.VALIDATION;
        case -32601: // Method not found
        case -32603: // Internal error
          return ReceiveErrorCategory.METHOD;
        default:
          if (error.code >= -32099 && error.code <= -32000) {
            return ReceiveErrorCategory.METHOD;
          }
      }
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      if (message.includes('parse') || message.includes('json')) {
        return ReceiveErrorCategory.PARSE;
      }
      if (message.includes('invalid') || message.includes('validation')) {
        return ReceiveErrorCategory.VALIDATION;
      }
      if (message.includes('transport') || message.includes('connection')) {
        return ReceiveErrorCategory.TRANSPORT;
      }
    }

    return ReceiveErrorCategory.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(category: ReceiveErrorCategory, error: unknown): ErrorSeverity {
    switch (category) {
      case ReceiveErrorCategory.PARSE:
        // Parse errors might indicate malicious activity
        return ErrorSeverity.HIGH;
      case ReceiveErrorCategory.VALIDATION:
        // Validation errors are usually client mistakes
        return ErrorSeverity.MEDIUM;
      case ReceiveErrorCategory.METHOD:
        // Method errors depend on the specific error
        if (error instanceof JSONRPCError && error.code === -32601) {
          return ErrorSeverity.LOW; // Method not found is common
        }
        return ErrorSeverity.MEDIUM;
      case ReceiveErrorCategory.TRANSPORT:
        // Transport errors might indicate connectivity issues
        return ErrorSeverity.HIGH;
      case ReceiveErrorCategory.UNKNOWN:
        // Unknown errors are potentially critical
        return ErrorSeverity.CRITICAL;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  /**
   * Suggest recovery action based on error
   */
  private suggestRecoveryAction(category: ReceiveErrorCategory, error: unknown): string {
    switch (category) {
      case ReceiveErrorCategory.PARSE:
        return 'Validate message format before processing';
      case ReceiveErrorCategory.VALIDATION:
        return 'Check JSON-RPC message structure and required fields';
      case ReceiveErrorCategory.METHOD:
        if (error instanceof JSONRPCError && error.code === -32601) {
          return 'Register the missing method handler';
        }
        return 'Review method implementation for errors';
      case ReceiveErrorCategory.TRANSPORT:
        return 'Check transport connection and retry';
      case ReceiveErrorCategory.UNKNOWN:
        return 'Investigate unexpected error and add proper handling';
      default:
        return 'Review error details and implement appropriate handling';
    }
  }

  /**
   * Check if circuit breaker should be activated
   */
  private checkCircuitBreaker(): void {
    const now = this.config.timeSource();
    if (!this.config.disableThrottling && now - this.lastCircuitBreakerCheck < 1000) {
      return; // Check at most once per second
    }

    this.lastCircuitBreakerCheck = now;
    const windowStart = now - this.config.errorRateWindow;

    // Remove old errors from history
    // biome-ignore lint/style/noNonNullAssertion: We check length > 0 above
    while (this.errorHistory.length > 0 && this.errorHistory[0]!.timestamp < windowStart) {
      this.errorHistory.shift();
    }

    // Check error rate
    if (this.errorHistory.length >= this.config.maxErrorRate) {
      this.circuitBreakerOpen = true;
      this.config.logger('Circuit breaker activated due to high error rate', {
        errorCount: this.errorHistory.length,
        window: this.config.errorRateWindow,
        maxRate: this.config.maxErrorRate,
      });
    } else if (this.circuitBreakerOpen && this.errorHistory.length < this.config.maxErrorRate / 2) {
      // Reset circuit breaker when error rate drops significantly
      this.circuitBreakerOpen = false;
      this.config.logger('Circuit breaker deactivated', {
        errorCount: this.errorHistory.length,
      });
    }
  }

  /**
   * Handle a receive error
   */
  async handleError(error: unknown, rawMessage: unknown, context?: Record<string, unknown>): Promise<void> {
    // Check circuit breaker status first (this may reset it if errors have expired)
    this.checkCircuitBreaker();

    // Check if circuit breaker is open after the check
    if (this.circuitBreakerOpen) {
      this.config.logger('Error dropped by circuit breaker', { error, rawMessage });
      return;
    }

    // Categorize the error
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(category, error);
    const recoveryAction = this.suggestRecoveryAction(category, error);

    // Create error event
    const errorEvent: ReceiveErrorEvent = {
      category,
      severity,
      error: error instanceof Error ? error : new Error(String(error)),
      rawMessage,
      timestamp: this.config.timeSource(),
      ...(context && { context }),
      recoveryAction,
    };

    // Add to history
    this.errorHistory.push(errorEvent);

    // Check circuit breaker after adding the error
    this.checkCircuitBreaker();

    // Log to console if enabled
    if (this.config.logToConsole) {
      const logMessage = `[JSONRPCNode] Receive error - Category: ${category}, Severity: ${severity}`;
      const logData = {
        error: errorEvent.error.message,
        rawMessage,
        context,
        recoveryAction,
      };

      switch (severity) {
        case ErrorSeverity.LOW:
          console.debug(logMessage, logData);
          break;
        case ErrorSeverity.MEDIUM:
          console.warn(logMessage, logData);
          break;
        case ErrorSeverity.HIGH:
        case ErrorSeverity.CRITICAL:
          this.config.logger(logMessage, logData);
          break;
      }
    }

    // Call category-specific handlers
    const handlers = this.errorHandlers.get(category) || [];
    for (const handler of handlers) {
      try {
        await handler(errorEvent);
      } catch (handlerError) {
        if (this.config.logToConsole) {
          this.config.logger('Error in error handler', { handlerError, category });
        }
      }
    }

    // Call global handler
    if (this.config.globalHandler) {
      try {
        await this.config.globalHandler(errorEvent);
      } catch (handlerError) {
        if (this.config.logToConsole) {
          this.config.logger('Error in global error handler', { handlerError });
        }
      }
    }

    // Handle critical errors
    if (severity === ErrorSeverity.CRITICAL && this.config.recoveryStrategy.disconnectOnCritical) {
      if (this.config.logToConsole) {
        this.config.logger('Critical error detected, disconnection recommended', errorEvent);
      }
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ReceiveErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
    recentErrors: ReceiveErrorEvent[];
    circuitBreakerOpen: boolean;
  } {
    const stats = {
      totalErrors: this.errorHistory.length,
      errorsByCategory: {} as Record<ReceiveErrorCategory, number>,
      errorsBySeverity: {} as Record<ErrorSeverity, number>,
      recentErrors: this.errorHistory.slice(-10), // Last 10 errors
      circuitBreakerOpen: this.circuitBreakerOpen,
    };

    // Initialize counters
    for (const category of Object.values(ReceiveErrorCategory)) {
      stats.errorsByCategory[category] = 0;
    }
    for (const severity of Object.values(ErrorSeverity)) {
      stats.errorsBySeverity[severity] = 0;
    }

    // Count errors
    for (const error of this.errorHistory) {
      stats.errorsByCategory[error.category]++;
      stats.errorsBySeverity[error.severity]++;
    }

    return stats;
  }

  /**
   * Register an error handler for a specific category
   */
  registerHandler(category: ReceiveErrorCategory, handler: ReceiveErrorHandlerFunction): () => void {
    const handlers = this.errorHandlers.get(category);
    if (handlers) {
      handlers.push(handler);
    }

    // Return cleanup function
    return () => {
      const handlers = this.errorHandlers.get(category);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index >= 0) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory.length = 0;
    this.retryAttempts.clear();
    this.circuitBreakerOpen = false;
  }

  /**
   * Create an enhanced JSONRPCNode with improved error handling
   */
  static enhanceNode(
    // biome-ignore lint/suspicious/noExplicitAny: Dynamic node type for enhanced transport access
    node: any,
    config?: ReceiveErrorHandlerConfig,
  ): {
    // biome-ignore lint/suspicious/noExplicitAny: Return type matches input for enhanced node
    node: any;
    errorHandler: ReceiveErrorHandler;
  } {
    const errorHandler = new ReceiveErrorHandler(config);

    // Override the transport onMessage to add error handling
    const originalTransport = node.transport;
    const enhancedTransport = {
      ...originalTransport,
      onMessage: (callback: (message: unknown) => void) => {
        // Call the original onMessage to register our enhanced callback
        return originalTransport.onMessage((message: unknown) => {
          // Wrap the callback with error handling
          Promise.resolve()
            .then(() => callback(message))
            .catch((error) => errorHandler.handleError(error, message));
        });
      },
    };

    // Replace transport on the node
    node.transport = enhancedTransport;

    return { node, errorHandler };
  }
}
