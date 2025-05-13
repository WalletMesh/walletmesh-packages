import { JSONRPCError } from '@walletmesh/jsonrpc';

/**
 * Enum of available Aztec Wallet RPC error types.
 * @public
 */
export const AztecWalletErrorType = {
  unknownInternalError: 'unknownInternalError',
  refused: 'refused',
  walletNotConnected: 'walletNotConnected',
  contractInstanceNotRegistered: 'contractInstanceNotRegistered',
  contractClassNotRegistered: 'contractClassNotRegistered',
  senderNotRegistered: 'senderNotRegistered',
  invalidResponse: 'invalidResponse',
  notConnected: 'notConnected',
  chainNotSupported: 'chainNotSupported',
  invalidRequest: 'invalidRequest',
  invalidParams: 'invalidParams',
  permissionDenied: 'permissionDenied',
  sessionNotFound: 'sessionNotFound',
  sessionExpired: 'sessionExpired',
  transactionNotFound: 'transactionNotFound',
  blockNotFound: 'blockNotFound',
  authWitnessNotFound: 'authWitnessNotFound',
} as const;

/**
 * Type representing valid Aztec Wallet RPC error types.
 * @public
 * @typeParam AztecWalletErrorType - String literal union of error type values
 */
export type AztecWalletErrorType = (typeof AztecWalletErrorType)[keyof typeof AztecWalletErrorType];

/**
 * Map of error codes and messages for Aztec Wallet RPC errors.
 * @public
 */
export const AztecWalletErrorMap: Record<AztecWalletErrorType, { code: number; message: string }> = {
  unknownInternalError: { code: -32000, message: 'Unknown internal error' },
  refused: { code: -32001, message: 'User refused transaction' },
  walletNotConnected: { code: -32002, message: 'Wallet not connected' },
  contractInstanceNotRegistered: { code: -32003, message: 'Contract instance not registered' },
  contractClassNotRegistered: { code: -32004, message: 'Contract class not registered' },
  senderNotRegistered: { code: -32005, message: 'Sender not registered' },
  invalidResponse: { code: -32006, message: 'Invalid response format' },
  notConnected: { code: -32007, message: 'Not connected to any chain' },
  chainNotSupported: { code: -32008, message: 'Chain not supported' },
  invalidRequest: { code: -32009, message: 'Invalid request format' },
  invalidParams: { code: -32010, message: 'Invalid parameters' },
  permissionDenied: { code: -32011, message: 'Permission denied' },
  sessionNotFound: { code: -32012, message: 'Session not found' },
  sessionExpired: { code: -32013, message: 'Session expired' },
  transactionNotFound: { code: -32014, message: 'Transaction not found' },
  blockNotFound: { code: -32015, message: 'Block not found' },
  authWitnessNotFound: { code: -32016, message: 'Authorization witness not found' },
};

/**
 * Custom error class for Aztec Wallet RPC errors.
 * @public
 */
export class AztecWalletError extends JSONRPCError {
  /**
   * Creates a new AztecWalletError.
   * @param err - The error type from AztecWalletErrorMap
   * @param data - Optional additional error data
   */
  constructor(err: AztecWalletErrorType, data?: string) {
    super(AztecWalletErrorMap[err].code, AztecWalletErrorMap[err].message, data);
  }
}
