import { describe, expect, it, vi } from 'vitest';
import { MiddlewareManager } from './middleware-manager.js';
import type { JSONRPCContext, JSONRPCMethodMap, JSONRPCRequest, JSONRPCResponse } from './types.js';

interface TestMethodMap extends JSONRPCMethodMap {
  add: { params: { a: number; b: number }; result: number };
  greet: { params: { name: string }; result: string };
}

interface MiddlewareEntry<T extends JSONRPCMethodMap, C extends JSONRPCContext> {
  middleware: (
    context: C,
    request: JSONRPCRequest<T, keyof T>,
    next: () => Promise<JSONRPCResponse<T>>,
  ) => Promise<JSONRPCResponse<T>>;
  priority: number;
  methods?: string[];
}

describe('MiddlewareManager', () => {
  const baseHandler = vi.fn(async (_context, request) => ({
    jsonrpc: '2.0' as const,
    result: 'base handler result',
    id: request.id,
  }));

  it('should execute middleware chain in correct order', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const order: number[] = [];

    // Add middleware with different priorities
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(1);
        const response = await next();
        order.push(4);
        return response;
      },
      { priority: 1 },
    );

    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(2);
        const response = await next();
        order.push(3);
        return response;
      },
      { priority: 2 },
    );

    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(order).toEqual([1, 2, 3, 4]);
  });

  it('should allow middleware to modify request context', async () => {
    const manager = new MiddlewareManager<TestMethodMap, { modified?: boolean }>(baseHandler);

    manager.addMiddleware(async (context, _request, next) => {
      context.modified = true;
      return next();
    });

    const context = {};
    await manager.execute(context, {
      jsonrpc: '2.0',
      method: 'add',
      params: { a: 1, b: 2 },
      id: '1',
    });

    expect(context).toHaveProperty('modified', true);
  });

  it('should allow middleware to modify response', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);

    manager.addMiddleware(async (_context, _request, next) => {
      const response = await next();
      response.result = 'modified result';
      return response;
    });

    const response = await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(response.result).toBe('modified result');
  });

  it('should handle middleware errors', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);

    manager.addMiddleware(async () => {
      throw new Error('Middleware error');
    });

    await expect(
      manager.execute(
        {},
        {
          jsonrpc: '2.0',
          method: 'add',
          params: { a: 1, b: 2 },
          id: '1',
        },
      ),
    ).rejects.toThrow('Middleware error');
  });

  it('should prevent calling next() multiple times', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);

    manager.addMiddleware(async (_context, _request, next) => {
      const response = await next();
      await next(); // Should throw
      return response;
    });

    await expect(
      manager.execute(
        {},
        {
          jsonrpc: '2.0',
          method: 'add',
          params: { a: 1, b: 2 },
          id: '1',
        },
      ),
    ).rejects.toThrow('next() called multiple times');
  });

  it('should handle cleanup function edge cases', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const middleware = vi.fn(async (_context, _request, next) => next());

    // Get the cleanup function but don't add the middleware to the stack
    const cleanup = manager.addMiddleware(middleware);

    // Remove the middleware from the stack
    cleanup();

    // Call cleanup again - should be a no-op since middleware is already removed
    cleanup();

    // Add another middleware
    const middleware2 = vi.fn(async (_context, _request, next) => next());
    manager.addMiddleware(middleware2);

    // Call the original cleanup - should be a no-op since middleware is not in stack
    cleanup();

    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(middleware).not.toHaveBeenCalled();
    expect(middleware2).toHaveBeenCalled();
  });

  it('should remove middleware when cleanup function is called', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const middleware = vi.fn(async (_context, _request, next) => next());

    const cleanup = manager.addMiddleware(middleware);
    cleanup();

    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(middleware).not.toHaveBeenCalled();
  });

  it('should maintain middleware stack order when adding middleware', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const order: number[] = [];

    // Add high priority middleware
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(1);
        const response = await next();
        return response;
      },
      { priority: -1 },
    );

    // Add medium priority middleware
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(2);
        const response = await next();
        return response;
      },
      { priority: 0 },
    );

    // Add low priority middleware
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(3);
        const response = await next();
        return response;
      },
      { priority: 1 },
    );

    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(order).toEqual([1, 2, 3]);
  });

  it('should handle method filtering edge cases', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const order: number[] = [];

    // Add middleware without methods option (should run for all methods)
    manager.addMiddleware(async (_context, _request, next) => {
      order.push(1);
      const response = await next();
      return response;
    });

    // Add middleware with non-matching method (should not run)
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(2);
        const response = await next();
        return response;
      },
      { methods: ['greet'] },
    );

    // Add middleware with no methods specified (should run for all methods)
    manager.addMiddleware(async (_context, _request, next) => {
      order.push(3);
      const response = await next();
      return response;
    });

    // Test with 'add' method
    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );
    expect(order).toEqual([1, 3]); // Only middleware without method restrictions should run

    // Clear order array
    order.length = 0;

    // Test with 'greet' method
    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'greet',
        params: { name: 'test' },
        id: '2',
      },
    );
    expect(order).toEqual([1, 2, 3]); // All middleware should run
  });

  it('should filter middleware by method', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const order: number[] = [];

    // Add middleware for 'add' method
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(1);
        const response = await next();
        return response;
      },
      { methods: ['add'] },
    );

    // Add middleware for 'greet' method
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(2);
        const response = await next();
        return response;
      },
      { methods: ['greet'] },
    );

    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(order).toEqual([1]); // Only 'add' middleware should run
  });

  it('should maintain middleware stack order when removing middleware', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const order: number[] = [];

    manager.addMiddleware(async (_context, _request, next) => {
      order.push(1);
      const response = await next();
      return response;
    });

    const cleanup = manager.addMiddleware(async (_context, _request, next) => {
      order.push(2);
      const response = await next();
      return response;
    });

    manager.addMiddleware(async (_context, _request, next) => {
      order.push(3);
      const response = await next();
      return response;
    });

    cleanup(); // Remove middle middleware

    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(order).toEqual([1, 3]);
  });

  it('should provide access to the middleware stack', () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const middleware1 = async (
      _context: JSONRPCContext,
      _request: JSONRPCRequest<TestMethodMap, keyof TestMethodMap>,
      next: () => Promise<JSONRPCResponse<TestMethodMap>>,
    ) => next();
    const middleware2 = async (
      _context: JSONRPCContext,
      _request: JSONRPCRequest<TestMethodMap, keyof TestMethodMap>,
      next: () => Promise<JSONRPCResponse<TestMethodMap>>,
    ) => next();

    manager.addMiddleware(middleware1);
    manager.addMiddleware(middleware2);

    const stack = manager.getMiddlewareStack();
    expect(stack).toHaveLength(3); // base handler + 2 middleware
    expect(stack[0]?.middleware).toBe(middleware1);
    expect(stack[1]?.middleware).toBe(middleware2);
    expect(stack[2]?.middleware).toBe(baseHandler);
  });

  it('should throw when middleware is invalid', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);

    // Test undefined
    await expect(async () => {
      // @ts-expect-error - Testing runtime behavior
      manager.addMiddleware(undefined);
    }).rejects.toThrow('Middleware must be a function');

    // Test null
    await expect(async () => {
      // @ts-expect-error - Testing runtime behavior
      manager.addMiddleware(null);
    }).rejects.toThrow('Middleware must be a function');
  });

  it('should remove all middleware except base handler', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const middleware1 = vi.fn();
    const middleware2 = vi.fn();

    manager.addMiddleware(middleware1);
    manager.addMiddleware(middleware2);
    manager.removeAllMiddleware();

    const stack = manager.getMiddlewareStack();
    expect(stack).toHaveLength(1); // Only base handler remains
    expect(stack[0]?.middleware).toBe(baseHandler);
  });

  it('should insert middleware at correct position based on priority', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    const order: number[] = [];

    // Add low priority middleware first
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(3);
        const response = await next();
        return response;
      },
      { priority: 3 },
    );

    // Add high priority middleware
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(1);
        const response = await next();
        return response;
      },
      { priority: 1 },
    );

    // Add medium priority middleware - should be inserted between the other two
    manager.addMiddleware(
      async (_context, _request, next) => {
        order.push(2);
        const response = await next();
        return response;
      },
      { priority: 2 },
    );

    await manager.execute(
      {},
      {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      },
    );

    expect(order).toEqual([1, 2, 3]);
  });

  it('should prevent calling next() multiple times at same index', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);

    manager.addMiddleware(async (_context, _request, next) => {
      // Create a promise that resolves after a small delay
      const delay = new Promise((resolve) => setTimeout(resolve, 0));
      // Start the first next() call
      next();
      // Wait a bit to ensure the first call has set the flag
      await delay;
      // Try to call next() again at the same index
      await next();
      return { jsonrpc: '2.0', result: 'unreachable', id: '1' };
    });

    await expect(
      manager.execute(
        {},
        {
          jsonrpc: '2.0',
          method: 'add',
          params: { a: 1, b: 2 },
          id: '1',
        },
      ),
    ).rejects.toThrow('next() called multiple times');
  });

  it('should throw when no middleware handles the request', async () => {
    // Create a manager with a base handler that calls next()
    const manager = new MiddlewareManager<TestMethodMap>(async (_context, _request, next) => {
      // Base handler should never call next() since it's the last in the chain
      return next();
    });

    await expect(
      manager.execute(
        {},
        {
          jsonrpc: '2.0',
          method: 'add',
          params: { a: 1, b: 2 },
          id: '1',
        },
      ),
    ).rejects.toThrow('No middleware left to handle request');
  });

  it('should throw when middleware function is undefined', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);
    // Access private property for testing
    const stack = (
      manager as unknown as { middlewareStack: Array<MiddlewareEntry<TestMethodMap, JSONRPCContext>> }
    ).middlewareStack;

    // Force an undefined middleware into the stack
    stack.push({
      middleware: undefined as unknown as MiddlewareEntry<TestMethodMap, JSONRPCContext>['middleware'],
      priority: 0,
    });

    await expect(
      manager.execute(
        {},
        {
          jsonrpc: '2.0',
          method: 'add',
          params: { a: 1, b: 2 },
          id: '1',
        },
      ),
    ).rejects.toThrow('Middleware function at index 0 is undefined');
  });

  it('should throw when next() is called after all middleware have executed', async () => {
    const manager = new MiddlewareManager<TestMethodMap>(baseHandler);

    // Add middleware that calls next() after base handler
    manager.addMiddleware(async (_context, _request, next) => {
      const response = await next();
      // This will cause next() to be called after all middleware have executed
      await next();
      return response;
    });

    await expect(
      manager.execute(
        {},
        {
          jsonrpc: '2.0',
          method: 'add',
          params: { a: 1, b: 2 },
          id: '1',
        },
      ),
    ).rejects.toThrow('next() called multiple times');
  });
});
