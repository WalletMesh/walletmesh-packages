export enum WalletMeshErrorCode {
  // User errors
  USER_REJECTED = 'USER_REJECTED',
  USER_CANCELLED = 'USER_CANCELLED',

  // Connection errors
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
  NOT_CONNECTED = 'NOT_CONNECTED',

  // Chain errors
  CHAIN_MISMATCH = 'CHAIN_MISMATCH',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  CHAIN_SWITCH_FAILED = 'CHAIN_SWITCH_FAILED',

  // Wallet errors
  WALLET_NOT_FOUND = 'WALLET_NOT_FOUND',
  WALLET_NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  WALLET_LOCKED = 'WALLET_LOCKED',

  // Transaction errors
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  GAS_ESTIMATION_FAILED = 'GAS_ESTIMATION_FAILED',

  // Provider errors
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  PROVIDER_ERROR = 'PROVIDER_ERROR',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INVALID_PARAMS = 'INVALID_PARAMS',
  METHOD_NOT_SUPPORTED = 'METHOD_NOT_SUPPORTED',
}

export interface WalletMeshError extends Error {
  code: WalletMeshErrorCode;
  message: string;
  details?: unknown;
  originalError?: Error | undefined;
}

export class WalletMeshErrorImpl extends Error implements WalletMeshError {
  code: WalletMeshErrorCode;
  details?: unknown;
  originalError?: Error | undefined;

  constructor(
    code: WalletMeshErrorCode,
    message: string,
    details?: unknown,
    originalError?: Error | undefined,
  ) {
    super(message);
    this.name = 'WalletMeshError';
    this.code = code;
    this.details = details;
    this.originalError = originalError;
  }
}

// Helper to create typed errors
export function createWalletMeshError(
  code: WalletMeshErrorCode,
  message: string,
  details?: unknown,
  originalError?: Error | undefined,
): WalletMeshError {
  return new WalletMeshErrorImpl(code, message, details, originalError);
}

// Common error factories
export const WalletMeshErrors = {
  userRejected: (details?: unknown) =>
    createWalletMeshError(WalletMeshErrorCode.USER_REJECTED, 'User rejected the request', details),

  connectionFailed: (reason: string, details?: unknown) =>
    createWalletMeshError(WalletMeshErrorCode.CONNECTION_FAILED, `Connection failed: ${reason}`, details),

  chainMismatch: (expected: string, actual: string) =>
    createWalletMeshError(
      WalletMeshErrorCode.CHAIN_MISMATCH,
      `Chain mismatch: expected ${expected}, got ${actual}`,
      { expected, actual },
    ),

  walletNotFound: (walletId: string) =>
    createWalletMeshError(WalletMeshErrorCode.WALLET_NOT_FOUND, `Wallet not found: ${walletId}`, {
      walletId,
    }),

  walletNotInstalled: (walletName: string) =>
    createWalletMeshError(WalletMeshErrorCode.WALLET_NOT_INSTALLED, `${walletName} is not installed`, {
      walletName,
    }),

  insufficientFunds: (required: string, available: string) =>
    createWalletMeshError(
      WalletMeshErrorCode.INSUFFICIENT_FUNDS,
      `Insufficient funds: required ${required}, available ${available}`,
      { required, available },
    ),

  transactionFailed: (reason: string, txHash?: string) =>
    createWalletMeshError(WalletMeshErrorCode.TRANSACTION_FAILED, `Transaction failed: ${reason}`, {
      reason,
      txHash,
    }),

  notConnected: () => createWalletMeshError(WalletMeshErrorCode.NOT_CONNECTED, 'No wallet connected'),

  providerNotFound: () =>
    createWalletMeshError(WalletMeshErrorCode.PROVIDER_NOT_FOUND, 'No provider available'),
} as const;

// Type guard for WalletMeshError
export function isWalletMeshError(error: unknown): error is WalletMeshError {
  return (
    error instanceof Error &&
    'code' in error &&
    Object.values(WalletMeshErrorCode).includes((error as WalletMeshError).code)
  );
}

// Helper to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (isWalletMeshError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}

// Helper to check if error is recoverable
export function isRecoverableError(error: unknown): boolean {
  if (!isWalletMeshError(error)) {
    return false;
  }

  const recoverableErrors = [
    WalletMeshErrorCode.CONNECTION_TIMEOUT,
    WalletMeshErrorCode.CHAIN_MISMATCH,
    WalletMeshErrorCode.WALLET_LOCKED,
    WalletMeshErrorCode.GAS_ESTIMATION_FAILED,
  ];

  return recoverableErrors.includes(error.code);
}
