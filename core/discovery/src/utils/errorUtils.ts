/**
 * Standardized error utilities for the Discovery package.
 *
 * Provides consistent error formatting, categorization, and context
 * across all discovery protocol components. These utilities are
 * primarily for internal use within the discovery package.
 *
 * @module errorUtils
 * @category Utils
 * @since 0.1.0
 * @internal
 */

/**
 * Error categories for consistent error classification.
 */
export enum ErrorCategory {
  /** Validation errors - invalid input, malformed data */
  VALIDATION = 'validation',
  /** State errors - invalid state transitions, concurrent operations */
  STATE = 'state',
  /** Network errors - timeouts, connection failures */
  NETWORK = 'network',
  /** Security errors - origin validation, permission issues */
  SECURITY = 'security',
  /** Configuration errors - invalid settings, missing required config */
  CONFIGURATION = 'configuration',
  /** Internal errors - unexpected conditions, implementation bugs */
  INTERNAL = 'internal',
}

/**
 * Context information for enriching error messages.
 */
export interface ErrorContext {
  /** The component or module where the error occurred */
  component?: string;
  /** The operation being performed when the error occurred */
  operation?: string;
  /** Additional contextual data */
  metadata?: Record<string, unknown>;
  /** The original error if this is wrapping another error */
  cause?: Error;
}

/**
 * Standardized error class with category and context.
 */
export class DiscoveryError extends Error {
  /** Error category for classification */
  public readonly category: ErrorCategory;
  /** Component where the error occurred */
  public readonly component?: string;
  /** Operation being performed */
  public readonly operation?: string;
  /** Additional metadata */
  public readonly metadata?: Record<string, unknown>;
  /** Original error cause */
  public override readonly cause?: Error;

  constructor(message: string, category: ErrorCategory, context: ErrorContext = {}) {
    // Create enhanced message with context
    const enhancedMessage = DiscoveryError.formatMessage(message, context);
    super(enhancedMessage);

    this.name = 'DiscoveryError';
    this.category = category;
    if (context.component !== undefined) {
      this.component = context.component;
    }
    if (context.operation !== undefined) {
      this.operation = context.operation;
    }
    if (context.metadata !== undefined) {
      this.metadata = context.metadata;
    }
    if (context.cause !== undefined) {
      this.cause = context.cause;
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DiscoveryError);
    }
  }

  /**
   * Format error message with context information.
   *
   * @internal
   * @category Utilities
   * @since 0.1.0
   */
  private static formatMessage(message: string, context: ErrorContext): string {
    const parts: string[] = [];

    // Add component prefix if provided
    if (context.component) {
      parts.push(`[${context.component}]`);
    }

    // Add operation context if provided
    if (context.operation) {
      parts.push(`${context.operation}:`);
    }

    // Add the main message
    parts.push(message);

    // Add metadata if provided
    if (context.metadata && Object.keys(context.metadata).length > 0) {
      const metadataStr = Object.entries(context.metadata)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(', ');
      parts.push(`(${metadataStr})`);
    }

    // Add cause information if provided
    if (context.cause) {
      parts.push(`Caused by: ${context.cause.message}`);
    }

    return parts.join(' ');
  }

  /**
   * Convert this error to a plain object for serialization.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      category: this.category,
      component: this.component,
      operation: this.operation,
      metadata: this.metadata,
      stack: this.stack,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : undefined,
    };
  }
}

/**
 * Factory functions for creating standardized errors.
 */
export const createError = {
  /**
   * Create a validation error.
   */
  validation: (message: string, context: ErrorContext = {}): DiscoveryError =>
    new DiscoveryError(message, ErrorCategory.VALIDATION, context),

  /**
   * Create a state error.
   */
  state: (message: string, context: ErrorContext = {}): DiscoveryError =>
    new DiscoveryError(message, ErrorCategory.STATE, context),

  /**
   * Create a network error.
   */
  network: (message: string, context: ErrorContext = {}): DiscoveryError =>
    new DiscoveryError(message, ErrorCategory.NETWORK, context),

  /**
   * Create a security error.
   */
  security: (message: string, context: ErrorContext = {}): DiscoveryError =>
    new DiscoveryError(message, ErrorCategory.SECURITY, context),

  /**
   * Create a configuration error.
   */
  configuration: (message: string, context: ErrorContext = {}): DiscoveryError =>
    new DiscoveryError(message, ErrorCategory.CONFIGURATION, context),

  /**
   * Create an internal error.
   */
  internal: (message: string, context: ErrorContext = {}): DiscoveryError =>
    new DiscoveryError(message, ErrorCategory.INTERNAL, context),
};

