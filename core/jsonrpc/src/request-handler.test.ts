import { describe, expect, it, type Mock, vi } from 'vitest';
import { JSONRPCError } from './error.js';
import type { MethodManager } from './method-manager.js';
import { MiddlewareManager } from './middleware-manager.js';
import { RequestHandler } from './request-handler.js';
import type {
  FallbackMethodHandler,
  JSONRPCContext,
  JSONRPCMethodDef,
  JSONRPCParams,
  JSONRPCRequest,
  MethodResponse,
} from './types.js';

describe('RequestHandler', () => {
  // Define test types
  type TestMethods = {
    test: JSONRPCMethodDef<{ value: string }, string>;
    [key: string]: JSONRPCMethodDef<JSONRPCParams, unknown>;
  };

  type TestContext = JSONRPCContext & {
    userId: string;
  };

  // Create mock method manager
  const createMethodManager = () => {
    const methodManager = {
      methods: new Map(),
      serializers: new Map(),
      pendingRequests: new Map(),
      fallbackHandler: undefined as FallbackMethodHandler<TestContext> | undefined,

      getMethod: vi.fn() as Mock,
      getFallbackHandler: vi.fn() as Mock,
      getSerializer: vi.fn() as Mock,
      registerMethod: vi.fn(),
      setFallbackHandler: vi.fn(),
      registerSerializer: vi.fn(),
      addPendingRequest: vi.fn(),
      removePendingRequest: vi.fn(),
      deserializeParams: vi.fn() as Mock,
      serializeResult: vi.fn() as Mock,
    } as unknown as MethodManager<TestMethods, TestContext>;
    return methodManager;
  };

  // Create post-deserialization middleware manager
  // This mimics what's in JSONRPCNode constructor
  const createMiddlewareManager = (methodManager: MethodManager<TestMethods, TestContext>) => {
    return new MiddlewareManager<TestMethods, TestContext>(async (context, request) => {
      const method = methodManager.getMethod(request.method);

      let methodResponse: MethodResponse<unknown>;

      if (method) {
        methodResponse = await method(
          context,
          request.method,
          request.params as TestMethods[keyof TestMethods]['params'],
        );
      } else {
        // Try fallback handler
        const fallback = methodManager.getFallbackHandler();
        if (fallback) {
          methodResponse = await fallback(context, String(request.method), request.params);
        } else {
          throw new JSONRPCError(-32601, 'Method not found', String(request.method));
        }
      }

      // Convert MethodResponse to JSONRPCResponse
      if (methodResponse.success) {
        return {
          jsonrpc: '2.0' as const,
          result: methodResponse.data,
          id: request.id,
        };
      }

      // For errors, throw JSONRPCError
      throw new JSONRPCError(
        methodResponse.error.code,
        methodResponse.error.message,
        methodResponse.error.data,
      );
    });
  };

  describe('Method Not Found Handling', () => {
    it('should throw method not found error when no method or fallback handler exists', async () => {
      const methodManager = createMethodManager();
      const middlewareManager = createMiddlewareManager(methodManager);
      const handler = new RequestHandler<TestMethods, TestContext>(methodManager, middlewareManager);

      // Mock method manager to return no method and no fallback
      (methodManager.getMethod as Mock).mockReturnValue(undefined);
      (methodManager.getFallbackHandler as Mock).mockReturnValue(undefined);
      (methodManager.deserializeParams as Mock).mockResolvedValue({ value: 'test' });

      const request = {
        jsonrpc: '2.0' as const,
        method: 'nonexistent',
        params: { value: 'test' },
        id: 1,
      };

      await expect(handler.handleRequest({ userId: '123' }, request)).rejects.toThrow(
        new JSONRPCError(-32601, 'Method not found', 'nonexistent'),
      );

      // Verify method manager was called correctly
      expect(methodManager.getMethod).toHaveBeenCalledWith('nonexistent');
      expect(methodManager.getFallbackHandler).toHaveBeenCalled();
    });

    it('should use fallback handler when method not found but fallback exists', async () => {
      const methodManager = createMethodManager();
      const middlewareManager = createMiddlewareManager(methodManager);
      const handler = new RequestHandler<TestMethods, TestContext>(methodManager, middlewareManager);

      // Mock successful fallback handler response
      const fallbackResponse: MethodResponse<string> = {
        success: true,
        data: 'fallback result',
      };
      const fallbackHandler = vi.fn().mockResolvedValue(fallbackResponse);

      // Mock method manager to return no method but provide fallback
      (methodManager.getMethod as Mock).mockReturnValue(undefined);
      (methodManager.getFallbackHandler as Mock).mockReturnValue(fallbackHandler);
      (methodManager.getSerializer as Mock).mockReturnValue(undefined);
      (methodManager.deserializeParams as Mock).mockResolvedValue({ value: 'test' });
      (methodManager.serializeResult as Mock).mockResolvedValue('fallback result');

      const request = {
        jsonrpc: '2.0' as const,
        method: 'nonexistent',
        params: { value: 'test' },
        id: 1,
      };

      const response = await handler.handleRequest({ userId: '123' }, request);

      // Verify response
      expect(response).toEqual({
        jsonrpc: '2.0',
        result: 'fallback result',
        id: 1,
      });

      // Verify fallback handler was called with correct arguments
      expect(fallbackHandler).toHaveBeenCalledWith({ userId: '123' }, 'nonexistent', { value: 'test' });
      expect(methodManager.deserializeParams).toHaveBeenCalledWith('nonexistent', { value: 'test' });
      expect(methodManager.serializeResult).toHaveBeenCalledWith('nonexistent', 'fallback result');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when method returns unsuccessful response', async () => {
      const methodManager = createMethodManager();
      const middlewareManager = createMiddlewareManager(methodManager);
      const handler = new RequestHandler<TestMethods, TestContext>(methodManager, middlewareManager);

      // Mock method that returns an error response
      const errorResponse: MethodResponse<string> = {
        success: false,
        error: {
          code: -32000,
          message: 'Custom error',
          data: { details: 'Something went wrong' },
        },
      };
      const methodHandler = vi.fn().mockResolvedValue(errorResponse);

      // Mock method manager to return the error-producing method
      (methodManager.getMethod as Mock).mockReturnValue(methodHandler);
      (methodManager.getSerializer as Mock).mockReturnValue(undefined);
      (methodManager.deserializeParams as Mock).mockResolvedValue({ value: 'test' });

      const request = {
        jsonrpc: '2.0' as const,
        method: 'test',
        params: { value: 'test' },
        id: 1,
      };

      await expect(handler.handleRequest({ userId: '123' }, request)).rejects.toThrow(
        new JSONRPCError(-32000, 'Custom error', { details: 'Something went wrong' }),
      );

      // Verify method was called
      expect(methodHandler).toHaveBeenCalledWith({ userId: '123' }, 'test', { value: 'test' });
    });

    it('should throw error when fallback handler returns unsuccessful response', async () => {
      const methodManager = createMethodManager();
      const middlewareManager = createMiddlewareManager(methodManager);
      const handler = new RequestHandler<TestMethods, TestContext>(methodManager, middlewareManager);

      // Mock fallback handler that returns an error response
      const errorResponse: MethodResponse<string> = {
        success: false,
        error: {
          code: -32000,
          message: 'Fallback error',
          data: { reason: 'Invalid operation' },
        },
      };
      const fallbackHandler = vi.fn().mockResolvedValue(errorResponse);

      // Mock method manager to return no method but provide fallback
      (methodManager.getMethod as Mock).mockReturnValue(undefined);
      (methodManager.getFallbackHandler as Mock).mockReturnValue(fallbackHandler);
      (methodManager.getSerializer as Mock).mockReturnValue(undefined);
      (methodManager.deserializeParams as Mock).mockResolvedValue({ value: 'test' });

      const request = {
        jsonrpc: '2.0' as const,
        method: 'nonexistent',
        params: { value: 'test' },
        id: 1,
      };

      await expect(handler.handleRequest({ userId: '123' }, request)).rejects.toThrow(
        new JSONRPCError(-32000, 'Fallback error', { reason: 'Invalid operation' }),
      );

      // Verify fallback handler was called
      expect(fallbackHandler).toHaveBeenCalledWith({ userId: '123' }, 'nonexistent', { value: 'test' });
    });

    it('should throw invalid request error for malformed requests', async () => {
      const methodManager = createMethodManager();
      const middlewareManager = createMiddlewareManager(methodManager);
      const handler = new RequestHandler<TestMethods, TestContext>(methodManager, middlewareManager);

      // Create an invalid request by using null as the request object
      const invalidRequest = null as unknown as JSONRPCRequest<TestMethods, keyof TestMethods>;

      await expect(handler.handleRequest({ userId: '123' }, invalidRequest)).rejects.toThrow(
        new JSONRPCError(-32600, 'Invalid Request', 'Invalid request format'),
      );

      // Verify that method manager was not called since request was invalid
      expect(methodManager.getMethod).not.toHaveBeenCalled();
      expect(methodManager.getFallbackHandler).not.toHaveBeenCalled();
    });
  });
});
