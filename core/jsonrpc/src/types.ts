/**
 * Represents a JSON-RPC message identifier.
 * - `undefined` for notifications (messages that don't require a response)
 * - `string` or `number` for request/response correlation
 * - `null` for error responses to invalid requests
 *
 * @example
 * ```typescript
 * const id: JSONRPCID = "request-123"; // String ID
 * const id: JSONRPCID = 456; // Numeric ID
 * const id: JSONRPCID = undefined; // Notification (no response expected)
 * const id: JSONRPCID = null; // Error response for invalid request
 * ```
 */
export type JSONRPCID = undefined | string | number | null;

/**
 * Represents JSON-RPC method parameters.
 * - `undefined` for methods without parameters
 * - Array for positional parameters
 * - Object for named parameters
 *
 * @example
 * ```typescript
 * // No parameters
 * const params: JSONRPCParams = undefined;
 *
 * // Positional parameters
 * const params: JSONRPCParams = [1, "hello", true];
 *
 * // Named parameters
 * const params: JSONRPCParams = { x: 1, y: 2, message: "hello" };
 * ```
 */
export type JSONRPCParams = undefined | unknown[] | Record<string, unknown>;

/**
 * Represents serialized data in a JSON-RPC message.
 * Used by serializers to convert complex types to/from JSON-compatible format.
 *
 * @example
 * ```typescript
 * const serialized: JSONRPCSerializedData = {
 *   serialized: JSON.stringify({ date: new Date().toISOString() })
 * };
 * ```
 */
export type JSONRPCSerializedData = {
  serialized: string;
  method: string;
};

/**
 * Interface for serializing and deserializing values.
 * Enables custom type conversion for complex objects that need special handling.
 *
 * @typeParam T - The type of value to serialize/deserialize
 *
 * @example
 * ```typescript
 * const dateSerializer: Serializer<Date> = {
 *   serialize: (date) => ({ serialized: date.toISOString() }),
 *   deserialize: (data) => new Date(data.serialized)
 * };
 * ```
 */
export interface Serializer<T> {
  /**
   * Serializes a value to JSONRPCSerializedData
   * @param value - The value to serialize
   * @param method - The method name associated with this serialization
   * @returns The serialized data
   */
  serialize(method: string, value: T): Promise<JSONRPCSerializedData>;

  /**
   * Deserializes JSONRPCSerializedData back to the original type
   * @param method - The method name associated with this deserialization
   * @param value - The serialized data to deserialize
   * @returns The deserialized value
   */
  deserialize(method: string, value: JSONRPCSerializedData): Promise<T>;
}

/**
 * Interface for RPC method parameter and result serialization.
 * Allows defining separate serializers for method parameters and return values.
 *
 * @typeParam P - The parameters type
 * @typeParam R - The result type
 *
 * @example
 * ```typescript
 * const methodSerializer: JSONRPCSerializer<{ date: Date }, Date> = {
 *   params: dateSerializer,
 *   result: dateSerializer
 * };
 * ```
 */
export interface JSONRPCSerializer<P, R> {
  /**
   * Serializer for method parameters
   */
  params: Serializer<P>;

  /**
   * Optional serializer for method result
   */
  result?: Serializer<R>;
}

/**
 * Defines a JSON-RPC method's parameter and result types, with optional serialization.
 *
 * @example
 * ```typescript
 * type AddMethod = JSONRPCMethodDef<
 *   { a: number; b: number }, // Parameters type
 *   number                    // Result type
 * >;
 *
 * type DateMethod = JSONRPCMethodDef<
 *   { date: Date },  // Parameters type
 *   Date,            // Result type
 *   {
 *     params: dateSerializer,
 *     result: dateSerializer
 *   }
 * >;
 * ```
 */
export interface JSONRPCMethodDef<P extends JSONRPCParams = JSONRPCParams, R = unknown> {
  /** The parameters of the method. */
  params?: P;
  /** The result of the method. */
  result: R;
  /** Optional serializer for parameters and result */
  serializer?: JSONRPCSerializer<P, R>;
}

/**
 * Maps method names to their definitions in a JSON-RPC interface.
 *
 * @example
 * ```typescript
 * type MethodMap = {
 *   add: {
 *     params: { a: number; b: number };
 *     result: number;
 *   };
 *   greet: {
 *     params: { name: string };
 *     result: string;
 *   };
 * };
 * ```
 */
