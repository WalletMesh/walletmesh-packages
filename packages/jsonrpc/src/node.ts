import type {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCEvent,
  JSONRPCMethodMap,
  JSONRPCEventMap,
  JSONRPCSerializer,
  JSONRPCEventHandler,
  JSONRPCContext,
  JSONRPCID,
  JSONRPCSerializedData,
  JSONRPCMiddleware,
} from './types.js';
import { isJSONRPCSerializedData } from './utils.js';
import { JSONRPCError } from './error.js';

/**
 * Transport interface for sending JSON-RPC messages between nodes.
 * This interface abstracts the actual message transmission mechanism,
 * allowing the node to work with any transport layer (WebSocket, postMessage, etc.).
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam E - The event map defining available events
 *
 * @example
 * ```typescript
 * // WebSocket transport
 * const wsTransport: Transport<MethodMap, EventMap> = {
 *   send: message => ws.send(JSON.stringify(message))
 * };
 *
 * // postMessage transport
 * const windowTransport: Transport<MethodMap, EventMap> = {
 *   send: message => window.postMessage(JSON.stringify(message), '*')
 * };
 *
 * // Custom transport with encryption
 * const encryptedTransport: Transport<MethodMap, EventMap> = {
 *   send: message => {
 *     const encrypted = encrypt(JSON.stringify(message));
 *     socket.send(encrypted);
 *   }
 * };
 * ```
 */
export type Transport<T extends JSONRPCMethodMap, E extends JSONRPCEventMap> = {
  /**
   * Sends a JSON-RPC message to the remote node.
   * @param message - The message to send (request, response, or event)
   */
  send: (message: JSONRPCRequest<T, keyof T> | JSONRPCResponse<T> | JSONRPCEvent<E, keyof E>) => void;
};

/**
 * Function type for handling JSON-RPC method calls.
 * Method handlers receive a context object and typed parameters,
 * and return a promise or direct value of the specified result type.
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam M - The specific method being handled
 * @typeParam C - The context type for method handlers
 *
 * @example
 * ```typescript
 * // Simple handler
 * const addHandler: MethodHandler<MethodMap, 'add', Context> =
 *   (context, { a, b }) => a + b;
 *
 * // Async handler with context
 * const getUserHandler: MethodHandler<MethodMap, 'getUser', Context> =
 *   async (context, { id }) => {
 *     if (!context.isAuthorized) {
 *       throw new JSONRPCError(-32600, 'Unauthorized');
 *     }
 *     return await db.users.findById(id);
 *   };
 * ```
 */
export type MethodHandler<T extends JSONRPCMethodMap, M extends keyof T, C extends JSONRPCContext> = (
  context: C,
  params: T[M]['params'],
) => Promise<T[M]['result']> | T[M]['result'];

/**
 * Internal interface representing a registered JSON-RPC method.
 * Combines the method implementation with optional parameter/result serialization.
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam M - The specific method being registered
 * @typeParam C - The context type for method handlers
 *
 * @internal
 * @example
 * ```typescript
 * const method: RegisteredMethod<MethodMap, 'processDate', Context> = {
 *   handler: async (context, params) => {
 *     return await processDate(params.date);
 *   },
 *   serializer: {
 *     params: dateSerializer,
 *     result: dateSerializer
 *   }
 * };
 * ```
 */
interface RegisteredMethod<T extends JSONRPCMethodMap, M extends keyof T, C extends JSONRPCContext> {
  /** The method implementation */
  handler: MethodHandler<T, M, C>;
  /** Optional serializer for method parameters and results */
  serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined;
}

