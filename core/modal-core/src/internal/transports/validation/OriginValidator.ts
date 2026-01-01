/**
 * Origin Validator Utility
 *
 * Provides centralized origin validation logic for all transport types.
 * Validates that the claimed origin (_context.origin) matches the browser-validated origin.
 *
 * @module internal/transports/validation
 */

import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { ModalError } from '../../../types.js';

/**
 * Origin validation result
 */
export interface OriginValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Error if validation failed */
  error?: ModalError;
  /** Context information about the validation */
  context?: {
    contextOrigin?: string;
    trustedOrigin?: string;
    transportType?: string;
  };
}

/**
 * Origin validation options
 */
export interface OriginValidationOptions {
  /** Transport type for error context */
  transportType: string;
  /** Whether the trusted origin is browser-validated (most secure) */
  isBrowserValidated?: boolean;
  /** Additional context for error messages */
  additionalContext?: Record<string, unknown>;
  /** Whether to require the origin field (strict mode for wrapped messages) */
  requireOriginField?: boolean;
}

/**
 * Origin Validator
 *
 * Encapsulates origin validation logic used across all transport types.
 * Provides consistent validation behavior and error handling.
 */
export class OriginValidator {
  /**
   * Validate _context.origin against a trusted origin
   *
   * @param message - The message to validate
   * @param trustedOrigin - The trusted origin to validate against (from browser or environment)
   * @param options - Validation options
   * @returns Validation result with error if validation fails
   */
  static validateContextOrigin(
    message: unknown,
    trustedOrigin: string | undefined,
    options: OriginValidationOptions,
  ): OriginValidationResult {
    // Extract _context.origin from message
    const contextOrigin = this.extractContextOrigin(message);

    // If no _context.origin field, validation passes (field is optional by default)
    if (contextOrigin === undefined) {
      return { valid: true };
    }

    // If no trusted origin is available (SSR, non-browser), validation passes
    if (!trustedOrigin) {
      return { valid: true };
    }

    // Compare origins
    if (contextOrigin !== trustedOrigin) {
      const originType = options.isBrowserValidated ? 'browser origin' : 'dApp origin';

      const error = ErrorFactory.messageFailed(
        `Origin mismatch: _context.origin="${contextOrigin}" does not match ${originType}="${trustedOrigin}"`,
        {
          transport: options.transportType,
          contextOrigin,
          trustedOrigin,
          isBrowserValidated: options.isBrowserValidated ?? false,
          ...options.additionalContext,
        },
      );

      return {
        valid: false,
        error,
        context: {
          contextOrigin,
          trustedOrigin,
          transportType: options.transportType,
        },
      };
    }

    return { valid: true };
  }

  /**
   * Validate wrapped message origin (strict validation for CrossWindowTransport)
   *
   * @param wrappedMessage - The wrapped message object
   * @param trustedOrigin - The trusted origin to validate against
   * @param options - Validation options
   * @returns Validation result with error if validation fails
   */
  static validateWrappedOrigin(
    wrappedMessage: unknown,
    trustedOrigin: string | undefined,
    options: OriginValidationOptions,
  ): OriginValidationResult {
    // Extract origin from wrapped message
    const wrappedOrigin = this.extractWrappedOrigin(wrappedMessage);

    // Strict mode: origin field is REQUIRED
    if (options.requireOriginField && wrappedOrigin === undefined) {
      const error = ErrorFactory.messageFailed(
        'Invalid message: wrapped message missing required origin field',
        {
          transport: options.transportType,
          ...(trustedOrigin !== undefined && { trustedOrigin }),
          ...options.additionalContext,
        },
      );

      return {
        valid: false,
        error,
        context: {
          ...(trustedOrigin !== undefined && { trustedOrigin }),
          transportType: options.transportType,
        },
      };
    }

    // If no wrapped origin and not required, validation passes
    if (wrappedOrigin === undefined) {
      return { valid: true };
    }

    // If no trusted origin is available (SSR, non-browser), validation passes
    if (!trustedOrigin) {
      return { valid: true };
    }

    // Compare origins
    if (wrappedOrigin !== trustedOrigin) {
      const originType = options.isBrowserValidated ? 'browser origin' : 'dApp origin';

      const error = ErrorFactory.messageFailed(
        `Origin mismatch: wrapped message origin="${wrappedOrigin}" does not match ${originType}="${trustedOrigin}"`,
        {
          transport: options.transportType,
          wrappedOrigin,
          trustedOrigin,
          isBrowserValidated: options.isBrowserValidated ?? false,
          ...options.additionalContext,
        },
      );

      return {
        valid: false,
        error,
        context: {
          contextOrigin: wrappedOrigin,
          trustedOrigin,
          transportType: options.transportType,
        },
      };
    }

    return { valid: true };
  }

  /**
   * Extract _context.origin from message
   *
   * @param message - The message to extract from
   * @returns The origin string or undefined if not present
   */
  private static extractContextOrigin(message: unknown): string | undefined {
    if (
      message &&
      typeof message === 'object' &&
      '_context' in message &&
      message._context &&
      typeof message._context === 'object' &&
      'origin' in message._context
    ) {
      const origin = (message._context as { origin?: unknown }).origin;
      return typeof origin === 'string' ? origin : undefined;
    }
    return undefined;
  }

  /**
   * Extract origin from wrapped message
   *
   * @param wrappedMessage - The wrapped message to extract from
   * @returns The origin string or undefined if not present
   */
  private static extractWrappedOrigin(wrappedMessage: unknown): string | undefined {
    if (wrappedMessage && typeof wrappedMessage === 'object' && 'origin' in wrappedMessage) {
      const origin = (wrappedMessage as { origin?: unknown }).origin;
      return typeof origin === 'string' ? origin : undefined;
    }
    return undefined;
  }

  /**
   * Get dApp origin from browser environment
   * Returns undefined in SSR/non-browser environments
   *
   * @returns The dApp origin or undefined
   */
  static getDAppOrigin(): string | undefined {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin;
    }
    return undefined;
  }

  /**
   * Check if we're in a browser environment where origin validation is meaningful
   *
   * @returns True if in browser with window.location available
   */
  static isBrowserEnvironment(): boolean {
    return typeof window !== 'undefined' && window.location !== undefined;
  }
}
