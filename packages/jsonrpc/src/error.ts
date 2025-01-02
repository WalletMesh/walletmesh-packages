import type { JSONRPCErrorInterface, JSONRPCID } from './types.js';

/**
 * JSON-RPC Error class that implements the JSON-RPC 2.0 error object specification.
 * Provides structured error handling with standard error codes and optional additional data.
 *
 * Standard error codes (as per JSON-RPC 2.0 spec):
 * - Parse error (-32700): Invalid JSON received by the server
 *   - Used when the JSON string cannot be parsed
 *   - Example: Malformed JSON syntax
 *
 * - Invalid Request (-32600): The JSON sent is not a valid Request object
 *   - Used when the request structure is invalid
 *   - Example: Missing required fields, wrong version
 *
 * - Method not found (-32601): The requested method does not exist or is unavailable
 *   - Used when the method name is not registered
 *   - Example: Calling an unregistered method
 *
 * - Invalid params (-32602): Method parameters are invalid
 *   - Used when parameters don't match the method's expectations
 *   - Example: Wrong types, missing required params
 *
 * - Internal error (-32603): Internal JSON-RPC error
 *   - Used for unexpected server conditions
 *   - Example: Database connection failure
 *
 * - Server error (-32000 to -32099): Reserved for implementation-defined server errors
 *   - TimeoutError uses -32000 (see TimeoutError class)
 *   - Other codes in this range can be used for custom server errors
 *   - Example: Rate limiting, validation errors
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
 *
 * // Error handling pattern
 * try {
 *   const result = await validateAndProcess(request);
 *   return { success: true, data: result };
 * } catch (error) {
 *   if (error instanceof JSONRPCError) {
 *     throw error; // Re-throw JSON-RPC errors
 *   }
 *   // Wrap other errors as Internal error
 *   throw new JSONRPCError(
 *     -32603,
 *     'Internal error',
 *     error instanceof Error ? error.message : 'Unknown error'
 *   );
 * }
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
   * @throws {TypeError} If code is not a number or message is not a string
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
 * Uses the first server error code (-32000) to indicate timeout conditions while
 * staying within the JSON-RPC 2.0 specification's error code ranges.
 *
 * Common timeout scenarios:
 * - Network latency causing slow responses
 * - Long-running operations that exceed timeout
 * - Lost or dropped connections
 * - Remote node unresponsive
 *
 * @example
 * ```typescript
 * // Setting timeouts on method calls
 * try {
 *   // Call method with 5 second timeout
 *   const result = await peer.callMethod('slowMethod', params, 5);
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.error(`Request ${error.id} timed out`);
 *     // Handle timeout (retry, fallback, etc.)
 *   }
 * }
 *
 * // Implementing timeouts in method handlers
 * peer.registerMethod('longOperation', async (context, params) => {
 *   const timeoutMs = 5000;
 *   try {
 *     const result = await Promise.race([
 *       performOperation(params),
 *       new Promise((_, reject) =>
 *         setTimeout(() => reject(new TimeoutError('Operation timed out')), timeoutMs)
 *       )
 *     ]);
 *     return { success: true, data: result };
 *   } catch (error) {
 *     if (error instanceof TimeoutError) {
 *       throw error;
 *     }
 *     throw new JSONRPCError(-32603, 'Operation failed');
 *   }
 * });
 * ```
 */
export class TimeoutError extends JSONRPCError {
  override name = 'TimeoutError';

  /**
   * Creates a new TimeoutError instance.
   *
   * @param message - A message describing the timeout (e.g., "Request timed out after 5 seconds")
   * @param id - The ID of the request that timed out (used for correlation with the original request)
   * @throws {TypeError} If message is not a string
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
