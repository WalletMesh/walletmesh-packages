import { JSONRPCError, TimeoutError } from './error.js';
import type {
  JSONRPCMethodMap,
  JSONRPCSerializer,
  JSONRPCContext,
  JSONRPCID,
  JSONRPCSerializedData,
  MethodHandler,
  FallbackMethodHandler,
} from './types.js';

/**
 * Internal interface representing a pending request waiting for a response.
 *
 * @typeParam R - The expected result type
 */
interface PendingRequest<R> {
  /** Function to resolve the promise with the result */
  resolve: (value: R) => void;
  /** Function to reject the promise with an error */
  reject: (reason: unknown) => void;
  /** Optional timeout ID for request cancellation */
  timeoutId: NodeJS.Timeout | undefined;
  /** Optional serializer for the response */
  serializer: JSONRPCSerializer<unknown, R> | undefined;
}

/**
 * Manages JSON-RPC method registration, execution, and response handling.
 * Provides support for method serialization, timeouts, and error handling.
 *
 * @typeParam T - Method map defining available RPC methods
 * @typeParam C - Context type shared between handlers
 *
 * @example
 * ```typescript
 * // Define method types
 * type MethodMap = {
 *   add: {
 *     params: { a: number; b: number };
 *     result: number;
 *   };
 *   getUser: {
 *     params: { id: string };
 *     result: User;
 *     serializer?: JSONRPCSerializer<{ id: string }, User>;
 *   };
 * };
 *
 * // Create manager instance
 * const methods = new MethodManager<MethodMap, Context>();
 *
 * // Register methods
 * methods.registerMethod('add', async (context, params) => {
 *   return {
 *     success: true,
 *     data: params.a + params.b
 *   };
 * });
 * ```
 */
