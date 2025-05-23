import { JSONRPCError, TimeoutError } from './error.js';
import { ParameterSerializer } from './parameter-serializer.js';
import type {
  JSONRPCMethodMap,
  JSONRPCSerializer,
  JSONRPCContext,
  JSONRPCID,
  JSONRPCSerializedData,
  MethodHandler,
  FallbackMethodHandler,
} from './types.js';

interface PendingRequest<R> {
  resolve: (value: R) => void;
  reject: (reason: unknown) => void;
  timeoutId: NodeJS.Timeout | undefined;
  serializer: JSONRPCSerializer<unknown, R> | undefined;
}

/**
 * Manages method handlers, serializers, and pending requests for JSON-RPC operations.
 * This class is responsible for registering methods, handling serialization/deserialization,
 * and managing the lifecycle of JSON-RPC requests.
 *
 * @typeParam T - Method map defining available RPC methods and their types.
 * @typeParam C - Context type shared between method handlers.
 */
export class MethodManager<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private methods = new Map<keyof T, unknown>();
  private serializers = new Map<keyof T, JSONRPCSerializer<unknown, unknown>>();
  private pendingRequests = new Map<JSONRPCID, PendingRequest<T[keyof T]['result']>>();
  private fallbackHandler?: FallbackMethodHandler<C>;

  private parameterSerializer: ParameterSerializer;

  constructor() {
    this.parameterSerializer = new ParameterSerializer();
  }

  /**
   * Sets a fallback handler that is invoked if a requested method is not registered.
   *
   * @param handler - The fallback method handler.
   */
  setFallbackHandler(handler: FallbackMethodHandler<C>): void {
    this.fallbackHandler = handler;
  }

  /**
   * Retrieves the currently set fallback handler.
   *
   * @returns The fallback method handler, or undefined if not set.
   */
  getFallbackHandler(): FallbackMethodHandler<C> | undefined {
    return this.fallbackHandler;
  }

  /**
   * Registers a handler for a specific RPC method.
   *
   * @param name - The name of the method to register.
   * @param handler - The function that will handle requests for this method.
   */
  registerMethod<M extends keyof T>(name: M, handler: MethodHandler<T, M, C>): void {
    this.methods.set(name, handler as unknown);
  }

  /**
   * Registers a custom serializer for the parameters and/or result of a specific method.
   *
   * @param name - The name of the method for which to register the serializer.
   * @param serializer - The serializer implementation.
   */
  registerSerializer<M extends keyof T>(
    name: M,
    serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.serializers.set(name, serializer as JSONRPCSerializer<unknown, unknown>);
  }

  /**
   * Retrieves the handler for a specific RPC method.
   *
   * @param name - The name of the method.
   * @returns The method handler, or undefined if not found.
   */
  getMethod<M extends keyof T>(name: M): MethodHandler<T, M, C> | undefined {
    const handler = this.methods.get(name) as MethodHandler<T, M, C> | undefined;
    return handler;
  }

  /**
   * Retrieves the serializer for a specific RPC method.
   *
   * @param name - The name of the method.
   * @returns The serializer, or undefined if not found for this method.
   */
  getSerializer<M extends keyof T>(name: M): JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined {
    return this.serializers.get(name) as JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined;
  }

  /**
   * Deserializes method parameters using the appropriate serializer.
   * Uses method-specific serializer if available, otherwise uses standard JSON deserialization.
   *
   * @param method - The method name.
   * @param params - The parameters to deserialize.
   * @returns The deserialized parameters.
   */
  async deserializeParams<M extends keyof T>(
    method: M,
    params: unknown,
  ): Promise<T[M]['params'] | undefined> {
    const serializer = this.getSerializer(method);
    return this.parameterSerializer.deserializeParams(String(method), params, serializer) as Promise<
      T[M]['params'] | undefined
    >;
  }

  /**
   * Serializes method parameters using the appropriate serializer.
   * Uses method-specific serializer if available, otherwise uses standard JSON serialization.
   *
   * @param method - The method name.
   * @param params - The parameters to serialize.
   * @returns The serialized parameters.
   */
  async serializeParams<M extends keyof T>(method: M, params: T[M]['params'] | undefined): Promise<unknown> {
    const serializer = this.getSerializer(method);
    return this.parameterSerializer.serializeParams(String(method), params, serializer);
  }

  /**
   * Serializes method result using the appropriate serializer.
   * Uses method-specific serializer if available, otherwise uses standard JSON serialization.
   *
   * @param method - The method name.
   * @param result - The result to serialize.
   * @returns The serialized result.
   */
  async serializeResult<M extends keyof T>(method: M, result: T[M]['result'] | undefined): Promise<unknown> {
    const serializer = this.getSerializer(method);
    return this.parameterSerializer.serializeResult(String(method), result, serializer);
  }

  /**
   * Deserializes method result using the appropriate serializer.
   * Uses method-specific serializer if available, otherwise uses standard JSON deserialization.
   *
   * @param method - The method name.
   * @param result - The result to deserialize.
   * @returns The deserialized result.
   */
  async deserializeResult<M extends keyof T>(
    method: M,
    result: unknown,
  ): Promise<T[M]['result'] | undefined> {
    const serializer = this.getSerializer(method);
    return this.parameterSerializer.deserializeResult(String(method), result, serializer) as Promise<
      T[M]['result'] | undefined
    >;
  }

  /**
   * Adds a pending request to the manager, to be resolved or rejected when a response is received or a timeout occurs.
   *
   * @param id - The unique ID of the request.
   * @param resolve - The function to call when the request is successfully resolved.
   * @param reject - The function to call when the request fails or times out.
   * @param timeoutInSeconds - The timeout duration in seconds. If 0, no timeout is applied.
   * @param serializer - Optional serializer for the request's result.
   * @typeParam N - The method name, used to infer the result type.
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
   * Handles an incoming JSON-RPC response.
   * Matches the response to a pending request by ID and resolves or rejects the request's promise.
   *
   * @param id - The ID of the response, corresponding to a pending request.
   * @param result - The result field from the JSON-RPC response.
   * @param error - The error field from the JSON-RPC response.
   * @returns A promise that resolves to true if the response was handled (i.e., a pending request was found), false otherwise.
   */
  async handleResponse(
    id: JSONRPCID,
    result: unknown,
    error?: { code: number; message: string; data?: unknown },
  ): Promise<boolean> {
    const request = this.pendingRequests.get(id);
    if (!request) {
      return false;
    }

    if (request.timeoutId) {
      clearTimeout(request.timeoutId);
    }

    if (error) {
      let errorData: string | Record<string, unknown> | undefined;
      if (error.data === undefined || error.data === null) {
        errorData = undefined;
      } else if (typeof error.data === 'string') {
        errorData = error.data;
      } else if (typeof error.data === 'object') {
        // Ensure we have a proper object
        try {
          errorData = error.data as Record<string, unknown>;
        } catch {
          errorData = undefined;
        }
      }
      request.reject(new JSONRPCError(error.code, error.message, errorData));
      this.pendingRequests.delete(id);
    } else if (request.serializer?.result) {
      try {
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
          const deserialized = await request.serializer.result.deserialize(String(id), serializedData);
          request.resolve(deserialized);
        } else {
          request.reject(new JSONRPCError(-32603, 'Invalid serialized result format'));
        }
      } catch (err) {
        request.reject(new JSONRPCError(-32000, 'Failed to deserialize result'));
      } finally {
        this.pendingRequests.delete(id);
      }
    } else {
      if (result === undefined || result === null) {
        request.resolve(result as T[keyof T]['result']);
        this.pendingRequests.delete(id);
        return true;
      }

      const type = typeof result;
      if (type === 'string' || type === 'number' || type === 'boolean') {
        request.resolve(result as T[keyof T]['result']);
        this.pendingRequests.delete(id);
        return true;
      }

      if (type === 'object') {
        try {
          JSON.stringify(result);
          request.resolve(result as T[keyof T]['result']);
          this.pendingRequests.delete(id);
          return true;
        } catch {
          request.reject(new JSONRPCError(-32603, 'Result is not JSON-serializable'));
          this.pendingRequests.delete(id);
          return true;
        }
      }

      request.reject(new JSONRPCError(-32603, 'Invalid result type'));
      this.pendingRequests.delete(id);
    }

    return true;
  }

  /**
   * Rejects all pending requests with the given reason.
   * Typically used when the node is closing or a connection is lost.
   *
   * @param reason - The error or reason for rejecting the requests.
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
