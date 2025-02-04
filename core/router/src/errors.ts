import { JSONRPCError } from '@walletmesh/jsonrpc';

/**
 * Error codes and messages for the multi-chain router
 */
export const RouterErrorMap = {
  unknownChain: { code: -32000, message: 'Unknown chain ID' },
  invalidSession: { code: -32001, message: 'Invalid or expired session' },
  insufficientPermissions: { code: -32002, message: 'Insufficient permissions for method' },
  methodNotSupported: { code: -32003, message: 'Method not supported by chain' },
  walletNotAvailable: { code: -32004, message: 'Wallet service not available' },
  partialFailure: { code: -32005, message: 'Partial failure' },
  invalidRequest: { code: -32006, message: 'Invalid request parameters' },
  unknownError: { code: -32603, message: 'Internal error' },
} as const;

/**
 * Custom error class for router errors
 */
export class RouterError extends JSONRPCError {
  override name = 'RouterError';

  /**
   * Creates a new RouterError.
   * @param err - The error type from RouterErrorMap
   * @param data - Optional additional error data
   */
  constructor(err: keyof typeof RouterErrorMap, data?: string | Record<string, unknown>) {
    super(RouterErrorMap[err].code, RouterErrorMap[err].message, data);
  }
}
