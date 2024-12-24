/**
 * Represents a JSON-RPC message identifier.
 * - `undefined` for notifications (messages that don't require a response)
 * - `string` or `number` for request/response correlation
 *
 * @example
 * ```typescript
 * const id: JSONRPCID = "request-123"; // String ID
 * const id: JSONRPCID = 456; // Numeric ID
 * const id: JSONRPCID = undefined; // Notification (no response expected)
 * ```
 */
export type JSONRPCID = undefined | string | number;

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
export type JSONRPCSerializedData = { serialized: string };

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
   * @returns The serialized data
   */
  serialize(value: T): JSONRPCSerializedData;

  /**
   * Deserializes JSONRPCSerializedData back to the original type
   * @param value - The serialized data to deserialize
   * @returns The deserialized value
   */
  deserialize(value: JSONRPCSerializedData): T;
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
export type JSONRPCMethodDef<P extends JSONRPCParams = JSONRPCParams, R = unknown> = {
  /** The parameters of the method. */
  params?: P;
  /** The result of the method. */
  result: R;
  /** Optional serializer for parameters and result */
  serializer?: JSONRPCSerializer<P, R>;
};

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
export type JSONRPCMethodMap = {
  [method: string]: JSONRPCMethodDef;
};

/**
 * Represents a JSON-RPC 2.0 request message.
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam M - The specific method being called
 * @typeParam P - The parameters type for the method
 *
 * @example
 * ```typescript
 * const request: JSONRPCRequest<MethodMap, 'add'> = {
 *   jsonrpc: '2.0',
 *   method: 'add',
 *   params: { a: 1, b: 2 },
 *   id: 'request-123'
 * };
 *
 * // Notification (no response expected)
 * const notification: JSONRPCRequest<MethodMap, 'log'> = {
 *   jsonrpc: '2.0',
 *   method: 'log',
 *   params: { message: 'Hello' }
 * };
 * ```
 */
export interface JSONRPCRequest<
  T extends JSONRPCMethodMap,
  M extends keyof T,
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
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam M - The specific method that was called
 *
 * @example
 * ```typescript
 * // Successful response
 * const response: JSONRPCResponse<MethodMap, 'add'> = {
 *   jsonrpc: '2.0',
 *   result: 3,
 *   id: 'request-123'
 * };
 *
 * // Error response
 * const errorResponse: JSONRPCResponse<MethodMap> = {
 *   jsonrpc: '2.0',
 *   error: {
 *     code: -32600,
 *     message: 'Invalid Request'
 *   },
 *   id: 'request-123'
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
 * - Parse error (-32700)
 * - Invalid Request (-32600)
 * - Method not found (-32601)
 * - Invalid params (-32602)
 * - Internal error (-32603)
 * - Server error (-32000 to -32099)
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
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam C - The context type shared between middleware and handlers
 *
 * @example
 * ```typescript
 * const loggingMiddleware: JSONRPCMiddleware<MethodMap, Context> =
 *   async (context, request, next) => {
 *     console.log('Request:', request);
 *     const response = await next();
 *     console.log('Response:', response);
 *     return response;
 *   };
 *
 * const authMiddleware: JSONRPCMiddleware<MethodMap, Context> =
 *   async (context, request, next) => {
 *     if (!context.isAuthorized) {
 *       throw new JSONRPCError(-32600, 'Unauthorized');
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
 * Maps event names to their payload types for JSON-RPC events.
 *
 * @example
 * ```typescript
 * type EventMap = {
 *   userJoined: { username: string; timestamp: number };
 *   statusUpdate: { user: string; status: 'online' | 'offline' };
 *   messageReceived: { text: string; from: string };
 * };
 * ```
 */
export type JSONRPCEventMap = {
  [event: string]: unknown;
};

/**
 * Represents a JSON-RPC 2.0 event message.
 * Events are similar to notifications but use 'event' instead of 'method'.
 *
 * @typeParam T - The event map defining available events
 * @typeParam E - The specific event being emitted
 *
 * @example
 * ```typescript
 * const event: JSONRPCEvent<EventMap, 'userJoined'> = {
 *   jsonrpc: '2.0',
 *   event: 'userJoined',
 *   params: {
 *     username: 'Alice',
 *     timestamp: Date.now()
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
 *
 * @typeParam T - The event map defining available events
 * @typeParam E - The specific event being handled
 *
 * @example
 * ```typescript
 * const handler: JSONRPCEventHandler<EventMap, 'userJoined'> =
 *   ({ username, timestamp }) => {
 *     console.log(`${username} joined at ${new Date(timestamp)}`);
 *   };
 *
 * peer.on('userJoined', handler);
 * ```
 */
export type JSONRPCEventHandler<T extends JSONRPCEventMap, E extends keyof T> = (params: T[E]) => void;
