/**
 * @packageDocumentation
 * Transport and protocol error types for consistent error handling
 */

/**
 * Protocol error codes for validation and processing errors
 */
export enum ProtocolErrorCode {
  /** General validation failure */
  VALIDATION_FAILED = 'validation_failed',
  /** Invalid message format or structure */
  INVALID_FORMAT = 'invalid_format',
  /** Unknown or unsupported message type */
  UNKNOWN_MESSAGE_TYPE = 'unknown_message_type',
  /** Required field missing in message */
  MISSING_REQUIRED_FIELD = 'missing_required_field',
  /** Invalid payload structure or content */
  INVALID_PAYLOAD = 'invalid_payload'
}

/**
 * Transport error codes for connection and communication errors
 */
export enum TransportErrorCode {
  /** General transport error */
  TRANSPORT_ERROR = 'transport_error',
  /** Failed to establish connection */
  CONNECTION_FAILED = 'connection_failed',
  /** Transport not connected */
  NOT_CONNECTED = 'not_connected',
  /** Message send failed */
  SEND_FAILED = 'send_failed',
  /** Protocol error occurred */
  PROTOCOL_ERROR = 'protocol_error',
  /** Operation timed out */
  TIMEOUT = 'timeout',
  /** Invalid message format/structure */
  INVALID_MESSAGE = 'invalid_message'
}

/**
 * Protocol-specific error with error code and details
 */
export class ProtocolError extends Error {
  constructor(
    message: string,
    public readonly code: ProtocolErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ProtocolError';
  }

  override toString(): string {
    const details = this.details ? `: ${JSON.stringify(this.details)}` : '';
    return `${this.name}[${this.code}]: ${this.message}${details}`;
  }
}

/**
 * Transport-specific error with error code and details
 */
export class TransportError extends Error {
  constructor(
    message: string,
    public readonly code: TransportErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'TransportError';
  }

  override toString(): string {
    const details = this.details ? `: ${JSON.stringify(this.details)}` : '';
    return `${this.name}[${this.code}]: ${this.message}${details}`;
  }
}

/**
 * Factory methods for protocol errors
 */
export const createProtocolError = {
  validation: (message: string, details?: unknown) => 
    new ProtocolError(message, ProtocolErrorCode.VALIDATION_FAILED, details),
  
  invalidFormat: (message: string, details?: unknown) =>
    new ProtocolError(message, ProtocolErrorCode.INVALID_FORMAT, details),
  
  unknownMessageType: (type: string) =>
    new ProtocolError(
      `Unknown message type: ${type}`,
      ProtocolErrorCode.UNKNOWN_MESSAGE_TYPE,
      { receivedType: type }
    ),

  missingField: (field: string, details?: unknown) =>
    new ProtocolError(
      `Missing required field: ${field}`,
      ProtocolErrorCode.MISSING_REQUIRED_FIELD,
      details
    ),

  invalidPayload: (message: string, details?: unknown) =>
    new ProtocolError(
      message,
      ProtocolErrorCode.INVALID_PAYLOAD,
      details
    )
};

/**
 * Factory methods for transport errors
 */
export const createTransportError = {
  connectionFailed: (message: string, details?: unknown) =>
    new TransportError(message, TransportErrorCode.CONNECTION_FAILED, details),

  notConnected: (message: string, details?: unknown) =>
    new TransportError(message, TransportErrorCode.NOT_CONNECTED, details),

  sendFailed: (message: string, details?: unknown) =>
    new TransportError(message, TransportErrorCode.SEND_FAILED, details),

  protocolError: (message: string, details?: unknown) =>
    new TransportError(message, TransportErrorCode.PROTOCOL_ERROR, details),

  timeout: (message: string, details?: unknown) =>
    new TransportError(message, TransportErrorCode.TIMEOUT, details),

  error: (message: string, details?: unknown) =>
    new TransportError(message, TransportErrorCode.TRANSPORT_ERROR, details),
    
  invalidMessage: (message: string, details?: unknown) =>
    new TransportError(message, TransportErrorCode.INVALID_MESSAGE, details)
};

/**
 * Type guard for ProtocolError
 */
export const isProtocolError = (error: unknown): error is ProtocolError =>
  error instanceof ProtocolError;

/**
 * Type guard for TransportError
 */
export const isTransportError = (error: unknown): error is TransportError =>
  error instanceof TransportError;