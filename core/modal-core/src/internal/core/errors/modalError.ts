/**
 * Modal Error implementation as a proper Error class
 *
 * This class extends the native Error class while implementing the ModalError
 * interface, allowing it to work with both instanceof Error checks and
 * the rich error metadata system used throughout modal-core.
 *
 * @internal
 */

import type { ModalError, ModalErrorCategory, RecoveryStrategy } from './types.js';

/**
 * Error class that implements the ModalError interface
 *
 * This class provides:
 * - Proper instanceof Error behavior
 * - Stack traces for debugging
 * - All ModalError metadata (category, recovery strategy, etc.)
 * - Simplified recoverability model (determined by recoveryStrategy)
 *
 * @example
 * ```typescript
 * const error = new ModalErrorImpl({
 *   code: 'CONNECTION_FAILED',
 *   message: 'Failed to connect to wallet',
 *   category: 'network',
 *   recoveryStrategy: 'wait_and_retry',
 *   retryDelay: 2000,
 *   maxRetries: 5
 * });
 *
 * console.log(error instanceof Error); // true
 * console.log(error.recoveryStrategy); // 'wait_and_retry'
 * ```
 *
 * @internal
 */
export class ModalErrorImpl extends Error implements ModalError {
  public readonly code: string;
  public readonly category: ModalErrorCategory;
  public readonly recoveryStrategy?: RecoveryStrategy;
  public readonly retryDelay?: number;
  public readonly maxRetries?: number;
  public readonly classification?:
    | 'network'
    | 'permission'
    | 'provider'
    | 'temporary'
    | 'permanent'
    | 'unknown';
  public readonly data?: Record<string, unknown>;
  public override readonly cause?: unknown;

  /**
   * Override the name property to identify this as a ModalError
   */
  public override get name(): string {
    return 'ModalError';
  }

  /**
   * Override toString to return just the message for string coercion
   */
  public override toString(): string {
    return this.message;
  }

  constructor(error: ModalError) {
    super(error.message);

    // The name is set via the getter above

    // Copy all properties from the ModalError interface
    this.code = error.code;
    this.category = error.category;
    // Handle optional properties correctly for exactOptionalPropertyTypes
    if (error.recoveryStrategy !== undefined) {
      this.recoveryStrategy = error.recoveryStrategy;
    }
    if (error.retryDelay !== undefined) {
      this.retryDelay = error.retryDelay;
    }
    if (error.maxRetries !== undefined) {
      this.maxRetries = error.maxRetries;
    }
    if (error.classification !== undefined) {
      this.classification = error.classification;
    }
    if (error.data !== undefined) {
      this.data = error.data;
    }
    if (error.cause !== undefined) {
      this.cause = error.cause;
    }

    // Ensure proper prototype chain for instanceof checks
    // This is necessary when extending built-in classes like Error
    Object.setPrototypeOf(this, ModalErrorImpl.prototype);

    // Capture stack trace (V8 engines only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ModalErrorImpl);
    }
  }

  /**
   * Serialize the error to a plain object (useful for logging)
   */
  toJSON(): ModalError {
    return {
      code: this.code,
      message: this.message,
      category: this.category,
      ...(this.recoveryStrategy !== undefined && { recoveryStrategy: this.recoveryStrategy }),
      ...(this.retryDelay !== undefined && { retryDelay: this.retryDelay }),
      ...(this.maxRetries !== undefined && { maxRetries: this.maxRetries }),
      ...(this.classification !== undefined && { classification: this.classification }),
      ...(this.data !== undefined && { data: this.data }),
      ...(this.cause !== undefined && { cause: this.cause }),
    };
  }
}