export interface JSONRPCMethodMap {
  [method: string]: JSONRPCMethodDef;
}

/**
 * Function type for handling JSON-RPC method calls.
 * Method handlers receive a context object and typed parameters,
 * and return a promise that resolves to a MethodResponse containing either
 * a success result or an error.
 *
 * @typeParam T - The RPC method map defining available methods and their types
 * @typeParam M - The specific method name being handled (must be a key of T)
 * @typeParam C - The context type for method handlers (defaults to JSONRPCContext)
 *
 * @example
 * ```typescript
 * // Simple handler returning success response
 * const addHandler: MethodHandler<MethodMap, 'add', Context> =
 *   async (context, method, { a, b }) => ({
 *     success: true,
 *     data: a + b
 *   });
 *
 * // Handler with error response
 * const getUserHandler: MethodHandler<MethodMap, 'getUser', Context> =
 *   async (context, method, { id }) => {
 *     if (!context.isAuthorized) {
 *       return {
 *         success: false,
 *         error: {
 *           code: -32600,
 *           message: 'Unauthorized'
 *         }
 *       };
 *     }
 *     const user = await db.users.findById(id);
 *     return {
 *       success: true,
 *       data: user
 *     };
 *   };
 * ```
 */
export type MethodHandler<
  T extends JSONRPCMethodMap,
  M extends keyof T,
  C extends JSONRPCContext = JSONRPCContext,
> = (context: C, method: M, params: T[M]['params']) => Promise<MethodResponse<T[M]['result']>>;

/**
 * Represents a JSON-RPC 2.0 request message.
 * Requests can be either method calls (with an ID) or notifications (without an ID).
 *
 * @typeParam T - The RPC method map defining available methods and their types
 * @typeParam M - The specific method name being called (must be a key of T)
 * @typeParam P - The parameters type for the method (defaults to JSONRPCParams)
 *
 * @example
 * ```typescript
 * // Method call with named parameters
 * const request: JSONRPCRequest<MethodMap, 'add'> = {
 *   jsonrpc: '2.0',
 *   method: 'add',
 *   params: { a: 1, b: 2 },
 *   id: 'request-123'
 * };
 *
 * // Method call with positional parameters
 * const request: JSONRPCRequest<MethodMap, 'multiply'> = {
 *   jsonrpc: '2.0',
 *   method: 'multiply',
 *   params: [3, 4],
 *   id: 456
 * };
 *
 * // Notification (no response expected)
 * const notification: JSONRPCRequest<MethodMap, 'log'> = {
 *   jsonrpc: '2.0',
 *   method: 'log',
 *   params: { message: 'Hello' }
 *   // No id field for notifications
 * };
 * ```
 */
export interface JSONRPCRequest<
  T extends JSONRPCMethodMap,
  M extends keyof T = keyof T,
  P extends JSONRPCParams = JSONRPCParams,
> {
  /** The JSON-RPC version ('2.0'). */
  jsonrpc: '2.0';
  /** The method name. */
  method: M;
  /** The parameters of the method. */
  params?: P;
  /** The request ID. */
  id?: JSONRPCID;
}

/**
 * Represents a JSON-RPC 2.0 response message.
 * A response must include either a result (for success) or an error (for failure),
 * but never both. The id field must match the id from the request.
 *
 * @typeParam T - The RPC method map defining available methods and their types
 * @typeParam M - The specific method that was called (must be a key of T)
 *
 * @example
 * ```typescript
 * // Successful response with primitive result
 * const response: JSONRPCResponse<MethodMap, 'add'> = {
 *   jsonrpc: '2.0',
 *   result: 3,
 *   id: 'request-123'
 * };
 *
 * // Successful response with object result
 * const response: JSONRPCResponse<MethodMap, 'getUser'> = {
 *   jsonrpc: '2.0',
 *   result: { id: 123, name: 'Alice' },
 *   id: 'request-456'
 * };
 *
 * // Error response
 * const errorResponse: JSONRPCResponse<MethodMap> = {
 *   jsonrpc: '2.0',
 *   error: {
 *     code: -32600,
 *     message: 'Invalid Request',
 *     data: { details: 'Missing required parameter: id' }
 *   },
 *   id: 'request-123'
 * };
 *
 * // Error response for invalid request (null id)
 * const invalidResponse: JSONRPCResponse<MethodMap> = {
 *   jsonrpc: '2.0',
 *   error: {
 *     code: -32600,
 *     message: 'Invalid Request'
 *   },
 *   id: null
 * };
 * ```
 */
