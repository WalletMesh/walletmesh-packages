import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChromeExtensionTransport } from '../ChromeExtensionTransport.js';
import type { ChromeMessage, ChromePort, ChromeRuntime } from '../types.js';
import { ChromeMessageType, createMessageId } from '../types.js';
import { TransportError } from '../../types.js';

describe('ChromeExtensionTransport', () => {
  const mockConfig = {
    extensionId: 'test-extension-id',
    timeout: 100,
    reconnectAttempts: 2,
    reconnectDelay: 50,
    autoReconnect: true,
  };

  let transport: ChromeExtensionTransport;
  let mockPort: ChromePort;
  let messageHandlers: Array<(message: ChromeMessage) => void>;
  let disconnectHandlers: Array<() => void>;
  let originalChrome: typeof window.chrome | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    messageHandlers = [];
    disconnectHandlers = [];

    // Store original chrome object
    originalChrome = window.chrome;

    // Create mock port
    mockPort = {
      name: 'test-port',
      disconnect: vi.fn(),
      onMessage: {
        addListener: vi.fn((handler) => messageHandlers.push(handler)),
        removeListener: vi.fn(),
      },
      onDisconnect: {
        addListener: vi.fn((handler) => disconnectHandlers.push(handler)),
        removeListener: vi.fn(),
      },
      postMessage: vi.fn(),
    };

    // Mock chrome.runtime
    const mockRuntime: ChromeRuntime = {
      connect: vi.fn(() => mockPort),
      lastError: undefined,
    };

    Object.defineProperty(window, 'chrome', {
      value: { runtime: mockRuntime },
      configurable: true,
    });

    transport = new ChromeExtensionTransport(mockConfig);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
    vi.useRealTimers();

    // Restore original chrome object
    Object.defineProperty(window, 'chrome', {
      value: originalChrome,
      configurable: true,
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await transport.connect();
      expect(window.chrome?.runtime.connect).toHaveBeenCalledWith(mockConfig.extensionId, {
        name: undefined,
      });
      expect(transport.isConnected()).toBe(true);
    });

    it('should throw if Chrome runtime is not available', async () => {
      Object.defineProperty(window, 'chrome', {
        value: undefined,
        configurable: true,
      });
      await expect(transport.connect()).rejects.toThrow(TransportError);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      const mockRuntime: Partial<ChromeRuntime> = {
        connect: vi.fn(() => {
          throw error;
        }),
        lastError: undefined,
      };
      Object.defineProperty(window, 'chrome', {
        value: { runtime: mockRuntime as ChromeRuntime },
        configurable: true,
      });
      await expect(transport.connect()).rejects.toThrow(TransportError);
      expect(transport.isConnected()).toBe(false);
    });
  });

  describe('disconnect', () => {
    it('should disconnect successfully', async () => {
      await transport.connect();
      await transport.disconnect();
      expect(mockPort.disconnect).toHaveBeenCalled();
      expect(transport.isConnected()).toBe(false);
    });

    it('should handle disconnect errors gracefully', async () => {
      await transport.connect();
      mockPort.disconnect = vi.fn(() => {
        throw new Error('Disconnect failed');
      });
      await transport.disconnect();
      expect(transport.isConnected()).toBe(false);
    });
  });

  describe('message handling', () => {
    it('should send messages correctly', async () => {
      await transport.connect();
      const testData = { test: 'data' };
      await transport.send(testData);

      expect(mockPort.postMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ChromeMessageType.REQUEST,
          payload: testData,
        }),
      );
    });

    it('should handle message handler registration', async () => {
      const handler = vi.fn();
      transport.onMessage(handler);

      await transport.connect();
      const testMessage: ChromeMessage = {
        type: ChromeMessageType.RESPONSE,
        payload: { test: 'data' },
        timestamp: Date.now(),
        id: createMessageId(),
      };

      if (messageHandlers[0]) {
        messageHandlers[0](testMessage);
        expect(handler).toHaveBeenCalledWith(testMessage);
      }
    });

    it('should handle invalid messages', async () => {
      const handler = vi.fn();
      transport.onMessage(handler);
      await transport.connect();

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const invalidMessage = {
        timestamp: Date.now(),
        type: 'INVALID' as ChromeMessageType,
        id: createMessageId(),
      };

      if (messageHandlers[0]) {
        messageHandlers[0](invalidMessage);
        expect(handler).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });
  });

  describe('reconnection', () => {
    it('should attempt reconnection on disconnect', async () => {
      let attempts = 0;

      // Setup connect mock to track attempts
      if (window.chrome?.runtime) {
        window.chrome.runtime.connect = vi.fn(() => {
          attempts++;
          return mockPort;
        });
      }

      await transport.connect();

      if (disconnectHandlers[0]) {
        disconnectHandlers[0]();
      }

      // Advance timers by reconnection delay plus buffer
      vi.advanceTimersByTime(mockConfig.reconnectDelay);
      await vi.runAllTimersAsync();

      expect(attempts).toBeGreaterThanOrEqual(1);
    });

    it('should notify handlers after max reconnection attempts', async () => {
      const handler = vi.fn();
      transport.onMessage(handler);
      await transport.connect();

      // Setup failing reconnection
      if (window.chrome?.runtime) {
        window.chrome.runtime.connect = vi.fn(() => {
          throw new Error('Connection failed');
        });
      }

      if (disconnectHandlers[0]) {
        disconnectHandlers[0]();
      }

      // Run initial disconnect handlers
      await vi.runAllTimersAsync();

      // Advance past each reconnection attempt
      for (let i = 0; i < mockConfig.reconnectAttempts; i++) {
        vi.advanceTimersByTime(mockConfig.reconnectDelay);
        await vi.runAllTimersAsync();
      }

      // Give time for the final error handler
      vi.advanceTimersByTime(mockConfig.reconnectDelay);
      await vi.runAllTimersAsync();

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ChromeMessageType.ERROR,
          error: expect.objectContaining({
            code: 'RECONNECT_FAILED',
          }),
        }),
      );
    });
  });
});
