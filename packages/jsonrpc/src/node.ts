import type {
  JSONRPCMethodMap,
  JSONRPCEventMap,
  JSONRPCContext,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCEvent,
  JSONRPCSerializer,
  JSONRPCMiddleware,
  JSONRPCID,
  JSONRPCParams,
  JSONRPCTransport,
} from './types.js';
import { EventManager } from './event-manager.js';
import { MiddlewareManager } from './middleware-manager.js';
import { MethodManager } from './method-manager.js';
import { JSONRPCError } from './error.js';
import { MessageValidator } from './message-validator.js';
import { ParameterSerializer } from './parameter-serializer.js';
import { RequestHandler } from './request-handler.js';
import { wrapHandler } from './utils.js';

/**
 * Core class implementing the JSON-RPC 2.0 protocol with bi-directional communication support.
 * Provides a high-level interface for JSON-RPC communication while managing all the underlying complexity.
 *
 * @typeParam T - Method map defining available RPC methods and their types
 * @typeParam E - Event map defining available events and their payload types
 * @typeParam C - Context type shared between middleware and method handlers
 *
 * @example
 * ```typescript
 * // Define method and event types
 * type Methods = {
 *   add: {
 *     params: { a: number; b: number };
 *     result: number;
 *   };
 * };
 *
 * type Events = {
 *   userJoined: { username: string };
 * };
 *
 * // Create node instance
 * const node = new JSONRPCNode<Methods, Events>({
 *   send: message => ws.send(JSON.stringify(message))
 * });
 *
 * // Register method handler
 * node.registerMethod('add', (context, { a, b }) => a + b);
 *
 * // Listen for events
 * node.on('userJoined', ({ username }) => {
 *   console.log(`${username} joined`);
 * });
 * ```
 */
