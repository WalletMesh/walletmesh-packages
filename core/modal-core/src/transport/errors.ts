/**
 * @packageDocumentation
 * Error types and factories for protocol-level errors.
 */

/**
 * Error codes specific to protocol operations.
 */
export enum ProtocolErrorCode {
  VALIDATION_FAILED = 'validation_failed',
  INVALID_FORMAT = 'invalid_format',
  UNKNOWN_MESSAGE_TYPE = 'unknown_message_type',
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  INVALID_PAYLOAD = 'invalid_payload',
}

/**
 * Protocol-specific error type.
 * Used for errors that occur during message validation and processing.
 */
export class ProtocolError extends Error {
  constructor(
    message: string,
    public readonly code: ProtocolErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ProtocolError';

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ProtocolError.prototype);
  }

  /**
   * Creates a string representation of the error.
   */
  override toString(): string {
    return `${this.name} [${this.code}]: ${this.message}${
      this.details ? `\nDetails: ${JSON.stringify(this.details)}` : ''
    }`;
  }
}

/**
 * Factory methods for creating common protocol errors.
 */
export const createProtocolError = {
  /**
   * Creates an error for validation failures.
   */
  validation: (message: string, details?: unknown) =>
    new ProtocolError(message, ProtocolErrorCode.VALIDATION_FAILED, details),

  /**
   * Creates an error for invalid message format.
   */
  invalidFormat: (message: string, details?: unknown) =>
    new ProtocolError(message, ProtocolErrorCode.INVALID_FORMAT, details),

  /**
   * Creates an error for unknown message types.
   */
  unknownMessageType: (type: string) =>
    new ProtocolError(
      `Unknown message type: ${type}`,
      ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE,
      { type }
    ),

  /**
   * Creates an error for missing required fields.
   */
  missingField: (fieldName: string) =>
    new ProtocolError(
      `Missing required field: ${fieldName}`,
      ProtocolErrorCode.MISSING_REQUIRED_FIELD,
      { field: fieldName }
    ),

  /**
   * Creates an error for invalid payload content.
   */
  invalidPayload: (message: string, details?: unknown) =>
    new ProtocolError(message, ProtocolErrorCode.INVALID_PAYLOAD, details),
};

/**
 * Type guard for checking if an error is a ProtocolError.
 */
export const isProtocolError = (error: unknown): error is ProtocolError =>
  error instanceof ProtocolError;

/**
 * Type guard for checking if a code is a valid ProtocolErrorCode.
 */
export const isProtocolErrorCode = (code: string): code is ProtocolErrorCode =>
  Object.values(ProtocolErrorCode).includes(code as ProtocolErrorCode);