import { JSONRPCError, TimeoutError } from './error.js';
import type {
  JSONRPCErrorInterface,
  JSONRPCID,
  JSONRPCMethodMap,
  JSONRPCSerializedData,
  JSONRPCSerializer,
} from './types.js';
import { isJSONRPCSerializedData } from './utils.js';

/**
 * Internal interface representing a pending JSON-RPC request.
 * Tracks promise resolution, timeout, and serialization details.
 *
 * @typeParam T - The method map defining available RPC methods
 * @typeParam M - The specific method being called
 *
 * @internal
 */
interface PendingRequest<T extends JSONRPCMethodMap, M extends keyof T> {
  /** Function to resolve the request promise with the result */
  resolve: (value: T[M]['result']) => void;
  /** Function to reject the request promise with an error */
  reject: (reason?: unknown) => void;
  /** Timer for request timeout, null if no timeout */
  timer: ReturnType<typeof setTimeout> | null;
  /** Optional serializer for request parameters and result */
  serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined;
}

/**
 * Manages pending JSON-RPC requests and their lifecycle.
 * Handles request tracking, timeout management, and response correlation.
 *
 * Features:
 * - Request timeout management
 * - Response correlation with pending requests
 * - Result deserialization
 * - Cleanup of completed/failed requests
 *
 * @typeParam T - The method map defining available RPC methods
 *
 * @example
 * ```typescript
 * const manager = new RequestManager<MethodMap>();
 *
 * // Making a request
 * const id = 'req-123';
 * const cleanup = manager.addRequest(
 *   id,
 *   (result) => console.log('Success:', result),
 *   (error) => console.error('Error:', error),
 *   5, // 5 second timeout
 *   dateSerializer
 * );
 *
 * // Later when response arrives
 * manager.handleResponse(id, {
 *   serialized: new Date().toISOString()
 * });
 *
 * // Or if request fails
 * manager.handleResponse(id, undefined, {
 *   code: -32000,
 *   message: 'Server error'
 * });
 *
 * // Cleanup on component unmount
 * cleanup();
 * ```
 */
export class RequestManager<T extends JSONRPCMethodMap = JSONRPCMethodMap> {
  private pendingRequests = new Map<JSONRPCID, PendingRequest<T, keyof T>>();

  /**
   * Adds a new pending request to be tracked.
   * Returns a cleanup function that can be used to cancel the request.
   *
   * @param id - The request ID (used to correlate with response)
   * @param resolve - Function to resolve the request promise with result
   * @param reject - Function to reject the request promise with error
   * @param timeoutInSeconds - Optional timeout in seconds (0 means no timeout)
   * @param serializer - Optional serializer for request parameters and result
   * @returns A cleanup function that removes the request and cancels timeout
   * @throws {TypeError} If id is invalid or handlers are not functions
   *
   * @example
   * ```typescript
   * // Request with timeout and serialization
   * const cleanup = manager.addRequest(
   *   'req-123',
   *   (result: Date) => handleSuccess(result),
   *   (error) => handleError(error),
   *   30, // 30 second timeout
   *   dateSerializer
   * );
   *
   * // Request without timeout
   * const cleanup = manager.addRequest(
   *   'req-456',
   *   (result: number) => console.log(result),
   *   (error) => console.error(error)
   * );
   * ```
   */
  public addRequest<M extends keyof T>(
    id: JSONRPCID,
    resolve: (value: T[M]['result']) => void,
    reject: (reason?: unknown) => void,
    timeoutInSeconds = 0,
    serializer?: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): () => void {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (timeoutInSeconds > 0) {
      timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new TimeoutError('Request timed out', id));
      }, timeoutInSeconds * 1000);
    }

    this.pendingRequests.set(id, {
      resolve,
      reject,
      timer,
      serializer,
    } as PendingRequest<T, keyof T>);

    return () => {
      const request = this.pendingRequests.get(id);
      if (request?.timer) {
        clearTimeout(request.timer);
      }
      this.pendingRequests.delete(id);
    };
  }

  /**
   * Handles a response for a pending request.
   * Resolves or rejects the corresponding request promise based on response.
   * Automatically deserializes results if a serializer is registered.
   *
   * @param id - The request ID to match with pending request
   * @param result - The response result (if successful)
   * @param error - The response error (if failed)
   * @returns True if response was handled, false if no matching request found
   * @throws {TypeError} If response format is invalid
   *
   * @example
   * ```typescript
   * // Handle successful response
   * manager.handleResponse('req-123', {
   *   serialized: '2023-01-01T00:00:00.000Z'
   * });
   *
   * // Handle error response
   * manager.handleResponse('req-123', undefined, {
   *   code: -32602,
   *   message: 'Invalid params',
   *   data: { expected: 'number', received: 'string' }
   * });
   * ```
   */
  public async handleResponse(
    id: JSONRPCID,
    result: unknown,
    error?: JSONRPCErrorInterface,
  ): Promise<boolean> {
    const pendingRequest = this.pendingRequests.get(id);
    if (!pendingRequest) {
      return false;
    }

    if (pendingRequest.timer) {
      clearTimeout(pendingRequest.timer);
    }

    if (error) {
      pendingRequest.reject(new JSONRPCError(error.code, error.message, error.data));
      this.pendingRequests.delete(id);
    } else {
      try {
        if (result !== undefined && pendingRequest.serializer?.result && isJSONRPCSerializedData(result)) {
          const finalResult = await pendingRequest.serializer.result.deserialize(
            String(id),
            result as JSONRPCSerializedData,
          );
          pendingRequest.resolve(finalResult as T[keyof T]['result']);
        } else {
          pendingRequest.resolve(result as T[keyof T]['result']);
        }
      } catch (error) {
        pendingRequest.reject(error);
      } finally {
        this.pendingRequests.delete(id);
      }
    }

    return true;
  }

  /**
   * Checks if a request with the given ID is pending.
   * Useful for avoiding duplicate requests or checking request state.
   *
   * @param id - The request ID to check
   * @returns True if request is pending, false otherwise
   *
   * @example
   * ```typescript
   * // Check before making duplicate request
   * if (!manager.hasPendingRequest('req-123')) {
   *   makeRequest('req-123', params);
   * }
   * ```
   */
  public hasPendingRequest(id: JSONRPCID): boolean {
    return this.pendingRequests.has(id);
  }

  /**
   * Gets the current number of pending requests.
   * Useful for monitoring request load or debugging.
   *
   * @returns The number of pending requests
   *
   * @example
   * ```typescript
   * // Monitor request load
   * setInterval(() => {
   *   const count = manager.getPendingCount();
   *   if (count > 100) {
   *     console.warn(`High pending request count: ${count}`);
   *   }
   * }, 5000);
   * ```
   */
  public getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Rejects all pending requests with an error.
   * Useful for cleanup during shutdown or error conditions.
   * Clears all timeouts and removes all pending requests.
   *
   * @param error - The error to reject all requests with
   *
   * @example
   * ```typescript
   * // Cleanup on connection loss
   * connection.onClose(() => {
   *   manager.rejectAllRequests(
   *     new Error('Connection closed')
   *   );
   * });
   *
   * // Cleanup on component unmount
   * useEffect(() => {
   *   return () => {
   *     manager.rejectAllRequests(
   *       new Error('Component unmounted')
   *     );
   *   };
   * }, []);
   * ```
   */
  public rejectAllRequests(error: Error): void {
    for (const [id, request] of this.pendingRequests) {
      if (request.timer) {
        clearTimeout(request.timer);
      }
      request.reject(error);
      this.pendingRequests.delete(id);
    }
  }
}