export interface JSONRPCResponse<T extends JSONRPCMethodMap, M extends keyof T = keyof T> {
  /** The JSON-RPC version ('2.0'). */
  jsonrpc: '2.0';
  /** The result of the method call, if successful. Can be modified by middleware. */
  result?: T[M]['result'];
  /** The error object, if an error occurred. */
  error?: JSONRPCErrorInterface;
  /** The request ID. */
  id: JSONRPCID;
}

/**
 * Represents a JSON-RPC 2.0 error object.
 *
 * Standard error codes:
 * - Parse error (-32700): Invalid JSON was received
 * - Invalid Request (-32600): The JSON sent is not a valid Request object
 * - Method not found (-32601): The method does not exist / is not available
 * - Invalid params (-32602): Invalid method parameter(s)
 * - Internal error (-32603): Internal JSON-RPC error
 * - Server error (-32000 to -32099): Implementation-defined server errors
 *
 * @example
 * ```typescript
 * const error: JSONRPCErrorInterface = {
 *   code: -32600,
 *   message: 'Invalid Request',
 *   data: { details: 'Missing required parameter' }
 * };
 * ```
 */
export interface JSONRPCErrorInterface {
  /** The error code. */
  code: number;
  /** The error message. */
  message: string;
  /** Additional error data. */
  data?: string | Record<string, unknown> | undefined;
}

/**
 * Represents a middleware function that can intercept and modify JSON-RPC requests/responses.
 * Middleware functions are executed in order before and after method handlers,
 * allowing for cross-cutting concerns like logging, authentication, and error handling.
 *
 * @typeParam T - The RPC method map defining available methods and their types
 * @typeParam C - The context type shared between middleware and handlers (defaults to JSONRPCContext)
 *
 * @example
 * ```typescript
 * // Logging middleware with timing
 * const loggingMiddleware: JSONRPCMiddleware<MethodMap, Context> =
 *   async (context, request, next) => {
 *     const startTime = Date.now();
 *     console.log(`[${startTime}] Request:`, request);
 *
 *     try {
 *       const response = await next();
 *       console.log(`[${Date.now()}] Response (${Date.now() - startTime}ms):`, response);
 *       return response;
 *     } catch (error) {
 *       console.error(`[${Date.now()}] Error (${Date.now() - startTime}ms):`, error);
 *       throw error;
 *     }
 *   };
 *
 * // Authentication middleware with role checking
 * const authMiddleware: JSONRPCMiddleware<MethodMap, Context> =
 *   async (context, request, next) => {
 *     if (!context.isAuthorized) {
 *       return {
 *         jsonrpc: '2.0',
 *         error: {
 *           code: -32600,
 *           message: 'Unauthorized',
 *           data: { requiredRole: 'admin' }
 *         },
 *         id: request.id
 *       };
 *     }
 *     return next();
 *   };
 *
 * // Rate limiting middleware
 * const rateLimitMiddleware: JSONRPCMiddleware<MethodMap, Context> =
 *   async (context, request, next) => {
 *     const { ip } = context;
 *     const limit = await rateLimit.check(ip);
 *     if (!limit.success) {
 *       return {
 *         jsonrpc: '2.0',
 *         error: {
 *           code: -32000,
 *           message: 'Rate limit exceeded',
 *           data: {
 *             retryAfter: limit.resetTime,
 *             limit: limit.max,
 *             remaining: limit.remaining
 *           }
 *         },
 *         id: request.id
 *       };
 *     }
 *     return next();
 *   };
 * ```
 */
export type JSONRPCMiddleware<T extends JSONRPCMethodMap, C extends JSONRPCContext> = (
  context: C,
  request: JSONRPCRequest<T, keyof T>,
  next: () => Promise<JSONRPCResponse<T>>,
) => Promise<JSONRPCResponse<T>>;

