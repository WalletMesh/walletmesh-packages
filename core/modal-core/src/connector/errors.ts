/**
 * @packageDocumentation
 * Connector-specific error types and handling
 */

/**
 * Connector error codes for consistent error identification
 */
export enum ConnectorErrorCode {
  /** Invalid connector type specified */
  INVALID_TYPE = 'invalid_type',
  /** Invalid configuration provided */
  INVALID_CONFIG = 'invalid_config',
  /** Invalid connector creator function */
  INVALID_CREATOR = 'invalid_creator',
  /** Connector type not registered */
  NOT_REGISTERED = 'not_registered',
  /** Connection creation failed */
  CONNECTION_FAILED = 'connection_failed',
  /** Connection validation failed */
  VALIDATION_FAILED = 'validation_failed',
  /** Operation failed due to disconnect state */
  NOT_CONNECTED = 'not_connected',
  /** General connector error */
  CONNECTOR_ERROR = 'connector_error',
}

/**
 * Connector-specific error with error code and optional details
 */
export class ConnectorError extends Error {
  constructor(
    message: string,
    public readonly code: ConnectorErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ConnectorError';
  }

  override toString(): string {
    const details = this.details ? `: ${JSON.stringify(this.details)}` : '';
    return `${this.name}[${this.code}]: ${this.message}${details}`;
  }
}

/**
 * Factory methods for common connector errors
 */
export const createConnectorError = {
  invalidType: (type: string, details?: unknown) =>
    new ConnectorError(`Invalid connector type: ${type}`, ConnectorErrorCode.INVALID_TYPE, details),

  invalidConfig: (message: string, details?: unknown) =>
    new ConnectorError(message, ConnectorErrorCode.INVALID_CONFIG, details),

  invalidCreator: (message = 'Creator must be a function', details?: unknown) =>
    new ConnectorError(message, ConnectorErrorCode.INVALID_CREATOR, details),

  notRegistered: (type: string, details?: unknown) =>
    new ConnectorError(
      `No connector registered for type: ${type}`,
      ConnectorErrorCode.NOT_REGISTERED,
      details,
    ),

  connectionFailed: (message: string, details?: unknown) =>
    new ConnectorError(message, ConnectorErrorCode.CONNECTION_FAILED, details),

  validationFailed: (message: string, details?: unknown) =>
    new ConnectorError(message, ConnectorErrorCode.VALIDATION_FAILED, details),

  notConnected: (message = 'Operation requires connection', details?: unknown) =>
    new ConnectorError(message, ConnectorErrorCode.NOT_CONNECTED, details),

  error: (message: string, details?: unknown) =>
    new ConnectorError(message, ConnectorErrorCode.CONNECTOR_ERROR, details),
};

/**
 * Type guard for ConnectorError
 */
export const isConnectorError = (error: unknown): error is ConnectorError => error instanceof ConnectorError;
