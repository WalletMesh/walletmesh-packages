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
 * This is useful for applying middleware selectively, such as authentication
 * for sensitive operations or logging for specific methods.
 *
 * @typeParam T - The RPC method map defining available methods
 * @typeParam C - The context type shared between middleware and handlers
 * @param methods - Array of method names to apply the middleware to
 * @param middleware - The middleware to apply to the specified methods
 * @returns A new middleware function that only executes for the specified methods
 *
 * @example
 * ```typescript
 * // Apply authentication only to sensitive methods
 * peer.addMiddleware(
 *   applyToMethods(['transferFunds', 'updateProfile'],
 *     async (context, request, next) => {
 *       if (!context.isAuthenticated) {
 *         throw new JSONRPCError(-32600, 'Authentication required');
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
 * Checks if a value is a valid JSONRPCID (string, number, or undefined).
 *
 * @param value - The value to check
 * @returns True if the value is a valid JSON-RPC ID
 *
 * @example
 * ```typescript
 * if (isJSONRPCID(message.id)) {
 *   // Handle valid ID
 * } else {
 *   throw new JSONRPCError(-32600, 'Invalid Request ID');
 * }
 * ```
 */
export function isJSONRPCID(value: unknown): value is JSONRPCID {
  return typeof value === 'string' || typeof value === 'number' || value === undefined;
}

/**
 * Type guard for validating JSON-RPC protocol version.
 * Checks if a value is the string '2.0' as required by the JSON-RPC 2.0 spec.
 *
 * @param value - The value to check
 * @returns True if the value is '2.0'
 *
 * @example
 * ```typescript
 * if (!isJSONRPCVersion(message.jsonrpc)) {
 *   throw new JSONRPCError(-32600, 'Invalid JSON-RPC version');
 * }
 * ```
 */
export function isJSONRPCVersion(value: unknown): value is '2.0' {
  return value === '2.0';
}

/**
 * Type guard for validating JSON-RPC serialized data.
 * Checks if a value matches the JSONRPCSerializedData structure.
 *
 * @param value - The value to check
 * @returns True if the value is valid serialized data
 *
 * @example
 * ```typescript
 * if (isJSONRPCSerializedData(response.result)) {
 *   // Handle serialized data
 *   const result = deserializer.deserialize(response.result);
 * } else {
 *   // Handle raw data
 *   const result = response.result;
 * }
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
