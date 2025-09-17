import { ERROR_CODES, ERROR_MESSAGES, SILENT_FAILURE_CODES, getErrorCategory } from '../core/constants.js';
import type { ErrorCategory } from '../types/core.js';

/**
 * Protocol error with standardized error codes and categories.
 *
 * Extends the standard Error class with protocol-specific error codes,
 * categories, metadata, and silent failure handling for consistent error
 * management across the discovery protocol implementation.
 *
 * ## Features
 * - **Standardized error codes**: Consistent numeric codes for all protocol errors
 * - **Error categorization**: Groups errors by type (security, capability, protocol, etc.)
 * - **Silent failure support**: Marks errors that should not generate responses
 * - **Rich context data**: Includes additional metadata for debugging
 * - **Factory methods**: Convenient static methods for common error scenarios
 * - **Type safety**: Full TypeScript support with proper error typing
 *
 * ## Error Categories
 * - `security`: Origin validation, rate limiting, session security
 * - `capability`: Unsupported capabilities or chains
 * - `protocol`: Message format, missing fields, protocol violations
 * - `connection`: Transport and connection related errors
 * - `internal`: Implementation bugs and unexpected conditions
 *
 * ## Silent Failure Pattern
 * Some errors trigger "silent failures" where the responder logs the error
 * but doesn't send any response to prevent information leakage to attackers.
 *
 * @example Basic protocol error
 * ```typescript
 * throw new ProtocolError(
 *   ERROR_CODES.ORIGIN_VALIDATION_FAILED,
 *   { origin: 'http://untrusted.com', reason: 'HTTP not allowed' },
 *   'Custom error message'
 * );
 * ```
 *
 * @example Using factory methods
 * ```typescript
 * // Security errors
 * throw ProtocolError.originValidationFailed('http://malicious.com');
 * throw ProtocolError.rateLimitExceeded('https://spam.com', 100);
 * throw ProtocolError.sessionReplayDetected('session-123', 'https://attacker.com');
 *
 * // Capability errors
 * throw ProtocolError.capabilityNotSupported('unsupported-feature');
 * throw ProtocolError.chainNotSupported('unsupported:chain:42');
 *
 * // Protocol errors
 * throw ProtocolError.invalidMessageFormat('Missing required sessionId');
 * throw ProtocolError.missingRequiredField('discoveryRequest.origin');
 * ```
 *
 * @example Error handling with categorization
 * ```typescript
 * try {
 *   await processDiscoveryRequest(request);
 * } catch (error) {
 *   if (ProtocolError.isProtocolError(error)) {
 *     console.log(`Protocol error [${error.code}]:`, error.message);
 *     console.log('Category:', error.category);
 *     console.log('Context:', error.context);
 *
 *     if (error.silent) {
 *       // Silent failure - log but don't respond
 *       logger.debug('Silent failure:', error.message);
 *       return;
 *     }
 *
 *     // Send error response based on category
 *     switch (error.category) {
 *       case 'security':
 *         sendSecurityErrorResponse(error);
 *         break;
 *       case 'capability':
 *         // Don't respond - responder can't fulfill requirements
 *         break;
 *       default:
 *         sendGenericErrorResponse(error);
 *     }
 *   }
 * }
 * ```
 *
 * @example Checking for silent failures
 * ```typescript
 * if (ProtocolError.shouldSilentlyFail(error)) {
 *   logger.debug('[Silent Failure]', error.message);
 *   return; // Don't send any response
 * }
 * ```
 *
 * @category Errors
 * @since 0.1.0
 * @see {@link ERROR_CODES} for available error codes
 * @see {@link ErrorCategory} for error categorization
 */
export class ProtocolError extends Error {
  /**
   * Numeric error code from ERROR_CODES
   */
  readonly code: number;

  /**
   * Error category (protocol, security, capability, connection, internal)
   */
  readonly category: ErrorCategory | 'unknown';

