import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSONRPCError, TimeoutError } from './error.js';
import { JSONRPCProxy } from './proxy.js';
import type { JSONRPCTransport } from './types.js';

describe('JSONRPCProxy', () => {
  let transport: JSONRPCTransport;
  let messageHandler: ((message: unknown) => void) | undefined;

  beforeEach(() => {
    // Mock transport
    transport = {
      send: vi.fn().mockResolvedValue(undefined),
      onMessage: vi.fn((handler) => {
        messageHandler = handler;
        return () => {
          messageHandler = undefined;
        };
      }),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default config', () => {
      const proxy = new JSONRPCProxy(transport);
      expect(transport.onMessage).toHaveBeenCalledOnce();
      proxy.close();
    });

    it('should initialize with custom config', () => {
      const logger = vi.fn();
      const proxy = new JSONRPCProxy(transport, {
        timeoutMs: 10000,
        debug: true,
        logger,
        chainId: 'test-chain',
      });

      expect(logger).toHaveBeenCalledWith(
        '[JSONRPCProxy:test-chain] Proxy initialized',
        expect.objectContaining({
          timeoutMs: 10000,
          debug: true,
          chainId: 'test-chain',
        }),
      );
      proxy.close();
    });
  });

  describe('forward', () => {
    describe('notifications', () => {
      it('should forward notifications without waiting for response', async () => {
        const proxy = new JSONRPCProxy(transport);
        const notification = {
          jsonrpc: '2.0' as const,
          method: 'test.notify',
          params: { data: 'test' },
        };

        const result = await proxy.forward(notification);

        expect(result).toBeUndefined();
        expect(transport.send).toHaveBeenCalledWith(notification);
        proxy.close();
      });

      it('should handle notification forwarding errors', async () => {
        const proxy = new JSONRPCProxy(transport);
        const error = new Error('Send failed');
        vi.mocked(transport.send).mockRejectedValueOnce(error);

        const notification = {
          jsonrpc: '2.0' as const,
          method: 'test.notify',
        };

        await expect(proxy.forward(notification)).rejects.toThrow(error);
        proxy.close();
      });
    });

    describe('requests', () => {
      it('should forward request and wait for response', async () => {
        const proxy = new JSONRPCProxy(transport);
        const request = {
          jsonrpc: '2.0' as const,
          method: 'test.call',
          params: { value: 42 },
          id: 'test-1',
        };
        const response = {
          jsonrpc: '2.0' as const,
          result: { success: true },
          id: 'test-1',
        };

        // Start the forward operation
        const forwardPromise = proxy.forward(request);

        // Verify request was sent
        expect(transport.send).toHaveBeenCalledWith(request);

        // Simulate response
        messageHandler?.(response);

        // Wait for response
        const result = await forwardPromise;
        expect(result).toEqual(response);
        proxy.close();
      });

      it('should handle request timeout', async () => {
        vi.useFakeTimers();
        const proxy = new JSONRPCProxy(transport, {
          timeoutMs: 1000,
        });

        const request = {
          jsonrpc: '2.0' as const,
          method: 'test.timeout',
          id: 123,
        };

        // Start the forward operation
        const forwardPromise = proxy.forward(request);

        // Advance time to trigger timeout
        vi.advanceTimersByTime(1001);

        // Should reject with TimeoutError
        await expect(forwardPromise).rejects.toThrow(TimeoutError);
        await expect(forwardPromise).rejects.toThrow('Request timeout after 1000ms');
        proxy.close();
        vi.useRealTimers();
      });

      it('should handle send failures', async () => {
        const proxy = new JSONRPCProxy(transport);
        const error = new Error('Network error');
        vi.mocked(transport.send).mockRejectedValueOnce(error);

        const request = {
          jsonrpc: '2.0' as const,
          method: 'test.fail',
          id: 'fail-1',
        };

        await expect(proxy.forward(request)).rejects.toThrow(error);
        proxy.close();
      });

      it('should handle multiple concurrent requests', async () => {
        const proxy = new JSONRPCProxy(transport);

        // Send multiple requests
        const request1 = {
          jsonrpc: '2.0' as const,
          method: 'test.call1',
          id: 'req-1',
        };
        const request2 = {
          jsonrpc: '2.0' as const,
          method: 'test.call2',
          id: 'req-2',
        };

        const promise1 = proxy.forward(request1);
        const promise2 = proxy.forward(request2);

        // Respond to request2 first
        messageHandler?.({
          jsonrpc: '2.0' as const,
          result: 'result2',
          id: 'req-2',
        });

        const result2 = await promise2;
        expect(result2).toEqual({
          jsonrpc: '2.0',
          result: 'result2',
          id: 'req-2',
        });

        // Respond to request1
        messageHandler?.({
          jsonrpc: '2.0' as const,
          result: 'result1',
          id: 'req-1',
        });

        const result1 = await promise1;
        expect(result1).toEqual({
          jsonrpc: '2.0',
          result: 'result1',
          id: 'req-1',
        });
        proxy.close();
      });
    });

    describe('error handling', () => {
      it('should throw error when proxy is closed', async () => {
        const proxy = new JSONRPCProxy(transport);
        proxy.close();

        await expect(proxy.forward({ id: 1 })).rejects.toThrow(JSONRPCError);
        await expect(proxy.forward({ id: 1 })).rejects.toThrow('Proxy is closed');
      });

      it('should ignore messages with invalid id', async () => {
        const proxy = new JSONRPCProxy(transport);

        // Forward request with valid id
        const request = {
          jsonrpc: '2.0' as const,
          method: 'test',
          id: 'valid-id',
        };
        const forwardPromise = proxy.forward(request);

        // Send response with invalid id type
        messageHandler?.({
          jsonrpc: '2.0' as const,
          result: 'ignored',
          id: { invalid: true }, // Invalid ID type
        });

        // Send correct response
        messageHandler?.({
          jsonrpc: '2.0' as const,
          result: 'correct',
          id: 'valid-id',
        });

        const result = await forwardPromise;
        expect(result).toEqual({
          jsonrpc: '2.0',
          result: 'correct',
          id: 'valid-id',
        });
        proxy.close();
      });
    });
  });

  describe('handleResponse', () => {
    it('should handle events from server', async () => {
      const logger = vi.fn();
      const proxy = new JSONRPCProxy(transport, {
        debug: true,
        logger,
      });

      // Simulate event from server
      const event = {
        jsonrpc: '2.0' as const,
        event: 'test.event',
        params: { data: 'event data' },
      };

      messageHandler?.(event);

      expect(logger).toHaveBeenCalledWith('[JSONRPCProxy] Event received', { event: 'test.event' });
      proxy.close();
    });

    it('should ignore responses without pending request', () => {
      const proxy = new JSONRPCProxy(transport);

      // Send response without matching request
      messageHandler?.({
        jsonrpc: '2.0' as const,
        result: 'orphan',
        id: 'no-request',
      });

      // Should be ignored
      proxy.close();
    });
  });

  describe('logging', () => {
    it('should use custom logger when provided', async () => {
      const logger = vi.fn();
      const proxy = new JSONRPCProxy(transport, {
        logger,
        chainId: 'test',
      });

      await proxy.forward({
        jsonrpc: '2.0' as const,
        method: 'test',
      });

      expect(logger).toHaveBeenCalledWith('[JSONRPCProxy:test] Forwarding message', expect.any(Object));
      proxy.close();
    });

    it('should use console.log when debug is true', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const proxy = new JSONRPCProxy(transport, {
        debug: true,
      });

      await proxy.forward({
        jsonrpc: '2.0' as const,
        method: 'test',
      });

      expect(consoleSpy).toHaveBeenCalledWith('[JSONRPCProxy] Forwarding message', expect.any(Object));
      proxy.close();
      consoleSpy.mockRestore();
    });

    it('should not log when debug is false and no logger', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const proxy = new JSONRPCProxy(transport, {
        debug: false,
      });

      await proxy.forward({
        jsonrpc: '2.0' as const,
        method: 'test',
      });

      expect(consoleSpy).not.toHaveBeenCalled();
      proxy.close();
      consoleSpy.mockRestore();
    });
  });

  describe('close', () => {
    it('should reject all pending requests on close', async () => {
      const proxy = new JSONRPCProxy(transport);

      // Start multiple requests
      const promise1 = proxy.forward({
        jsonrpc: '2.0' as const,
        method: 'call1',
        id: 'close-1',
      });
      const promise2 = proxy.forward({
        jsonrpc: '2.0' as const,
        method: 'call2',
        id: 'close-2',
      });

      // Close proxy
      proxy.close();

      // All requests should be rejected
      await expect(promise1).rejects.toThrow(JSONRPCError);
      await expect(promise1).rejects.toThrow('Proxy closed');
      await expect(promise2).rejects.toThrow(JSONRPCError);
    });

    it('should be idempotent', () => {
      const proxy = new JSONRPCProxy(transport);

      // Multiple closes should not throw
      proxy.close();
      proxy.close();
      proxy.close();
    });
  });

  describe('edge cases', () => {
    it('should handle messages without id, method, or event', async () => {
      const proxy = new JSONRPCProxy(transport);

      // Forward a malformed message
      const result = await proxy.forward({
        jsonrpc: '2.0' as const,
        data: 'malformed',
      });

      expect(result).toBeUndefined();
      proxy.close();
    });

    it('should extract method from various message formats', async () => {
      const logger = vi.fn();
      const proxy = new JSONRPCProxy(transport, {
        logger,
      });

      // Valid method
      await proxy.forward({
        jsonrpc: '2.0' as const,
        method: 'test.method',
      });

      expect(logger).toHaveBeenCalledWith(
        '[JSONRPCProxy] Forwarding message',
        expect.objectContaining({ method: 'test.method' }),
      );

      // Invalid method type
      await proxy.forward({
        jsonrpc: '2.0' as const,
        method: 123, // Invalid type
      });

      expect(logger).toHaveBeenCalledWith(
        '[JSONRPCProxy] Forwarding message',
        expect.objectContaining({ method: undefined }),
      );
      proxy.close();
    });

    it('should handle timeout cleanup properly', async () => {
      vi.useFakeTimers();
      const proxy = new JSONRPCProxy(transport, {
        timeoutMs: 1000,
      });

      // Start request
      const promise = proxy.forward({
        jsonrpc: '2.0' as const,
        method: 'test',
        id: 'timeout-test',
      });

      // Send response before timeout
      vi.advanceTimersByTime(500);
      messageHandler?.({
        jsonrpc: '2.0' as const,
        result: 'success',
        id: 'timeout-test',
      });

      const result = await promise;
      expect(result).toEqual({
        jsonrpc: '2.0',
        result: 'success',
        id: 'timeout-test',
      });

      // Advance past original timeout - should not cause issues
      vi.advanceTimersByTime(1000);

      proxy.close();
      vi.useRealTimers();
    });
  });
});
