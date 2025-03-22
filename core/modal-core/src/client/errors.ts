/**
 * @packageDocumentation
 * Client-specific error types and handling
 */

/**
 * Client error codes for consistent error identification
 */
export enum ClientErrorCode {
  /** Origin validation failed */
  ORIGIN_MISMATCH = 'origin_mismatch',
  /** Session initialization failed */
  INIT_FAILED = 'init_failed',
  /** Session restoration failed */
  RESTORE_FAILED = 'restore_failed',
  /** Connection state error */
  CONNECTION_ERROR = 'connection_error',
  /** Wallet connection failed */
  CONNECT_FAILED = 'connect_failed',
  /** Wallet disconnection failed */
  DISCONNECT_FAILED = 'disconnect_failed',
  /** Factory creation failed */
  FACTORY_ERROR = 'factory_error',
  /** Client operation failed */
  CLIENT_ERROR = 'client_error',
}

/**
 * Client-specific error with error code and optional details
 */
export class ClientError extends Error {
  constructor(
    message: string,
    public readonly code: ClientErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ClientError';
  }

  override toString(): string {
    const details = this.details ? `: ${JSON.stringify(this.details)}` : '';
    return `${this.name}[${this.code}]: ${this.message}${details}`;
  }
}

/**
 * Factory methods for common client errors
 */
export const createClientError = {
  originMismatch: (expected: string, actual: string, details?: unknown) =>
    new ClientError(
      `Origin mismatch: DApp info specifies '${expected}' but is being served from '${actual}'`,
      ClientErrorCode.ORIGIN_MISMATCH,
      details,
    ),

  initFailed: (message = 'Failed to initialize session manager', details?: unknown) =>
    new ClientError(message, ClientErrorCode.INIT_FAILED, details),

  restoreFailed: (message = 'Failed to restore sessions', details?: unknown) =>
    new ClientError(message, ClientErrorCode.RESTORE_FAILED, details),

  connectionError: (message = 'Not connected', details?: unknown) =>
    new ClientError(message, ClientErrorCode.CONNECTION_ERROR, details),

  connectFailed: (message = 'Failed to connect wallet', details?: unknown) =>
    new ClientError(message, ClientErrorCode.CONNECT_FAILED, details),

  disconnectFailed: (message = 'Failed to disconnect wallet', details?: unknown) =>
    new ClientError(message, ClientErrorCode.DISCONNECT_FAILED, details),

  factoryError: (message: string, details?: unknown) =>
    new ClientError(message, ClientErrorCode.FACTORY_ERROR, details),

  error: (message: string, details?: unknown) =>
    new ClientError(message, ClientErrorCode.CLIENT_ERROR, details),
};

/**
 * Type guard for ClientError
 */
export const isClientError = (error: unknown): error is ClientError => error instanceof ClientError;