  /**
   * Whether this error should result in a silent failure (no response)
   */
  readonly silent: boolean;

  /**
   * Additional context data for debugging
   */
  readonly context?: Record<string, unknown>;

  constructor(code: number, context?: Record<string, unknown>, customMessage?: string) {
    const message = customMessage || ERROR_MESSAGES[code] || 'Unknown protocol error';
    super(message);

    this.name = 'ProtocolError';
    this.code = code;
    this.category = getErrorCategory(code);
    // Type assertion needed because code could be any error code, not just silent ones
    this.silent = SILENT_FAILURE_CODES.has(code as Parameters<typeof SILENT_FAILURE_CODES.has>[0]);
    if (context) {
      this.context = context;
    }

    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProtocolError);
    }
  }

  /**
   * Create a protocol error for origin validation failure.
   *
   * Factory method for creating standardized origin validation errors.
   * These errors typically result in silent failures to prevent information
   * leakage to potential attackers.
   *
   * @param origin - The origin that failed validation
   * @param reason - Optional reason for the validation failure
   * @returns ProtocolError with origin validation context
   *
   * @example
   * ```typescript
   * // Basic validation failure
   * throw ProtocolError.originValidationFailed('http://malicious.com');
   *
   * // With specific reason
   * throw ProtocolError.originValidationFailed(
   *   'http://untrusted.com',
   *   'HTTP protocol not allowed'
   * );
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static originValidationFailed(origin: string, reason?: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.ORIGIN_VALIDATION_FAILED, { origin, reason });
  }

  /**
   * Create a protocol error for rate limit exceeded.
   *
   * Factory method for creating rate limiting errors when an origin
   * exceeds the allowed request frequency. Results in silent failure
   * to prevent abuse detection by attackers.
   *
   * @param origin - The origin that exceeded the rate limit
   * @param limit - The rate limit that was exceeded
   * @returns ProtocolError with rate limiting context
   *
   * @example
   * ```typescript
   * throw ProtocolError.rateLimitExceeded('https://spam.com', 100);
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static rateLimitExceeded(origin: string, limit: number): ProtocolError {
    return new ProtocolError(ERROR_CODES.RATE_LIMIT_EXCEEDED, { origin, limit });
  }

  /**
   * Create a protocol error for session replay detection.
   *
   * Factory method for creating session replay attack errors when
   * the same session ID is used multiple times from the same origin.
   * Results in silent failure to prevent attack confirmation.
   *
   * @param sessionId - The session ID that was replayed
   * @param origin - The origin attempting the replay
   * @returns ProtocolError with session replay context
   *
   * @example
   * ```typescript
   * throw ProtocolError.sessionReplayDetected(
   *   'session-abc-123',
   *   'https://attacker.com'
   * );
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static sessionReplayDetected(sessionId: string, origin: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.SESSION_REPLAY_DETECTED, { sessionId, origin });
  }

  /**
   * Create a protocol error for blocked origin.
   *
   * Factory method for creating errors when an origin is explicitly
   * blocked by the security policy. Results in silent failure.
   *
   * @param origin - The blocked origin
   * @returns ProtocolError with blocked origin context
   *
   * @example
   * ```typescript
   * throw ProtocolError.originBlocked('https://blocked-site.com');
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static originBlocked(origin: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.ORIGIN_BLOCKED, { origin });
  }

  /**
   * Create a protocol error for unsupported capability.
   *
   * Factory method for creating errors when a responder cannot
   * provide a requested capability. Results in silent failure
   * to preserve responder privacy.
   *
   * @param capability - The unsupported capability
   * @returns ProtocolError with capability context
   *
   * @example
   * ```typescript
   * throw ProtocolError.capabilityNotSupported('hardware-wallet');
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static capabilityNotSupported(capability: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.CAPABILITY_NOT_SUPPORTED, { capability });
  }

  /**
   * Create a protocol error for unsupported chain.
   *
   * Factory method for creating errors when a responder cannot
   * support a requested blockchain network. Results in silent
   * failure to preserve responder privacy.
   *
   * @param chain - The unsupported chain identifier
   * @returns ProtocolError with chain context
   *
   * @example
   * ```typescript
   * throw ProtocolError.chainNotSupported('eip155:999');
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static chainNotSupported(chain: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.CHAIN_NOT_SUPPORTED, { chain });
  }

  /**
   * Create a protocol error for message too large.
   *
   * Factory method for creating errors when a protocol message
   * exceeds the maximum allowed size. Helps prevent DoS attacks
   * through oversized messages.
   *
   * @param size - The actual message size in bytes
   * @param maxSize - The maximum allowed size in bytes
   * @returns ProtocolError with size context
   *
   * @example
   * ```typescript
   * throw ProtocolError.messageTooLarge(1048576, 65536); // 1MB vs 64KB limit
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static messageTooLarge(size: number, maxSize: number): ProtocolError {
    return new ProtocolError(ERROR_CODES.MESSAGE_TOO_LARGE, { size, maxSize });
  }

  /**
   * Create a protocol error for invalid message format.
   *
   * Factory method for creating errors when a protocol message
   * has an invalid structure, missing fields, or incorrect data types.
   *
   * @param reason - Specific reason for the format error
   * @returns ProtocolError with format validation context
   *
   * @example
   * ```typescript
   * throw ProtocolError.invalidMessageFormat('sessionId must be a string');
   * throw ProtocolError.invalidMessageFormat('Invalid JSON structure');
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static invalidMessageFormat(reason: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.INVALID_MESSAGE_FORMAT, { reason });
  }

  /**
   * Create a protocol error for missing required field.
   *
   * Factory method for creating errors when a required field
   * is missing from a protocol message.
   *
   * @param field - The name of the missing required field
   * @returns ProtocolError with missing field context
   *
   * @example
   * ```typescript
   * throw ProtocolError.missingRequiredField('sessionId');
   * throw ProtocolError.missingRequiredField('request.origin');
   * ```
   *
   * @category Factory Methods
   * @since 0.1.0
   */
  static missingRequiredField(field: string): ProtocolError {
    return new ProtocolError(ERROR_CODES.MISSING_REQUIRED_FIELD, { field });
  }

  /**
   * Check if an error is a ProtocolError.
   *
   * Type guard function that determines if an unknown error is
   * a ProtocolError instance. Useful for error handling and
   * accessing protocol-specific error properties.
   *
   * @param error - The error to check
   * @returns `true` if error is ProtocolError, `false` otherwise
   *
   * @example
   * ```typescript
   * catch (error) {
   *   if (ProtocolError.isProtocolError(error)) {
   *     // TypeScript knows error is ProtocolError
   *     console.log('Error code:', error.code);
   *     console.log('Category:', error.category);
   *   }
   * }
   * ```
   *
   * @category Type Guards
   * @since 0.1.0
   */
  static isProtocolError(error: unknown): error is ProtocolError {
    return error instanceof ProtocolError;
  }

  /**
   * Check if an error should result in silent failure.
   *
   * Determines whether an error should trigger a silent failure
   * (no response sent) based on the error type and security
   * considerations. Silent failures prevent information leakage
   * to potential attackers.
   *
   * @param error - The error to check
   * @returns `true` if error should result in silent failure, `false` otherwise
   *
   * @example
   * ```typescript
   * catch (error) {
   *   if (ProtocolError.shouldSilentlyFail(error)) {
   *     logger.debug('[Silent Failure]', error.message);
   *     return; // Don't send any response
   *   }
   *
   *   sendErrorResponse(error);
   * }
   * ```
   *
   * @category Security
   * @since 0.1.0
   */
  static shouldSilentlyFail(error: unknown): boolean {
    if (error instanceof ProtocolError) {
      return error.silent;
    }
    return false;
  }
}