export class MethodManager<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private methods = new Map<keyof T, unknown>();
  private serializers = new Map<keyof T, JSONRPCSerializer<unknown, unknown>>();
  private pendingRequests = new Map<JSONRPCID, PendingRequest<T[keyof T]['result']>>();
  private fallbackHandler?: FallbackMethodHandler<C>;

  /**
   * Registers a fallback handler for unregistered methods.
   * The fallback handler will be called when a method is not found.
   *
   * @param handler - The fallback handler implementation
   *
   * @example
   * ```typescript
   * methods.setFallbackHandler(async (context, method, params) => {
   *   console.log(`Unknown method called: ${method}`);
   *   return {
   *     success: false,
   *     error: {
   *       code: -32601,
   *       message: `Method ${method} is not supported`,
   *       data: { availableMethods: Array.from(methods.keys()) }
   *     }
   *   };
   * });
   * ```
   */
  setFallbackHandler(handler: FallbackMethodHandler<C>): void {
    this.fallbackHandler = handler;
  }

  /**
   * Gets the registered fallback handler if one exists.
   *
   * @returns The fallback handler if registered, undefined otherwise
   */
  getFallbackHandler(): FallbackMethodHandler<C> | undefined {
    return this.fallbackHandler;
  }

  /**
   * Registers a method handler with optional serialization support.
   *
   * @param name - The name of the method to register
   * @param handler - The function that implements the method
   * @param serializer - Optional serializer for complex parameter/result types
   *
   * @example
   * ```typescript
   * // Simple method
   * methods.registerMethod('add', (context, { a, b }) => ({
   *   success: true,
   *   data: a + b
   * }));
   *
   * // Method with serialization
   * methods.registerMethod(
   *   'getUser',
   *   async (context, { id }) => {
   *     const user = await db.users.findById(id);
   *     return { success: true, data: user };
   *   },
   *   userSerializer
   * );
   * ```
   */
  registerMethod<M extends keyof T>(name: M, handler: MethodHandler<T, M, C>): void {
    this.methods.set(name, handler as unknown);
  }

  /**
   * Registers a serializer for parameters and results.
   *
   * @param name - The name to register the serializer under
   * @param serializer - The serializer implementation
   *
   * @example
   * ```typescript
   * // Register Date serializer
   * methods.registerSerializer('processDate', {
   *   params: {
   *     serialize: date => ({ serialized: date.toISOString() }),
   *     deserialize: data => new Date(data.serialized)
   *   },
   *   result: {
   *     serialize: date => ({ serialized: date.toISOString() }),
   *     deserialize: data => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  registerSerializer<M extends keyof T>(
    name: M,
    serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.serializers.set(name, serializer as JSONRPCSerializer<unknown, unknown>);
  }

  /**
   * Gets a registered method by name.
   *
   * @param name - The name of the method to retrieve
   * @returns The registered method if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const method = methods.getMethod('add');
   * if (method) {
   *   console.log('Method found');
   * }
   * ```
   */
  getMethod<M extends keyof T>(name: M): MethodHandler<T, M, C> | undefined {
    const handler = this.methods.get(name) as MethodHandler<T, M, C> | undefined;
    return handler;
  }

  /**
   * Gets a registered serializer by name.
   *
   * @param name - The name of the serializer to retrieve
   * @returns The registered serializer if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const serializer = methods.getSerializer('processDate');
   * if (serializer) {
   *   console.log('Serializer found');
   * }
   * ```
   */
  getSerializer<M extends keyof T>(name: M): JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined {
    return this.serializers.get(name) as JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined;
  }

  /**
   * Adds a pending request waiting for a response.
   * Handles timeout setup and cleanup for the request.
   *
   * @param id - The unique identifier for the request
   * @param resolve - Function to resolve the request promise
   * @param reject - Function to reject the request promise
   * @param timeoutInSeconds - Optional timeout duration (0 means no timeout)
   * @param serializer - Optional serializer for the response
   *
   * @example
   * ```typescript
   * // Add request with 5 second timeout
   * methods.addPendingRequest(
   *   'req-123',
   *   result => console.log('Success:', result),
   *   error => console.error('Failed:', error),
   *   5,
   *   dateSerializer
   * );
   * ```
   */
  addPendingRequest<N extends keyof T>(
    id: JSONRPCID,
    resolve: (value: T[N]['result']) => void,
    reject: (reason: unknown) => void,
    timeoutInSeconds: number,
    serializer?: JSONRPCSerializer<T[N]['params'], T[N]['result']>,
  ): void {
    const request: PendingRequest<T[N]['result']> = {
      resolve,
      reject,
      timeoutId: undefined,
      serializer,
    };

    if (timeoutInSeconds > 0) {
      request.timeoutId = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new TimeoutError('Request timed out', id));
      }, timeoutInSeconds * 1000);
    }

    this.pendingRequests.set(id, request);
  }

  /**
   * Handles a JSON-RPC response by resolving or rejecting the corresponding request.
   * Handles response deserialization and validation.
   *
   * @param id - The request ID to handle
   * @param result - The response result (if successful)
   * @param error - The error object (if failed)
   *
   * @example
   * ```typescript
   * // Handle successful response
   * methods.handleResponse('req-123', { value: 42 });
   *
   * // Handle error response
   * methods.handleResponse('req-123', undefined, {
   *   code: -32600,
   *   message: 'Invalid Request'
   * });
   * ```
   */
  handleResponse(
    id: JSONRPCID,
    result: unknown,
    error?: { code: number; message: string; data?: unknown },
  ): void {
    const request = this.pendingRequests.get(id);
    if (!request) {
      return;
    }

    if (request.timeoutId) {
      clearTimeout(request.timeoutId);
    }

    this.pendingRequests.delete(id);

    if (error) {
      let errorData: string | Record<string, unknown> | undefined;
      if (error.data === undefined) {
        errorData = undefined;
      } else if (typeof error.data === 'string') {
        errorData = error.data;
      } else if (typeof error.data === 'object' && error.data !== null) {
        errorData = error.data as Record<string, unknown>;
      }
      request.reject(new JSONRPCError(error.code, error.message, errorData));
    } else if (request.serializer?.result) {
      try {
        // Ensure result is a valid serialized data format
        if (
          typeof result === 'object' &&
          result !== null &&
          'serialized' in result &&
          typeof result.serialized === 'string'
        ) {
          const serializedData: JSONRPCSerializedData = {
            serialized: result.serialized,
            method: 'method' in result && typeof result.method === 'string' ? result.method : String(id),
          };
          const deserialized = request.serializer.result.deserialize(String(id), serializedData);
          request.resolve(deserialized);
          return;
        }
        request.reject(new JSONRPCError(-32603, 'Invalid serialized result format'));
      } catch (err) {
        request.reject(new JSONRPCError(-32000, 'Failed to deserialize result'));
      }
    } else {
      // Ensure result is a valid JSON-RPC type
      if (result === undefined || result === null) {
        request.resolve(result as T[keyof T]['result']);
        return;
      }

      const type = typeof result;
      if (type === 'string' || type === 'number' || type === 'boolean') {
        request.resolve(result as T[keyof T]['result']);
        return;
      }

      if (type === 'object') {
        try {
          // Verify the object is JSON-serializable
          JSON.stringify(result);
          request.resolve(result as T[keyof T]['result']);
        } catch {
          request.reject(new JSONRPCError(-32603, 'Result is not JSON-serializable'));
        }
        return;
      }

      request.reject(new JSONRPCError(-32603, 'Invalid result type'));
    }
  }

  /**
   * Rejects all pending requests with the given error.
   * Used during cleanup or when shutting down.
   *
   * @param reason - The error to reject requests with
   *
   * @example
   * ```typescript
   * // Reject all requests during shutdown
   * methods.rejectAllRequests(new Error('Server shutting down'));
   * ```
   */
  rejectAllRequests(reason: Error): void {
    for (const [id, request] of this.pendingRequests) {
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
      request.reject(reason);
      this.pendingRequests.delete(id);
    }
  }
}