/**
 * Base type for context objects shared between middleware and method handlers.
 * Extend this type to add custom context properties.
 *
 * @example
 * ```typescript
 * type CustomContext = JSONRPCContext & {
 *   user?: string;
 *   isAuthorized?: boolean;
 *   session?: {
 *     id: string;
 *     expires: Date;
 *   };
 * };
 * ```
 */
export type JSONRPCContext = Record<string, unknown>;

/**
 * Function type for sending JSON-RPC messages between nodes.
 * Implement this to provide the actual transport mechanism for message delivery.
 * The transport layer handles message serialization and delivery between nodes.
 *
 * @example
 * ```typescript
 * // WebSocket transport with reconnection and error handling
 * const wsTransport: JSONRPCTransport = {
 *   send: message => {
 *     if (ws.readyState !== WebSocket.OPEN) {
 *       throw new Error('WebSocket not connected');
 *     }
 *     ws.send(JSON.stringify(message));
 *   }
 * };
 *
 * // postMessage transport with origin validation
 * const windowTransport: JSONRPCTransport = {
 *   send: message => {
 *     if (!targetWindow) {
 *       throw new Error('Target window not available');
 *     }
 *     targetWindow.postMessage(JSON.stringify(message), targetOrigin);
 *   }
 * };
 *
 * // HTTP transport with fetch
 * const httpTransport: JSONRPCTransport = {
 *   send: async message => {
 *     try {
 *       const response = await fetch('https://api.example.com/jsonrpc', {
 *         method: 'POST',
 *         headers: {
 *           'Content-Type': 'application/json',
 *           'Authorization': `Bearer ${token}`
 *         },
 *         body: JSON.stringify(message)
 *       });
 *       if (!response.ok) {
 *         throw new Error(`HTTP error: ${response.status}`);
 *       }
 *     } catch (error) {
 *       console.error('Transport error:', error);
 *       throw error;
 *     }
 *   }
 * };
 * ```
 */
export interface JSONRPCTransport {
  /**
   * Sends a JSON-RPC message to the remote node.
   * The implementation should handle message serialization and delivery.
   *
   * @param message - The message to send. This will be a JSON-RPC request,
   *                 response, or event object that needs to be delivered to
   *                 the remote node.
   * @returns A promise that resolves when the message has been sent
   * @throws {Error} If message delivery fails (e.g., connection lost)
   */
  send(message: unknown): Promise<void>;
}

/**
 * Maps event names to their payload types for JSON-RPC events.
 * Events provide a way to handle asynchronous notifications with typed payloads.
 * Unlike methods, events are one-way communications and don't expect responses.
 *
 * @example
 * ```typescript
 * // Define event types with their payloads
 * type EventMap = {
 *   // User lifecycle events
 *   userJoined: { username: string; timestamp: number };
 *   userLeft: { username: string; timestamp: number };
 *
 *   // Status events
 *   statusUpdate: {
 *     user: string;
 *     status: 'online' | 'offline' | 'away';
 *     lastSeen?: number;
 *   };
 *
 *   // Chat events
 *   messageReceived: {
 *     id: string;
 *     text: string;
 *     from: string;
 *     timestamp: number;
 *     attachments?: Array<{
 *       type: 'image' | 'file';
 *       url: string;
 *     }>;
 *   };
 * };
 * ```
 */
export interface JSONRPCEventMap {
  [event: string]: unknown;
}

/**
 * Represents a JSON-RPC 2.0 event message.
 * Events are similar to notifications but use 'event' instead of 'method'.
 * While notifications are used for one-way method calls, events are used
 * for broadcasting state changes or significant occurrences in the system.
 *
 * @typeParam T - The event map defining available events and their payload types
 * @typeParam E - The specific event being emitted (must be a key of T)
 *
 * @example
 * ```typescript
 * // User joined event
 * const joinEvent: JSONRPCEvent<EventMap, 'userJoined'> = {
 *   jsonrpc: '2.0',
 *   event: 'userJoined',
 *   params: {
 *     username: 'Alice',
 *     timestamp: Date.now()
 *   }
 * };
 *
 * // Status update event
 * const statusEvent: JSONRPCEvent<EventMap, 'statusUpdate'> = {
 *   jsonrpc: '2.0',
 *   event: 'statusUpdate',
 *   params: {
 *     user: 'Bob',
 *     status: 'away',
 *     lastSeen: Date.now()
 *   }
 * };
 * ```
 */