/**
 * Core class implementing the JSON-RPC 2.0 protocol with bi-directional communication support.
 *
 * Features:
 * - Full JSON-RPC 2.0 protocol implementation
 * - Bi-directional communication (each node can both send and receive)
 * - Type-safe method and event definitions
 * - Middleware support for request/response modification
 * - Custom serialization for complex data types
 * - Request timeouts
 * - Event system for broadcast-style communication
 * - Comprehensive error handling
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam E - The event map defining available events
 * @typeParam C - The context type for method handlers
 *
 * @example
 * ```typescript
 * // Define your types
 * type MethodMap = {
 *   add: {
 *     params: { a: number; b: number };
 *     result: number;
 *   };
 *   getUser: {
 *     params: { id: string };
 *     result: User;
 *   };
 * };
 *
 * type EventMap = {
 *   userJoined: { username: string };
 *   statusUpdate: { user: string; status: 'online' | 'offline' };
 * };
 *
 * type Context = {
 *   userId?: string;
 *   isAuthorized?: boolean;
 * };
 *
 * // Create a node instance
 * const node = new JSONRPCNode<MethodMap, EventMap, Context>({
 *   send: message => websocket.send(JSON.stringify(message))
 * });
 *
 * // Register methods
 * node.registerMethod('add', (context, { a, b }) => a + b);
 *
 * node.registerMethod('getUser', async (context, { id }) => {
 *   if (!context.isAuthorized) {
 *     throw new JSONRPCError(-32600, 'Unauthorized');
 *   }
 *   return await db.users.findById(id);
 * });
 *
 * // Add middleware
 * node.addMiddleware(async (context, request, next) => {
 *   console.log('Request:', request);
 *   const response = await next();
 *   console.log('Response:', response);
 *   return response;
 * });
 *
 * // Handle events
 * node.on('userJoined', ({ username }) => {
 *   console.log(`${username} joined`);
 * });
 *
 * // Call remote methods
 * try {
 *   const sum = await node.callMethod('add', { a: 1, b: 2 });
 *   const user = await node.callMethod('getUser', { id: '123' }, 5);
 * } catch (error) {
 *   if (error instanceof TimeoutError) {
 *     console.error('Request timed out');
 *   } else if (error instanceof JSONRPCError) {
 *     console.error('RPC Error:', error.message);
 *   }
 * }
 *
 * // Emit events
 * node.emit('statusUpdate', {
 *   user: 'Alice',
 *   status: 'online'
 * });
 * ```
 */
