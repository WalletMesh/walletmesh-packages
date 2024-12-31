import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestHandler } from './request-handler.js';
import { MethodManager } from './method-manager.js';
import { JSONRPCError } from './error.js';
import type { JSONRPCContext, JSONRPCSerializer, JSONRPCRequest } from './types.js';

describe('RequestHandler', () => {
  type TestMethodMap = {
    add: { params: { a: number; b: number }; result: number };
    greet: { params: { name: string }; result: string };
    noParams: { params: undefined; result: undefined };
  };

  type TestContext = JSONRPCContext & {
    user?: string;
  };

  let methodManager: MethodManager<TestMethodMap, TestContext>;
  let requestHandler: RequestHandler<TestMethodMap, TestContext>;

  beforeEach(() => {
    methodManager = new MethodManager<TestMethodMap, TestContext>();
    requestHandler = new RequestHandler<TestMethodMap, TestContext>(methodManager);
  });

  describe('Request Validation', () => {
    it('should reject invalid request format', async () => {
      await expect(
        requestHandler.handleRequest({}, { jsonrpc: '2.0' } as unknown as JSONRPCRequest<
          TestMethodMap,
          keyof TestMethodMap
        >),
      ).rejects.toThrow(new JSONRPCError(-32600, 'Invalid Request', 'Invalid request format'));
    });

    it('should reject request for non-existent method', async () => {
      await expect(
        requestHandler.handleRequest({}, { jsonrpc: '2.0', method: 'add', id: '1' }),
      ).rejects.toThrow(new JSONRPCError(-32601, 'Method not found', 'nonexistent'));
    });
  });

  describe('Parameter Handling', () => {
    it('should handle method call without params', async () => {
      methodManager.registerMethod('noParams', async () => {
        return { success: true, data: undefined };
      });

      const response = await requestHandler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'noParams',
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: undefined,
        id: '1',
      });
    });

    it('should handle method call with object params', async () => {
      methodManager.registerMethod('add', async (_context, params) => {
        return { success: true, data: params.a + params.b };
      });

      const response = await requestHandler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'add',
          params: { a: 2, b: 3 },
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 5,
        id: '1',
      });
    });

    it('should handle method error', async () => {
      methodManager.registerMethod('add', async () => {
        return {
          success: false,
          error: {
            code: -32602,
            message: 'Invalid params',
            data: { expected: 'number', received: 'string' },
          },
        };
      });

      await expect(
        requestHandler.handleRequest(
          {},
          {
            jsonrpc: '2.0',
            method: 'add',
            params: { a: 'not a number', b: 2 },
            id: '1',
          },
        ),
      ).rejects.toThrow(JSONRPCError);
    });
  });

  describe('Serialization', () => {
    const testSerializer: JSONRPCSerializer<{ name: string }, string> = {
      params: {
        serialize: (params) => ({ serialized: JSON.stringify(params) }),
        deserialize: (data) => JSON.parse(data.serialized),
      },
      result: {
        serialize: (result) => ({ serialized: result }),
        deserialize: (data) => data.serialized,
      },
    };

    it('should handle serialized parameters', async () => {
      methodManager.registerMethod(
        'greet',
        async (_context, params) => {
          return { success: true, data: `Hello ${params.name}!` };
        },
        testSerializer,
      );

      const response = await requestHandler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'greet',
          params: { serialized: JSON.stringify({ name: 'Alice' }) },
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: { serialized: 'Hello Alice!' },
        id: '1',
      });
    });

    it('should handle serialization errors', async () => {
      const errorSerializer: JSONRPCSerializer<{ name: string }, string> = {
        params: {
          serialize: (params) => ({ serialized: JSON.stringify(params) }),
          deserialize: () => {
            throw new Error('Deserialization failed');
          },
        },
        result: {
          serialize: (result) => ({ serialized: result }),
          deserialize: (data) => data.serialized,
        },
      };

      methodManager.registerMethod(
        'greet',
        async (_context, params) => {
          return { success: true, data: `Hello ${params.name}!` };
        },
        errorSerializer,
      );

      await expect(
        requestHandler.handleRequest(
          {},
          {
            jsonrpc: '2.0',
            method: 'greet',
            params: { serialized: '{"name":"Alice"}' },
            id: '1',
          },
        ),
      ).rejects.toThrow(new JSONRPCError(-32000, 'Deserialization failed'));
    });
  });

  describe('Context Handling', () => {
    it('should pass context to method handler', async () => {
      const handler = vi.fn().mockResolvedValue({ success: true, data: 'success' });
      methodManager.registerMethod('greet', handler);

      const context = { user: 'alice' };
      await requestHandler.handleRequest(context, {
        jsonrpc: '2.0',
        method: 'greet',
        params: { name: 'Bob' },
        id: '1',
      });

      expect(handler).toHaveBeenCalledWith(context, { name: 'Bob' });
    });
  });
});
