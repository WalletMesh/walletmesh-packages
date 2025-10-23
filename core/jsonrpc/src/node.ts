import { JSONRPCError } from './error.js';
import { EventManager } from './event-manager.js';
import { MessageValidator } from './message-validator.js';
import { MethodManager } from './method-manager.js';
import { MiddlewareManager } from './middleware-manager.js';
import { RequestHandler } from './request-handler.js';
import type {
  JSONRPCContext,
  JSONRPCEvent,
  JSONRPCEventMap,
  JSONRPCID,
  JSONRPCMethodMap,
  JSONRPCMiddleware,
  JSONRPCParams,
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCSerializer,
  JSONRPCTransport,
  MethodResponse,
} from './types.js';
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
  private preDeserializationMiddlewareManager: MiddlewareManager<T, C>;
  private postDeserializationMiddlewareManager: MiddlewareManager<T, C>;
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

    // Create post-deserialization middleware manager
    // The final handler gets the method and invokes it with deserialized params
    // It converts MethodResponse to JSONRPCResponse for the middleware chain
    this.postDeserializationMiddlewareManager = new MiddlewareManager<T, C>(async (context, request) => {
      const method = this.methodManager.getMethod(request.method);

      let methodResponse: MethodResponse<unknown>;

      if (method) {
        methodResponse = await method(context, request.method, request.params as T[keyof T]['params']);
      } else {
        // Try fallback handler
        const fallback = this.methodManager.getFallbackHandler();
        if (fallback) {
          methodResponse = await fallback(context, String(request.method), request.params);
        } else {
          throw new JSONRPCError(-32601, 'Method not found', String(request.method));
        }
      }

      // Convert MethodResponse to JSONRPCResponse
      // This is a temporary conversion - RequestHandler will extract the data back out
      if (methodResponse.success) {
        return {
          jsonrpc: '2.0' as const,
          result: methodResponse.data,
          id: request.id,
        };
      }

      // For errors, throw JSONRPCError
      throw new JSONRPCError(
        methodResponse.error.code,
        methodResponse.error.message,
        methodResponse.error.data,
      );
    });

    // Create request handler with both middleware managers
    this.requestHandler = new RequestHandler<T, C>(
      this.methodManager,
      this.postDeserializationMiddlewareManager,
    );

    // Create pre-deserialization middleware manager (wraps request handler)
    this.preDeserializationMiddlewareManager = new MiddlewareManager<T, C>((context, request) =>
      this.requestHandler.handleRequest(context, request),
    );

    // Automatically connect to the transport's message receiver
    this.transport.onMessage((message) => {
      this.receiveMessage(message).catch((error) => {
        // Enhanced error handling with categorization and recovery strategies
        this.handleReceiveError(error, message);
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

          // Debug logging removed (transport is private)

          const transportSendStartTime = Date.now();
          await this.transport.send(request);
          const transportSendElapsed = Date.now() - transportSendStartTime;

          console.log(`✅ JSONRPCNode.callMethod transport.send completed after ${transportSendElapsed}ms`, {
            method,
            id,
            elapsed: transportSendElapsed,
          });
        } catch (error) {
          console.error('❌ JSONRPCNode.callMethod transport.send failed', {
            method,
            id,
            error: error instanceof Error ? error.message : error,
            errorType: typeof error,
            errorName: error instanceof Error ? error.constructor.name : 'Unknown',
            errorStack: error instanceof Error ? error.stack : undefined,
            // Transport state removed (transport is private)
          });

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
   * Send a JSON-RPC notification (request without id) to the remote endpoint.
   *
   * @param method - Method name of the notification
   * @param params - Optional parameters payload
   * @protected
   */
  protected async sendNotification(method: string, params?: JSONRPCParams): Promise<void> {
    const notification: JSONRPCRequest<JSONRPCMethodMap, string> = {
      jsonrpc: '2.0',
      method,
    };

    if (params !== undefined) {
      notification.params = params;
    }

    await this.transport.send(notification);
  }

  /**
   * Adds a middleware function to the pre-deserialization request processing chain.
   * Pre-deserialization middleware runs BEFORE params are deserialized, so it sees raw/serialized params.
   * This is the default behavior for backward compatibility with existing middleware.
   *
   * @param middleware - The middleware function to add.
   * @returns A function that, when called, will remove this middleware.
   */
  public addMiddleware(middleware: JSONRPCMiddleware<T, C>): () => void {
    return this.preDeserializationMiddlewareManager.addMiddleware(middleware);
  }

  /**
   * Adds a middleware function to the post-deserialization request processing chain.
   * Post-deserialization middleware runs AFTER params are deserialized, so it sees typed domain objects.
   * Use this when your middleware needs to work with the actual deserialized parameter types.
   *
   * @param middleware - The middleware function to add.
   * @returns A function that, when called, will remove this middleware.
   */
  public addPostDeserializationMiddleware(middleware: JSONRPCMiddleware<T, C>): () => void {
    return this.postDeserializationMiddlewareManager.addMiddleware(middleware);
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
      const response = await this.preDeserializationMiddlewareManager.execute(this.context, request);

      if (request.id !== undefined) {
        await this.transport.send(response);
      }
    } catch (error) {
      if (request.id !== undefined) {
        const response: JSONRPCResponse<T> = {
          jsonrpc: '2.0',
          error:
            error instanceof JSONRPCError
              ? {
                  code: error.code,
                  message: error.message,
                  // Ensure data is either undefined or a proper value, never null
                  data: error.data === null ? undefined : error.data,
                }
              : { code: -32000, message: error instanceof Error ? error.message : 'Unknown error' },
          id: request.id,
        };
        await this.transport.send(response);
      }
    }
  }

  private async handleResponse(response: JSONRPCResponse<T>): Promise<void> {
    // Ensure error is undefined if it's null to prevent downstream issues
    const error = response.error === null ? undefined : response.error;
    await this.methodManager.handleResponse(response.id, response.result, error);
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
   * Gets the list of registered method names.
   * Used for capability discovery following the wm_getSupportedMethods pattern.
   *
   * @returns Array of registered method names as strings.
   */
  public getRegisteredMethods(): string[] {
    return this.methodManager.getRegisteredMethods();
  }

  /**
   * Enhanced error handler for receive errors with categorization and recovery strategies.
   * This method provides improved error handling compared to basic console logging.
   *
   * @param error - The error that occurred during message processing
   * @param rawMessage - The raw message that caused the error
   * @private
   */
  private handleReceiveError(error: unknown, rawMessage: unknown): void {
    // Enhanced error handling with categorization
    const errorInfo = this.categorizeReceiveError(error);

    // Log with appropriate severity
    const logMessage = `[JSONRPCNode] Receive error - Category: ${errorInfo.category}, Severity: ${errorInfo.severity}`;
    const logData = {
      error: error instanceof Error ? error.message : String(error),
      rawMessage,
      recoveryAction: errorInfo.recoveryAction,
    };

    switch (errorInfo.severity) {
      case 'LOW':
        console.debug(logMessage, logData);
        break;
      case 'MEDIUM':
        console.warn(logMessage, logData);
        break;
      case 'HIGH':
      case 'CRITICAL':
        console.error(logMessage, logData);
        break;
    }

    // Emit error event for external handling
    try {
      if (this.eventManager && 'emit' in this.eventManager) {
        // Emit internal error event if supported
        (this.eventManager as { emit?: (event: string, data: unknown) => void }).emit?.('receiveError', {
          category: errorInfo.category,
          severity: errorInfo.severity,
          error: error instanceof Error ? error : new Error(String(error)),
          rawMessage,
          recoveryAction: errorInfo.recoveryAction,
          timestamp: Date.now(),
        });
      }
    } catch (emitError) {
      // Don't let error emission cause further issues
      console.warn('[JSONRPCNode] Failed to emit error event:', emitError);
    }
  }

  /**
   * Categorizes receive errors for improved handling and observability.
   *
   * @param error - The error to categorize
   * @returns Error information with category, severity, and recovery action
   * @private
   */
  private categorizeReceiveError(error: unknown): {
    category: string;
    severity: string;
    recoveryAction: string;
  } {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Check for JSON-RPC specific errors
      if ('code' in error && typeof error.code === 'number') {
        const code = error.code;
        switch (code) {
          case -32700: // Parse error
            return {
              category: 'PARSE',
              severity: 'HIGH',
              recoveryAction: 'Validate message format before processing',
            };
          case -32600: // Invalid Request
          case -32602: // Invalid params
            return {
              category: 'VALIDATION',
              severity: 'MEDIUM',
              recoveryAction: 'Check JSON-RPC message structure and required fields',
            };
          case -32601: // Method not found
            return {
              category: 'METHOD',
              severity: 'LOW',
              recoveryAction: 'Register the missing method handler',
            };
          case -32603: // Internal error
            return {
              category: 'METHOD',
              severity: 'MEDIUM',
              recoveryAction: 'Review method implementation for errors',
            };
          default:
            if (code >= -32099 && code <= -32000) {
              return {
                category: 'METHOD',
                severity: 'MEDIUM',
                recoveryAction: 'Review server error and retry if appropriate',
              };
            }
        }
      }

      // Categorize by error message content
      if (message.includes('parse') || message.includes('json')) {
        return {
          category: 'PARSE',
          severity: 'HIGH',
          recoveryAction: 'Validate message format before processing',
        };
      }

      if (message.includes('invalid') || message.includes('validation')) {
        return {
          category: 'VALIDATION',
          severity: 'MEDIUM',
          recoveryAction: 'Check JSON-RPC message structure and required fields',
        };
      }

      if (message.includes('transport') || message.includes('connection')) {
        return {
          category: 'TRANSPORT',
          severity: 'HIGH',
          recoveryAction: 'Check transport connection and retry',
        };
      }
    }

    // Default for unknown errors
    return {
      category: 'UNKNOWN',
      severity: 'CRITICAL',
      recoveryAction: 'Investigate unexpected error and add proper handling',
    };
  }

  /**
   * Closes the JSON-RPC node, cleaning up resources.
   * This includes removing all event handlers, middleware, and rejecting any pending requests.
   * The underlying transport is not closed by this method and should be managed separately.
   */
  public async close(): Promise<void> {
    this.eventManager.removeAllHandlers();
    this.preDeserializationMiddlewareManager.removeAllMiddleware();
    this.postDeserializationMiddlewareManager.removeAllMiddleware();
    this.methodManager.rejectAllRequests(new Error('Node closed'));
  }
}