export class JSONRPCNode<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  E extends JSONRPCEventMap = JSONRPCEventMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private methods: Partial<{ [K in keyof T]: RegisteredMethod<T, K, C> }> = {};
  private eventHandlers = new Map<keyof E, Set<JSONRPCEventHandler<E, keyof E>>>();
  private pendingRequests = new Map<
    JSONRPCID,
    {
      resolve: (value: T[keyof T]['result']) => void;
      reject: (reason?: unknown) => void;
      timer: ReturnType<typeof setTimeout> | null;
      serializer: JSONRPCSerializer<T[keyof T]['params'], T[keyof T]['result']> | undefined;
    }
  >();
  private serializers = new Map<keyof T, JSONRPCSerializer<T[keyof T]['params'], T[keyof T]['result']>>();
  private middlewareStack: JSONRPCMiddleware<T, C>[] = [];

  private baseHandler: JSONRPCMiddleware<T, C> = async (context, request, _next) => {
    const method = this.methods[request.method];
    if (!method) {
      throw new JSONRPCError(-32601, 'Method not found');
    }

    try {
      // Deserialize parameters if needed
      const params = method.serializer?.params
        ? method.serializer.params.deserialize(request.params as JSONRPCSerializedData)
        : request.params;

      const result = await Promise.resolve(method.handler(context, params));

      return {
        jsonrpc: '2.0',
        result: method.serializer?.result ? method.serializer.result.serialize(result) : result,
        id: request.id,
      };
    } catch (error) {
      throw error instanceof JSONRPCError
        ? error
        : new JSONRPCError(-32000, error instanceof Error ? error.message : 'Unknown error');
    }
  };

  constructor(
    private transport: Transport<T, E>,
    public readonly context: C = {} as C,
  ) {
    // Initialize middleware stack with base handler
    this.middlewareStack = [this.baseHandler];
  }

  /**
   * Registers a method that can be called by remote nodes.
   *
   * @param name - The name of the method to register
   * @param handler - The function that implements the method
   * @param serializer - Optional serializer for method parameters and results
   *
   * @example
   * ```typescript
   * node.registerMethod('add', async (context, params) => {
   *   return params.a + params.b;
   * });
   * ```
   */
  public registerMethod<M extends keyof T>(
    name: M,
    handler: MethodHandler<T, M, C>,
    serializer?: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.methods[name] = { handler, serializer };
  }

  /**
   * Registers a serializer for a remote method.
   * Used when calling methods that require parameter or result serialization.
   *
   * @param method - The name of the method to register a serializer for
   * @param serializer - The serializer implementation
   *
   * @example
   * ```typescript
   * node.registerSerializer('processDate', {
   *   params: {
   *     serialize: (date) => ({ serialized: date.toISOString() }),
   *     deserialize: (data) => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public registerSerializer<M extends keyof T>(
    method: M,
    serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.serializers.set(method, serializer);
  }

  /**
   * Calls a method on the remote node.
   *
   * @param method - The name of the method to call
   * @param params - The parameters to pass to the method
   * @param timeoutInSeconds - Optional timeout in seconds (0 means no timeout)
   * @returns A promise that resolves with the method result
   * @throws {JSONRPCError} If the method call fails or times out
   *
   * @example
   * ```typescript
   * try {
   *   const result = await node.callMethod('add', { a: 1, b: 2 }, 5);
   *   console.log('Result:', result);
   * } catch (error) {
   *   console.error('Error:', error);
   * }
   * ```
   */
  public callMethod<M extends keyof T>(
    method: M,
    params?: T[M]['params'],
    timeoutInSeconds = 0,
  ): Promise<T[M]['result']> {
    const id = crypto.randomUUID();

    // Serialize parameters if serializer exists
    const paramSerializer = this.serializers.get(method)?.params;
    const serializedParams = params && paramSerializer ? paramSerializer.serialize(params) : params;

    const request: JSONRPCRequest<T, M> = {
      jsonrpc: '2.0',
      method,
      params: serializedParams,
      id,
    };

    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | null = null;

      if (timeoutInSeconds > 0) {
        timer = setTimeout(() => {
          this.pendingRequests.delete(id);
          reject(new JSONRPCError(-32000, 'Request timed out'));
        }, timeoutInSeconds * 1000);
      }

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timer,
        serializer: this.serializers.get(method),
      });

      this.transport.send(request);
    });
  }

  /**
   * Sends a notification to the remote node.
   *
   * @param method - The name of the method to call
   * @param params - The parameters to pass to the method
   *
   * @example
   * ```typescript
   * node.notify('logMessage', { level: 'info', message: 'Hello' });
   * ```
   */
  public notify<M extends keyof T>(method: M, params: T[M]['params']): void {
    const paramSerializer = this.serializers.get(method)?.params;
    const serializedParams = params && paramSerializer ? paramSerializer.serialize(params) : params;

    const request: JSONRPCRequest<T, keyof T> = {
      jsonrpc: '2.0',
      method,
      params: serializedParams,
    };
    this.transport.send(request);
  }

  /**
   * Registers a handler for a specific event type.
   *
   * @param event - The name of the event to handle
   * @param handler - The function to call when the event is received
   * @returns A cleanup function that removes the event handler when called
   *
   * @example
   * ```typescript
   * const cleanup = node.on('userJoined', ({ username }) => {
   *   console.log(`${username} joined`);
   * });
   *
   * // Later...
   * cleanup(); // Remove the event handler
   * ```
   */
  public on<K extends keyof E>(event: K, handler: JSONRPCEventHandler<E, K>): () => void {
    const handlers = this.eventHandlers.get(event) || new Set();
    handlers.add(handler as JSONRPCEventHandler<E, keyof E>);
    this.eventHandlers.set(event, handlers);

    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler as JSONRPCEventHandler<E, keyof E>);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
        }
      }
    };
  }

  /**
   * Emits an event to the remote node.
   *
   * @param event - The name of the event to emit
   * @param params - The event parameters
   *
   * @example
   * ```typescript
   * node.emit('statusUpdate', {
   *   user: 'Alice',
   *   status: 'online'
   * });
   * ```
   */
  public emit<K extends keyof E>(event: K, params: E[K]): void {
    const eventMessage: JSONRPCEvent<E, K> = {
      jsonrpc: '2.0',
      event,
      params,
    };
    this.transport.send(eventMessage);
  }

  /**
   * Handles an incoming message from the remote node.
   * This should be called whenever a message is received through the transport.
   *
   * @param message - The received message
   * @returns A promise that resolves when the message has been handled
   *
   * @example
   * ```typescript
   * websocket.on('message', async (data) => {
   *   await node.receiveMessage(JSON.parse(data));
   * });
   * ```
   */
  public async receiveMessage(message: unknown): Promise<void> {
    if (!this.isValidMessage(message)) {
      console.error('Invalid message received:', message);
      return;
    }

    const msg = message as { jsonrpc: '2.0'; method?: string; event?: string; id?: JSONRPCID };

    if (msg.method) {
      // Handle request
      await this.handleRequest(message as JSONRPCRequest<T, keyof T>);
    } else if (msg.event) {
      // Handle event
      this.handleEvent(message as JSONRPCEvent<E, keyof E>);
    } else if (msg.id !== undefined) {
      // Handle response
      this.handleResponse(message as JSONRPCResponse<T>);
    }
  }

  private isValidMessage(message: unknown): boolean {
    if (typeof message !== 'object' || message === null) {
      return false;
    }

    const msg = message as { jsonrpc?: string; method?: unknown; event?: unknown; id?: unknown };
    return (
      msg.jsonrpc === '2.0' &&
      (typeof msg.method === 'string' || // Request
        typeof msg.event === 'string' || // Event
        msg.id !== undefined) // Response
    );
  }

  /**
   * Adds a middleware function to the middleware stack.
   * Middleware functions are executed in the order they are added,
   * and can modify both requests and responses.
   *
   * @param middleware - The middleware function to add
   * @returns A cleanup function that removes the middleware when called
   *
   * @example
   * ```typescript
   * const cleanup = node.addMiddleware(async (context, request, next) => {
   *   console.log('Request:', request);
   *   const response = await next();
   *   console.log('Response:', response);
   *   return response;
   * });
   *
   * // Later...
   * cleanup(); // Remove the middleware
   * ```
   */
  public addMiddleware(middleware: JSONRPCMiddleware<T, C>): () => void {
    const baseHandlerIndex = this.middlewareStack.length - 1;
    this.middlewareStack.splice(baseHandlerIndex, 0, middleware);
    return () => {
      const index = this.middlewareStack.indexOf(middleware);
      if (index !== -1) {
        this.middlewareStack.splice(index, 1);
      }
    };
  }

  private async handleRequest(request: JSONRPCRequest<T, keyof T>): Promise<void> {
    if (request.jsonrpc !== '2.0') {
      const response: JSONRPCResponse<T> = {
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request' },
        id: request.id,
      };
      this.transport.send(response);
      return;
    }

    try {
      const composed = this.composeMiddleware(this.middlewareStack);
      const response = await composed(this.context, request);

      // Only send response for non-notifications
      if (request.id !== undefined) {
        this.transport.send(response);
      }
    } catch (error) {
      if (request.id !== undefined) {
        const response: JSONRPCResponse<T> = {
          jsonrpc: '2.0',
          error:
            error instanceof JSONRPCError
              ? { code: error.code, message: error.message, data: error.data }
              : { code: -32000, message: error instanceof Error ? error.message : 'Unknown error' },
          id: request.id,
        };
        this.transport.send(response);
      }
    }
  }

  private composeMiddleware(middlewareList: JSONRPCMiddleware<T, C>[]) {
    return async (context: C, request: JSONRPCRequest<T, keyof T>): Promise<JSONRPCResponse<T>> => {
      let index = -1;
      const dispatch = async (i: number): Promise<JSONRPCResponse<T>> => {
        if (i <= index) throw new JSONRPCError(-32000, 'next() called multiple times');
        index = i;
        if (i >= middlewareList.length) throw new JSONRPCError(-32000, 'No middleware to handle request');
        const fn = middlewareList[i];
        if (!fn) throw new JSONRPCError(-32000, `Middleware function at index ${i} is undefined`);
        return await fn(context, request, () => dispatch(i + 1));
      };
      return dispatch(0);
    };
  }

  private handleResponse(response: JSONRPCResponse<T>): void {
    const pendingRequest = this.pendingRequests.get(response.id);
    if (!pendingRequest) {
      console.warn('Received response for unknown request:', response.id);
      return;
    }

    if (pendingRequest.timer) {
      clearTimeout(pendingRequest.timer);
    }

    if (response.error) {
      pendingRequest.reject(
        new JSONRPCError(response.error.code, response.error.message, response.error.data),
      );
    } else {
      // Deserialize result if needed
      const result =
        response.result !== undefined &&
        pendingRequest.serializer?.result &&
        isJSONRPCSerializedData(response.result)
          ? pendingRequest.serializer.result.deserialize(response.result)
          : response.result;

      pendingRequest.resolve(result);
    }

    this.pendingRequests.delete(response.id);
  }

  private handleEvent(event: JSONRPCEvent<E, keyof E>): void {
    const handlers = this.eventHandlers.get(event.event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(event.params);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      }
    }
  }
}
