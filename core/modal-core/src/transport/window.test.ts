/**
 * @packageDocumentation
 * Tests for window-based transport implementation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { WindowTransport } from './window.js';
import { MessageType, TransportError, TransportErrorCode } from './types.js';
import type { Message, MessageHandler } from './types.js';

interface MockWindow {
  closed: boolean;
  close: MockInstance;
  focus: MockInstance;
  postMessage: MockInstance;
  location: {
    href: string;
  } | null;
}

describe('WindowTransport', () => {
  const mockUrl = 'https://test.walletmesh.com';
  let mockWindow: MockWindow;
  let messageHandler: EventListener;
  let transport: WindowTransport;

  beforeEach(() => {
    mockWindow = {
      closed: false,
      close: vi.fn(),
      focus: vi.fn(),
      postMessage: vi.fn(),
      location: { href: mockUrl },
    };

    vi.spyOn(window, 'addEventListener').mockImplementation(
      (event: string, handler: EventListenerOrEventListenerObject) => {
        if (event === 'message' && typeof handler === 'function') {
          messageHandler = handler;
        }
      }
    );
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});

    window.innerWidth = 1024;
    window.innerHeight = 768;
    window.screenX = 0;
    window.screenY = 0;

    // Setup window.open mock after setting dimensions
    vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window);
  });

  describe('connection management', () => {
    it('should establish connection successfully', async () => {
      transport = new WindowTransport({ url: mockUrl });
      await transport.connect();

      expect(window.open).toHaveBeenCalled();
      expect(window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(transport.isConnected()).toBe(true);
    });

    it('should prevent duplicate connections', async () => {
      transport = new WindowTransport({ url: mockUrl });
      await transport.connect();
      expect(transport.isConnected()).toBe(true);

      await expect(transport.connect()).rejects.toThrow('Transport already connected');
    });

    it('should fail if window cannot be opened', async () => {
      vi.spyOn(window, 'open').mockReturnValue(null);
      transport = new WindowTransport({ url: mockUrl });

      await expect(transport.connect()).rejects.toThrow('Failed to open window');
      expect(transport.isConnected()).toBe(false);
    });

    it('should handle non-transport errors during connect', async () => {
      // Mock window.open to throw a generic error
      const genericError = new Error('Generic error');
      vi.spyOn(window, 'open').mockImplementation(() => {
        throw genericError;
      });

      transport = new WindowTransport({ url: mockUrl });
      const error = await transport.connect().catch(e => e);
      
      expect(error).toBeInstanceOf(TransportError);
      expect(error.message).toBe('Failed to establish connection');
      expect(error.code).toBe(TransportErrorCode.CONNECTION_FAILED);
    });

    it('should handle null window during load', async () => {
      transport = new WindowTransport({ url: mockUrl });
      transport['window'] = null;
      
      const promise = transport['waitForWindowLoad']();
      await expect(promise).rejects.toThrow('No window to wait for');
    });

    it('should handle window load timeout', async () => {
      vi.useFakeTimers();
      transport = new WindowTransport({ url: mockUrl, timeout: 100 });
      
      // Mock location to have undefined href to prevent load
      Object.defineProperty(mockWindow, 'location', {
        get: () => ({ href: undefined }),
        configurable: true
      });

      const connectPromise = transport.connect();
      await vi.advanceTimersByTimeAsync(101);

      await expect(connectPromise).rejects.toThrow('Window load timeout');
      vi.useRealTimers();
    });

    it('should handle window closing during load', async () => {
      vi.useFakeTimers();
      transport = new WindowTransport({ url: mockUrl });
      
      mockWindow.closed = true;
      const connectPromise = transport.connect();
      await vi.advanceTimersByTimeAsync(50);

      await expect(connectPromise).rejects.toThrow('Window closed before loading');
      vi.useRealTimers();
    });

    it('should handle cross-origin errors', async () => {
      vi.useFakeTimers();
      transport = new WindowTransport({ url: mockUrl });

      // Create a DOMException to simulate cross-origin error
      const crossOriginError = new DOMException(
        'Blocked a frame with origin "null" from accessing a cross-origin frame',
        'SecurityError'
      );

      // Mock location to throw on access
      Object.defineProperty(mockWindow, 'location', {
        get() {
          throw crossOriginError;
        },
        configurable: true
      });

      const error = await transport.connect().catch(e => e);
      expect(error).toBeInstanceOf(TransportError);
      expect(error.code).toBe(TransportErrorCode.CONNECTION_FAILED);
      expect(error.message).toContain('Failed to establish connection');
      
      vi.useRealTimers();
    });

    it('should disconnect cleanly', async () => {
      transport = new WindowTransport({ url: mockUrl });
      await transport.connect();
      await transport.disconnect();

      expect(mockWindow.close).toHaveBeenCalled();
      expect(window.removeEventListener).toHaveBeenCalled();
      expect(transport.isConnected()).toBe(false);
    });
  });

  describe('message handling', () => {
    beforeEach(async () => {
      transport = new WindowTransport({ url: mockUrl });
      await transport.connect();
    });

    it('should handle message lifecycle', async () => {
      const message: Message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: 'regular' },
        timestamp: Date.now(),
      };

      const response: Message = {
        id: '1',
        type: MessageType.RESPONSE,
        payload: { result: 'success' },
        timestamp: Date.now(),
      };

      const sendPromise = transport.send(message);

      // Add error throwing handler (should not affect main flow)
      transport.subscribe({
        canHandle: () => true,
        handle: async () => { throw new Error('Handler error'); }
      });

      messageHandler(new MessageEvent('message', {
        origin: mockUrl,
        data: response,
      }));

      const result = await sendPromise;
      expect(mockWindow.postMessage).toHaveBeenCalledWith(message, mockUrl);
      expect(result).toEqual(response);
    });

    it('should handle message timeouts', async () => {
      vi.useFakeTimers();
      await transport.disconnect();

      transport = new WindowTransport({ url: mockUrl, timeout: 100 });
      await transport.connect();

      const message: Message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      const sendPromise = transport.send(message);
      await vi.advanceTimersByTimeAsync(150);
      
      await expect(sendPromise).rejects.toThrow('Message timeout');
      vi.useRealTimers();
    });

    it('should fail when sending message without connection', async () => {
      await transport.disconnect();
      const message: Message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };
      await expect(transport.send(message)).rejects.toThrow('Transport not connected');
    });

    it('should ignore messages from wrong origin', async () => {
      messageHandler(new MessageEvent('message', {
        origin: 'https://wrong.origin.com',
        data: { test: true },
      }));

      expect(mockWindow.postMessage).not.toHaveBeenCalled();
    });

    it('should handle handler cleanup correctly', async () => {
      const handler: MessageHandler = {
        canHandle: () => true,
        handle: async () => {}
      };

      const unsubscribe = transport.subscribe(handler);
      expect(transport['handlers'].size).toBe(1);
      expect(transport['handlers'].has(handler)).toBe(true);

      // Call unsubscribe function
      unsubscribe();
      expect(transport['handlers'].size).toBe(0);
      expect(transport['handlers'].has(handler)).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should use custom window dimensions', async () => {
      const openSpy = vi.spyOn(window, 'open');
      const dimensions = { width: 600, height: 800 };
      transport = new WindowTransport({
        url: mockUrl,
        dimensions,
      });

      await transport.connect();

      const lastCall = openSpy.mock.lastCall;
      expect(lastCall).toBeDefined();
      expect(lastCall?.[2]).toContain('width=600');
      expect(lastCall?.[2]).toContain('height=800');
    });

    it('should calculate window position', async () => {
      window.innerWidth = 1920;
      window.innerHeight = 1080;
      window.screenX = 100;
      window.screenY = 100;

      const openSpy = vi.spyOn(window, 'open');
      const dimensions = { width: 400, height: 600 };
      transport = new WindowTransport({
        url: mockUrl,
        dimensions,
      });

      await transport.connect();

      const lastCall = openSpy.mock.lastCall;
      expect(lastCall).toBeDefined();
      const expectedLeft = Math.floor((1920 - 400) / 2) + 100;
      const expectedTop = Math.floor((1080 - 600) / 2) + 100;

      const features = String(lastCall?.[2] || '');
      expect(features).toContain(`left=${expectedLeft}`);
      expect(features).toContain(`top=${expectedTop}`);
    });
  });

  describe('error handling', () => {
    it('should handle transport errors', async () => {
      transport = new WindowTransport({ url: mockUrl });
      await transport.connect();

      mockWindow.postMessage.mockImplementationOnce(() => {
        throw new TransportError('PostMessage failed', TransportErrorCode.TRANSPORT_ERROR);
      });

      const message: Message = {
        id: '1',
        type: MessageType.REQUEST,
        payload: { test: true },
        timestamp: Date.now(),
      };

      await expect(transport.send(message)).rejects.toThrow(TransportError);
    });

    it('should handle window closing', async () => {
      vi.useFakeTimers();
      transport = new WindowTransport({ url: mockUrl });
      await transport.connect();

      mockWindow.closed = true;
      await vi.advanceTimersByTimeAsync(150);
      expect(transport.isConnected()).toBe(false);
      vi.useRealTimers();
    });
  });

  afterEach(async () => {
    if (transport) {
      await transport.disconnect();
    }
    Object.defineProperty(mockWindow, 'location', {
      value: { href: mockUrl },
      configurable: true
    });
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.resetConfig();
  });
});
