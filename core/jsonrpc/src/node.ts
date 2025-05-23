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
import { RequestHandler } from './request-handler.js';
import { wrapHandler } from './utils.js';

/**
 * Represents a JSON-RPC 2.0 node capable of bi-directional communication.
 * It can register methods, handle incoming requests, send requests,
 * emit and listen for events, and manage middleware.
 *
 * The node interacts with a transport layer (defined by {@link JSONRPCTransport})
 * for sending and receiving messages. It automatically hooks into the transport's
 * `onMessage` callback to process incoming messages.
 *
 * @typeParam T - A map defining the available RPC methods, their parameters, and result types.
 * @typeParam E - A map defining the available events and their payload types.
 * @typeParam C - A context type shared across method handlers and middleware.
 *
 * @example
 * ```typescript
 * // Define method and event maps
 * type MyMethods = {
 *   add: { params: { a: number, b: number }, result: number };
 * };
 * type MyEvents = {
 *   updated: { value: string };
 * };
 * type MyContext = { userId?: string };
 *
 * // Implement a transport (e.g., using WebSockets)
 * const transport: JSONRPCTransport = {
 *   send: async (message) => { websocket.send(JSON.stringify(message)); },
 *   onMessage: (callback) => {
 *     websocket.onmessage = (event) => callback(JSON.parse(event.data as string));
 *   }
 * };
 *
 * // Create and configure the node
 * const node = new JSONRPCNode<MyMethods, MyEvents, MyContext>(transport, { customContextValue: 123 });
 *
 * node.registerMethod('add', async (context, params) => {
 *   console.log('Context:', context.userId, context.customContextValue);
 *   return params.a + params.b;
 * });
 *
 * node.on('updated', (payload) => console.log('Event received:', payload.value));
 *
 * // To send requests or emit events:
 * // const sum = await node.callMethod('add', { a: 1, b: 2 });
 * // await node.emit('updated', { value: 'new data' });
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

  /**
   * Creates an instance of JSONRPCNode.
   *
   * @param transport - The transport mechanism for sending and receiving messages.
   *                    The node will automatically subscribe to `transport.onMessage`.
   * @param context - An optional initial context object to be passed to middleware and method handlers.
   *                  Defaults to an empty object.
   */
  constructor(
    private transport: JSONRPCTransport,
    public readonly context: C = {} as C,
  ) {
    this.methodManager = new MethodManager<T, C>();
    this.eventManager = new EventManager<E>();
    this.messageValidator = new MessageValidator();
    this.requestHandler = new RequestHandler<T, C>(this.methodManager);

    this.middlewareManager = new MiddlewareManager<T, C>((context, request) =>
      this.requestHandler.handleRequest(context, request),
    );

    // Automatically connect to the transport's message receiver
    this.transport.onMessage((message) => {
      this.receiveMessage(message).catch((error) => {
        // TODO: Consider a more robust error handling/logging strategy for unhandled receive errors.
        console.error('[JSONRPCNode] Error handling received message:', error);
      });
    });
  }

  /**
   * Registers a method handler for a given method name.
   *
   * @param name - The name of the method to register.
   * @param handler - The asynchronous function to handle requests for this method.
   *                  It receives the context and method parameters, and should return the result.
   */
  public registerMethod<M extends keyof T>(
    name: Extract<M, string>,
    handler: (context: C, params: T[M]['params']) => Promise<T[M]['result']>,
  ): void {
    const wrappedHandler = wrapHandler<T, M, C>(handler);
    this.methodManager.registerMethod(name, wrappedHandler);
  }

  /**
   * Registers a custom serializer for the parameters and/or result of a specific method.
   *
   * @param method - The name of the method for which to register the serializer.
   * @param serializer - The serializer implementation for the method's parameters and/or result.
   */
  public registerSerializer<M extends keyof T>(
    method: M,
    serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']>,
  ): void {
    this.methodManager.registerSerializer(method, serializer);
  }

  /**
   * Calls a remote JSON-RPC method.
   *
   * @param method - The name of the method to call.
   * @param params - The parameters for the method call.
   * @param timeoutInSeconds - Optional timeout for the request in seconds. Defaults to 0 (no timeout).
   * @returns A promise that resolves with the result of the method call.
   * @throws {TimeoutError} If the request times out.
   * @throws {JSONRPCError} If the remote end returns an error.
   * @throws {Error} If sending the request fails.
   */
  public async callMethod<M extends keyof T>(
    method: M,
    params?: T[M]['params'],
    timeoutInSeconds = 0,
  ): Promise<T[M]['result']> {
    const id = crypto.randomUUID();
    const serializer = this.methodManager.getSerializer(method);

    return new Promise((resolve, reject) => {
      this.methodManager.addPendingRequest(id, resolve, reject, timeoutInSeconds, serializer);

      const sendRequest = async () => {
        try {
          const serializedParams = await this.methodManager.serializeParams(method, params);
          const request: JSONRPCRequest<T, M> = {
            jsonrpc: '2.0',
            method,
            params: serializedParams as JSONRPCParams,
            id,
          };
          await this.transport.send(request);
        } catch (error) {
          reject(error);
          this.methodManager.rejectAllRequests(error instanceof Error ? error : new Error(String(error)));
        }
      };

      sendRequest();
    });
  }

  /**
   * Sends a JSON-RPC notification (a request without an ID, expecting no response).
   *
   * @param method - The name of the method for the notification.
   * @param params - The parameters for the notification.
   */
  public async notify<M extends keyof T>(method: M, params: T[M]['params']): Promise<void> {
    const serializedParams = await this.methodManager.serializeParams(method, params);

    await this.transport.send({
      jsonrpc: '2.0',
      method,
      params: serializedParams as JSONRPCParams,
    });
  }

  /**
   * Registers an event handler for a specific event name.
   *
   * @param event - The name of the event to listen for.
   * @param handler - The function to call when the event is received. It receives the event payload.
   * @returns A function that, when called, will remove this event handler.
   */
  public on<K extends keyof E>(event: K, handler: (params: E[K]) => void): () => void {
    return this.eventManager.on(event, handler);
  }

  /**
   * Emits an event to the remote end.
   *
   * @param event - The name of the event to emit.
   * @param params - The payload for the event.
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
   * Adds a middleware function to the request processing chain.
   * Middleware functions can intercept and modify incoming requests and outgoing responses.
   *
   * @param middleware - The middleware function to add.
   * @returns A function that, when called, will remove this middleware.
   */
  public addMiddleware(middleware: JSONRPCMiddleware<T, C>): () => void {
    return this.middlewareManager.addMiddleware(middleware);
  }

  /**
   * Processes an incoming message from the transport.
   * This method is typically called by the transport's `onMessage` handler.
   * It validates the message and routes it to the appropriate handler (request, response, or event).
   *
   * @param message - The raw message received from the transport.
   */
  public async receiveMessage(message: unknown): Promise<void> {
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
      await this.handleRequest(message as JSONRPCRequest<T, keyof T>);
    } else if (msg.event) {
      this.handleEvent(message as JSONRPCEvent<E, keyof E>);
    } else if (msg.id !== undefined) {
      await this.handleResponse(message as JSONRPCResponse<T>);
    }
  }

  private async handleRequest(request: JSONRPCRequest<T, keyof T>): Promise<void> {
    try {
      const response = await this.middlewareManager.execute(this.context, request);

      if (request.id !== undefined) {
        await this.transport.send(response);
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
        await this.transport.send(response);
      }
    }
  }

  private async handleResponse(response: JSONRPCResponse<T>): Promise<void> {
    await this.methodManager.handleResponse(response.id, response.result, response.error);
  }

  private handleEvent(event: JSONRPCEvent<E, keyof E>): void {
    this.eventManager.handleEvent(event.event, event.params);
  }

  /**
   * Sets a fallback handler for methods that are not explicitly registered.
   * This handler will be invoked if a request is received for a method name
   * that does not have a registered handler. The provided handler should return
   * the direct result of the operation, which will be wrapped into a MethodResponse.
   *
   * @param handler - The asynchronous function to handle fallback requests.
   *                  It receives the context, method name, and parameters, and should
   *                  return a Promise resolving to the method's result.
   */
  public setFallbackHandler(
    handler: (context: C, method: string, params: JSONRPCParams) => Promise<unknown>,
  ): void {
    this.methodManager.setFallbackHandler(wrapHandler(handler));
  }

  /**
   * Closes the JSON-RPC node, cleaning up resources.
   * This includes removing all event handlers, middleware, and rejecting any pending requests.
   * The underlying transport is not closed by this method and should be managed separately.
   */
  public async close(): Promise<void> {
    this.eventManager.removeAllHandlers();
    this.middlewareManager.removeAllMiddleware();
    this.methodManager.rejectAllRequests(new Error('Node closed'));
  }
}
