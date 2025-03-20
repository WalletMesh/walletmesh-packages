/**
 * @packageDocumentation
 * Error types for WalletMesh client module.
 */

export interface WalletError extends Error {
  code: string | undefined;
  details?: unknown;
}

/**
 * Create a WalletError instance.
 */
export function createWalletError(message: string, code?: string, details?: unknown): WalletError {
  const error = new Error(message) as WalletError;
  error.code = code;
  error.details = details;
  error.name = 'WalletError';
  return error;
}