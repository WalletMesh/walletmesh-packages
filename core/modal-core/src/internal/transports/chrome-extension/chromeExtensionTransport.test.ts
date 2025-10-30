/**
 * Tests for ChromeExtensionTransport implementation
 * @vitest-environment happy-dom
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChromeExtensionConfig } from '../../../types.js';
import { MockChromePort } from '../test-helpers/MockChromePort.js';
import { ChromeExtensionTransport } from './chromeExtensionTransport.js';

// Import centralized test utilities
import { createMockErrorHandler, createTestEnvironment } from '../../../testing/index.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import { createDebugLogger } from '../../core/logger/logger.js';

// Default test configuration
const transportTestUtils = {
  config: {
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  runAllTimers: async () => {
    await vi.runAllTimersAsync();
  },
};

// Helper function to create transport with all dependencies
const createTestTransport = (config: ChromeExtensionConfig) => {
  const logger = createDebugLogger('TestTransport', false);
  const errorHandler = createMockErrorHandler();

  // Override handleError to provide specific responses
  errorHandler.handleError = vi.fn().mockImplementation((error, _context) => {
    // Check if this is a MESSAGE_FAILED error
    if (error?.message?.includes('MESSAGE_FAILED') || error?.message?.includes('Failed to send message')) {
      return {
        code: 'message_failed',
        message: 'Failed to send message through transport',
        category: 'network',
        fatal: false,
      };
    }
    // Default to connection error
    return {
      code: 'connection_failed',
      message: 'Failed to connect to transport',
      category: 'network',
      fatal: false,
    };
  });

  const transport = new ChromeExtensionTransport(config, logger, errorHandler);

  return transport;
};

// Mock Chrome API
const mockChrome = {
  runtime: {
    id: 'mock-extension-id',
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    lastError: null,
    shouldFail: false,
    lastPort: null as MockChromePort | null,
    connect: vi.fn((_extensionId?: string) => {
      // Check if we should fail
      if (mockChrome.runtime.shouldFail) {
        throw ErrorFactory.transportError('Failed to connect to extension');
      }

      // Create and store a new MockChromePort
      const port = new MockChromePort();
      mockChrome.runtime.lastPort = port;
      return port;
    }),
  },
};

// Install/uninstall helpers
const installMockChrome = () => {
  Object.assign(global, { chrome: mockChrome });
  // Also set on window for jsdom environment
  if (typeof window !== 'undefined') {
    Object.assign(window, { chrome: mockChrome });
  }
};

const uninstallMockChrome = () => {
  Object.assign(global, { chrome: undefined });
  // Also clear from window for jsdom environment
  if (typeof window !== 'undefined') {
    Object.assign(window, { chrome: undefined });
  }
};

// Create test environment
const testEnv = createTestEnvironment({
  mockErrors: false,
  suppressRejections: ['connection_failed', 'message_failed'],
  browserEnvironment: true,
});

describe('ChromeExtensionTransport', () => {
  let originalQueueMicrotask: typeof queueMicrotask;

  beforeEach(() => {
    testEnv.setup();

    // Mock queueMicrotask to execute immediately
    originalQueueMicrotask = global.queueMicrotask;
    global.queueMicrotask = ((callback: VoidFunction) => {
      // Execute immediately in tests
      callback();
    }) as typeof queueMicrotask;

    // Install the mock Chrome API
    installMockChrome();

    // Reset the mock state
    mockChrome.runtime.shouldFail = false;
    mockChrome.runtime.lastPort = null;

    // Reset the mock implementation to default
    mockChrome.runtime.connect = vi.fn((_extensionId?: string) => {
      // Check if we should fail
      if (mockChrome.runtime.shouldFail) {
        throw ErrorFactory.transportError('Failed to connect to extension');
      }

      // Create and store a new MockChromePort
      const port = new MockChromePort();
      mockChrome.runtime.lastPort = port;
      return port;
    });
  });

  afterEach(async () => {
    // Restore original queueMicrotask
    global.queueMicrotask = originalQueueMicrotask;

    // Uninstall the mock Chrome API
    uninstallMockChrome();

    await testEnv.teardown();
  });

  it('should create a ChromeExtensionTransport with correct configuration', () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      timeout: 5000,
      retries: 3,
      retryDelay: 1000,
    });

    expect(transport).toBeInstanceOf(ChromeExtensionTransport);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private config for testing
    expect((transport as any).config.extensionId).toBe('test-extension-id');
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private config for testing
    expect((transport as any).config.timeout).toBe(5000);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private config for testing
    expect((transport as any).config.retries).toBe(3);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private config for testing
    expect((transport as any).config.retryDelay).toBe(1000);
  });

  it('should use default values when not provided', () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
    });

    // biome-ignore lint/suspicious/noExplicitAny: Accessing private config for testing
    expect((transport as any).config.timeout).toBe(30000);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private config for testing
    expect((transport as any).config.retries).toBe(3);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private config for testing
    expect((transport as any).config.retryDelay).toBe(1000);
  });

  it('should connect successfully to Chrome extension', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Start connection
    const connectPromise = transport.connect();

    // Send wallet_ready to complete connection
    const mockPort = mockChrome.runtime.lastPort as MockChromePort;
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).connected).toBe(true);
    expect(mockChrome.runtime.lastPort).not.toBeNull();
  });

  it('should emit connected event when connection is established', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // biome-ignore lint/suspicious/noExplicitAny: Spying on private method for testing
    const emitSpy = vi.spyOn(transport as any, 'emit');

    // Start connection
    const connectPromise = transport.connect();

    // Send wallet_ready to complete connection
    const mockPort = mockChrome.runtime.lastPort as MockChromePort;
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'connected',
    });
  });

  it('should throw error when Chrome runtime is not available', async () => {
    uninstallMockChrome();

    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Add error handler to prevent unhandled rejection
    const errorHandler = vi.fn();
    transport.on('error', errorHandler);

    const connectPromise = transport.connect();

    // Advance timers to handle AbstractTransport's hardcoded 1000ms retry delays (3 retries)
    await vi.advanceTimersByTimeAsync(4000);

    await expect(connectPromise).rejects.toThrow('Failed to connect to transport');

    // Verify error was also emitted as event
    expect(errorHandler).toHaveBeenCalled();
  }, 10000);

  it('should handle connection failures and retry', async () => {
    // Create a transport with retry configuration
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Make first attempt fail, second succeed
    let attemptCount = 0;
    mockChrome.runtime.connect = vi.fn((_extensionId?: string) => {
      attemptCount++;
      if (attemptCount <= 4) {
        // AbstractTransport retries 3 times, then ChromeExtension retries once
        throw ErrorFactory.transportError('Failed to connect to extension');
      }
      const port = new MockChromePort();
      mockChrome.runtime.lastPort = port;
      return port;
    });

    // Connect - will succeed after retries
    const connectPromise = transport.connect();

    // Advance through AbstractTransport's retry attempts (3 retries * 1000ms each)
    await vi.advanceTimersByTimeAsync(5000);

    // After retries succeed and port is created, send wallet_ready to complete connection
    const mockPort = mockChrome.runtime.lastPort as MockChromePort;
    mockPort.simulateMessage({ type: 'wallet_ready' });

    await connectPromise;

    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).connected).toBe(true);
    expect(attemptCount).toBeGreaterThan(4);
  }, 10000);

  it('should throw error after all retry attempts fail', async () => {
    // All connection attempts will fail
    mockChrome.runtime.shouldFail = true;

    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Add error handler to prevent unhandled rejection
    const errorHandler = vi.fn();
    transport.on('error', errorHandler);

    // biome-ignore lint/suspicious/noExplicitAny: Spying on private method for testing
    const emitSpy = vi.spyOn(transport as any, 'emit');

    const connectPromise = transport.connect();

    // Advance through all retry attempts
    await transportTestUtils.runAllTimers();

    await expect(connectPromise).rejects.toThrow('Failed to connect to transport');

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'error',
      error: expect.objectContaining({
        code: expect.any(String),
        message: expect.any(String),
        category: 'network',
      }),
    });
  });

  it('should handle connection timeouts', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      timeout: transportTestUtils.config.timeout,
      retries: 1,
    });

    // Add error handler to prevent unhandled rejection
    const errorHandler = vi.fn();
    transport.on('error', errorHandler);

    // Mock the connect to never resolve
    mockChrome.runtime.connect = vi.fn().mockImplementation(() => {
      // This will cause the connection to timeout
      return new Promise(() => {
        // Never resolve
      });
    });

    const connectPromise = transport.connect();

    // Advance past timeout and AbstractTransport retries
    await vi.advanceTimersByTimeAsync(5000);

    await expect(connectPromise).rejects.toThrow('Failed to connect to transport');
  }, 10000);

  it('should send messages through the Chrome port', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Start connection
    const connectPromise = transport.connect();

    // Simulate wallet_ready to complete the connection
    const mockPort = mockChrome.runtime.lastPort as MockChromePort;
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    const postMessageSpy = vi.spyOn(mockPort, 'postMessage');

    const testData = { message: 'hello' };
    // After wallet_ready, messages should be sent immediately
    await transport.send(testData);
    expect(postMessageSpy).toHaveBeenCalledWith(testData);
  });

  it('should handle incoming messages from Chrome extension', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // biome-ignore lint/suspicious/noExplicitAny: Spying on private method for testing
    const emitSpy = vi.spyOn(transport as any, 'emit');

    // Start connection
    const connectPromise = transport.connect();

    const mockPort = mockChrome.runtime.lastPort as MockChromePort;

    // Send wallet_ready to complete connection
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    // Reset the spy to clear any previous events
    emitSpy.mockReset();

    const testMessage = { type: 'test', data: 'message' };

    // Simulate receiving a message
    if (mockPort.simulateMessage) {
      mockPort.simulateMessage(testMessage);
    }

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'message',
      data: testMessage,
    });
  });

  it('should disconnect from Chrome extension', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Start connection
    const connectPromise = transport.connect();

    const mockPort = mockChrome.runtime.lastPort as MockChromePort;

    // Send wallet_ready to complete connection
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    const disconnectSpy = vi.spyOn(mockPort, 'disconnect');

    await transport.disconnect();

    expect(disconnectSpy).toHaveBeenCalled();
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).connected).toBe(false);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).port).toBeNull();
  });

  it('should emit disconnected event when disconnecting', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Start connection
    const connectPromise = transport.connect();

    const mockPort = mockChrome.runtime.lastPort as MockChromePort;

    // Send wallet_ready to complete connection
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    // biome-ignore lint/suspicious/noExplicitAny: Spying on private method for testing
    const emitSpy = vi.spyOn(transport as any, 'emit');

    // Reset the spy to clear any previous events
    emitSpy.mockReset();

    await transport.disconnect();

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'disconnected',
      reason: 'Disconnected by user',
    });
  });

  it('should handle remote disconnection', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Start connection
    const connectPromise = transport.connect();

    const mockPort = mockChrome.runtime.lastPort as MockChromePort;

    // Send wallet_ready to complete connection
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    // biome-ignore lint/suspicious/noExplicitAny: Spying on private method for testing
    const emitSpy = vi.spyOn(transport as any, 'emit');

    // Reset the spy to clear any previous events
    emitSpy.mockReset();

    // Simulate disconnection from the extension side
    if (mockPort.simulateDisconnect) {
      mockPort.simulateDisconnect();
    }

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'disconnected',
      reason: 'Connection closed by extension',
    });
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).connected).toBe(false);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).port).toBeNull();
  });

  it('should throw error when sending without connection', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Don't connect
    const sendPromise = transport.send({ test: 'data' });

    // Advance timers for retries and readiness timeout flush
    await transportTestUtils.runAllTimers();

    await expect(sendPromise).rejects.toThrow('Failed to send message through transport');
  });

  it('should handle errors when sending messages', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Start connection
    const connectPromise = transport.connect();

    const mockPort = mockChrome.runtime.lastPort as MockChromePort;

    // Send wallet_ready to complete connection
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    // Force an error when posting a message
    vi.spyOn(mockPort, 'postMessage').mockImplementation(() => {
      throw ErrorFactory.messageFailed('Failed to send message');
    });

    // biome-ignore lint/suspicious/noExplicitAny: Spying on private method for testing
    const emitSpy = vi.spyOn(transport as any, 'emit');

    // Reset the spy to clear any previous events
    emitSpy.mockReset();

    const sendPromise = transport.send({ test: 'data' });

    // No retries needed since throw is synchronous; still advance timers to flush microtasks
    await transportTestUtils.runAllTimers();

    await expect(sendPromise).rejects.toThrow('Failed to send message through transport');

    expect(emitSpy).toHaveBeenCalledWith({
      type: 'error',
      error: expect.objectContaining({
        code: expect.any(String),
        message: expect.any(String),
        category: 'network',
      }),
    });
  });

  it('should fail connection when wallet_ready is not received within timeout', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      timeout: 200, // short timeout to trigger readiness timeout quickly
      retries: 1,
      retryDelay: 50,
    });

    // Start connection (don't await yet)
    const connectPromise = transport.connect();

    // Run all timers to trigger the wallet_ready timeout
    await vi.runAllTimersAsync();

    // Connection should fail - AbstractTransport wraps the error
    await expect(connectPromise).rejects.toMatchObject({
      message: 'Failed to connect to transport',
      category: 'network',
    });
  });

  it('should handle timeout when connection is already timed out during microtask', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      timeout: 100, // Short timeout for fake timers
      retries: 1,
    });

    // Mock the connect to delay longer than timeout
    const originalConnect = mockChrome.runtime.connect;
    mockChrome.runtime.connect = vi.fn().mockImplementation(() => {
      // Delay to trigger timeout
      return new Promise((resolve) => {
        setTimeout(() => {
          const port = new MockChromePort();
          mockChrome.runtime.lastPort = port;
          resolve(port);
        }, 200); // Delay longer than timeout
      });
    });

    try {
      const connectPromise = transport.connect();

      // Advance past timeout and AbstractTransport retries
      await vi.advanceTimersByTimeAsync(5000);

      await expect(connectPromise).rejects.toThrow('Failed to connect to transport');
    } finally {
      // Restore original mock
      mockChrome.runtime.connect = originalConnect;
    }
  }, 10000);

  it('should handle disconnect errors gracefully', async () => {
    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    // Start connection
    const connectPromise = transport.connect();

    const mockPort = mockChrome.runtime.lastPort as MockChromePort;

    // Send wallet_ready to complete connection
    mockPort.simulateMessage({ type: 'wallet_ready' });

    // Wait for connection to complete
    await connectPromise;

    // Mock port.disconnect to throw an error
    vi.spyOn(mockPort, 'disconnect').mockImplementation(() => {
      throw ErrorFactory.transportDisconnected('Failed to disconnect port');
    });

    // Disconnect should not throw despite port.disconnect throwing
    await expect(transport.disconnect()).resolves.not.toThrow();

    // Should still be disconnected
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).connected).toBe(false);
    // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
    expect((transport as any).port).toBeNull();
  });

  it('should handle missing chrome runtime connect method', async () => {
    // Override chrome.runtime to not have connect method
    const originalConnect = mockChrome.runtime.connect;
    // biome-ignore lint/suspicious/noExplicitAny: Need to simulate missing chrome.runtime.connect method for testing
    mockChrome.runtime.connect = undefined as any;

    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    const connectPromise = transport.connect();

    // Advance timers for retries
    await transportTestUtils.runAllTimers();

    await expect(connectPromise).rejects.toThrow('Failed to connect to transport');

    // Restore
    mockChrome.runtime.connect = originalConnect;
  });

  it('should handle failed port creation', async () => {
    // Mock chrome.runtime.connect to return null (failed port creation)
    mockChrome.runtime.connect = vi.fn().mockReturnValue(null);

    const transport = createTestTransport({
      extensionId: 'test-extension-id',
      ...transportTestUtils.config,
    });

    const connectPromise = transport.connect();

    // Advance timers for retries
    await transportTestUtils.runAllTimers();

    await expect(connectPromise).rejects.toThrow('Failed to connect to transport');
  });
});
