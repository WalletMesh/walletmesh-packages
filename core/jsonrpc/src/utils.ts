import { JSONRPCError } from './error.js';
import type {
  JSONRPCMethodMap,
  JSONRPCContext,
  MethodHandler,
  JSONRPCMiddleware,
  JSONRPCID,
  JSONRPCSerializedData,
} from './types.js';

/**
 * Type guard to check if a value is a valid JSON-RPC ID.
 * Valid IDs can be strings, numbers, or undefined.
 *
 * @param value - The value to check
 * @returns True if the value is a valid JSON-RPC ID, false otherwise
 *
 * @example
 * ```typescript
 * isJSONRPCID("123");     // true
 * isJSONRPCID(456);       // true
 * isJSONRPCID(undefined); // true
 * isJSONRPCID(null);      // false
 * isJSONRPCID({});        // false
 * ```
 */
export function isJSONRPCID(value: unknown): value is JSONRPCID {
  if (value === undefined) return true;
  if (typeof value === 'string') return true;
  if (typeof value === 'number') return true;
  return false;
}

/**
 * Type guard to check if a value is a valid JSON-RPC version string.
 * The only valid version string is '2.0' as per the JSON-RPC 2.0 specification.
 *
 * @param value - The value to check
 * @returns True if the value is '2.0', false otherwise
 *
 * @example
 * ```typescript
 * isJSONRPCVersion("2.0");  // true
 * isJSONRPCVersion("1.0");  // false
 * isJSONRPCVersion(2);      // false
 * ```
 */
export function isJSONRPCVersion(value: unknown): value is '2.0' {
  return value === '2.0';
}

/**
 * Type guard to check if a value matches the JSONRPCSerializedData format.
 * Valid serialized data must be an object with a 'serialized' property containing a string.
 *
 * @param value - The value to check
 * @returns True if the value matches the JSONRPCSerializedData format, false otherwise
 *
 * @example
 * ```typescript
 * isJSONRPCSerializedData({ serialized: "data" });  // true
 * isJSONRPCSerializedData({ serialized: 123 });     // false
 * isJSONRPCSerializedData({ data: "string" });      // false
 * ```
 */
export function isJSONRPCSerializedData(value: unknown): value is JSONRPCSerializedData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'serialized' in value &&
    typeof value.serialized === 'string' &&
    'method' in value &&
    typeof value.method === 'string'
  );
}

/**
 * Helper function to apply middleware only to specific methods.
 * Creates a new middleware that only executes for the specified methods,
 * passing through all other requests unchanged.
 *
 * @param methods - Array of method names to apply the middleware to
 * @param middleware - The middleware function to apply
 * @returns A new middleware function that only applies to specified methods
 *
 * @example
 * ```typescript
 * // Create logging middleware only for 'add' and 'subtract' methods
 * const loggerMiddleware = applyToMethods(['add', 'subtract'],
 *   async (context, request, next) => {
 *     console.log(`Calling ${request.method}`);
 *     const result = await next();
 *     console.log(`${request.method} returned:`, result);
 *     return result;
 *   }
 * );
 * ```
 */
export function applyToMethods<T extends JSONRPCMethodMap, C extends JSONRPCContext>(
  methods: Array<keyof T>,
  middleware: JSONRPCMiddleware<T, C>,
): JSONRPCMiddleware<T, C> {
  return async (context, request, next) => {
    if (methods.includes(request.method)) {
      return middleware(context, request, next);
    }
    return next();
  };
}

/**
 * Wraps a handler function with standard error handling and response formatting.
 * Used by both JSONRPCNode and tests to ensure consistent error handling.
 *
 * @param handler - The original handler function
 * @returns A wrapped handler that returns MethodResponse
 *
 * @example
 * ```typescript
 * const handler = (context, params) => params.a + params.b;
 * const wrapped = wrapHandler(handler, 'add');
 * ```
 */
export function wrapHandler<T extends JSONRPCMethodMap, M extends keyof T, C extends JSONRPCContext>(
  handler:
    | ((context: C, params: T[M]['params']) => Promise<T[M]['result']>)
    | ((context: C, method: M, params: T[M]['params']) => Promise<T[M]['result']>),
): MethodHandler<T, M, C> {
  return async (context: C, method: M, params: T[M]['params']) => {
    try {
      const result =
        handler.length === 2
          ? (handler as (context: C, params: T[M]['params']) => Promise<T[M]['result']>)(context, params) // normal handler
          : (handler as (context: C, method: M, params: T[M]['params']) => Promise<T[M]['result']>)(
              context,
              method,
              params,
            ); // fallback handler
      return {
        success: true,
        data: await result,
      };
    } catch (error) {
      if (error instanceof JSONRPCError) {
        return {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            data: error.data,
          },
        };
      }
      return {
        success: false,
        error: {
          code: error instanceof Error && error.message === 'Method not found' ? -32601 : -32000,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: error instanceof Error && error.message === 'Method not found' ? String(method) : undefined,
        },
      };
    }
  };
}