/**
 * Wrap an existing error with additional context.
 */
export function wrapError(
  error: unknown,
  category: ErrorCategory,
  context: ErrorContext = {},
): DiscoveryError {
  const originalError = error instanceof Error ? error : new Error(String(error));
  const wrappedContext = { ...context, cause: originalError };

  return new DiscoveryError(originalError.message, category, wrappedContext);
}

/**
 * Check if an error is a DiscoveryError.
 */
export function isDiscoveryError(error: unknown): error is DiscoveryError {
  return error instanceof DiscoveryError;
}

/**
 * Check if an error is of a specific category.
 */
export function isErrorCategory(error: unknown, category: ErrorCategory): boolean {
  return isDiscoveryError(error) && error.category === category;
}

/**
 * Extract meaningful error information for logging or debugging.
 */
export function extractErrorInfo(error: unknown): {
  message: string;
  category?: ErrorCategory;
  component?: string;
  operation?: string;
  stack?: string;
} {
  if (isDiscoveryError(error)) {
    return {
      message: error.message,
      ...(error.category !== undefined && { category: error.category }),
      ...(error.component !== undefined && { component: error.component }),
      ...(error.operation !== undefined && { operation: error.operation }),
      ...(error.stack !== undefined && { stack: error.stack }),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      ...(error.stack !== undefined && { stack: error.stack }),
    };
  }

  return {
    message: String(error),
  };
}

/**
 * Format error for user-friendly display.
 */
export function formatErrorForUser(error: unknown): string {
  if (isDiscoveryError(error)) {
    switch (error.category) {
      case ErrorCategory.VALIDATION:
        return `Invalid input: ${error.message}`;
      case ErrorCategory.STATE:
        return `Operation not allowed: ${error.message}`;
      case ErrorCategory.NETWORK:
        return `Connection problem: ${error.message}`;
      case ErrorCategory.SECURITY:
        return `Security error: ${error.message}`;
      case ErrorCategory.CONFIGURATION:
        return `Configuration error: ${error.message}`;
      case ErrorCategory.INTERNAL:
        return `Internal error: ${error.message}`;
      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Common error patterns with standardized messages.
 */
export const standardErrors = {
  /**
   * Invalid state transition error.
   */
  invalidStateTransition: (from: string, to: string, validTransitions: string[]): DiscoveryError =>
    createError.state(
      `Cannot transition from ${from} to ${to}. Valid transitions: ${validTransitions.join(', ')}`,
      { component: 'StateMachine', operation: 'transition' },
    ),

  /**
   * Discovery timeout error.
   */
  discoveryTimeout: (timeoutMs: number): DiscoveryError =>
    createError.network(`Discovery timed out after ${timeoutMs}ms. No qualifying wallets responded.`, {
      component: 'DiscoveryInitiator',
      operation: 'startDiscovery',
    }),

  /**
   * Origin validation error.
   */
  invalidOrigin: (origin: string, reason: string): DiscoveryError =>
    createError.security(`Origin validation failed for '${origin}': ${reason}`, {
      component: 'OriginValidator',
      operation: 'validateOrigin',
    }),

  /**
   * Rate limit exceeded error.
   */
  rateLimitExceeded: (origin: string, limit: number, windowMs: number): DiscoveryError =>
    createError.security(
      `Rate limit exceeded for origin '${origin}'. Maximum ${limit} requests per ${windowMs}ms.`,
      { component: 'RateLimiter', operation: 'recordRequest' },
    ),

  /**
   * Invalid discovery request error.
   */
  invalidCapabilityRequest: (reason: string): DiscoveryError =>
    createError.validation(`Invalid discovery request: ${reason}`, {
      component: 'CapabilityMatcher',
      operation: 'validateRequest',
    }),

  /**
   * Session not found error.
   */
  sessionNotFound: (sessionId: string): DiscoveryError =>
    createError.state(`Session not found: ${sessionId}`, {
      component: 'SessionTracker',
      operation: 'getSession',
    }),

  /**
   * Configuration missing error.
   */
  configurationMissing: (requiredField: string): DiscoveryError =>
    createError.configuration(`Missing required configuration: ${requiredField}`, {
      component: 'Configuration',
      operation: 'validate',
    }),
};
