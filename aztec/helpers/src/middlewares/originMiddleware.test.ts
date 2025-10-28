import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createOriginMiddleware } from './originMiddleware.js';
import type { RouterContext, RouterMethodMap } from '@walletmesh/router';
import type { JSONRPCRequest } from '@walletmesh/jsonrpc';

describe('originMiddleware', () => {
  let mockContext: RouterContext;
  let mockRequest: JSONRPCRequest<RouterMethodMap, 'wm_connect'>;
  let mockNext: ReturnType<typeof vi.fn>;

  // Store original window properties
  const originalLocation = global.window?.location;
  const originalDocument = global.document;
  const originalWindow = global.window;

  beforeEach(() => {
    mockContext = {} as RouterContext;
    mockRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'wm_connect',
      params: [],
    };
    mockNext = vi.fn().mockResolvedValue({ result: 'success' });
  });

  afterEach(() => {
    // Restore original properties
    if (originalWindow) {
      global.window = originalWindow;
    }
    if (originalDocument) {
      global.document = originalDocument;
    }
    vi.clearAllMocks();
  });

  describe('createOriginMiddleware', () => {
    it('should create middleware that sets origin from provided dappOrigin', async () => {
      const middleware = createOriginMiddleware('https://example.com');

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('https://example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should create middleware that uses empty string if provided', async () => {
      const middleware = createOriginMiddleware('');

      await middleware(mockContext, mockRequest, mockNext);

      // Empty string is still a valid origin value
      expect(mockContext.origin).toBe('');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should detect origin from document.referrer when no dappOrigin provided', async () => {
      // Mock document.referrer
      Object.defineProperty(global, 'document', {
        value: {
          referrer: 'https://dapp.example.com/page',
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('https://dapp.example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should detect origin from window.opener when document.referrer not available', async () => {
      // Mock window.opener
      Object.defineProperty(global, 'window', {
        value: {
          opener: {
            location: {
              origin: 'https://opener.example.com',
            },
          },
          location: {
            origin: 'https://wallet.example.com',
          },
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'document', {
        value: {
          referrer: '',
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('https://opener.example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should detect origin from window.parent when in iframe and no referrer/opener', async () => {
      // Mock window.parent (iframe scenario)
      const mockParent = {
        location: {
          origin: 'https://parent.example.com',
        },
      };

      const mockWindow = {
        parent: mockParent,
        location: {
          origin: 'https://wallet.example.com',
        },
      };

      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'document', {
        value: {
          referrer: '',
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('https://parent.example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should fallback to window.location.origin when no other method works', async () => {
      // Mock only window.location
      Object.defineProperty(global, 'window', {
        value: {
          location: {
            origin: 'https://wallet.example.com',
          },
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'document', {
        value: {
          referrer: '',
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('https://wallet.example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should fallback to "unknown" when no origin can be determined', async () => {
      // Mock empty environment
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'document', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('unknown');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should handle invalid URL in document.referrer gracefully', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      Object.defineProperty(global, 'document', {
        value: {
          referrer: 'not-a-valid-url',
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'window', {
        value: {
          location: {
            origin: 'https://wallet.example.com',
          },
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      // Should fallback to window.location.origin
      expect(mockContext.origin).toBe('https://wallet.example.com');
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to parse document.referrer:', expect.any(Error));
      expect(mockNext).toHaveBeenCalledOnce();

      consoleWarnSpy.mockRestore();
    });

    it('should handle CORS errors when accessing window.opener gracefully', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Mock window.opener that throws CORS error
      const mockOpener = {};
      Object.defineProperty(mockOpener, 'location', {
        get() {
          throw new Error('SecurityError: Blocked a frame with origin from accessing a cross-origin frame');
        },
      });

      Object.defineProperty(global, 'window', {
        value: {
          opener: mockOpener,
          location: {
            origin: 'https://wallet.example.com',
          },
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'document', {
        value: {
          referrer: '',
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      // Should fallback to window.location.origin
      expect(mockContext.origin).toBe('https://wallet.example.com');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Cross-origin context detected, window.opener access blocked by CORS',
      );
      expect(mockNext).toHaveBeenCalledOnce();

      consoleLogSpy.mockRestore();
    });

    it('should handle window.parent === window (not in iframe) correctly', async () => {
      const mockWindow = {
        location: {
          origin: 'https://wallet.example.com',
        },
      };

      // window.parent === window means not in iframe
      (mockWindow as any).parent = mockWindow;

      Object.defineProperty(global, 'window', {
        value: mockWindow,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'document', {
        value: {
          referrer: '',
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      // Should use window.location.origin since window.parent check is skipped
      expect(mockContext.origin).toBe('https://wallet.example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });

  describe('middleware execution', () => {
    it('should call next() and return its result', async () => {
      const expectedResult = { data: 'test-data', status: 'ok' };
      mockNext.mockResolvedValue(expectedResult);

      const middleware = createOriginMiddleware('https://example.com');

      const result = await middleware(mockContext, mockRequest, mockNext);

      expect(result).toEqual(expectedResult);
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should propagate errors from next()', async () => {
      const error = new Error('Downstream middleware failed');
      mockNext.mockRejectedValue(error);

      const middleware = createOriginMiddleware('https://example.com');

      await expect(middleware(mockContext, mockRequest, mockNext)).rejects.toThrow('Downstream middleware failed');
    });

    it('should set context.origin before calling next()', async () => {
      let contextOriginDuringNext: string | undefined;

      mockNext.mockImplementation(async () => {
        contextOriginDuringNext = mockContext.origin;
        return { result: 'success' };
      });

      const middleware = createOriginMiddleware('https://example.com');

      await middleware(mockContext, mockRequest, mockNext);

      // Verify origin was set BEFORE next() was called
      expect(contextOriginDuringNext).toBe('https://example.com');
      expect(mockContext.origin).toBe('https://example.com');
    });

    it('should work with different request types', async () => {
      const middleware = createOriginMiddleware('https://example.com');

      const requests: Array<JSONRPCRequest<RouterMethodMap, any>> = [
        { jsonrpc: '2.0', id: 1, method: 'wm_connect', params: [] },
        { jsonrpc: '2.0', id: 2, method: 'wm_call', params: [{ call: { method: 'test', params: [] } }] },
        { jsonrpc: '2.0', id: 3, method: 'wm_disconnect', params: [] },
      ];

      for (const request of requests) {
        mockContext = {} as RouterContext;
        await middleware(mockContext, request, mockNext);
        expect(mockContext.origin).toBe('https://example.com');
      }

      expect(mockNext).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple sequential calls with same middleware instance', async () => {
      const middleware = createOriginMiddleware('https://example.com');

      // First call
      const context1 = {} as RouterContext;
      await middleware(context1, mockRequest, mockNext);
      expect(context1.origin).toBe('https://example.com');

      // Second call
      const context2 = {} as RouterContext;
      await middleware(context2, mockRequest, mockNext);
      expect(context2.origin).toBe('https://example.com');

      // Third call
      const context3 = {} as RouterContext;
      await middleware(context3, mockRequest, mockNext);
      expect(context3.origin).toBe('https://example.com');

      expect(mockNext).toHaveBeenCalledTimes(3);
    });
  });

  describe('origin precedence', () => {
    it('should prefer provided dappOrigin over detected origin', async () => {
      // Set up all detection methods
      Object.defineProperty(global, 'document', {
        value: {
          referrer: 'https://referrer.example.com/page',
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'window', {
        value: {
          opener: {
            location: {
              origin: 'https://opener.example.com',
            },
          },
          location: {
            origin: 'https://wallet.example.com',
          },
        },
        writable: true,
        configurable: true,
      });

      // Provided origin should take precedence
      const middleware = createOriginMiddleware('https://provided.example.com');

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('https://provided.example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it('should prefer document.referrer over window.opener', async () => {
      Object.defineProperty(global, 'document', {
        value: {
          referrer: 'https://referrer.example.com/page',
        },
        writable: true,
        configurable: true,
      });

      Object.defineProperty(global, 'window', {
        value: {
          opener: {
            location: {
              origin: 'https://opener.example.com',
            },
          },
          location: {
            origin: 'https://wallet.example.com',
          },
        },
        writable: true,
        configurable: true,
      });

      const middleware = createOriginMiddleware();

      await middleware(mockContext, mockRequest, mockNext);

      expect(mockContext.origin).toBe('https://referrer.example.com');
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });
});
