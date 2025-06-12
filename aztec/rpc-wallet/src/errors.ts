/**
 * @module @walletmesh/aztec-rpc-wallet/errors
 *
 * This module defines custom error types and codes specific to the Aztec RPC Wallet.
 * It provides a structured way to represent errors that can occur during
 * interactions with the Aztec wallet, aligning with JSON-RPC error standards
 * while offering more specific error information.
 */

import { JSONRPCError } from '@walletmesh/jsonrpc';

/**
 * An object acting as an enum for specific Aztec Wallet RPC error types.
 * Each key represents a distinct error condition that can occur within the Aztec wallet system.
 * These keys are used to look up corresponding error codes and messages in {@link AztecWalletErrorMap}.
 *
 * @public
 * @readonly
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
 * A type alias representing the string literal union of all valid keys from {@link AztecWalletErrorType}.
 * This provides type safety when referring to specific Aztec wallet error types.
 *
 * @public
 */
export type AztecWalletErrorType = (typeof AztecWalletErrorType)[keyof typeof AztecWalletErrorType];

/**
 * A map associating each {@link AztecWalletErrorType} with a specific JSON-RPC error code
 * and a human-readable message. This map is used by the {@link AztecWalletError} class
 * to construct standardized error objects.
 *
 * The error codes are chosen from the range typically reserved for server-defined errors
 * in JSON-RPC (e.g., -32000 to -32099).
 *
 * @public
 * @readonly
 */
export const AztecWalletErrorMap: Record<AztecWalletErrorType, { code: number; message: string }> = {
  unknownInternalError: { code: -32000, message: 'Unknown internal error' },
  refused: { code: -32001, message: 'User refused transaction' }, // Or request
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
 * Custom error class for representing errors specific to the Aztec RPC Wallet.
 * It extends the base {@link JSONRPCError} from `@walletmesh/jsonrpc` and uses
 * predefined error types and messages from {@link AztecWalletErrorMap}.
 *
 * This class allows for consistent error handling and reporting within the
 * Aztec wallet system, providing both a standard JSON-RPC error code and
 * a more specific Aztec error type.
 *
 * @public
 * @example
 * ```typescript
 * if (!isConnected) {
 *   throw new AztecWalletError('walletNotConnected', 'Attempted to call method while disconnected.');
 * }
 * ```
 */
export class AztecWalletError extends JSONRPCError {
  /**
   * The specific Aztec wallet error type.
   */
  public readonly aztecErrorType: AztecWalletErrorType;

  /**
   * Creates a new `AztecWalletError` instance.
   *
   * @param errorType - The specific {@link AztecWalletErrorType} identifying the error.
   *                    This key is used to look up the code and message from {@link AztecWalletErrorMap}.
   * @param data - Optional additional data associated with the error. This can be a string
   *               or a record, providing more context. It will be included in the `data`
   *               field of the JSON-RPC error object.
   */
  constructor(errorType: AztecWalletErrorType, data?: string | Record<string, unknown>) {
    const errorDetails = AztecWalletErrorMap[errorType];
    super(errorDetails.code, errorDetails.message, data);
    this.aztecErrorType = errorType;
    // Ensure the name property is set to the class name
    this.name = 'AztecWalletError';
  }
}
