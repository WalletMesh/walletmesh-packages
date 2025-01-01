import type {
  JSONRPCMethodMap,
  JSONRPCContext,
  JSONRPCRequest,
  JSONRPCResponse,
  MethodResponse,
} from './types.js';
import { JSONRPCError } from './error.js';
import { MessageValidator } from './message-validator.js';
import type { MethodManager } from './method-manager.js';
import { ParameterSerializer } from './parameter-serializer.js';

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
  private serializer: ParameterSerializer;

  constructor(private methodManager: MethodManager<T, C>) {
    this.validator = new MessageValidator();
    this.serializer = new ParameterSerializer();
  }

  /**
   * Processes a JSON-RPC request and returns a response.
   * Performs the following steps:
   * 1. Validates request structure
   * 2. Looks up and validates method
   * 3. Deserializes parameters if needed
   * 4. Executes method handler
   * 5. Serializes result if needed
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

    // Get method or fallback handler
    const method = this.methodManager.getMethod(request.method);
    let methodResponse: MethodResponse<unknown>;

    if (method) {
      // Process and validate params for registered method
      const serializer = this.methodManager.getSerializer(request.method);
      const methodParams = this.serializer.deserializeParams<T[keyof T]['params'], T[keyof T]['result']>(
        String(request.method),
        request.params,
        serializer,
      );
      methodResponse = await method(context, request.method, methodParams as T[keyof T]['params']);
    } else {
      // Try fallback handler
      const fallback = this.methodManager.getFallbackHandler();
      if (fallback) {
        methodResponse = await fallback(context, request.method, request.params);
      } else {
        throw new JSONRPCError(-32601, 'Method not found', request.method);
      }
    }

    if (!methodResponse.success) {
      throw new JSONRPCError(
        methodResponse.error.code,
        methodResponse.error.message,
        methodResponse.error.data,
      );
    }

    // Serialize result if needed
    const serializer = this.methodManager.getSerializer(request.method);
    const serializedResult = this.serializer.serializeResult<T[keyof T]['params'], T[keyof T]['result']>(
      String(request.method),
      methodResponse.data,
      serializer,
    );

    // Return JSON-RPC response
    return {
      jsonrpc: '2.0' as const,
      result: serializedResult,
      id: request.id,
    };
  }
}
