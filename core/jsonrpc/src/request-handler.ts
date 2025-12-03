import { JSONRPCError } from './error.js';
import { MessageValidator } from './message-validator.js';
import type { MethodManager } from './method-manager.js';
import type { MiddlewareManager } from './middleware-manager.js';
import type { JSONRPCContext, JSONRPCMethodMap, JSONRPCRequest, JSONRPCResponse } from './types.js';

/**
 * Handles processing and validation of JSON-RPC requests.
 * This class coordinates the validation, parameter serialization, method execution,
 * and response formatting for JSON-RPC method calls.
 *
 * @typeParam T - Method map defining available RPC methods
 * @typeParam C - Context type shared between method handlers
 *
 * @example
 * ```typescript
 * const handler = new RequestHandler(methodManager);
 *
 * // Process a request
 * const response = await handler.handleRequest(
 *   { userId: '123' }, // context
 *   {
 *     jsonrpc: '2.0',
 *     method: 'add',
 *     params: { a: 1, b: 2 },
 *     id: 'req-1'
 *   }
 * );
 * ```
 */
export class RequestHandler<T extends JSONRPCMethodMap, C extends JSONRPCContext> {
  private validator: MessageValidator;

  constructor(
    private methodManager: MethodManager<T, C>,
    private postDeserializationMiddlewareManager: MiddlewareManager<T, C>,
  ) {
    this.validator = new MessageValidator();
  }

  /**
   * Processes a JSON-RPC request and returns a response.
   * Performs the following steps:
   * 1. Validates request structure
   * 2. Deserializes parameters
   * 3. Runs post-deserialization middleware chain
   * 4. Executes method handler (via middleware)
   * 5. Serializes result
   * 6. Formats and returns JSON-RPC response
   *
   * @param context - Context object passed to method handlers
   * @param request - The JSON-RPC request to process
   * @returns Promise resolving to the JSON-RPC response
   * @throws {JSONRPCError} If request is invalid (-32600)
   * @throws {JSONRPCError} If method not found (-32601)
   * @throws {JSONRPCError} If parameters invalid (-32602)
   * @throws {JSONRPCError} If method execution fails (various codes)
   *
   * @example
   * ```typescript
   * try {
   *   const response = await handler.handleRequest(
   *     { userId: '123' },
   *     {
   *       jsonrpc: '2.0',
   *       method: 'add',
   *       params: { a: 1, b: 2 },
   *       id: 'req-1'
   *     }
   *   );
   *   console.log('Result:', response.result);
   * } catch (error) {
   *   if (error instanceof JSONRPCError) {
   *     console.error(`RPC Error ${error.code}: ${error.message}`);
   *   }
   * }
   * ```
   */
  public async handleRequest(context: C, request: JSONRPCRequest<T, keyof T>): Promise<JSONRPCResponse<T>> {
    // Validate request structure
    if (!this.validator.isValidRequest(request)) {
      throw new JSONRPCError(-32600, 'Invalid Request', 'Invalid request format');
    }

    // Deserialize params BEFORE post-deserialization middleware runs
    const deserializedParams = await this.methodManager.deserializeParams(request.method, request.params);

    // Update request with deserialized params so post-deserialization middleware sees typed params
    const deserializedRequest = {
      ...request,
      params: deserializedParams,
    } as JSONRPCRequest<T, keyof T>;

    // Execute post-deserialization middleware chain
    // The final handler in this chain calls the method handler and converts MethodResponse to JSONRPCResponse
    const response = await this.postDeserializationMiddlewareManager.execute(context, deserializedRequest);

    // Serialize result if needed
    const serializedResult = await this.methodManager.serializeResult(request.method, response.result);

    // Return JSON-RPC response with serialized result
    return {
      jsonrpc: '2.0' as const,
      result: serializedResult,
      id: response.id,
    };
  }
}
