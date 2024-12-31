import { describe, it, expect, vi } from 'vitest';
import { RequestHandler } from './request-handler.js';
import { JSONRPCError } from './error.js';
import { wrapHandler } from './utils.js';
import type {
  JSONRPCContext,
  JSONRPCRequest,
  FallbackMethodHandler,
  JSONRPCSerializedData,
} from './types.js';
import type { MethodManager } from './method-manager.js';

describe('RequestHandler', () => {
  type TestMethodMap = {
    test: { params: { value: string }; result: string };
    noParams: { params: undefined; result: string };
    // Make unknown method params match JSONRPCParams constraint
    unknown: { params: { [key: string]: unknown }; result: string };
  };

  // Create properly typed mock functions
  const getMethodMock = vi.fn();
  const getSerializerMock = vi.fn();
  const getFallbackHandlerMock = vi.fn();

  // Create a properly typed mock MethodManager
  const methodManager = {
    getMethod: getMethodMock,
    getSerializer: getSerializerMock,
    getFallbackHandler: getFallbackHandlerMock,
    registerMethod: vi.fn(),
    registerSerializer: vi.fn(),
    setFallbackHandler: vi.fn(),
    rejectAllRequests: vi.fn(),
    handleResponse: vi.fn(),
    addPendingRequest: vi.fn(),
  } as unknown as MethodManager<TestMethodMap, JSONRPCContext>;

  const handler = new RequestHandler<TestMethodMap, JSONRPCContext>(methodManager);

  describe('Request Validation', () => {
    it('should throw on invalid request', async () => {
      await expect(
        handler.handleRequest({}, {
          jsonrpc: '2.0',
          method: 'test',
          invalid: true,
        } as JSONRPCRequest<TestMethodMap, keyof TestMethodMap>),
      ).rejects.toThrow(JSONRPCError);
    });

    it('should throw specific error for invalid request structure', async () => {
      await expect(
        handler.handleRequest({}, {
          foo: 'bar',
        } as unknown as JSONRPCRequest<TestMethodMap, keyof TestMethodMap>),
      ).rejects.toThrow(
        expect.objectContaining({
          code: -32600,
          message: 'Invalid Request',
          data: 'Invalid request format',
        }),
      );
    });

    it('should handle missing params', async () => {
      const rawHandler = async (_context: JSONRPCContext, _params: undefined): Promise<string> => 'test';
      const method = wrapHandler<TestMethodMap, 'noParams', JSONRPCContext>(rawHandler);

      getMethodMock.mockReturnValue(method);

      const response = await handler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'noParams',
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 'test',
        id: '1',
      });
    });
  });

  describe('Parameter Handling', () => {
    it('should handle method call without params', async () => {
      const rawHandler = async (_context: JSONRPCContext, _params: undefined): Promise<string> => 'test';
      const method = wrapHandler<TestMethodMap, 'noParams', JSONRPCContext>(rawHandler);

      getMethodMock.mockReturnValue(method);

      const response = await handler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'noParams',
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 'test',
        id: '1',
      });
    });

    it('should handle method call with object params', async () => {
      const rawHandler = async (_context: JSONRPCContext, params: { value: string }): Promise<string> =>
        params.value;
      const method = wrapHandler<TestMethodMap, 'test', JSONRPCContext>(rawHandler);

      getMethodMock.mockReturnValue(method);

      const response = await handler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'test',
          params: { value: 'test' },
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 'test',
        id: '1',
      });
    });

    it('should handle method error', async () => {
      const rawHandler = async (): Promise<string> => {
        throw new JSONRPCError(-32000, 'Test error');
      };
      const method = wrapHandler<TestMethodMap, 'test', JSONRPCContext>(rawHandler);

      getMethodMock.mockReturnValue(method);

      await expect(
        handler.handleRequest(
          {},
          {
            jsonrpc: '2.0',
            method: 'test',
            params: { value: 'test' },
            id: '1',
          },
        ),
      ).rejects.toThrow(JSONRPCError);
    });
  });

  describe('Serialization', () => {
    it('should handle serialized parameters', async () => {
      const rawHandler = async (_context: JSONRPCContext, _params: { value: string }): Promise<string> =>
        'test';
      const method = wrapHandler<TestMethodMap, 'test', JSONRPCContext>(rawHandler);

      getMethodMock.mockReturnValue(method);
      getSerializerMock.mockReturnValue({
        params: {
          serialize: () => ({ serialized: 'test' }),
          deserialize: () => ({ value: 'test' }),
        },
      });

      const response = await handler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'test',
          params: { serialized: 'test' },
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 'test',
        id: '1',
      });
    });

    it('should handle serialization errors', async () => {
      const rawHandler = async (_context: JSONRPCContext, _params: { value: string }): Promise<string> =>
        'test';
      const method = wrapHandler<TestMethodMap, 'test', JSONRPCContext>(rawHandler);

      getMethodMock.mockReturnValue(method);
      getSerializerMock.mockReturnValue({
        params: {
          serialize: () => ({ serialized: 'test' }),
          deserialize: () => {
            throw new Error('Deserialization failed');
          },
        },
      });

      await expect(
        handler.handleRequest(
          {},
          {
            jsonrpc: '2.0',
            method: 'test',
            params: { serialized: 'test' },
            id: '1',
          },
        ),
      ).rejects.toThrow('Deserialization failed');
    });
  });

  describe('Context Handling', () => {
    it('should pass context to method handler', async () => {
      const rawHandler = async (context: JSONRPCContext, _params: { value: string }): Promise<string> =>
        context.value as string;
      const method = wrapHandler<TestMethodMap, 'test', JSONRPCContext>(rawHandler);

      getMethodMock.mockReturnValue(method);
      getSerializerMock.mockReturnValue({
        params: {
          serialize: () => ({ serialized: JSON.stringify({ value: 'test' }) }),
          deserialize: (data: JSONRPCSerializedData) => JSON.parse(data.serialized),
        },
      });

      const response = await handler.handleRequest(
        { value: 'test' },
        {
          jsonrpc: '2.0',
          method: 'test',
          params: { serialized: JSON.stringify({ value: 'test' }) },
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 'test',
        id: '1',
      });
    });
  });

  describe('Fallback Handler', () => {
    it('should use fallback handler when method not found', async () => {
      const fallback: FallbackMethodHandler<JSONRPCContext> = async (_context, method, params) => ({
        success: true,
        data: `Handled ${method} with ${JSON.stringify(params)}`,
      });

      getMethodMock.mockReturnValue(undefined);
      getFallbackHandlerMock.mockReturnValue(fallback);

      const response = await handler.handleRequest(
        {},
        {
          jsonrpc: '2.0',
          method: 'unknown' as keyof TestMethodMap,
          params: { test: true },
          id: '1',
        },
      );

      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 'Handled unknown with {"test":true}',
        id: '1',
      });
    });

    it('should throw method not found when no fallback handler', async () => {
      getMethodMock.mockReturnValue(undefined);
      getFallbackHandlerMock.mockReturnValue(undefined);

      await expect(
        handler.handleRequest(
          {},
          {
            jsonrpc: '2.0',
            method: 'unknown' as keyof TestMethodMap,
            id: '1',
          },
        ),
      ).rejects.toThrow(JSONRPCError);
    });

    it('should handle fallback handler errors', async () => {
      const fallback: FallbackMethodHandler<JSONRPCContext> = async () => {
        throw new JSONRPCError(-32000, 'Fallback error');
      };

      getMethodMock.mockReturnValue(undefined);
      getFallbackHandlerMock.mockReturnValue(fallback);

      await expect(
        handler.handleRequest(
          {},
          {
            jsonrpc: '2.0',
            method: 'unknown' as keyof TestMethodMap,
            id: '1',
          },
        ),
      ).rejects.toThrow(JSONRPCError);
    });
  });
});
