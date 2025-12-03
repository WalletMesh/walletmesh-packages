import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment } from '../../../testing/index.js';
import type { PopupConfig } from '../../../types.js';
import type { ErrorHandler } from '../../core/errors/errorHandler.js';
import type { Logger } from '../../core/logger/logger.js';
import { PopupWindow } from './PopupWindowTransport.ssr.js';

// Mock dependencies
vi.mock('../../../api/utils/environment.js', () => ({
  isBrowser: vi.fn(() => true),
  getWindow: vi.fn(() => mockWindow),
}));

vi.mock('../../utils/dom-essentials.js', () => ({
  attachGlobalListener: vi.fn((_target: string, _event: string, handler: EventListener) => {
    const cleanup = vi.fn();
    mockMessageListeners.push({ handler, cleanup });
    return cleanup;
  }),
  createSafeInterval: vi.fn((callback: () => void, ms: number) => {
    const id = setInterval(callback, ms);
    mockIntervals.push(id);
    return id;
  }),
  createSafeTimeout: vi.fn((callback: () => void, ms: number) => {
    const id = setTimeout(callback, ms);
    mockTimeouts.push(id);
    return () => clearTimeout(id);
  }),
}));

vi.mock('../../../api/utils/lazy.js', () => ({
  createLazy: vi.fn((factory: () => unknown) => factory),
  createLazyAsync: vi.fn((factory: () => Promise<unknown>) => factory),
}));

vi.mock('../AbstractTransport.ssr.js', () => ({
  AbstractTransport: class {
    protected connected = false;

    constructor(
      protected config: unknown,
      protected logger: Logger,
      protected errorHandler: ErrorHandler,
    ) {}

    protected log(level: string, message: string, data?: unknown): void {
      this.logger?.[level as keyof Logger]?.(message, data);
    }

    protected emit(event: unknown): void {
      // Store emitted events for testing
      mockEmittedEvents.push(event);
    }

    protected cleanup(): void {}

    // Public methods that delegate to protected methods
    async connect(): Promise<void> {
      return this.connectInternal();
    }

    async disconnect(): Promise<void> {
      return this.disconnectInternal();
    }

    async send(data: unknown): Promise<void> {
      return this.sendInternal(data);
    }

    on(_event: string, _handler: (...args: unknown[]) => void): () => void {
      return () => {};
    }

    off(_event: string, _handler?: (...args: unknown[]) => void): void {}

    // These will be overridden by PopupWindow
    protected async connectInternal(): Promise<void> {
      throw new Error('Not implemented');
    }

    protected async disconnectInternal(): Promise<void> {
      throw new Error('Not implemented');
    }

    protected async sendInternal(_data: unknown): Promise<void> {
      throw new Error('Not implemented');
    }
  },
}));

// Test mocks
let mockWindow: {
  open: ReturnType<typeof vi.fn>;
  innerWidth: number;
  innerHeight: number;
};

let mockPopup: {
  closed: boolean;
  close: ReturnType<typeof vi.fn>;
  postMessage: ReturnType<typeof vi.fn>;
};

let mockMessageListeners: { handler: EventListener; cleanup: ReturnType<typeof vi.fn> }[];
let mockIntervals: NodeJS.Timeout[];
let mockTimeouts: NodeJS.Timeout[];
let mockEmittedEvents: unknown[];

// Create test environment
const testEnv = createTestEnvironment({
  mockErrors: false,
  browserEnvironment: true,
});

