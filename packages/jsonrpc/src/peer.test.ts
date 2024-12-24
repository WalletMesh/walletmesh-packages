import { describe, it, expect, vi } from 'vitest';
import { JSONRPCError, JSONRPCPeer, TimeoutError } from './index.js';
import { applyToMethods, isJSONRPCID, isJSONRPCVersion, isJSONRPCSerializedData } from './utils.js';
import type { JSONRPCContext, JSONRPCRequest, JSONRPCResponse, JSONRPCSerializer } from './types.js';

describe('JSONRPCPeer', () => {
  type TestContext = JSONRPCContext & {
    user?: string;
  };
  type TestMethodMap = {
    add: { params: { a: number; b: number }; result: number };
    greet: { params: { name: string }; result: string };
  };

  type TestEventMap = {
    userJoined: { name: string; id: number };
    messageReceived: { text: string; from: string };
  };

  describe('Utils', () => {
    describe('isJSONRPCID', () => {
      it('should validate JSON-RPC IDs', () => {
        expect(isJSONRPCID('123')).toBe(true);
        expect(isJSONRPCID(123)).toBe(true);
        expect(isJSONRPCID(undefined)).toBe(true);
        expect(isJSONRPCID(null)).toBe(false);
        expect(isJSONRPCID({})).toBe(false);
        expect(isJSONRPCID([])).toBe(false);
      });
    });

    describe('isJSONRPCVersion', () => {
      it('should validate JSON-RPC version', () => {
        expect(isJSONRPCVersion('2.0')).toBe(true);
        expect(isJSONRPCVersion('1.0')).toBe(false);
        expect(isJSONRPCVersion(2)).toBe(false);
        expect(isJSONRPCVersion(undefined)).toBe(false);
        expect(isJSONRPCVersion(null)).toBe(false);
      });
    });

    describe('isJSONRPCSerializedData', () => {
      it('should validate JSON-RPC serialized data', () => {
        expect(isJSONRPCSerializedData({ serialized: 'test' })).toBe(true);
        expect(isJSONRPCSerializedData({ serialized: 123 })).toBe(false);
        expect(isJSONRPCSerializedData({ other: 'test' })).toBe(false);
        expect(isJSONRPCSerializedData(null)).toBe(false);
        expect(isJSONRPCSerializedData(undefined)).toBe(false);
        expect(isJSONRPCSerializedData({})).toBe(false);
      });
    });

    describe('applyToMethods', () => {
      it('should create method-specific middleware', async () => {
        const middleware = vi.fn(async (_context, _request, next) => next());
        const wrappedMiddleware = applyToMethods(['test'], middleware);

        await wrappedMiddleware({}, { jsonrpc: '2.0', method: 'test', id: '1' }, async () => ({
          jsonrpc: '2.0',
          id: '1',
          result: null,
        }));
        await wrappedMiddleware({}, { jsonrpc: '2.0', method: 'other', id: '2' }, async () => ({
          jsonrpc: '2.0',
          id: '2',
          result: null,
        }));

        expect(middleware).toHaveBeenCalledTimes(1);
        expect(middleware).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ method: 'test' }),
          expect.any(Function),
        );
      });
    });
  });

  it('should handle method calls correctly', async () => {
    const transport = {
      send: vi.fn((message) => {
        // Simulate response from other peer
        if ('method' in message && message.method === 'add') {
          peer.receiveMessage({
            jsonrpc: '2.0',
            result:
              (message.params as { a: number; b: number }).a + (message.params as { a: number; b: number }).b,
            id: message.id,
          });
        }
      }),
    };

    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    // Register local method
    peer.registerMethod('greet', (_context, { name }) => `Hello, ${name}!`);

    // Call remote method
    const result = await peer.callMethod('add', { a: 2, b: 3 });
    expect(result).toBe(5);

    // Verify transport was called with correct message
    expect(transport.send).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 2, b: 3 },
      }),
    );
  });

  it('should handle events correctly', async () => {
    const transport = {
      send: vi.fn(),
    };

    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
    const eventHandler = vi.fn();

    // Register event handler
    peer.on('userJoined', eventHandler);

    // Simulate receiving an event
    await peer.receiveMessage({
      jsonrpc: '2.0',
      event: 'userJoined',
      params: { name: 'Alice', id: 123 },
    });

    // Verify handler was called with correct params
    expect(eventHandler).toHaveBeenCalledWith({ name: 'Alice', id: 123 });

    // Emit an event
    peer.emit('messageReceived', { text: 'Hello!', from: 'Bob' });

    // Verify transport was called with correct message
    expect(transport.send).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      event: 'messageReceived',
      params: { text: 'Hello!', from: 'Bob' },
    });
  });

  it('should handle bi-directional communication', async () => {
    const peerA = new JSONRPCPeer<TestMethodMap, TestEventMap>({
      send: (message) => {
        // Forward message to peer B
        peerB.receiveMessage(message);
      },
    });

    const peerB = new JSONRPCPeer<TestMethodMap, TestEventMap>({
      send: (message) => {
        // Forward message to peer A
        peerA.receiveMessage(message);
      },
    });

    // Register methods on both peers
    peerA.registerMethod('add', (_context, { a, b }) => a + b);
    peerB.registerMethod('greet', (_context, { name }) => `Hello, ${name}!`);

    // Test calling methods in both directions
    const sum = await peerB.callMethod('add', { a: 2, b: 3 });
    expect(sum).toBe(5);

    const greeting = await peerA.callMethod('greet', { name: 'Alice' });
    expect(greeting).toBe('Hello, Alice!');

    // Test events in both directions
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    peerA.on('userJoined', handlerA);
    peerB.on('messageReceived', handlerB);

    peerA.emit('messageReceived', { text: 'Hi!', from: 'Alice' });
    peerB.emit('userJoined', { name: 'Bob', id: 456 });

    expect(handlerA).toHaveBeenCalledWith({ name: 'Bob', id: 456 });
    expect(handlerB).toHaveBeenCalledWith({ text: 'Hi!', from: 'Alice' });
  });

  it('should handle errors correctly', async () => {
    const transport = {
      send: vi.fn((message) => {
        if ('method' in message && message.method === 'add') {
          peer.receiveMessage({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Test error',
            },
            id: message.id,
          });
        }
      }),
    };

    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    // Test error from remote method
    await expect(peer.callMethod('add', { a: 2, b: 3 })).rejects.toThrow(JSONRPCError);

    // Test error in local method
    peer.registerMethod('greet', () => {
      throw new JSONRPCError(-32000, 'Test error');
    });

    await peer.receiveMessage({
      jsonrpc: '2.0',
      method: 'greet',
      params: { name: 'Alice' },
      id: '123',
    });

    expect(transport.send).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Test error',
        },
        id: '123',
      }),
    );
  });

  it('should handle errors with data correctly', async () => {
    const transport = { send: vi.fn() };
    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    // Test error with data
    peer.registerMethod('greet', () => {
      throw new JSONRPCError(-32000, 'Test error', { details: 'More info' });
    });

    await peer.receiveMessage({
      jsonrpc: '2.0',
      method: 'greet',
      params: { name: 'Alice' },
      id: '123',
    });

    expect(transport.send).toHaveBeenCalledWith(
      expect.objectContaining({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Test error',
          data: { details: 'More info' },
        },
        id: '123',
      }),
    );
  });

  describe('Error handling', () => {
    it('should handle JSONRPCErrors', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      // Register a method that throws an error without a message property
      peer.registerMethod('add', () => {
        throw new JSONRPCError(-32222, 'Test error -32222', { details: 'More info' });
      });

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32222,
          message: 'Test error -32222',
          data: { details: 'More info' },
        },
        id: '1',
      });
    });

    it('should handle errors that are not JSONRPCErrors', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      // Register a method that throws an error without a message property
      peer.registerMethod('add', () => {
        throw new Error('Test error');
      });

      await peer.receiveMessage({
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

    it('should handle non-errors', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      // Register a method that throws an error without a message property
      peer.registerMethod('add', () => {
        throw 'Test error';
      });

      await peer.receiveMessage({
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

    it('should handle undefined params in method handler', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      peer.registerMethod('add', (_context, params) => params.a + params.b);

      // Call method without params
      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        id: '1',
      });

      // Should use empty object as params
      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: "Cannot read properties of undefined (reading 'a')",
        },
        id: '1',
      });
    });

    it('should handle timeout errors', async () => {
      const error = new TimeoutError('Test timeout', -32000);
      expect(error).toBeInstanceOf(TimeoutError);
      expect(error.message).toBe('Test timeout');
      expect(error.code).toBe(-32000);
    });

    it('should format error with string data', () => {
      const error = new JSONRPCError(-32000, 'Test error', 'Additional info');
      expect(error.toString()).toBe('JSONRPCError(-32000): Test error, Data: Additional info');
    });

    it('should format error with object data', () => {
      const error = new JSONRPCError(-32000, 'Test error', { detail: 'More info' });
      expect(error.toString()).toBe('JSONRPCError(-32000): Test error, Data: {"detail":"More info"}');
    });
  });

  it('should handle parameter serialization', () => {
    const transport = { send: vi.fn() };
    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    const serializer = {
      params: {
        serialize: vi.fn((p) => ({ serialized: JSON.stringify(p) })),
        deserialize: vi.fn((d) => JSON.parse(d.serialized)),
      },
      result: {
        serialize: vi.fn((r) => ({ serialized: JSON.stringify(r) })),
        deserialize: vi.fn((d) => JSON.parse(d.serialized)),
      },
    };

    peer.registerMethod('add', (_context, params) => params.a + params.b, serializer);
    peer.registerSerializer('greet', serializer);

    // Test parameter serialization in method call
    peer.callMethod('greet', { name: 'Alice' });
    expect(serializer.params.serialize).toHaveBeenCalledWith({ name: 'Alice' });

    // Test parameter serialization in notification
    peer.notify('greet', { name: 'Bob' });
    expect(serializer.params.serialize).toHaveBeenCalledWith({ name: 'Bob' });

    // Test parameter deserialization in method handler
    peer.receiveMessage({
      jsonrpc: '2.0',
      method: 'add',
      params: { serialized: JSON.stringify({ a: 1, b: 2 }) },
      id: '1',
    });
    expect(serializer.params.deserialize).toHaveBeenCalledWith({
      serialized: JSON.stringify({ a: 1, b: 2 }),
    });
  });

  describe('Invalid request handling', () => {
    it('should handle invalid JSON-RPC version', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      // Register method to ensure we get past method not found error
      peer.registerMethod('add', (_context, params) => params.a + params.b);

      // Create a request with invalid version
      const request: JSONRPCRequest<TestMethodMap, keyof TestMethodMap> = {
        jsonrpc: '1.0' as '2.0', // Force type to be '2.0' for the function call
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      };

      // Send the request directly to handleRequest
      const peerWithPrivate = peer as unknown as {
        handleRequest(request: JSONRPCRequest<TestMethodMap, keyof TestMethodMap>): Promise<void>;
      };
      await peerWithPrivate.handleRequest(request);

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request' },
        id: '1',
      });
    });

    it('should handle method not found', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'nonexistent',
        params: {},
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: { code: -32601, message: 'Method not found' },
        id: '1',
      });
    });

    it('should handle undefined middleware function', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      // Register method to ensure we get past method not found error
      peer.registerMethod('add', (_context, params) => params.a + params.b);

      // Force middleware stack to have an undefined entry
      (peer as unknown as { middlewareStack: Array<unknown> }).middlewareStack = [
        async (
          _context: JSONRPCContext,
          _request: JSONRPCRequest<TestMethodMap, keyof TestMethodMap>,
          next: () => Promise<JSONRPCResponse<TestMethodMap>>,
        ) => next(),
        undefined,
      ];

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Middleware function at index 1 is undefined' },
        id: '1',
      });
    });

    it('should handle no middleware to handle request', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      // Clear middleware stack
      (peer as unknown as { middlewareStack: Array<unknown> }).middlewareStack = [];

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'No middleware to handle request' },
        id: '1',
      });
    });
  });

  it('should handle middleware errors', async () => {
    const transport = { send: vi.fn() };
    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    peer.addMiddleware(async () => {
      throw new Error('Middleware error');
    });

    await peer.receiveMessage({
      jsonrpc: '2.0',
      method: 'add',
      params: { a: 1, b: 2 },
      id: '1',
    });

    expect(transport.send).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Middleware error' },
      id: '1',
    });

    consoleSpy.mockRestore();
  });

  it('should handle event handler cleanup correctly', async () => {
    const transport = { send: vi.fn() };
    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    const handler1 = vi.fn();
    const handler2 = vi.fn();

    // Add two handlers for the same event
    const cleanup1 = peer.on('userJoined', handler1);
    const cleanup2 = peer.on('userJoined', handler2);

    // Remove first handler
    cleanup1();

    // Event should still be handled by second handler
    await peer.receiveMessage({
      jsonrpc: '2.0',
      event: 'userJoined',
      params: { name: 'Alice', id: 123 },
    });

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith({ name: 'Alice', id: 123 });

    // Remove second handler
    cleanup2();

    // Event should not be handled anymore
    await peer.receiveMessage({
      jsonrpc: '2.0',
      event: 'userJoined',
      params: { name: 'Bob', id: 456 },
    });

    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it('should handle serialized results in responses', async () => {
    const transport = { send: vi.fn() };
    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    const serializer: JSONRPCSerializer<{ a: number; b: number }, number> = {
      params: {
        serialize: vi.fn((p) => ({ serialized: JSON.stringify(p) })),
        deserialize: vi.fn((d) => JSON.parse(d.serialized)),
      },
      result: {
        serialize: vi.fn((r) => ({ serialized: JSON.stringify(r) })),
        deserialize: vi.fn((d) => JSON.parse(d.serialized)),
      },
    };

    // Register serializer for the method
    peer.registerSerializer('add', serializer);

    // Get the request ID before making the call
    const requestId = crypto.randomUUID();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(requestId);

    // Simulate a pending request
    const promise = peer.callMethod('add', { a: 1, b: 2 });

    // Simulate receiving a response with serialized data
    await peer.receiveMessage({
      jsonrpc: '2.0',
      result: { serialized: '3' },
      id: requestId,
    });

    const result = await promise;
    expect(result).toBe(3);
    if (!serializer.result) {
      throw new Error('Result serializer should be defined');
    }
    expect(serializer.result.deserialize).toHaveBeenCalledWith({ serialized: '3' });
  });

  it('should handle unknown responses and event handler errors', async () => {
    const transport = { send: vi.fn() };
    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Test unknown response
    peer.receiveMessage({
      jsonrpc: '2.0',
      result: 42,
      id: 'unknown',
    });
    expect(consoleWarnSpy).toHaveBeenCalledWith('Received response for unknown request:', 'unknown');

    // Test event handler error
    const errorHandler = () => {
      throw new Error('Event handler error');
    };
    peer.on('userJoined', errorHandler);

    await peer.receiveMessage({
      jsonrpc: '2.0',
      event: 'userJoined',
      params: { name: 'Alice', id: 123 },
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error in event handler:', expect.any(Error));

    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle notifications correctly', () => {
    const transport = {
      send: vi.fn(),
    };

    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    // Send notification
    peer.notify('greet', { name: 'Alice' });

    // Verify transport was called with notification message (no id)
    expect(transport.send).toHaveBeenCalledWith({
      jsonrpc: '2.0',
      method: 'greet',
      params: { name: 'Alice' },
    });
  });

  it('should handle method timeouts', async () => {
    const transport = {
      send: vi.fn(),
    };

    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

    // Call method with 1 second timeout
    await expect(peer.callMethod('add', { a: 2, b: 3 }, 1)).rejects.toThrow('Request timed out');
  });

  it('should clear timeout when response is received', async () => {
    const transport = {
      send: vi.fn(),
    };
    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    // Get the request ID before making the call
    const requestId = crypto.randomUUID();
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(requestId);

    // Make method call with timeout
    const promise = peer.callMethod('add', { a: 2, b: 3 }, 1);

    // Simulate receiving response before timeout
    await peer.receiveMessage({
      jsonrpc: '2.0',
      result: 5,
      id: requestId,
    });

    await promise;

    // Verify clearTimeout was called
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should handle invalid messages gracefully', async () => {
    const transport = {
      send: vi.fn(),
    };

    const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Test various invalid messages
    await peer.receiveMessage(null);
    await peer.receiveMessage({});
    await peer.receiveMessage({ jsonrpc: '1.0' });
    await peer.receiveMessage({ jsonrpc: '2.0', method: 123 });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  describe('Middleware', () => {
    it('should execute middleware in order', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap, TestContext>(transport);
      const order: number[] = [];

      peer.addMiddleware(async (_context, _req, next) => {
        order.push(1);
        return await next();
      });

      peer.addMiddleware(async (_context, _req, next) => {
        order.push(2);
        return await next();
      });

      peer.addMiddleware(async (_context, _req, next) => {
        order.push(3);
        return await next();
      });

      peer.registerMethod('add', (_context, params) => {
        if (!params) {
          throw new JSONRPCError(-32000, "Cannot read properties of undefined (reading 'a')");
        }
        return params.a + params.b;
      });

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(order).toEqual([1, 2, 3]);
    });

    it('should allow middleware to modify request', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      peer.addMiddleware(async (_context, req, next) => {
        if (req.method === 'add') {
          req.params = { a: 10, b: 20 };
        }
        return await next();
      });

      peer.registerMethod('add', (_context, params) => params.a + params.b);

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        result: 30,
        id: '1',
      });
    });

    it('should support removing middleware', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
      const callLog: string[] = [];

      const removeMiddleware = peer.addMiddleware(async (_context, _req, next) => {
        callLog.push('middleware');
        return next();
      });

      peer.registerMethod('add', (_context, params) => {
        callLog.push('method');
        return params.a + params.b;
      });

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(callLog).toEqual(['middleware', 'method']);

      callLog.length = 0;
      removeMiddleware();

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '2',
      });

      expect(callLog).toEqual(['method']);
    });

    it('should apply middleware to specified methods', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
      const callLog: string[] = [];
      const middleware = vi.fn(async (_context, req, next) => {
        callLog.push(`middleware for ${String(req.method)}`);
        return next();
      });

      peer.addMiddleware(applyToMethods(['add', 'greet'], middleware));

      peer.registerMethod('add', (_context, params) => {
        callLog.push('add method');
        return params.a + params.b;
      });

      peer.registerMethod('greet', (_context, params) => {
        callLog.push('greet method');
        return `Hello, ${params.name}!`;
      });

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'greet',
        params: { name: 'Alice' },
        id: '2',
      });

      expect(callLog).toEqual(['middleware for add', 'add method', 'middleware for greet', 'greet method']);
      expect(middleware).toHaveBeenCalledTimes(2);
    });

    it('should handle next() called multiple times error', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      peer.addMiddleware(async (_context, _req, next) => {
        await next();
        return await next();
      });

      peer.registerMethod('add', (_context, params) => params.a + params.b);

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'next() called multiple times' },
        id: '1',
      });
    });

    it('should allow middleware to modify responses', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);

      // Add middleware that modifies the response
      peer.addMiddleware(async (_context, _request, next) => {
        const response = await next();
        if (response.result !== undefined && typeof response.result === 'number') {
          response.result = response.result * 2; // Double the number
        }
        return response;
      });

      peer.registerMethod('add', (_context, params) => params.a + params.b);

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        result: 6, // Original result (3) doubled by middleware
        id: '1',
      });
    });

    it('should allow multiple middleware to modify responses in order', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap>(transport);
      const order: string[] = [];

      // First middleware (executes last in the chain)
      peer.addMiddleware(async (_context, _request, next) => {
        const response = await next();
        order.push('middleware1');
        if (response.result !== undefined && typeof response.result === 'number') {
          response.result = response.result + 10; // Add 10
        }
        return response;
      });

      // Second middleware (executes first in the chain)
      peer.addMiddleware(async (_context, _request, next) => {
        const response = await next();
        order.push('middleware2');
        if (response.result !== undefined && typeof response.result === 'number') {
          response.result = response.result * 2; // Double the number
        }
        return response;
      });

      peer.registerMethod('add', (_context, params) => {
        order.push('handler');
        return params.a + params.b;
      });

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      // Verify execution order
      expect(order).toEqual(['handler', 'middleware2', 'middleware1']);

      // Verify final response has modifications from both middleware
      // Original result: 3
      // After middleware2: 6 (doubled)
      // After middleware1: 16 (added 10)
      expect(transport.send).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        result: 16,
        id: '1',
      });
    });

    it('should pass context to method handlers', async () => {
      const transport = { send: vi.fn() };
      const peer = new JSONRPCPeer<TestMethodMap, TestEventMap, TestContext>(transport);

      peer.addMiddleware(async (context, _request, next) => {
        context.user = 'testUser';
        return next();
      });

      const handler = vi.fn((_context, params) => params.a + params.b);
      peer.registerMethod('add', handler);

      await peer.receiveMessage({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 1, b: 2 },
        id: '1',
      });

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ user: 'testUser' }), { a: 1, b: 2 });
    });
  });
});
