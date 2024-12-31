import type { JSONRPCMethodMap, JSONRPCContext, JSONRPCSerializer, MethodHandler } from './types.js';
import { JSONRPCError } from './error.js';

/**
 * Internal interface representing a registered JSON-RPC method.
 * Combines the method implementation with optional parameter/result serialization.
 *
 * @typeParam T - The method map defining available RPC methods
 * @typeParam M - The specific method being registered
 * @typeParam C - The context type for method handlers
 *
 * @internal
 */
interface RegisteredMethod<T extends JSONRPCMethodMap, M extends keyof T, C extends JSONRPCContext> {
  /** The method implementation */
  handler: MethodHandler<T, M, C>;
  /** Optional serializer for method parameters and results */
  serializer: JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined;
}

/**
 * Manages registration and lookup of JSON-RPC methods and their serializers.
 * Provides a type-safe registry for method implementations and data serialization.
 *
 * Features:
 * - Type-safe method registration and lookup
 * - Optional parameter/result serialization
 * - Separate serializer registration for remote methods
 * - Error handling for method not found cases
 *
 * @typeParam T - The method map defining available RPC methods
 * @typeParam C - The context type for method handlers
 *
 * @example
 * ```typescript
 * type MethodMap = {
 *   add: {
 *     params: { a: number; b: number };
 *     result: number;
 *   };
 *   getUser: {
 *     params: { id: string };
 *     result: User;
 *     serializer: UserSerializer;
 *   };
 * };
 *
 * const registry = new MethodRegistry<MethodMap>();
 *
 * // Register simple method
 * registry.registerMethod('add', (context, { a, b }) => a + b);
 *
 * // Register method with serialization
 * registry.registerMethod('getUser',
 *   async (context, { id }) => {
 *     const user = await db.users.findById(id);
 *     if (!user) throw new JSONRPCError(-32602, 'User not found');
 *     return user;
 *   },
 *   userSerializer
 * );
 *
 * // Register serializer for remote method
 * registry.registerSerializer('getUser', userSerializer);
 * ```
 */
export class MethodRegistry<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private methods: Partial<{ [K in keyof T]: RegisteredMethod<T, K, C> }> = {};
  private serializers = new Map<keyof T, JSONRPCSerializer<T[keyof T]['params'], T[keyof T]['result']>>();

  /**
   * Registers a method that can be called by remote nodes.
   * The method handler receives a context object and typed parameters,
   * and returns a promise or direct value of the specified result type.
   *
   * @param name - The name of the method to register
   * @param handler - The function that implements the method
   * @param serializer - Optional serializer for method parameters and results
   * @throws {TypeError} If handler is not a function
   *
   * @example
   * ```typescript
   * // Simple synchronous method
   * registry.registerMethod('add',
   *   (context, { a, b }) => a + b
   * );
   *
   * // Async method with error handling
   * registry.registerMethod('divide',
   *   async (context, { a, b }) => {
   *     if (b === 0) {
   *       throw new JSONRPCError(-32602, 'Division by zero');
   *     }
   *     return a / b;
   *   }
   * );
   *
   * // Method with serialization
   * registry.registerMethod('getDate',
   *   (context, { timestamp }) => new Date(timestamp),
   *   dateSerializer
   * );
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
   * This is separate from method registration to support serialization of
   * remote methods that aren't implemented locally.
   *
   * @param method - The name of the method to register a serializer for
   * @param serializer - The serializer implementation
   * @throws {TypeError} If serializer doesn't implement required methods
   *
   * @example
   * ```typescript
   * // Register serializer for remote method
   * registry.registerSerializer('getUser', {
   *   params: {
   *     serialize: (params) => ({
   *       serialized: JSON.stringify(params)
   *     }),
   *     deserialize: (data) => JSON.parse(data.serialized)
   *   },
   *   result: {
   *     serialize: (user) => ({
   *       serialized: JSON.stringify(user)
   *     }),
   *     deserialize: (data) => {
   *       const user = JSON.parse(data.serialized);
   *       return new User(user);
   *     }
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
   * Gets a registered method by name.
   * Returns both the method implementation and any associated serializer.
   *
   * @param name - The name of the method to get
   * @returns The registered method and its serializer
   * @throws {JSONRPCError} If the method is not found (-32601)
   *
   * @example
   * ```typescript
   * try {
   *   const { handler, serializer } = registry.getMethod('add');
   *   // Use handler and serializer...
   * } catch (error) {
   *   if (error instanceof JSONRPCError && error.code === -32601) {
   *     console.error('Method not found');
   *   }
   * }
   * ```
   */
  public getMethod<M extends keyof T>(name: M): RegisteredMethod<T, M, C> {
    const method = this.methods[name];
    if (!method) {
      throw new JSONRPCError(-32601, 'Method not found', String(name));
    }
    return method as RegisteredMethod<T, M, C>;
  }

  /**
   * Gets a registered serializer by method name.
   * Checks both method-specific serializers and standalone serializers.
   *
   * @param method - The name of the method to get the serializer for
   * @returns The registered serializer or undefined if not found
   *
   * @example
   * ```typescript
   * const serializer = registry.getSerializer('getUser');
   * if (serializer) {
   *   // Serialize parameters
   *   const serializedParams = serializer.params.serialize(params);
   *   // Make RPC call...
   *   // Deserialize result
   *   const result = serializer.result?.deserialize(response.result);
   * }
   * ```
   */
  public getSerializer<M extends keyof T>(
    method: M,
  ): JSONRPCSerializer<T[M]['params'], T[M]['result']> | undefined {
    // Check both registered method serializer and standalone serializer
    return this.methods[method]?.serializer || this.serializers.get(method);
  }

  /**
   * Checks if a method is registered.
   * Use this to verify method availability before attempting to call it.
   *
   * @param name - The name of the method to check
   * @returns True if the method is registered, false otherwise
   *
   * @example
   * ```typescript
   * if (registry.hasMethod('add')) {
   *   const result = await node.callMethod('add', { a: 1, b: 2 });
   * } else {
   *   console.error('Method not available');
   * }
   * ```
   */
  public hasMethod(name: keyof T): boolean {
    return name in this.methods;
  }

  /**
   * Removes a registered method.
   * Useful when dynamically updating available methods or cleaning up.
   *
   * @param name - The name of the method to remove
   *
   * @example
   * ```typescript
   * // Remove deprecated method
   * registry.removeMethod('oldMethod');
   *
   * // Replace method implementation
   * registry.removeMethod('method');
   * registry.registerMethod('method', newImplementation);
   * ```
   */
  public removeMethod(name: keyof T): void {
    delete this.methods[name];
  }

  /**
   * Removes a registered serializer.
   * Only removes standalone serializers, not those registered with methods.
   *
   * @param method - The name of the method to remove the serializer for
   *
   * @example
   * ```typescript
   * // Remove serializer when method is no longer available
   * registry.removeSerializer('remoteMethod');
   * ```
   */
  public removeSerializer(method: keyof T): void {
    this.serializers.delete(method);
  }
}
