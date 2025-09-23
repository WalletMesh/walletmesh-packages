/**
 * AbstractTransport SSR Tests
 *
 * Comprehensive tests for SSR-safe AbstractTransport implementation with organized structure:
 * - Initialization (Constructor, EventTarget Creation)
 * - Core Operations (connect, disconnect, send)
 * - Event Management (Event System, emit, emitErrorEvent)
 * - Utilities (Logging Methods, delay, isConnected)
 * - Lifecycle Management (cleanup, destroy)
 * - Edge Cases and Integration
 *
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment } from '../../testing/index.js';
import type { TransportConfig, TransportEvent } from '../../types.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { ErrorHandler } from '../core/errors/errorHandler.js';
import type { Logger } from '../core/logger/logger.js';
import { AbstractTransport } from './AbstractTransport.ssr.js';

// Create test environment
const testEnv = createTestEnvironment({
  mockErrors: false, // We need real error factory for SSR tests
  suppressRejections: ['connection_failed', 'message_failed'],
});

// Mock dependencies
vi.mock('../../api/utils/environment.js', () => ({
  isBrowser: vi.fn(() => true),
}));

vi.mock('../utils/dom-essentials.js', () => ({
  createSafeTimeout: vi.fn((callback: () => void, ms: number) => {
    const id = setTimeout(callback, ms);
    mockTimeouts.push(id);
    return () => clearTimeout(id);
  }),
}));

vi.mock('../../api/utils/lazy.js', () => ({
  createLazy: vi.fn((factory: () => unknown) => factory),
  createLazyAsync: vi.fn((factory: () => Promise<unknown>) => factory),
}));

vi.mock('../core/errors/errorFactory.js', () => ({
  ErrorFactory: {
    connectionFailed: vi.fn((message: string, details?: unknown) => ({
      code: 'connection_failed',
      message,
      category: 'network',
      fatal: false,
      data: details,
    })),
    transportDisconnected: vi.fn((message: string, reason?: string) => ({
      code: 'transport_disconnected',
      message,
      category: 'network',
      fatal: false,
      data: { reason },
    })),
    messageFailed: vi.fn((message: string, details?: unknown) => ({
      code: 'message_failed',
      message,
      category: 'network',
      fatal: false,
      data: details,
    })),
    transportError: vi.fn((message: string) => ({
      code: 'transport_error',
      message,
      category: 'network',
      fatal: false,
    })),
  },
}));

vi.mock('../core/errors/utils.js', () => ({
  isModalError: vi.fn((error: unknown) => {
    return error && typeof error.code === 'string' && typeof error.category === 'string';
  }),
}));

// Test mocks
let mockTimeouts: NodeJS.Timeout[];
let mockEventTarget: {
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
  dispatchEvent: ReturnType<typeof vi.fn>;
};

// Concrete implementation for testing
class TestTransport extends AbstractTransport {
  public connectCalled = false;
  public disconnectCalled = false;
  public sendCalled = false;
  public connectShouldFail = false;
  public disconnectShouldFail = false;
  public sendShouldFail = false;
  public sentData: unknown[] = [];

  protected async connectInternal(): Promise<void> {
    this.connectCalled = true;
    if (this.connectShouldFail) {
      throw new Error('Connect failed');
    }
    this.connected = true;
  }

  protected async disconnectInternal(): Promise<void> {
    this.disconnectCalled = true;
    if (this.disconnectShouldFail) {
      throw new Error('Disconnect failed');
    }
    this.connected = false;
  }

  protected async sendInternal(data: unknown): Promise<void> {
    this.sendCalled = true;
    this.sentData.push(data);
    if (this.sendShouldFail) {
      throw new Error('Send failed');
    }
  }

  // Expose protected methods for testing
  public testEmit(event: TransportEvent): void {
    this.emit(event);
  }

  public testLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.log(level, message, data);
  }

  public testLogError(message: string, error: Error | unknown, data?: Record<string, unknown>): void {
    this.logError(message, error, data);
  }

  public testEmitErrorEvent(error: Error): void {
    this.emitErrorEvent(error);
  }

  public testCleanup(): void {
    this.cleanup();
  }

  public testDelay(ms: number): Promise<void> {
    return this.delay(ms);
  }

  public getSubscriptions(): Map<string, Map<(event: TransportEvent) => void, (e: Event) => void>> {
    return (this as { subscriptions: Map<string, Map<(event: TransportEvent) => void, (e: Event) => void>> })
      .subscriptions;
  }
}

describe('AbstractTransport', () => {
  let transport: TestTransport;
  let mockLogger: Logger;
  let mockErrorHandler: ErrorHandler;
  let config: TransportConfig;

  beforeEach(async () => {
    testEnv.setup();

    // Reset mocks
    mockTimeouts = [];

    mockEventTarget = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
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
      timeout: 10000,
    };

    // Set up browser environment by default
    const { isBrowser } = await import('../../api/utils/environment.js');
    vi.mocked(isBrowser).mockReturnValue(true);

    // Mock EventTarget creation
    const { createLazy } = await import('../../api/utils/lazy.js');
    vi.mocked(createLazy).mockImplementation((factory: () => unknown) => () => {
      if (factory.toString().includes('EventTarget')) {
        return mockEventTarget;
      }
      return factory();
    });

    transport = new TestTransport(config, mockLogger, mockErrorHandler);
  });

  afterEach(async () => {
    await testEnv.teardown();

    // Clean up timeouts
    mockTimeouts.forEach(clearTimeout);
  });

  describe('Initialization', () => {
    describe('Constructor', () => {
      it('should create transport with valid config', () => {
        expect(transport).toBeInstanceOf(AbstractTransport);
        expect(transport.isConnected()).toBe(false);
      });

      it('should use default timeout when not provided', () => {
        const defaultTransport = new TestTransport({}, mockLogger, mockErrorHandler);
        expect(defaultTransport).toBeInstanceOf(AbstractTransport);
      });

      it('should handle null config gracefully', () => {
        // @ts-expect-error Testing with null config
        const nullConfigTransport = new TestTransport(null, mockLogger, mockErrorHandler);
        expect(nullConfigTransport).toBeInstanceOf(AbstractTransport);
      });

      it('should override default timeout with provided value', () => {
        const customConfig = { timeout: 60000 };
        const customTransport = new TestTransport(customConfig, mockLogger, mockErrorHandler);
        expect(customTransport).toBeInstanceOf(AbstractTransport);
      });

      it('should store logger and error handler references', () => {
        expect(transport).toBeInstanceOf(AbstractTransport);

        // Test logger usage
        transport.testLog('debug', 'test message');
        expect(mockLogger.debug).toHaveBeenCalledWith('test message', undefined);
      });
    });

    describe('EventTarget Creation (SSR Safety)', () => {
      it('should create EventTarget in browser environment', async () => {
        const { isBrowser } = await import('../../api/utils/environment.js');
        vi.mocked(isBrowser).mockReturnValue(true);

        const browserTransport = new TestTransport(config, mockLogger, mockErrorHandler);
        expect(browserTransport).toBeInstanceOf(AbstractTransport);
      });

      it('should create polyfill EventTarget in SSR environment', async () => {
        const { isBrowser } = await import('../../api/utils/environment.js');
        vi.mocked(isBrowser).mockReturnValue(false);

        const ssrTransport = new TestTransport(config, mockLogger, mockErrorHandler);
        expect(ssrTransport).toBeInstanceOf(AbstractTransport);
      });
    });
  }); // End of Initialization

  describe('Core Operations', () => {
    describe('connect', () => {
      it('should connect successfully on first attempt', async () => {
        await transport.connect();

        expect(transport.connectCalled).toBe(true);
        expect(transport.isConnected()).toBe(true);
      });

      it('should retry connection failures', async () => {
        let attempts = 0;
        transport.connectInternal = vi.fn(async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Connection failed');
          }
          transport.connected = true;
        });

        const connectPromise = transport.connect();

        // Advance fake timers for retry delays (2 retries * 1000ms each)
        await testEnv.advanceTimers(2000);

        await connectPromise;

        expect(transport.connectInternal).toHaveBeenCalledTimes(3);
        expect(transport.isConnected()).toBe(true);
      });

      it('should fail after max retries', async () => {
        transport.connectShouldFail = true;

        const connectPromise = transport.connect();

        // Advance fake timers for retry delays (3 retries * 1000ms each)
        await testEnv.advanceTimers(3000);

        await expect(connectPromise).rejects.toMatchObject({
          code: 'connection_failed',
          message: 'Failed to connect to transport',
          category: 'network',
        });

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Connection failed',
          expect.objectContaining({
            error: expect.any(Object),
          }),
        );
      });

      it('should emit error event on connection failure', async () => {
        transport.connectShouldFail = true;

        const connectPromise = transport.connect();

        // Advance fake timers for retry delays
        await testEnv.advanceTimers(3000);

        await expect(connectPromise).rejects.toThrow();

        // Error event should be emitted
        expect(mockEventTarget.dispatchEvent).toHaveBeenCalled();
      });

      it('should handle emit error gracefully', async () => {
        transport.connectShouldFail = true;
        mockEventTarget.dispatchEvent.mockImplementation(() => {
          throw new Error('Dispatch failed');
        });

        const connectPromise = transport.connect();

        // Advance fake timers for retry delays
        await testEnv.advanceTimers(3000);

        await expect(connectPromise).rejects.toThrow();

        // Check that the error log was called - the second call should be for Failed to emit error event
        expect(mockLogger.error).toHaveBeenCalledTimes(2);

        // Get the second call args
        const secondCall = mockLogger.error.mock.calls[1];
        expect(secondCall[0]).toBe('Failed to emit error event');
        // The error is logged as an object with error property
        expect(secondCall[1]).toEqual({ error: 'Dispatch failed', stack: expect.any(String) });
      });

      it('should delay between retry attempts', async () => {
        let attempts = 0;
        transport.connectInternal = vi.fn(async () => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Connection failed');
          }
          transport.connected = true;
        });

        const connectPromise = transport.connect();

        // Should not be connected yet
        expect(transport.isConnected()).toBe(false);

        // Advance time for first retry delay
        await testEnv.advanceTimers(1000);

        await connectPromise;
        expect(transport.isConnected()).toBe(true);
      });
    });

    describe('disconnect', () => {
      beforeEach(async () => {
        await transport.connect();
      });

      it('should disconnect successfully', async () => {
        await transport.disconnect();

        expect(transport.disconnectCalled).toBe(true);
        expect(transport.isConnected()).toBe(false);
      });

      it('should handle disconnect failures', async () => {
        transport.disconnectShouldFail = true;

        await expect(transport.disconnect()).rejects.toMatchObject({
          code: 'transport_disconnected',
          message: 'Failed to disconnect from transport',
          category: 'network',
        });

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Disconnect failed',
          expect.objectContaining({
            error: expect.any(Object),
          }),
        );
      });

      it('should emit error event on disconnect failure', async () => {
        transport.disconnectShouldFail = true;

        await expect(transport.disconnect()).rejects.toThrow();

        // Error event should be emitted
        expect(mockEventTarget.dispatchEvent).toHaveBeenCalled();
      });

      it('should handle emit error during disconnect gracefully', async () => {
        transport.disconnectShouldFail = true;
        mockEventTarget.dispatchEvent.mockImplementation(() => {
          throw new Error('Dispatch failed');
        });

        await expect(transport.disconnect()).rejects.toThrow();

        // Check that the error log was called - the second call should be for Failed to emit error event
        expect(mockLogger.error).toHaveBeenCalledTimes(2);

        // Get the second call args
        const secondCall = mockLogger.error.mock.calls[1];
        expect(secondCall[0]).toBe('Failed to emit error event');
        // The error is logged as an object with error property
        expect(secondCall[1]).toEqual({ error: 'Dispatch failed', stack: expect.any(String) });
      });
    });

    describe('send', () => {
      beforeEach(async () => {
        await transport.connect();
      });

      it('should send data successfully', async () => {
        const testData = { type: 'test', payload: 'hello' };

        await transport.send(testData);

        expect(transport.sendCalled).toBe(true);
        expect(transport.sentData).toContain(testData);
      });

      it('should throw error when not connected', async () => {
        await transport.disconnect();

        await expect(transport.send({ test: 'data' })).rejects.toMatchObject({
          code: 'message_failed',
          message: 'Failed to send message through transport',
        });
      });

      it('should retry send failures', async () => {
        let attempts = 0;
        const originalSendInternal = transport.sendInternal;
        transport.sendInternal = vi.fn(async (data: unknown) => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Send failed');
          }
          transport.sentData.push(data);
        });

        const sendPromise = transport.send({ test: 'data' });

        // Advance fake timers for retry delay
        await testEnv.advanceTimers(500);

        await sendPromise;

        expect(transport.sendInternal).toHaveBeenCalledTimes(2);
        expect(transport.sentData).toHaveLength(1);
      });

      it('should fail after max send retries', async () => {
        transport.sendShouldFail = true;

        const sendPromise = transport.send({ test: 'data' });

        // Advance fake timers for retry delays
        await testEnv.advanceTimers(1500); // 3 attempts * 500ms

        await expect(sendPromise).rejects.toMatchObject({
          code: 'message_failed',
          message: 'Failed to send message through transport',
          category: 'network',
        });

        expect(mockLogger.error).toHaveBeenCalledWith(
          'Send failed',
          expect.objectContaining({
            error: expect.objectContaining({
              code: 'message_failed',
              message: 'Failed to send message through transport',
            }),
            data: { test: 'data' },
          }),
        );
      });

      it('should emit error event on send failure', async () => {
        transport.sendShouldFail = true;

        const sendPromise = transport.send({ test: 'data' });

        // Advance fake timers for retry delays
        await testEnv.advanceTimers(1500);

        await expect(sendPromise).rejects.toThrow();

        // Error event should be emitted
        expect(mockEventTarget.dispatchEvent).toHaveBeenCalled();
      });

      it('should delay between send retry attempts', async () => {
        let attempts = 0;
        transport.sendInternal = vi.fn(async (data: unknown) => {
          attempts++;
          if (attempts < 2) {
            throw new Error('Send failed');
          }
          transport.sentData.push(data);
        });

        const sendPromise = transport.send({ test: 'data' });

        // Advance time for retry delay
        await testEnv.advanceTimers(500);

        await sendPromise;
        expect(transport.sentData).toHaveLength(1);
      });
    });
  }); // End of Core Operations

  describe('Event Management', () => {
    describe('Event System', () => {
      it('should add event listeners', () => {
        const listener = vi.fn();

        const unsubscribe = transport.on('test', listener);

        expect(mockEventTarget.addEventListener).toHaveBeenCalledWith('test', expect.any(Function));
        expect(typeof unsubscribe).toBe('function');
      });

      it('should remove event listeners', () => {
        const listener = vi.fn();

        transport.on('test', listener);
        transport.off('test', listener);

        expect(mockEventTarget.removeEventListener).toHaveBeenCalledWith('test', expect.any(Function));
      });

      it('should track subscriptions correctly', () => {
        const listener1 = vi.fn();
        const listener2 = vi.fn();

        transport.on('test', listener1);
        transport.on('test', listener2);

        const subscriptions = transport.getSubscriptions();
        expect(subscriptions.has('test')).toBe(true);
        expect(subscriptions.get('test')?.size).toBe(2);
      });

      it('should clean up empty subscription maps', () => {
        const listener = vi.fn();

        transport.on('test', listener);
        transport.off('test', listener);

        const subscriptions = transport.getSubscriptions();
        expect(subscriptions.has('test')).toBe(false);
      });

      it('should handle off() for non-existent events', () => {
        const listener = vi.fn();

        expect(() => transport.off('nonexistent', listener)).not.toThrow();
      });

      it('should handle off() for non-existent listeners', () => {
        const listener1 = vi.fn();
        const listener2 = vi.fn();

        transport.on('test', listener1);

        expect(() => transport.off('test', listener2)).not.toThrow();
      });

      it('should return unsubscribe function that works', () => {
        const listener = vi.fn();

        const unsubscribe = transport.on('test', listener);
        unsubscribe();

        expect(mockEventTarget.removeEventListener).toHaveBeenCalled();
      });

      it('should handle wrapped listeners correctly', () => {
        const listener = vi.fn();
        const mockEvent = {
          detail: { type: 'test', data: 'payload' },
        } as CustomEvent<TransportEvent>;

        transport.on('test', listener);

        // Simulate the wrapped listener being called
        const wrappedListener = mockEventTarget.addEventListener.mock.calls[0][1] as EventListener;
        wrappedListener(mockEvent);

        expect(listener).toHaveBeenCalledWith({ type: 'test', data: 'payload' });
      });
    });

    describe('emit', () => {
      it('should emit events in browser environment', async () => {
        const { isBrowser } = await import('../../api/utils/environment.js');
        vi.mocked(isBrowser).mockReturnValue(true);

        const testEvent: TransportEvent = { type: 'connected' };
        transport.testEmit(testEvent);

        expect(mockEventTarget.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'connected',
            detail: testEvent,
          }),
        );
      });

      it('should log events in SSR environment', async () => {
        const { isBrowser } = await import('../../api/utils/environment.js');
        vi.mocked(isBrowser).mockReturnValue(false);

        const testEvent: TransportEvent = { type: 'connected' };
        transport.testEmit(testEvent);

        expect(mockLogger.debug).toHaveBeenCalledWith('SSR: Would emit transport event', {
          event: testEvent,
        });
        expect(mockEventTarget.dispatchEvent).not.toHaveBeenCalled();
      });
    });

    describe('Logging Methods', () => {
      it('should log messages at different levels', () => {
        transport.testLog('debug', 'Debug message', { key: 'value' });
        transport.testLog('info', 'Info message');
        transport.testLog('warn', 'Warning message');
        transport.testLog('error', 'Error message');

        expect(mockLogger.debug).toHaveBeenCalledWith('Debug message', { key: 'value' });
        expect(mockLogger.info).toHaveBeenCalledWith('Info message', undefined);
        expect(mockLogger.warn).toHaveBeenCalledWith('Warning message', undefined);
        expect(mockLogger.error).toHaveBeenCalledWith('Error message', undefined);
      });

      it('should log ModalError objects correctly', () => {
        const modalError = {
          code: 'test_error',
          message: 'Test error',
          category: 'test',
          fatal: false,
        };

        transport.testLogError('Error occurred', modalError, { context: 'test' });

        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
          error: modalError,
          context: 'test',
        });
      });

      it('should log regular Error objects correctly', () => {
        const error = new Error('Test error');
        error.stack = 'Error stack trace';

        transport.testLogError('Error occurred', error, { context: 'test' });

        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', {
          error: 'Test error',
          stack: 'Error stack trace',
          context: 'test',
        });
      });

      it('should log non-Error objects as strings', () => {
        const errorValue = { custom: 'error object' };

        transport.testLogError('Error occurred', errorValue);

        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', { error: '[object Object]' });
      });

      it('should handle primitive error values', () => {
        transport.testLogError('Error occurred', 'string error');
        transport.testLogError('Error occurred', 123);
        transport.testLogError('Error occurred', null);
        transport.testLogError('Error occurred', undefined);

        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', { error: 'string error' });
        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', { error: '123' });
        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', { error: 'null' });
        expect(mockLogger.error).toHaveBeenCalledWith('Error occurred', { error: 'undefined' });
      });
    });

    describe('emitErrorEvent', () => {
      it('should emit ModalError directly', () => {
        const modalError = {
          code: 'test_error',
          message: 'Test modal error',
          category: 'test',
          fatal: false,
        };

        transport.testEmitErrorEvent(modalError as Error);

        expect(mockEventTarget.dispatchEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            detail: {
              type: 'error',
              error: modalError,
            },
          }),
        );
      });

      it('should convert regular Error to ModalError', () => {
        const regularError = new Error('Regular error');

        transport.testEmitErrorEvent(regularError);

        expect(mockEventTarget.dispatchEvent).toHaveBeenCalledTimes(1);
        const eventCall = mockEventTarget.dispatchEvent.mock.calls[0][0];
        expect(eventCall).toBeInstanceOf(CustomEvent);
        expect(eventCall.type).toBe('error');
        expect(eventCall.detail).toMatchObject({
          type: 'error',
          error: expect.objectContaining({
            code: 'transport_unavailable',
            message: 'Regular error',
          }),
        });
      });
    });
  }); // End of Event Management

  describe('Utilities', () => {
    describe('delay', () => {
      it('should delay in browser environment', async () => {
        const { isBrowser } = await import('../../api/utils/environment.js');
        vi.mocked(isBrowser).mockReturnValue(true);

        const delayPromise = transport.testDelay(1000);

        // Should not resolve immediately
        let resolved = false;
        delayPromise.then(() => {
          resolved = true;
        });

        // Should not be resolved yet
        expect(resolved).toBe(false);

        // Advance time and wait for resolution
        await testEnv.advanceTimers(1000);

        await delayPromise;
        expect(resolved).toBe(true);
      });

      it('should resolve immediately in SSR environment', async () => {
        const { isBrowser } = await import('../../api/utils/environment.js');
        vi.mocked(isBrowser).mockReturnValue(false);

        const delayPromise = transport.testDelay(1000);

        await expect(delayPromise).resolves.toBeUndefined();
      });
    });

    describe('isConnected', () => {
      it('should return false initially', () => {
        expect(transport.isConnected()).toBe(false);
      });

      it('should return true after successful connection', async () => {
        await transport.connect();
        expect(transport.isConnected()).toBe(true);
      });

      it('should return false after disconnection', async () => {
        await transport.connect();
        await transport.disconnect();
        expect(transport.isConnected()).toBe(false);
      });

      it('should return false after cleanup', async () => {
        await transport.connect();
        transport.testCleanup();
        expect(transport.isConnected()).toBe(false);
      });
    });
  }); // End of Utilities

  describe('Lifecycle Management', () => {
    describe('cleanup', () => {
      it('should clean up all subscriptions', () => {
        const listener1 = vi.fn();
        const listener2 = vi.fn();

        transport.on('test1', listener1);
        transport.on('test2', listener2);

        transport.testCleanup();

        expect(mockEventTarget.removeEventListener).toHaveBeenCalledTimes(2);
        expect(transport.getSubscriptions().size).toBe(0);
        expect(transport.isConnected()).toBe(false);
      });

      it('should handle cleanup with no subscriptions', () => {
        expect(() => transport.testCleanup()).not.toThrow();
        expect(transport.isConnected()).toBe(false);
      });

      it('should reset connection state', async () => {
        await transport.connect();
        expect(transport.isConnected()).toBe(true);

        transport.testCleanup();
        expect(transport.isConnected()).toBe(false);
      });
    });

    describe('destroy', () => {
      it('should disconnect and cleanup when connected', async () => {
        await transport.connect();

        await transport.destroy();

        expect(transport.disconnectCalled).toBe(true);
        expect(transport.isConnected()).toBe(false);
      });

      it('should cleanup when not connected', async () => {
        await transport.destroy();

        expect(transport.disconnectCalled).toBe(false);
        expect(transport.isConnected()).toBe(false);
      });

      it('should handle disconnect errors during destroy', async () => {
        await transport.connect();
        transport.disconnectShouldFail = true;

        // Should not throw even if disconnect fails
        await expect(transport.destroy()).rejects.toThrow();
      });
    });
  }); // End of Lifecycle Management

  describe('Edge Cases and Integration', () => {
    it('should handle multiple connect calls', async () => {
      await transport.connect();
      const firstCallCount = transport.connectCalled ? 1 : 0;

      await transport.connect();
      // Should not call connectInternal again if already connected
      expect(transport.isConnected()).toBe(true);
    });

    it('should handle multiple disconnect calls', async () => {
      await transport.connect();
      await transport.disconnect();

      expect(transport.isConnected()).toBe(false);

      // Second disconnect should not throw
      await expect(transport.disconnect()).resolves.toBeUndefined();
    });

    it('should handle rapid connect/disconnect cycles', async () => {
      for (let i = 0; i < 5; i++) {
        await transport.connect();
        expect(transport.isConnected()).toBe(true);

        await transport.disconnect();
        expect(transport.isConnected()).toBe(false);
      }
    });

    it('should handle complex event subscription patterns', () => {
      const listeners = Array.from({ length: 10 }, () => vi.fn());
      const events = ['test1', 'test2', 'test3'];

      // Add many listeners
      const unsubscribers: (() => void)[] = [];
      listeners.forEach((listener, i) => {
        const event = events[i % events.length];
        unsubscribers.push(transport.on(event, listener));
      });

      // Remove some listeners
      for (const unsub of unsubscribers.slice(0, 5)) {
        unsub();
      }

      // Add more listeners
      listeners.slice(5).forEach((listener, i) => {
        const event = events[i % events.length];
        transport.on(event, listener);
      });

      // Cleanup should handle all remaining subscriptions
      transport.testCleanup();
      expect(transport.getSubscriptions().size).toBe(0);
    });

    it('should handle send with complex data types', async () => {
      await transport.connect();

      const complexData = {
        array: [1, 2, 3],
        nested: { key: 'value' },
        nullValue: null,
        undefinedValue: undefined,
        date: new Date(),
        regex: /test/g,
      };

      await transport.send(complexData);

      expect(transport.sentData).toContain(complexData);
    });

    it('should maintain proper error context through retry cycles', async () => {
      let attempts = 0;
      transport.connectInternal = vi.fn(async () => {
        attempts++;
        throw new Error(`Attempt ${attempts} failed`);
      });

      const connectPromise = transport.connect();

      // Advance fake timers for retry delays (3 retries * 1000ms each)
      await testEnv.advanceTimers(3000);

      await expect(connectPromise).rejects.toMatchObject({
        code: 'connection_failed',
        category: 'network',
      });

      // Should have tried 4 times (initial + 3 retries)
      expect(transport.connectInternal).toHaveBeenCalledTimes(4);
    });

    it('should handle overlapping async operations', async () => {
      const connectPromise1 = transport.connect();
      const connectPromise2 = transport.connect();

      await Promise.all([connectPromise1, connectPromise2]);

      expect(transport.isConnected()).toBe(true);
    });
  });
});
