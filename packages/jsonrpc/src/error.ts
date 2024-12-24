import type { JSONRPCErrorInterface, JSONRPCID } from './types.js';

/**
 * JSON-RPC Error class that implements the JSON-RPC 2.0 error object specification.
 *
 * Standard error codes:
 * - Parse error (-32700): Invalid JSON was received
 * - Invalid Request (-32600): The JSON sent is not a valid Request object
 * - Method not found (-32601): The method does not exist / is not available
 * - Invalid params (-32602): Invalid method parameter(s)
 * - Internal error (-32603): Internal JSON-RPC error
 * - Server error (-32000 to -32099): Implementation-defined server errors
 *
 * @example
 * ```typescript
 * // Basic error
 * throw new JSONRPCError(-32600, 'Invalid Request');
 *
 * // Error with additional data
 * throw new JSONRPCError(
 *   -32602,
 *   'Invalid parameters',
 *   { expected: ['username', 'password'], received: ['username'] }
 * );
 * ```
 */
export class JSONRPCError extends Error implements JSONRPCErrorInterface {
  override name = 'JSONRPCError';

  /**
   * Creates a new JSONRPCError instance.
   *
   * @param code - The error code (should follow JSON-RPC 2.0 error codes)
   * @param message - A short, human-readable error message
   * @param data - Optional additional error data for debugging or client handling
   *
   * @example
   * ```typescript
   * // Method handler with error handling
   * peer.registerMethod('divide', (context, { a, b }) => {
   *   if (b === 0) {
   *     throw new JSONRPCError(
   *       -32602,
   *       'Division by zero',
   *       { method: 'divide', params: { a, b } }
   *     );
   *   }
   *   return a / b;
   * });
   * ```
   */
  constructor(
    public code: number,
    message: string,
    public data?: string | Record<string, unknown>,
  ) {
    super(message);
  }

  override toString(): string {
    const msg = `${this.name}(${this.code}): ${this.message}`;
    if (this.data !== undefined) {
      if (typeof this.data === 'string') {
        return `${msg}, Data: ${this.data}`;
      }
      return `${msg}, Data: ${JSON.stringify(this.data)}`;
    }
    return msg;
  }
}

/**
 * Specialized error class for JSON-RPC request timeouts.
 * Extends JSONRPCError with a fixed error code (-32000) and includes the request ID.
 *
 * @example
 * ```typescript
 * try {
 *   // Call method with 5 second timeout
 *   const result = await peer.callMethod('slowMethod', params, 5);
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.error(`Request ${error.id} timed out`);
 *   }
 * }
 * ```
 */
export class TimeoutError extends JSONRPCError {
  override name = 'TimeoutError';

  /**
   * Creates a new TimeoutError instance.
   *
   * @param message - A message describing the timeout
   * @param id - The ID of the request that timed out
   *
   * @example
   * ```typescript
   * // Inside JSONRPCPeer implementation
   * if (timeoutInSeconds > 0) {
   *   timer = setTimeout(() => {
   *     this.pendingRequests.delete(id);
   *     reject(new TimeoutError('Request timed out', id));
   *   }, timeoutInSeconds * 1000);
   * }
   * ```
   */
  constructor(
    message: string,
    public id: JSONRPCID,
  ) {
    super(-32000, message);
  }
}
