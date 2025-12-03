import { JSONRPCError, TimeoutError } from './error.js';
import { ParameterSerializer } from './parameter-serializer.js';
import type {
  FallbackMethodHandler,
  JSONRPCContext,
  JSONRPCID,
  JSONRPCMethodMap,
  JSONRPCSerializedData,
  JSONRPCSerializer,
  MethodHandler,
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
   * Returns list of all registered method names.
   * Implements the wm_getSupportedMethods pattern for capability discovery.
   *
   * @returns Array of registered method names as strings.
   */
  getRegisteredMethods(): string[] {
    return Array.from(this.methods.keys()).map(String);
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
        // Defensive check: only timeout if the request is still pending
        // This prevents phantom timeouts when the response has already been processed
        const stillPending = this.pendingRequests.get(id);
        if (stillPending === request) {
          this.pendingRequests.delete(id);
          reject(new TimeoutError('Request timed out', id));
        } else {
          // Phantom timeout avoided - request was already resolved
          console.debug(
            '[MethodManager] Phantom timeout avoided for request:',
            id,
            stillPending ? 'different request object' : 'request already completed',
          );
        }
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

    // Atomically remove the request and clear its timeout to prevent race conditions
    // This must happen before we process the response to prevent phantom timeouts
    this.pendingRequests.delete(id);
    if (request.timeoutId) {
      clearTimeout(request.timeoutId);
    }

    if (error !== undefined) {
      // Log the error for debugging with full details
      console.warn('[MethodManager] Handling error response:', {
        id,
        error,
        errorType: typeof error,
        errorString: JSON.stringify(error),
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : 'N/A',
        errorCode: error && typeof error === 'object' ? (error as Record<string, unknown>).code : 'N/A',
        errorMessage: error && typeof error === 'object' ? (error as Record<string, unknown>).message : 'N/A',
        errorData: error && typeof error === 'object' ? (error as Record<string, unknown>).data : 'N/A',
      });

      // Ensure error is a proper object with required properties
      if (typeof error !== 'object' || error === null) {
        console.warn('[MethodManager] Invalid error object type:', typeof error, error);
        request.reject(
          new JSONRPCError(-32603, 'Internal error: Invalid error object', { originalError: String(error) }),
        );
        return true;
      }

      let errorData: string | Record<string, unknown> | undefined;
      let errorCode: number;
      let errorMessage: string;

      try {
        // Safely access error properties with validation and fallbacks
        const rawCode = (error as Record<string, unknown>).code;
        const rawMessage = (error as Record<string, unknown>).message;
        const rawData = (error as Record<string, unknown>).data;

        // Validate and set error code
        if (typeof rawCode === 'number' && !Number.isNaN(rawCode)) {
          errorCode = rawCode;
        } else {
          errorCode = -32603;
          console.warn('[MethodManager] Invalid error code, using default:', rawCode);
        }

        // Validate and set error message
        if (typeof rawMessage === 'string') {
          errorMessage = rawMessage;
        } else if (rawMessage != null) {
          // Try to convert to string if not null/undefined
          errorMessage = String(rawMessage);
          console.warn('[MethodManager] Non-string error message converted:', rawMessage);
        } else {
          errorMessage = 'Unknown error';
        }

        // Handle error data - ensure it's never null
        if (rawData === undefined || rawData === null) {
          errorData = undefined;
        } else if (typeof rawData === 'string') {
          errorData = rawData;
        } else if (typeof rawData === 'object') {
          // Ensure we have a proper object that can be serialized
          try {
            // Test if the object can be stringified (no circular refs, etc.)
            JSON.stringify(rawData);
            errorData = rawData as Record<string, unknown>;
          } catch (serializeError) {
            console.warn('[MethodManager] Error data cannot be serialized:', serializeError);
            errorData = undefined;
          }
        } else {
          // For other types, convert to string
          errorData = String(rawData);
        }
      } catch (accessError) {
        // If we can't access error properties at all, use defaults
        console.error('[MethodManager] Cannot access error properties:', accessError);
        errorCode = -32603;
        errorMessage = 'Internal error: Cannot access error properties';
        errorData = undefined; // Use undefined instead of an object to avoid issues
      }

      // Final validation before creating JSONRPCError
      if (errorData === null) {
        errorData = undefined;
      }

      request.reject(new JSONRPCError(errorCode, errorMessage, errorData));
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
      } catch (_err) {
        request.reject(new JSONRPCError(-32000, 'Failed to deserialize result'));
      }
    } else {
      if (result === undefined || result === null) {
        request.resolve(result as T[keyof T]['result']);
        return true;
      }

      const type = typeof result;
      if (type === 'string' || type === 'number' || type === 'boolean') {
        request.resolve(result as T[keyof T]['result']);
        return true;
      }

      if (type === 'object') {
        try {
          JSON.stringify(result);
          request.resolve(result as T[keyof T]['result']);
          return true;
        } catch {
          request.reject(new JSONRPCError(-32603, 'Result is not JSON-serializable'));
          return true;
        }
      }

      request.reject(new JSONRPCError(-32603, 'Invalid result type'));
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
