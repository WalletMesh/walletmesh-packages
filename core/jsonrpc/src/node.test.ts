import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { JSONRPCNode, TimeoutError, JSONRPCError } from './index.js';
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

  let transport: { send: ReturnType<typeof vi.fn<(message: unknown) => Promise<void>>> };
  let node: JSONRPCNode<TestMethodMap, TestEventMap, TestContext>;

  beforeEach(() => {
    transport = { send: vi.fn().mockResolvedValue(undefined) };
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
      node.registerMethod('add', (_context, params) => Promise.resolve(params.a + params.b));

      let capturedRequest: JSONRPCRequest<TestMethodMap, 'add'> | undefined;
      transport.send.mockImplementation(async (request) => {
        capturedRequest = request as JSONRPCRequest<TestMethodMap, 'add'>;
      });

      const promise = node.callMethod('add', { a: 2, b: 3 });
      await vi.runAllTimersAsync();

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest).toEqual({
        jsonrpc: '2.0',
        method: 'add',
        params: { a: 2, b: 3 },
        id: expect.any(String),
      });

      if (!capturedRequest) {
        throw new Error('Request was not captured');
      }

      await node.receiveMessage({
        jsonrpc: '2.0',
        result: 5,
        id: capturedRequest.id,
      });

      await expect(promise).resolves.toBe(5);
    });

    it('should handle JSON-RPC errors', async () => {
      node.registerMethod('add', () => {
        throw new JSONRPCError(-32602, 'Invalid params', { details: 'test' });
      });

      let capturedRequest: JSONRPCRequest<TestMethodMap, 'add'> | undefined;
      transport.send.mockImplementation(async (request) => {
        capturedRequest = request as JSONRPCRequest<TestMethodMap, 'add'>;
      });

      const promise = node.callMethod('add', { a: 2, b: 3 });
      await vi.runAllTimersAsync();

      if (!capturedRequest) {
        throw new Error('Request was not captured');
      }

      await node.receiveMessage({
        jsonrpc: '2.0',
        error: {
          code: -32602,
          message: 'Invalid params',
          data: { details: 'test' },
        },
        id: capturedRequest.id,
      });

      await expect(promise).rejects.toThrow('Invalid params');
    });

    it('should handle serialization', async () => {
      const serializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: async (method, params) => ({ serialized: JSON.stringify(params), method }),
          deserialize: async (_method, data) => JSON.parse(data.serialized),
        },
        result: {
          serialize: async (method, result) => ({ serialized: result, method }),
          deserialize: async (_method, data) => data.serialized,
        },
      };

      node.registerSerializer('greet', serializer);

      let capturedRequest: JSONRPCRequest<TestMethodMap, 'greet'> | undefined;
      transport.send.mockImplementation(async (request) => {
        capturedRequest = request as JSONRPCRequest<TestMethodMap, 'greet'>;
      });

      const promise = node.callMethod('greet', { name: 'Alice' });
      await vi.runAllTimersAsync();

      if (!capturedRequest) {
        throw new Error('Request was not captured');
      }

      await node.receiveMessage({
        jsonrpc: '2.0',
        result: { serialized: 'Hello Alice!', method: 'greet' },
        id: capturedRequest.id,
      });

      await expect(promise).resolves.toBe('Hello Alice!');
    });

    it('should handle method timeouts', async () => {
      node.registerMethod('add', async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return 5;
      });

      const promise = node.callMethod('add', { a: 2, b: 3 }, 1);
      await expect(
        Promise.race([promise, vi.advanceTimersByTimeAsync(1000).then(() => promise)]),
      ).rejects.toThrow(TimeoutError);
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
      let capturedRequest: JSONRPCRequest<TestMethodMap, 'add'> | undefined;
      transport.send.mockImplementation(async (request) => {
        capturedRequest = request as JSONRPCRequest<TestMethodMap, 'add'>;
      });

      const promise = node.callMethod('add', { a: 1, b: 2 });
      await vi.runAllTimersAsync();

      await node.close();
      await expect(promise).rejects.toThrow('Node closed');
    });
  });
});
