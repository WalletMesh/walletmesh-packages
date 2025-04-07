import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';
import { ChromeExtensionTransport } from './index.js';
import { TransportError, TransportErrorCode } from '../types.js';
import type { ChromeExtensionTransportConfig } from './types.js';

describe('ChromeExtensionTransport', () => {
  const originalWindow = global.window;
  let transport: ChromeExtensionTransport;
  let mockPort: {
    onMessage: {
      addListener: Mock;
      removeListener: Mock;
    };
    onDisconnect: {
      addListener: Mock;
      removeListener: Mock;
    };
    postMessage: Mock;
    disconnect: Mock;
  };
  let mockConnect: Mock;

  const defaultConfig: Required<ChromeExtensionTransportConfig> = {
    extensionId: 'test-extension-id',
    timeout: 1000,
    retries: 2,
    retryDelay: 100,
  };

  beforeEach(() => {
    // Reset mocks
    vi.restoreAllMocks();

    // Mock Chrome runtime API
    mockPort = {
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      onDisconnect: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      postMessage: vi.fn(),
      disconnect: vi.fn(),
    };

    mockConnect = vi.fn().mockReturnValue(mockPort);

    const mockRuntime = {
      connect: mockConnect,
      id: 'test-id',
      lastError: null,
      onConnect: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    };

    // Mock the global window object
    Object.defineProperty(global, 'window', {
      value: {
        chrome: {
          runtime: mockRuntime,
          tabs: {},
        },
      },
      writable: true,
    });

    transport = new ChromeExtensionTransport(defaultConfig);
  });

  afterEach(async () => {
    if (transport.isConnected) {
      await transport.disconnect();
    }
    vi.useRealTimers();
    vi.restoreAllMocks();

    // Restore original window
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
    });
  });

  describe('initialization', () => {
    it('should initialize successfully when Chrome runtime is available', async () => {
      await expect(transport.initialize()).resolves.toBeUndefined();
    });

    it('should fail initialization when Chrome runtime is not available', async () => {
      // Reset window.chrome
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });

      await expect(transport.initialize()).rejects.toThrow(
        new TransportError(TransportErrorCode.INITIALIZATION_FAILED, 'Chrome runtime API not available'),
      );
    });
  });

  describe('connection', () => {
    beforeEach(async () => {
      await transport.initialize();
    });

    it('should connect successfully', async () => {
      await transport.connect();

      expect(mockConnect).toHaveBeenCalledWith(defaultConfig.extensionId);
      expect(transport.isConnected).toBe(true);
    });

    it('should fail connection when port creation fails', async () => {
      mockConnect.mockReturnValue(null);
      vi.useFakeTimers();

      const connectAttempt = async () => {
        try {
          await transport.connect();
          // If connect succeeds unexpectedly, fail the test
          throw new Error('Test failed: Connection succeeded unexpectedly');
        } catch (err) {
          // Expected error, return it for assertion
          return err;
        }
      };

      const connectPromise = connectAttempt();

      // Fast-forward through all retries
      for (let i = 0; i <= defaultConfig.retries; i++) {
        await vi.advanceTimersByTimeAsync(defaultConfig.retryDelay);
      }

      const error = await connectPromise;
      expect(error).toBeDefined();
      expect(error).toMatchObject({
        code: TransportErrorCode.CONNECTION_FAILED,
        message: 'Max reconnection attempts reached',
      });
      expect(transport.isConnected).toBe(false);
    });

    it('should retry connection on failure', async () => {
      vi.useFakeTimers();
      let retryCount = 0;

      // Fail first attempt, succeed on retry
      mockConnect.mockImplementation(() => {
        retryCount++;
        if (retryCount === 1) {
          throw new Error('Connection failed');
        }
        return mockPort;
      });

      const connectPromise = transport.connect();

      // Fast-forward through retry delay
      await vi.runAllTimersAsync();

      await connectPromise;

      expect(mockConnect).toHaveBeenCalledTimes(2);
      expect(retryCount).toBe(2);
      expect(transport.isConnected).toBe(true);
    });

    it('should timeout if connection takes too long', async () => {
      // Setup mocks before enabling fake timers
      mockConnect.mockImplementation(() => ({
        onMessage: {
          addListener: vi.fn(),
        },
        onDisconnect: {
          addListener: vi.fn(),
        },
        disconnect: vi.fn(),
      }));

      // Prevent connection completion
      vi.spyOn(global, 'queueMicrotask').mockImplementation(() => {});

      // Enable fake timers after setup
      vi.useFakeTimers();

      // Start connection attempt with error handling
      const connectAttempt = async () => {
        try {
          await transport.connect();
          // If connect succeeds unexpectedly, fail the test
          throw new Error('Test failed: Connection succeeded unexpectedly');
        } catch (err) {
          // Expected timeout error, return it for assertion
          return err;
        }
      };

      const connectPromise = connectAttempt();
      await vi.advanceTimersByTimeAsync(defaultConfig.timeout);

      const error = await connectPromise;
      expect(error).toBeDefined();
      expect(error).toMatchObject({
        code: TransportErrorCode.TIMEOUT,
        message: 'Connection attempt 1 timed out',
      });
    });

    it('should throw if attempting to connect when already connected', async () => {
      await transport.connect();

      await expect(transport.connect()).rejects.toThrow(
        new TransportError(TransportErrorCode.INVALID_STATE, 'Transport is already connected'),
      );
    });
  });

  describe('disconnection', () => {
    beforeEach(async () => {
      await transport.initialize();
      await transport.connect();
    });

    it('should disconnect successfully', async () => {
      await transport.disconnect();

      expect(mockPort.disconnect).toHaveBeenCalled();
      expect(transport.isConnected).toBe(false);
    });

    it('should clean up event listeners on disconnect', async () => {
      await transport.disconnect();

      expect(mockPort.onMessage.removeListener).toHaveBeenCalled();
      expect(mockPort.onDisconnect.removeListener).toHaveBeenCalled();
    });

    it('should handle disconnection errors gracefully', async () => {
      mockPort.disconnect.mockImplementation(() => {
        throw new Error('Disconnect failed');
      });

      // Should not throw
      await transport.disconnect();
      expect(transport.isConnected).toBe(false);
    });
  });

  describe('messaging', () => {
    let messageHandler: unknown;
    let disconnectHandler: unknown;
    beforeEach(async () => {
      await transport.initialize();
      await transport.connect();
    });

    it('should send messages successfully', async () => {
      const message = { type: 'test', data: 'hello' };
      await transport.send(message);

      expect(mockPort.postMessage).toHaveBeenCalledWith(message);
    });

    it('should throw when sending message while not connected', async () => {
      await transport.disconnect();

      await expect(transport.send({ type: 'test' })).rejects.toThrow(
        new TransportError(TransportErrorCode.NOT_CONNECTED, 'Transport is not connected'),
      );
    });

    it('should throw when sending message fails', async () => {
      const sendError = new Error('Send failed');
      mockPort.postMessage.mockImplementation(() => {
        throw sendError;
      });

      await expect(transport.send({ type: 'test' })).rejects.toThrow(
        new TransportError(TransportErrorCode.SEND_FAILED, 'Failed to send message', sendError),
      );
    });

    it('should receive messages through onMessage handler', async () => {
      const message = { type: 'test', data: 'hello' };
      const onMessage = vi.fn();
      transport.onMessage = onMessage;

      const calls = mockPort.onMessage.addListener.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(Array.isArray(calls)).toBe(true);
      const firstCall = calls.at(0);
      expect(firstCall).toBeDefined();
      if (!firstCall) {
        throw new Error('No message handler registered');
      }
      messageHandler = firstCall[0];
      expect(typeof messageHandler).toBe('function');
      (messageHandler as (message: unknown) => void)(message);

      expect(onMessage).toHaveBeenCalledWith(message);
    });

    it('should handle port disconnection', async () => {
      const calls = mockPort.onDisconnect.addListener.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      expect(Array.isArray(calls)).toBe(true);
      const firstCall = calls.at(0);
      expect(firstCall).toBeDefined();
      if (!firstCall) {
        throw new Error('No disconnect handler registered');
      }
      disconnectHandler = firstCall[0];
      expect(typeof disconnectHandler).toBe('function');
      (disconnectHandler as () => void)();

      expect(transport.isConnected).toBe(false);
    });
  });
});
