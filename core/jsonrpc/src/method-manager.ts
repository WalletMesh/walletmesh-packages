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

interface PendingRequest<R> {
  resolve: (value: R) => void;
  reject: (reason: unknown) => void;
  timeoutId: NodeJS.Timeout | undefined;
  serializer: JSONRPCSerializer<unknown, R> | undefined;
}

export class MethodManager<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private methods = new Map<keyof T, unknown>();
  private serializers = new Map<keyof T, JSONRPCSerializer<unknown, unknown>>();
  private pendingRequests = new Map<JSONRPCID, PendingRequest<T[keyof T]['result']>>();
  private fallbackHandler?: FallbackMethodHandler<C>;

  setFallbackHandler(handler: FallbackMethodHandler<C>): void {
    this.fallbackHandler = handler;
  }

  getFallbackHandler(): FallbackMethodHandler<C> | undefined {
    return this.fallbackHandler;
  }

  registerMethod<M extends keyof T>(name: M, handler: MethodHandler<T, M, C>): void {
    this.methods.set(name, handler as unknown);
  }

  registerSerializer<M extends keyof T>(
    name: M,
    serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.serializers.set(name, serializer as JSONRPCSerializer<unknown, unknown>);
  }

  getMethod<M extends keyof T>(name: M): MethodHandler<T, M, C> | undefined {
    const handler = this.methods.get(name) as MethodHandler<T, M, C> | undefined;
    return handler;
  }

  getSerializer<M extends keyof T>(name: M): JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined {
    return this.serializers.get(name) as JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined;
  }

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
      if (error.data === undefined) {
        errorData = undefined;
      } else if (typeof error.data === 'string') {
        errorData = error.data;
      } else if (typeof error.data === 'object' && error.data !== null) {
        errorData = error.data as Record<string, unknown>;
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