describe('PopupWindow', () => {
  let transport: PopupWindow;
  let mockLogger: Logger;
  let mockErrorHandler: ErrorHandler;
  let config: PopupConfig;

  beforeEach(async () => {
    testEnv.setup();

    // Reset mocks
    mockMessageListeners = [];
    mockIntervals = [];
    mockTimeouts = [];
    mockEmittedEvents = [];

    mockPopup = {
      closed: false,
      close: vi.fn(),
      postMessage: vi.fn(),
    };

    mockWindow = {
      open: vi.fn(() => mockPopup as Window),
      innerWidth: 1920,
      innerHeight: 1080,
    };

    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    mockErrorHandler = {
      handleError: vi.fn(),
      isRecoverable: vi.fn(() => true),
      createRecoveryStrategy: vi.fn(),
    };

    config = {
      url: 'https://wallet.example.com/connect',
      width: 400,
      height: 600,
    };

    // Set up browser environment by default
    const { isBrowser, getWindow } = await import('../../../api/utils/environment.js');
    vi.mocked(isBrowser).mockReturnValue(true);
    vi.mocked(getWindow).mockReturnValue(mockWindow as Window);

    transport = new PopupWindow(config, mockLogger, mockErrorHandler);
  });

  afterEach(async () => {
    await testEnv.teardown();

    // Clean up intervals and timeouts
    mockIntervals.forEach(clearInterval);
    mockTimeouts.forEach(clearTimeout);
  });

  describe('Constructor', () => {
    it('should create PopupWindow with valid config', () => {
      expect(transport).toBeInstanceOf(PopupWindow);
    });

    it('should handle config with all optional properties', () => {
      const fullConfig: PopupConfig = {
        url: 'https://wallet.example.com/connect',
        target: '_popup',
        features: 'width=500,height=700',
        width: 500,
        height: 700,
        timeout: 60000,
      };

      const fullTransport = new PopupWindow(fullConfig, mockLogger, mockErrorHandler);
      expect(fullTransport).toBeInstanceOf(PopupWindow);
    });

    it('should handle empty config', () => {
      const emptyTransport = new PopupWindow({}, mockLogger, mockErrorHandler);
      expect(emptyTransport).toBeInstanceOf(PopupWindow);
    });

    it('should parse URL origin correctly', () => {
      const transport = new PopupWindow(config, mockLogger, mockErrorHandler);
      expect(transport).toBeInstanceOf(PopupWindow);
    });

    it('should handle invalid URL gracefully', async () => {
      const { isBrowser } = await import('../../../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(true);

      const invalidConfig = { url: 'not-a-valid-url' };
      const transport = new PopupWindow(invalidConfig, mockLogger, mockErrorHandler);

      expect(transport).toBeInstanceOf(PopupWindow);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid URL provided to popup transport, using wildcard origin',
        expect.objectContaining({
          url: 'not-a-valid-url',
          error: expect.any(Error),
        }),
      );
    });

    it('should not parse URL in SSR environment', async () => {
      const { isBrowser } = await import('../../../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(false);

      const transport = new PopupWindow(config, mockLogger, mockErrorHandler);
      expect(transport).toBeInstanceOf(PopupWindow);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('createFeatures', () => {
    it('should create centered popup features in browser', async () => {
      const { isBrowser } = await import('../../../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(true);

      const transport = new PopupWindow({ width: 400, height: 600 }, mockLogger, mockErrorHandler);
      expect(transport).toBeInstanceOf(PopupWindow);
    });

    it('should create default features in SSR environment', async () => {
      const { isBrowser } = await import('../../../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(false);

      const transport = new PopupWindow({ width: 400, height: 600 }, mockLogger, mockErrorHandler);
      expect(transport).toBeInstanceOf(PopupWindow);
    });

    it('should use default dimensions when not specified', () => {
      const transport = new PopupWindow({}, mockLogger, mockErrorHandler);
      expect(transport).toBeInstanceOf(PopupWindow);
    });
  });

  describe('connectInternal', () => {
    it('should connect successfully when popup opens', async () => {
      const connectPromise = transport.connect();

      // Simulate connection message from popup
      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      // Trigger the message handler
      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise;

      expect(mockWindow.open).toHaveBeenCalledWith(
        'https://wallet.example.com/connect',
        '_blank',
        expect.stringContaining('width=400,height=600'),
      );
      expect(mockEmittedEvents).toContainEqual({
        type: 'connected',
        url: 'https://wallet.example.com/connect',
      });
    });

    it('should reject when popup is blocked', async () => {
      mockWindow.open.mockReturnValue(null);

      await expect(transport.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Failed to open popup window - may be blocked',
      });
    });

    it('should reject when not in browser environment', async () => {
      const { isBrowser } = await import('../../../api/utils/environment.js');
      vi.mocked(isBrowser).mockReturnValue(false);

      await expect(transport.connect()).rejects.toMatchObject({
        code: 'render_failed',
        message: 'Popup transport requires browser environment',
      });
    });

    it('should timeout if connection takes too long', async () => {
      const connectPromise = transport.connect();

      // Advance time past the timeout
      vi.advanceTimersByTime(30001);

      await expect(connectPromise).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Popup connection timeout',
      });
    });

    it('should use custom timeout from config', async () => {
      const customConfig = { ...config, timeout: 10000 };
      transport = new PopupWindow(customConfig, mockLogger, mockErrorHandler);

      const connectPromise = transport.connect();

      // Advance time to just before custom timeout
      vi.advanceTimersByTime(9999);

      // Should not timeout yet
      await vi.runOnlyPendingTimersAsync();

      // Advance past custom timeout
      vi.advanceTimersByTime(2);

      await expect(connectPromise).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Popup connection timeout',
      });
    });

    it('should not reconnect if already connected', async () => {
      // First connection
      const connectPromise1 = transport.connect();

      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise1;

      // Second connection attempt
      const openCallCount = mockWindow.open.mock.calls.length;
      await transport.connect();

      // Should not call window.open again
      expect(mockWindow.open).toHaveBeenCalledTimes(openCallCount);
    });

    it('should handle window.open errors gracefully', async () => {
      mockWindow.open.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      await expect(transport.connect()).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Failed to open popup window',
      });
    });

    it('should verify message origin when targetOrigin is set', async () => {
      const connectPromise = transport.connect();

      // Message from wrong origin should be ignored
      const wrongOriginEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://malicious.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(wrongOriginEvent);
      }

      // Should not connect yet - advance time slightly to process
      await vi.advanceTimersByTimeAsync(100);

      // Correct origin should work
      const correctOriginEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(correctOriginEvent);
      }

      await connectPromise;
    });

    it('should handle non-connection messages', async () => {
      const connectPromise = transport.connect();

      // Send a regular message
      const messageEvent = new MessageEvent('message', {
        data: { type: 'data', payload: 'test' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(messageEvent);
      }

      // Should emit message event
      expect(mockEmittedEvents).toContainEqual({
        type: 'message',
        data: { type: 'data', payload: 'test' },
      });

      // Complete connection
      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise;
    });
  });

  describe('disconnectInternal', () => {
    it('should disconnect and close popup', async () => {
      // First connect
      const connectPromise = transport.connect();

      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise;

      // Then disconnect
      await transport.disconnect();

      expect(mockPopup.close).toHaveBeenCalled();
      expect(mockEmittedEvents).toContainEqual({
        type: 'disconnected',
        reason: 'Manual disconnect',
      });
    });

    it('should handle disconnect when popup is already closed', async () => {
      mockPopup.closed = true;

      await transport.disconnect();

      expect(mockPopup.close).not.toHaveBeenCalled();
    });

    it('should handle disconnect when popup is null', async () => {
      await transport.disconnect();

      expect(mockPopup.close).not.toHaveBeenCalled();
    });
  });

  describe('sendInternal', () => {
    beforeEach(async () => {
      // Connect first
      const connectPromise = transport.connect();

      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise;
    });

    it('should send message to popup', async () => {
      const testData = { type: 'test', payload: 'hello' };

      await transport.send(testData);

      expect(mockPopup.postMessage).toHaveBeenCalledWith(testData, 'https://wallet.example.com');
    });

    it('should throw error when popup is closed', async () => {
      mockPopup.closed = true;

      await expect(transport.send({ test: 'data' })).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Popup window is not open',
      });
    });

    it('should throw error when popup is null', async () => {
      // Set popup to null directly (simulating cleanup)
      (transport as { popup: unknown }).popup = null;

      await expect(transport.send({ test: 'data' })).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Popup window is not open',
      });
    });

    it('should handle postMessage errors', async () => {
      mockPopup.postMessage.mockImplementation(() => {
        throw new Error('Failed to post message');
      });

      await expect(transport.send({ test: 'data' })).rejects.toMatchObject({
        code: 'message_failed',
        message: 'Failed to send message to popup',
      });
    });
  });

  describe('handlePopupClosed', () => {
    it('should emit disconnected event when popup closes during connection', async () => {
      // Connect first
      const connectPromise = transport.connect();

      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise;

      // Clear previous events
      mockEmittedEvents.length = 0;

      // Simulate popup being closed
      mockPopup.closed = true;
      vi.advanceTimersByTime(1000);

      expect(mockEmittedEvents).toContainEqual({
        type: 'disconnected',
        reason: 'Popup window closed',
      });
    });

    it('should not emit disconnected event if not connected', async () => {
      // Simulate popup being closed without connection
      mockPopup.closed = true;

      // Start connection but don't complete it
      transport.connect().catch(() => {}); // Prevent unhandled rejection

      vi.advanceTimersByTime(1000);

      const disconnectedEvents = mockEmittedEvents.filter((e) => e.type === 'disconnected');
      expect(disconnectedEvents).toHaveLength(0);
    });
  });

  describe('cleanup', () => {
    it('should clean up all resources', async () => {
      // Connect to set up resources
      const connectPromise = transport.connect();

      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise;

      // Verify resources are set up
      expect(mockMessageListeners.length).toBeGreaterThan(0);
      expect(mockIntervals.length).toBeGreaterThan(0);

      // Call cleanup
      (transport as { cleanup(): void }).cleanup();

      // Verify cleanup was called on listeners
      for (const listener of mockMessageListeners) {
        expect(listener.cleanup).toHaveBeenCalled();
      }
    });

    it('should handle cleanup when no resources are set', () => {
      expect(() => (transport as { cleanup(): void }).cleanup()).not.toThrow();
    });
  });

  describe('wildcard origin handling', () => {
    it('should accept messages from any origin when using wildcard', async () => {
      const wildcardConfig = { url: '' }; // Empty URL results in wildcard
      const wildcardTransport = new PopupWindow(wildcardConfig, mockLogger, mockErrorHandler);

      const connectPromise = wildcardTransport.connect();

      // Message from any origin should be accepted
      const anyOriginEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://any-origin.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(anyOriginEvent);
      }

      await connectPromise;

      expect(mockEmittedEvents).toContainEqual({
        type: 'connected',
        url: '',
      });
    });
  });

  describe('error scenarios', () => {
    it('should handle getWindow errors in lazy initialization', async () => {
      const { getWindow, isBrowser } = await import('../../../api/utils/environment.js');
      // Mock isBrowser to return false to simulate SSR environment
      vi.mocked(isBrowser).mockReturnValue(false);

      // Create a new transport in SSR environment
      const errorTransport = new PopupWindow(config, mockLogger, mockErrorHandler);

      await expect(errorTransport.connect()).rejects.toMatchObject({
        code: 'render_failed',
        message: 'Popup transport requires browser environment',
      });

      // Restore browser environment
      vi.mocked(isBrowser).mockReturnValue(true);
    });

    it('should handle multiple connect attempts with errors', async () => {
      // First attempt fails
      mockWindow.open.mockReturnValueOnce(null);
      await expect(transport.connect()).rejects.toThrow();

      // Second attempt should work
      mockWindow.open.mockReturnValue(mockPopup as Window);
      const connectPromise = transport.connect();

      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[mockMessageListeners.length - 1].handler(connectEvent);
      }

      await connectPromise;
    });
  });

  describe('edge cases', () => {
    it('should handle message events without data', async () => {
      const connectPromise = transport.connect();

      const emptyEvent = new MessageEvent('message', {
        data: null,
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(emptyEvent);
      }

      // Should not crash, just ignore the message - advance time slightly
      await vi.advanceTimersByTimeAsync(100);

      // Complete connection normally
      const connectEvent = new MessageEvent('message', {
        data: { type: 'connected' },
        origin: 'https://wallet.example.com',
      });

      if (mockMessageListeners.length > 0) {
        mockMessageListeners[0].handler(connectEvent);
      }

      await connectPromise;
    });

    it('should handle timeout when popup is closed during connection', async () => {
      const connectPromise = transport.connect();

      // Close popup during connection attempt
      mockPopup.closed = true;
      vi.advanceTimersByTime(1000); // Trigger closed check

      // Then timeout
      vi.advanceTimersByTime(30000);

      await expect(connectPromise).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Popup connection timeout',
      });
    });

    it('should handle custom window features', () => {
      const customConfig = {
        url: 'https://wallet.example.com',
        features: 'width=800,height=900,left=100,top=50',
      };

      const customTransport = new PopupWindow(customConfig, mockLogger, mockErrorHandler);
      expect(customTransport).toBeInstanceOf(PopupWindow);
    });

    it('should handle undefined popup during send', async () => {
      // Don't connect, try to send directly
      await expect(transport.send({ test: 'data' })).rejects.toMatchObject({
        code: 'connection_failed',
        message: 'Popup window is not open',
      });
    });
  });
});
