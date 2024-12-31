import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSONRPCNode, TimeoutError, JSONRPCError } from './index.js';
import { applyToMethods } from './utils.js';
import type { JSONRPCContext, JSONRPCSerializer, JSONRPCRequest } from './types.js';

describe('JSONRPCNode', () => {
  type TestContext = JSONRPCContext & {
    user?: string;
  };

  type TestMethodMap = {
    add: { params: { a: number; b: number }; result: number };
    greet: { params: { name: string }; result: string };
    noParams: { params: undefined; result: undefined };
  };

  type TestEventMap = {
    userJoined: { name: string; id: number };
    messageReceived: { text: string; from: string };
  };

  let transport: { send: ReturnType<typeof vi.fn> };
  let node: JSONRPCNode<TestMethodMap, TestEventMap, TestContext>;

  beforeEach(() => {
    transport = { send: vi.fn() };
    node = new JSONRPCNode<TestMethodMap, TestEventMap, TestContext>(transport);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Constructor', () => {
    it('should initialize with custom context', () => {
      const customContext = { user: 'alice' };
      const nodeWithContext = new JSONRPCNode<TestMethodMap, TestEventMap, TestContext>(
        transport,
        customContext,
      );
      expect(nodeWithContext.context).toEqual(customContext);
    });
  });

  describe('Method Registration and Calling', () => {
    it('should register and call methods successfully', async () => {
      node.registerMethod('add', (_context, params) => params.a + params.b);

      const promise = node.callMethod('add', { a: 2, b: 3 });

      // Get the sent request
      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 2, b: 3 },
        id: expect.any(String),
      });

      // Get the request ID from the sent message
      const [[sentRequest]] = transport.send.mock.calls as [[JSONRPCRequest<TestMethodMap, 'add'>]];
      expect(sentRequest.id).toBeDefined();
      const requestId = sentRequest.id as string;

      // Simulate response
      await node.receiveMessage({
        jsonrpc: '2.0',
        result: 5,
        id: requestId,
      });

      await expect(promise).resolves.toBe(5);
    });

    it('should handle JSON-RPC errors', async () => {
      node.registerMethod('add', () => {
        throw new JSONRPCError(-32602, 'Invalid params', { details: 'test' });
      });

      const promise = node.callMethod('add', { a: 2, b: 3 });

      // Get the request ID
      const [[sentRequest]] = transport.send.mock.calls as [[JSONRPCRequest<TestMethodMap, 'add'>]];
      const requestId = sentRequest.id as string;

      // Simulate error response
      await node.receiveMessage({
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: 'Invalid params',
          data: { details: 'test' },
        },
        id: requestId,
      });

      await expect(promise).rejects.toThrow('Invalid params');
    });

    it('should handle standard errors', async () => {
      node.registerMethod('add', () => {
        throw new Error('Test error');
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Test error',
        },
        id: '1',
      });
    });

    it('should handle successful method registration and execution', async () => {
      // Register a method that returns a value
      node.registerMethod('add', (_context, params) => {
        return Promise.resolve(params.a + params.b);
      });

      // Send a request directly to test the handler
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 2, b: 3 },
        id: '1',
      });

      // Verify the successful response
      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        result: 5,
        id: '1',
      });
    });

    it('should handle successful synchronous method registration and execution', async () => {
      // Register a method that returns a value synchronously
      node.registerMethod('add', (_context, params) => params.a + params.b);

      // Send a request directly to test the handler
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 2, b: 3 },
        id: '1',
      });

      // Verify the successful response
      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        result: 5,
        id: '1',
      });
    });

    it('should handle request handler errors with notification', async () => {
      // Register a method that throws an error
      node.registerMethod('add', () => {
        throw new Error('Handler error');
      });

      // Send a notification (no id)
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
      });

      // Should not send error response for notifications
      expect(transport.send).not.toHaveBeenCalled();
    });

    it('should handle request handler errors with custom error response', async () => {
      // Register a method that throws a custom error
      node.registerMethod('add', () => {
        throw new JSONRPCError(-32099, 'Custom error', { details: 'test' });
      });

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      // Verify the error response
      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32099,
          message: 'Custom error',
          data: { details: 'test' },
        },
        id: '1',
      });
    });

    it('should handle non-Error objects in method registration', async () => {
      // Register a method that throws a non-Error object
      node.registerMethod('add', () => {
        throw { custom: 'error' }; // Throwing a custom object
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle non-Error objects in method handler', async () => {
      node.registerMethod('add', () => {
        throw 'Unknown error'; // Throwing a string
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle non-Error objects in middleware', async () => {
      const middleware = vi.fn(async () => {
        throw 'Middleware error'; // Throwing a string
      });
      node.addMiddleware(middleware);
      node.registerMethod('add', (_context, params) => params.a + params.b);

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle serialization', async () => {
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (params) => ({ serialized: JSON.stringify(params) }),
          deserialize: (data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: (result) => ({ serialized: result }),
          deserialize: (data) => data.serialized,
        },
      };

      node.registerSerializer('greet', serializer);
      const promise = node.callMethod('greet', { name: 'Alice' });

      // Get the request ID
      const [[sentRequest]] = transport.send.mock.calls as [[JSONRPCRequest<TestMethodMap, 'greet'>]];
      const requestId = sentRequest.id as string;

      // Simulate serialized response
      await node.receiveMessage({
        jsonrpc: '2.0',
        result: { serialized: 'Hello Alice!' },
        id: requestId,
      });

      await expect(promise).resolves.toBe('Hello Alice!');
    });

    it('should handle method timeouts', async () => {
      node.registerMethod('add', async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return 5;
      });

      const promise = node.callMethod('add', { a: 2, b: 3 }, 1);
      vi.runAllTimers();
      await expect(promise).rejects.toThrow(TimeoutError);
    });

    it('should handle fallback handler for unregistered methods', async () => {
      // Set up fallback handler
      node.setFallbackHandler(async (context, method, params) => ({
        success: false,
        error: {
          code: -32601,
          message: `Method ${method} is not supported`,
          data: { availableMethods: ['add', 'greet'] },
        },
      }));

      // Send request for unregistered method
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'subtract',
        params: { a: 5, b: 3 },
        id: '1',
      });

      // Verify response
      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method subtract is not supported',
          data: { availableMethods: ['add', 'greet'] },
        },
        id: '1',
      });
    });

    it('should handle notifications', () => {
      node.notify('add', { a: 1, b: 2 });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
      });
    });
  });

  describe('Event Handling', () => {
    it('should register event handlers and emit events', () => {
      const handler = vi.fn();
      node.on('userJoined', handler);

      node.emit('userJoined', { name: 'Alice', id: 1 });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        event: 'userJoined',
        params: { name: 'Alice', id: 1 },
      });
    });

    it('should support multiple event handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      node.on('messageReceived', handler1);
      node.on('messageReceived', handler2);

      node.receiveMessage({
        jsonrpc: '2.0',
        event: 'messageReceived',
        params: { text: 'Hello', from: 'Alice' },
      });

      expect(handler1).toHaveBeenCalledWith({ text: 'Hello', from: 'Alice' });
      expect(handler2).toHaveBeenCalledWith({ text: 'Hello', from: 'Alice' });
    });

    it('should allow removing event handlers', () => {
      const handler = vi.fn();
      const removeHandler = node.on('userJoined', handler);

      removeHandler();

      node.receiveMessage({
        jsonrpc: '2.0',
        event: 'userJoined',
        params: { name: 'Alice', id: 1 },
      });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Middleware', () => {
    it('should support method-specific middleware', async () => {
      const middleware = vi.fn(async (_context, _request, next) => next());
      const wrappedMiddleware = applyToMethods<TestMethodMap, TestContext>(['add'], middleware);
      node.addMiddleware(wrappedMiddleware);

      node.registerMethod('add', (_context, params) => params.a + params.b);

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(middleware).toHaveBeenCalledTimes(1);
      expect(middleware).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ method: 'add' }),
        expect.any(Function),
      );
    });
  });

  describe('Message Handling', () => {
    it('should handle invalid message format', async () => {
      await node.receiveMessage({ invalid: 'message' });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
        id: null,
      });
    });

    it('should handle string messages', async () => {
      await node.receiveMessage('invalid message');

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
        },
        id: null,
      });
    });

    it('should handle method not found error with specific error', async () => {
      node.registerMethod('add', () => {
        throw new Error('Method not found');
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'add',
        },
        id: '1',
      });
    });

    it('should handle method not found error with specific error in registerMethod', () => {
      const handler = () => {
        throw new Error('Method not found');
      };
      node.registerMethod('add', handler);

      // Call the method directly to test the error handling in registerMethod
      const request = {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      };

      return expect(
        node['methodManager'].getMethod('add')?.handler(node.context, request.params),
      ).resolves.toEqual({
        success: false,
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'add',
        },
      });
    });

    it('should handle Error with Method not found message in registerMethod', () => {
      const handler = () => {
        // Create an Error instance to hit the branch where error.message === 'Method not found'
        const error = new Error('Method not found');
        throw error;
      };
      node.registerMethod('add', handler);

      // Call the method directly to test the error handling in registerMethod
      const request = {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      };

      return expect(
        node['methodManager'].getMethod('add')?.handler(node.context, request.params),
      ).resolves.toEqual({
        success: false,
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'add',
        },
      });
    });

    it('should handle non-method-not-found error in registerMethod', () => {
      const handler = () => {
        throw new Error('Some other error');
      };
      node.registerMethod('add', handler);

      // Call the method directly to test the error handling in registerMethod
      const request = {
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      };

      return expect(
        node['methodManager'].getMethod('add')?.handler(node.context, request.params),
      ).resolves.toEqual({
        success: false,
        error: {
          code: -32000,
          message: 'Some other error',
          data: undefined,
        },
      });
    });

    it('should handle method not found with error response', async () => {
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'nonexistent',
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'nonexistent',
        },
        id: '1',
      });
    });

    it('should handle request handler errors', async () => {
      // Register a method that throws an error
      node.registerMethod('add', () => {
        throw new Error('Handler error');
      });

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Handler error',
        },
        id: '1',
      });
    });

    it('should handle request handler errors with non-Error object', async () => {
      // Register a method that throws a non-Error object
      node.registerMethod('add', () => {
        throw { custom: 'error', message: 'Custom message' };
      });

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle request handler errors with custom error-like object', async () => {
      // Register a method that throws an error-like object that's not an Error instance
      node.registerMethod('add', () => {
        throw { message: 'Custom error', stack: 'stack trace' };
      });

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle request handler errors with non-error object and no message', async () => {
      // Add middleware that throws a non-error object without a message property
      node.addMiddleware(async () => {
        throw { code: 123 }; // Not an Error instance and no message property
      });

      node.registerMethod('add', (_context, params) => params.a + params.b);

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle request handler errors with custom error message', async () => {
      // Register a method that throws an error with a custom message
      node.registerMethod('add', () => {
        const error = new Error();
        error.message = 'Custom error without Method not found';
        throw error;
      });

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Custom error without Method not found',
        },
        id: '1',
      });
    });

    it('should handle request handler errors with Error instance and custom message', async () => {
      // Add middleware that throws an Error with a custom message
      node.addMiddleware(async () => {
        throw new Error('Custom middleware error');
      });

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Custom middleware error',
        },
        id: '1',
      });
    });

    it('should handle request handler errors with middleware error', async () => {
      // Add middleware that throws an error
      node.addMiddleware(async () => {
        throw new Error('Middleware error');
      });

      node.registerMethod('add', (_context, params) => params.a + params.b);

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Middleware error',
        },
        id: '1',
      });
    });

    it('should handle request handler errors with custom error object', async () => {
      // Register a method that throws a custom error object
      node.registerMethod('add', () => {
        const error = new Error('Custom error') as Error & { code: number };
        error.code = 123; // Add a custom property
        throw error;
      });

      // Send a request
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Custom error',
        },
        id: '1',
      });
    });

    it('should handle method not found in request handler', async () => {
      // Register a method that throws a Method not found error
      node.registerMethod('add', () => {
        throw new Error('Method not found');
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'add',
        },
        id: '1',
      });
    });

    it('should handle method not found without error response', async () => {
      // Send a notification (no id)
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'nonexistent',
      });

      // Should not send error response for notifications
      expect(transport.send).not.toHaveBeenCalled();
    });

    it('should handle Error with "Method not found" message', async () => {
      // Register a method that throws a regular Error with "Method not found" message
      node.registerMethod('add', () => {
        const error = new Error('Method not found');
        throw error; // This should hit the specific error handling branch
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found',
          data: 'add',
        },
        id: '1',
      });
    });

    it('should handle unknown errors', async () => {
      node.registerMethod('add', () => {
        // Throw something that's not an Error object
        throw 'Unknown error';
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle non-Error objects without message property', async () => {
      // Add middleware that throws a non-Error object without a message property
      node.addMiddleware(async () => {
        throw { code: 123 }; // Not an Error instance and no message property
      });

      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Unknown error',
        },
        id: '1',
      });
    });

    it('should handle notification errors silently', async () => {
      node.registerMethod('add', () => {
        throw new Error('Test error');
      });

      // Send a notification (no id)
      await node.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
      });

      // Should not send error response for notifications
      expect(transport.send).not.toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.anything(),
        }),
      );
    });
  });

  describe('Node Lifecycle', () => {
    it('should clean up resources on close', async () => {
      const handler = vi.fn();
      const middleware = vi.fn();

      node.on('userJoined', handler);
      node.addMiddleware(middleware);

      await node.close();

      await node.receiveMessage({
        jsonrpc: '2.0',
        event: 'userJoined',
        params: { name: 'Alice', id: 1 },
      });

      expect(handler).not.toHaveBeenCalled();
      expect(middleware).not.toHaveBeenCalled();
    });

    it('should reject pending requests on close', async () => {
      const promise = node.callMethod('add', { a: 1, b: 2 });
      await node.close();
      await expect(promise).rejects.toThrow('Node closed');
    });
  });
});
