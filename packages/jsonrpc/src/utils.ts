import type {
  JSONRPCContext,
  JSONRPCMethodMap,
  JSONRPCMiddleware,
  JSONRPCRequest,
  JSONRPCID,
  JSONRPCSerializedData,
} from './types.js';

/**
 * Creates a middleware that only applies to specific JSON-RPC methods.
 * Enables selective middleware application based on method names, allowing
 * different middleware stacks for different methods.
 *
 * Common use cases:
 * - Authentication for sensitive operations
 * - Logging for specific methods
 * - Rate limiting for expensive operations
 * - Caching for read operations
 * - Validation for specific parameter types
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam C - The context type shared between middleware and handlers
 * @param methods - Array of method names to apply the middleware to
 * @param middleware - The middleware to apply to the specified methods
 * @returns A new middleware function that only executes for the specified methods
 *
 * @example
 * ```typescript
 * // Authentication for sensitive methods
 * node.addMiddleware(
 *   applyToMethods(['transferFunds', 'updateProfile'],
 *     async (context, request, next) => {
 *       if (!context.isAuthenticated) {
 *         throw new JSONRPCError(-32600, 'Authentication required');
 *       }
 *       return next();
 *     }
 *   )
 * );
 *
 * // Logging for specific methods
 * node.addMiddleware(
 *   applyToMethods(['createUser', 'deleteUser'],
 *     async (context, request, next) => {
 *       console.log(`Admin action: ${request.method}`, request.params);
 *       const response = await next();
 *       console.log(`Result:`, response.result);
 *       return response;
 *     }
 *   )
 * );
 *
 * // Rate limiting for expensive operations
 * node.addMiddleware(
 *   applyToMethods(['generateReport', 'runAnalysis'],
 *     async (context, request, next) => {
 *       const key = `${request.method}:${context.userId}`;
 *       if (!rateLimiter.allowRequest(key)) {
 *         throw new JSONRPCError(-32000, 'Rate limit exceeded');
 *       }
 *       return next();
 *     }
 *   )
 * );
 * ```
 */
export function applyToMethods<T extends JSONRPCMethodMap, C extends JSONRPCContext>(
  methods: (keyof T)[],
  middleware: JSONRPCMiddleware<T, C>,
): JSONRPCMiddleware<T, C> {
  return async (context: C, request: JSONRPCRequest<T, keyof T>, next) => {
    if ('method' in request && methods.includes(request.method)) {
      return middleware(context, request, next);
    }
    return next();
  };
}

/**
 * Type guard for validating JSON-RPC message identifiers.
 * Ensures a value matches the JSON-RPC 2.0 spec for request/response correlation:
 * - string or number for request/response pairs
 * - undefined for notifications (no response expected)
 * - null for error responses to invalid requests
 *
 * @param value - The value to check
 * @returns True if the value is a valid JSON-RPC ID
 *
 * @example
 * ```typescript
 * // Validate request ID
 * if (!isJSONRPCID(message.id)) {
 *   throw new JSONRPCError(-32600, 'Invalid Request ID');
 * }
 *
 * // Check for notification
 * if (isJSONRPCID(message.id) && message.id === undefined) {
 *   console.log('Processing notification');
 * }
 *
 * // Handle error response
 * if (isJSONRPCID(message.id) && message.id === null) {
 *   console.error('Error response for invalid request');
 * }
 * ```
 */
export function isJSONRPCID(value: unknown): value is JSONRPCID {
  return typeof value === 'string' || typeof value === 'number' || value === undefined;
}

/**
 * Type guard for validating JSON-RPC protocol version.
 * Ensures strict compliance with JSON-RPC 2.0 specification.
 * The version must be exactly the string '2.0' - no other values are valid.
 *
 * @param value - The value to check
 * @returns True if the value is '2.0'
 *
 * @example
 * ```typescript
 * // Basic version check
 * if (!isJSONRPCVersion(message.jsonrpc)) {
 *   throw new JSONRPCError(-32600, 'Invalid JSON-RPC version');
 * }
 *
 * // Common error cases
 * isJSONRPCVersion('2') // false - must be '2.0'
 * isJSONRPCVersion(2.0) // false - must be string
 * isJSONRPCVersion('1.0') // false - version 1.0 not supported
 * ```
 */
export function isJSONRPCVersion(value: unknown): value is '2.0' {
  return value === '2.0';
}

/**
 * Type guard for validating JSON-RPC serialized data.
 * Checks if a value matches the JSONRPCSerializedData structure,
 * which is used for transmitting complex objects that need special handling.
 *
 * Valid serialized data must:
 * - Be an object (not null)
 * - Have a 'serialized' property
 * - The 'serialized' property must be a string
 *
 * @param value - The value to check
 * @returns True if the value is valid serialized data
 *
 * @example
 * ```typescript
 * // Handling method results
 * if (isJSONRPCSerializedData(response.result)) {
 *   // Handle serialized data (e.g., Date objects)
 *   const result = deserializer.deserialize(response.result);
 *   console.log('Deserialized:', result instanceof Date); // true
 * } else {
 *   // Handle raw data (e.g., numbers, strings)
 *   const result = response.result;
 * }
 *
 * // Common serialization cases
 * const dateSerializer = {
 *   serialize: (date: Date) => ({
 *     serialized: date.toISOString() // Creates valid serialized data
 *   }),
 *   deserialize: (data) => new Date(data.serialized)
 * };
 *
 * // Invalid cases
 * isJSONRPCSerializedData({ data: 'string' }) // false - missing 'serialized'
 * isJSONRPCSerializedData({ serialized: 123 }) // false - not a string
 * isJSONRPCSerializedData(null) // false - not an object
 * ```
 */
export function isJSONRPCSerializedData(value: unknown): value is JSONRPCSerializedData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'serialized' in value &&
    typeof (value as JSONRPCSerializedData).serialized === 'string'
  );
}
