/**
 * @packageDocumentation
 * Error classes for WalletMesh
 */

/**
 * Base wallet error class
 */
export class WalletError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

/**
 * Error codes
 */
export enum ErrorCode {
  STORAGE = 'storage',
  CONNECTION = 'connection',
  PROVIDER = 'provider',
  INVALID_STATE = 'invalid_state',
}
