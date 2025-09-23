import type {
  JSONRPCContext,
  JSONRPCMethodMap,
  JSONRPCMiddleware,
  JSONRPCRequest,
  JSONRPCResponse,
} from './types.js';

/**
 * Represents a middleware entry in the middleware stack.
 *
 * @typeParam T - Method map defining available RPC methods
 * @typeParam C - Context type shared between middleware
 */
interface MiddlewareEntry<T extends JSONRPCMethodMap, C extends JSONRPCContext> {
  /** The middleware function */
  middleware: JSONRPCMiddleware<T, C>;
  /** Priority value (lower numbers execute first) */
  priority: number;
  /** Optional list of method names this middleware applies to */
  methods?: string[] | undefined;
}

/**
 * Manages the middleware stack for JSON-RPC request processing.
 * Supports prioritized middleware ordering and method-specific middleware.
 *
 * @typeParam T - Method map defining available RPC methods
 * @typeParam C - Context type shared between middleware
 *
 * @example
 * ```typescript
 * // Create manager with base handler
 * const manager = new MiddlewareManager(async (context, request) => {
 *   // Base handler implementation
 *   return { jsonrpc: '2.0', result: 42, id: request.id };
 * });
 *
 * // Add logging middleware (runs for all methods)
 * manager.addMiddleware(async (context, request, next) => {
 *   console.log('Request:', request);
 *   const response = await next();
 *   console.log('Response:', response);
 *   return response;
 * });
 *
 * // Add auth middleware (high priority, specific methods)
 * manager.addMiddleware(
 *   async (context, request, next) => {
 *     if (!context.isAuthorized) {
 *       throw new JSONRPCError(-32600, 'Unauthorized');
 *     }
 *     return next();
 *   },
 *   { priority: -10, methods: ['sendPayment', 'getBalance'] }
 * );
 * ```
 */
export class MiddlewareManager<
  T extends JSONRPCMethodMap = JSONRPCMethodMap,
  C extends JSONRPCContext = JSONRPCContext,
> {
  private middlewareStack: MiddlewareEntry<T, C>[] = [];
  private baseHandler: JSONRPCMiddleware<T, C>;

  constructor(baseHandler: JSONRPCMiddleware<T, C>) {
    this.baseHandler = baseHandler;
  }

  /**
   * Adds middleware to the stack with optional priority and method filtering.
   *
   * @param middleware - The middleware function to add
   * @param options - Configuration options for the middleware
   * @param options.priority - Optional priority value (lower numbers execute first, default: 0)
   * @param options.methods - Optional list of method names this middleware applies to
   * @returns A cleanup function that removes the middleware when called
   * @throws {Error} If middleware is not a function
   *
   * @example
   * ```typescript
   * // Basic middleware
   * const cleanup = manager.addMiddleware(async (context, request, next) => {
   *   console.log('Processing:', request.method);
   *   return next();
   * });
   *
   * // High priority auth middleware for specific methods
   * manager.addMiddleware(
   *   async (context, request, next) => {
   *     if (!context.isAuthorized) {
   *       throw new JSONRPCError(-32600, 'Unauthorized');
   *     }
   *     return next();
   *   },
   *   {
   *     priority: -10, // Runs early in the stack
   *     methods: ['sendPayment', 'getBalance']
   *   }
   * );
   *
   * // Later: remove middleware
   * cleanup();
   * ```
   */
  public addMiddleware(
    middleware: JSONRPCMiddleware<T, C>,
    options: {
      priority?: number;
      methods?: string[];
    } = {},
  ): () => void {
    if (!middleware || typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }

    const entry: MiddlewareEntry<T, C> = {
      middleware,
      priority: options.priority ?? 0,
      methods: options.methods,
    };

    // Insert maintaining priority order (lower numbers first)
    const insertIndex = this.middlewareStack.findIndex((m) => m.priority > entry.priority);
    if (insertIndex === -1) {
      this.middlewareStack.push(entry);
    } else {
      this.middlewareStack.splice(insertIndex, 0, entry);
    }

    return () => {
      const index = this.middlewareStack.indexOf(entry);
      if (index !== -1) {
        this.middlewareStack.splice(index, 1);
      }
    };
  }

  /**
   * Executes the middleware chain for a request.
   * Filters middleware by method and executes in priority order.
   *
   * @param context - The shared context object
   * @param request - The JSON-RPC request to process
   * @returns The JSON-RPC response after middleware processing
   * @throws {Error} If next() is called multiple times in any middleware
   * @throws {Error} If no middleware handles the request
   *
   * @example
   * ```typescript
   * // Process a request through the middleware stack
   * try {
   *   const response = await manager.execute(
   *     { isAuthorized: true },
   *     {
   *       jsonrpc: '2.0',
   *       method: 'add',
   *       params: { a: 1, b: 2 },
   *       id: 1
   *     }
   *   );
   *   console.log('Response:', response);
   * } catch (error) {
   *   console.error('Middleware error:', error);
   * }
   * ```
   */
  public async execute(context: C, request: JSONRPCRequest<T, keyof T>): Promise<JSONRPCResponse<T>> {
    // Filter middleware stack for this request
    const applicableMiddleware = this.middlewareStack.filter(
      (entry) => !entry.methods || entry.methods.includes(String(request.method)),
    );

    // Add base handler at the end
    const fullStack = [
      ...applicableMiddleware,
      { middleware: this.baseHandler, priority: Number.POSITIVE_INFINITY, methods: undefined },
    ];

    let currentIndex = 0;
    const nextCalledFlags = new Set<number>();

    const next = async (): Promise<JSONRPCResponse<T>> => {
      /* c8 ignore next 4 */
      if (nextCalledFlags.has(currentIndex)) {
        // This should not actually be reachable due to javascript's single-threaded nature
        throw new Error('next() called multiple times');
      }

      if (currentIndex >= fullStack.length) {
        throw new Error('No middleware left to handle request');
      }

      const current = fullStack[currentIndex];
      if (!current?.middleware || typeof current.middleware !== 'function') {
        throw new Error(`Middleware function at index ${currentIndex} is undefined`);
      }

      nextCalledFlags.add(currentIndex);
      const thisIndex = currentIndex;
      currentIndex++;

      return current.middleware(context, request, async () => {
        if (nextCalledFlags.has(thisIndex + 1)) {
          throw new Error('next() called multiple times');
        }
        return next();
      });
    };

    return next();
  }

  /**
   * Removes all middleware from the stack except the base handler.
   * Use this for cleanup or resetting the middleware stack.
   *
   * @example
   * ```typescript
   * // Reset middleware stack
   * manager.removeAllMiddleware();
   *
   * // Add new middleware after reset
   * manager.addMiddleware(newMiddleware);
   * ```
   */
  public removeAllMiddleware(): void {
    this.middlewareStack = [];
  }

  /**
   * Gets the current middleware stack for inspection.
   * Includes the base handler as the final entry.
   *
   * @returns A readonly array of middleware entries in execution order
   *
   * @example
   * ```typescript
   * // Inspect middleware stack
   * const stack = manager.getMiddlewareStack();
   * console.log('Stack size:', stack.length);
   * console.log('Priorities:', stack.map(m => m.priority));
   * console.log('Method filters:', stack.map(m => m.methods));
   * ```
   */
  public getMiddlewareStack(): readonly MiddlewareEntry<T, C>[] {
    return [
      ...this.middlewareStack,
      { middleware: this.baseHandler, priority: Number.POSITIVE_INFINITY, methods: undefined },
    ];
  }
}