export class JSONRPCNode<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  E extends JSONRPCEventMap = JSONRPCEventMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private methodManager: MethodManager<T, C>;
  private eventManager: EventManager<E>;
  private middlewareManager: MiddlewareManager<T, C>;
  private requestHandler: RequestHandler<T, C>;
  private messageValidator: MessageValidator;
  private parameterSerializer: ParameterSerializer;

  /**
   * Sets a fallback serializer to be used when no method-specific serializer is provided.
   *
   * @param serializer - The serializer to use as fallback
   *
   * @example
   * ```typescript
   * // Set a fallback serializer for handling dates
   * node.setFallbackSerializer({
   *   params: {
   *     serialize: (value, method) => ({ serialized: value instanceof Date ? value.toISOString() : String(value), method }),
   *     deserialize: (data, method) => new Date(data.serialized)
   *   },
   *   result: {
   *     serialize: (value, method) => ({ serialized: value instanceof Date ? value.toISOString() : String(value), method }),
   *     deserialize: (data, method) => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public setFallbackSerializer(serializer: JSONRPCSerializer<unknown, unknown>): void {
    this.parameterSerializer.setFallbackSerializer(serializer);
  }

  /**
   * Creates a new JSONRPCNode instance.
   *
   * @param transport - Transport object that handles sending messages between nodes
   * @param context - Optional context object shared between middleware and method handlers
   */
  constructor(
    private transport: JSONRPCTransport,
    public readonly context: C = {} as C,
  ) {
    this.methodManager = new MethodManager<T, C>();
    this.eventManager = new EventManager<E>();
    this.messageValidator = new MessageValidator();
    this.parameterSerializer = new ParameterSerializer();
    this.requestHandler = new RequestHandler<T, C>(this.methodManager);

    // Initialize middleware manager with request handler
    this.middlewareManager = new MiddlewareManager<T, C>((context, request) =>
      this.requestHandler.handleRequest(context, request),
    );
  }

  /**
   * Registers a method handler for the specified method name.
   *
   * @param name - The name of the method to register
   * @param handler - Function that handles method calls
   *
   * @example
   * ```typescript
   * // Register a method
   * node.registerMethod('add', (context, { a, b }) => a + b);
   * ```
   */
  public registerMethod<M extends keyof T>(
    name: Extract<M, string>,
    handler: (context: C, params: T[M]['params']) => Promise<T[M]['result']>,
  ): void {
    const wrappedHandler = wrapHandler<T, M, C>(handler);
    this.methodManager.registerMethod(name, wrappedHandler);
  }

  /**
   * Registers a serializer for parameters and results.
   *
   * @param method - The name to register the serializer under
   * @param serializer - The serializer implementation
   *
   * @example
   * ```typescript
   * // Register Date serializer
   * node.registerSerializer('processDate', {
   *   params: {
   *     serialize: (date, method) => ({ serialized: date.toISOString(), method }),
   *     deserialize: (data, method) => new Date(data.serialized)
   *   },
   *   result: {
   *     serialize: (date, method) => ({ serialized: date.toISOString(), method }),
   *     deserialize: (data, method) => new Date(data.serialized)
   *   }
   * });
   * ```
   */
  public registerSerializer<M extends keyof T>(
    method: M,
    serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.methodManager.registerSerializer(method, serializer);
  }

  /**
   * Calls a remote method and returns a promise for the result.
   *
   * @param method - The name of the method to call
   * @param params - Parameters to pass to the method
   * @param timeoutInSeconds - Optional timeout in seconds (0 for no timeout)
   * @returns Promise that resolves with the method result
   * @throws {JSONRPCError} If the remote method throws an error
   * @throws {TimeoutError} If the call times out
   *
   * @example
   * ```typescript
   * // Simple call
   * const sum = await node.callMethod('add', { a: 1, b: 2 });
   *
   * // Call with timeout
   * try {
   *   const result = await node.callMethod('slowMethod', { data: 'test' }, 5);
   * } catch (error) {
   *   if (error instanceof TimeoutError) {
   *     console.error('Request timed out');
   *   }
   * }
   * ```
   */
  public callMethod<M extends keyof T>(
    method: M,
    params?: T[M]['params'],
    timeoutInSeconds = 0,
  ): Promise<T[M]['result']> {
    const id = crypto.randomUUID();

    const serializer = this.methodManager.getSerializer(method);

    // Serialize parameters if serializer exists
    const serializedParams = this.parameterSerializer.serializeParams(String(method), params, serializer);

    const request: JSONRPCRequest<T, M> = {
      jsonrpc: '2.0',
      method,
      params: serializedParams,
      id,
    };

    return new Promise((resolve, reject) => {
      this.methodManager.addPendingRequest(id, resolve, reject, timeoutInSeconds, serializer);
      this.transport.send(request);
    });
  }

  /**
   * Sends a notification (a request without expecting a response).
   *
   * @param method - The name of the method to call
   * @param params - Parameters to pass to the method
   *
   * @example
   * ```typescript
   * node.notify('log', { message: 'User action performed' });
   * ```
   */
  public async notify<M extends keyof T>(method: M, params: T[M]['params']): Promise<void> {
    const serializer = this.methodManager.getSerializer(method);
    const serializedParams = this.parameterSerializer.serializeParams(String(method), params, serializer);

    const request: JSONRPCRequest<T, keyof T> = {
      jsonrpc: '2.0',
      method,
      params: serializedParams,
    };
    await this.transport.send(request);
  }

  /**
   * Registers an event handler for the specified event type.
   *
   * @param event - The name of the event to listen for
   * @param handler - Function that handles the event
   * @returns Cleanup function that removes the event handler
   *
   * @example
   * ```typescript
   * const cleanup = node.on('userJoined', ({ username }) => {
   *   console.log(`${username} joined`);
   * });
   *
   * // Later: remove handler
   * cleanup();
   * ```
   */
  public on<K extends keyof E>(event: K, handler: (params: E[K]) => void): () => void {
    return this.eventManager.on(event, handler);
  }

  /**
   * Emits an event to the remote node.
   *
   * @param event - The name of the event to emit
   * @param params - Event payload
   *
   * @example
   * ```typescript
   * node.emit('statusUpdate', { status: 'online' });
   * ```
   */
  public async emit<K extends keyof E>(event: K, params: E[K]): Promise<void> {
    const eventMessage: JSONRPCEvent<E, K> = {
      jsonrpc: '2.0',
      event,
      params,
    };
    await this.transport.send(eventMessage);
  }

  /**
   * Adds a middleware function to the middleware stack.
   *
   * @param middleware - Middleware function that can intercept/modify requests
   * @returns Cleanup function that removes the middleware
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
   * // Later: remove middleware
   * cleanup();
   * ```
   */
  public addMiddleware(middleware: JSONRPCMiddleware<T, C>): () => void {
    return this.middlewareManager.addMiddleware(middleware);
  }

  /**
   * Processes an incoming JSON-RPC message.
   * This method handles requests, responses, notifications, and events.
   *
   * @param message - The received message to process
   * @throws {JSONRPCError} If the message is invalid
   */
  public async receiveMessage(message: unknown): Promise<void> {
    // Handle parse error for string messages first
    if (typeof message === 'string') {
      console.error('Invalid message received:', message);
      await this.transport.send({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
        },
        id: null,
      });
      return;
    }

    if (!this.messageValidator.isValidMessage(message)) {
      console.error('Invalid message received:', message);
      await this.transport.send({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
        id: null,
      });
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

  private async handleRequest(request: JSONRPCRequest<T, keyof T>): Promise<void> {
    try {
      const response = await this.middlewareManager.execute(this.context, request);

      // Only send response for non-notifications (requests with an id)
      if (request.id !== undefined) {
        await this.transport.send(response);
      }
    } catch (error) {
      // Only send error response for non-notifications
      if (request.id !== undefined) {
        const response: JSONRPCResponse<T> = {
          jsonrpc: '2.0',
          error:
            error instanceof JSONRPCError
              ? { code: error.code, message: error.message, data: error.data }
              : { code: -32000, message: error instanceof Error ? error.message : 'Unknown error' },
          id: request.id,
        };
        await this.transport.send(response);
      }
    }
  }

  private handleResponse(response: JSONRPCResponse<T>): void {
    this.methodManager.handleResponse(response.id, response.result, response.error);
  }

  private handleEvent(event: JSONRPCEvent<E, keyof E>): void {
    this.eventManager.handleEvent(event.event, event.params);
  }

  /**
   * Sets a fallback handler for unregistered methods.
   * The fallback handler will be called when a method is not found.
   * Like registerMethod, the handler is wrapped to provide consistent error handling
   * and response formatting.
   *
   * @param handler - Function that handles unknown method calls
   *
   * @example
   * ```typescript
   * node.setFallbackHandler(async (context, method, params) => {
   *   console.log(`Unknown method called: ${method}`);
   *   // Simply throw an error or return a value
   *   throw new Error(`Method ${method} is not supported`);
   *   // Or handle it by forwarding to another RPC server
   *   return await otherServer.callMethod(method, params);
   * });
   * ```
   */
  public setFallbackHandler(
    handler: (context: C, method: string, params: JSONRPCParams) => Promise<unknown>,
  ): void {
    // Convert the wrapped handler back to fallback handler signature
    this.methodManager.setFallbackHandler(wrapHandler(handler));
  }

  /**
   * Closes the node, cleaning up all event handlers, middleware, and pending requests.
   *
   * @example
   * ```typescript
   * await node.close();
   * ```
   */
  public async close(): Promise<void> {
    this.eventManager.removeAllHandlers();
    this.middlewareManager.removeAllMiddleware();
    this.methodManager.rejectAllRequests(new Error('Node closed'));
  }
}