export interface JSONRPCEvent<T extends JSONRPCEventMap, E extends keyof T> {
  /** The JSON-RPC version ('2.0'). */
  jsonrpc: '2.0';
  /** The event name. */
  event: E;
  /** The event payload. */
  params: T[E];
}

/**
 * Represents a function that handles JSON-RPC events.
 * Event handlers receive typed event payloads and are used to react to
 * events emitted by remote nodes. Unlike method handlers, event handlers
 * are synchronous and don't return responses.
 *
 * @typeParam T - The event map defining available events and their payload types
 * @typeParam E - The specific event being handled (must be a key of T)
 *
 * @example
 * ```typescript
 * // Simple event logging
 * const logHandler: JSONRPCEventHandler<EventMap, 'userJoined'> =
 *   ({ username, timestamp }) => {
 *     console.log(`${username} joined at ${new Date(timestamp)}`);
 *   };
 *
 * // Event handler with state updates
 * const statusHandler: JSONRPCEventHandler<EventMap, 'statusUpdate'> =
 *   ({ user, status, lastSeen }) => {
 *     userStates.set(user, { status, lastSeen });
 *     ui.updateUserStatus(user, status);
 *   };
 *
 * // Event handler with error handling
 * const messageHandler: JSONRPCEventHandler<EventMap, 'messageReceived'> =
 *   ({ id, text, from, timestamp, attachments }) => {
 *     try {
 *       chatLog.addMessage({ id, text, from, timestamp });
 *       if (attachments?.length) {
 *         attachments.forEach(attachment => {
 *           mediaCache.preload(attachment.url);
 *         });
 *       }
 *     } catch (error) {
 *       console.error('Failed to process message:', error);
 *     }
 *   };
 *
 * // Register handlers
 * peer.on('userJoined', logHandler);
 * peer.on('statusUpdate', statusHandler);
 * peer.on('messageReceived', messageHandler);
 * ```
 */
export type JSONRPCEventHandler<T extends JSONRPCEventMap, E extends keyof T> = (params: T[E]) => void;

/**
 * Represents the response from a method handler.
 * Uses a discriminated union to distinguish between success and error cases.
 * The success field acts as a type guard to narrow the response type.
 *
 * @typeParam T - The type of the successful result data
 *
 * @example
 * ```typescript
 * // Success case with primitive result
 * const success: MethodResponse<number> = {
 *   success: true,
 *   data: 42
 * };
 *
 * // Success case with complex result
 * const userResponse: MethodResponse<User> = {
 *   success: true,
 *   data: {
 *     id: 123,
 *     name: 'Alice',
 *     roles: ['admin']
 *   }
 * };
 *
 * // Error case with standard error code
 * const error: MethodResponse<number> = {
 *   success: false,
 *   error: {
 *     code: -32602,
 *     message: 'Invalid params',
 *     data: { field: 'age', reason: 'must be positive' }
 *   }
 * };
 *
 * // Error case with custom error data
 * const customError: MethodResponse<User> = {
 *   success: false,
 *   error: {
 *     code: -32000,
 *     message: 'User not found',
 *     data: {
 *       id: 123,
 *       suggestions: ['124', '125', '126']
 *     }
 *   }
 * };
 * ```
 */
export type MethodResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: number;
        message: string;
        data?: string | Record<string, unknown> | undefined;
      };
    };

/**
 * Function type for handling unregistered JSON-RPC method calls.
 * The fallback handler receives the context, method name, and raw parameters,
 * and can implement custom logic for handling unknown methods.
 *
 * @typeParam C - The context type for method handlers
 *
 * @example
 * ```typescript
 * const fallbackHandler: FallbackMethodHandler<Context> =
 *   async (context, method, params) => {
 *     console.log(`Unknown method called: ${method}`);
 *     return {
 *       success: false,
 *       error: {
 *         code: -32601,
 *         message: `Method ${method} is not supported`,
 *         data: { availableMethods: ['add', 'subtract'] }
 *       }
 *     };
 *   };
 * ```
 */
export type FallbackMethodHandler<C extends JSONRPCContext> = (
  context: C,
  method: string,
  params: JSONRPCParams,
) => Promise<MethodResponse<unknown>>;
