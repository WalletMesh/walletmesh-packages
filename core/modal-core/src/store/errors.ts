/**
 * @packageDocumentation
 * Store-specific error types and handling
 */

/**
 * Store error codes for consistent error identification
 */
export enum StoreErrorCode {
  /** Invalid session ID provided */
  INVALID_SESSION_ID = 'invalid_session_id',
  /** Invalid or incomplete session data */
  INVALID_SESSION_DATA = 'invalid_session_data',
  /** Store initialization failed */
  INITIALIZATION_FAILED = 'initialization_failed',
  /** Store instance required but not provided */
  STORE_REQUIRED = 'store_required',
  /** Storage operation failed */
  STORAGE_ERROR = 'storage_error',
}

/**
 * Store-specific error with error code and optional details
 */
export class StoreError extends Error {
  constructor(
    message: string,
    public readonly code: StoreErrorCode,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'StoreError';
  }

  override toString(): string {
    const details = this.details ? `: ${JSON.stringify(this.details)}` : '';
    return `${this.name}[${this.code}]: ${this.message}${details}`;
  }
}

/**
 * Factory methods for common store errors
 */
export const createStoreError = {
  invalidSessionId: (id: string, details?: unknown) =>
    new StoreError(`Invalid session ID: ${id}`, StoreErrorCode.INVALID_SESSION_ID, details),

  invalidSessionData: (message: string, details?: unknown) =>
    new StoreError(message, StoreErrorCode.INVALID_SESSION_DATA, details),

  initializationFailed: (message: string, details?: unknown) =>
    new StoreError(message, StoreErrorCode.INITIALIZATION_FAILED, details),

  storeRequired: (message = 'Store instance is required', details?: unknown) =>
    new StoreError(message, StoreErrorCode.STORE_REQUIRED, details),

  storageError: (message: string, details?: unknown) =>
    new StoreError(message, StoreErrorCode.STORAGE_ERROR, details),
};

/**
 * Type guard for StoreError
 */
export const isStoreError = (error: unknown): error is StoreError => error instanceof StoreError;
