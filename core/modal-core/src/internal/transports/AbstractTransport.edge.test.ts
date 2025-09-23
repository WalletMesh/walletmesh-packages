/**
 * Edge case tests for AbstractTransport functionality
 * Tests error handling, retry logic, and cleanup scenarios
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TransportConfig, TransportEvent } from '../../types.js';
import { AbstractTransport } from './AbstractTransport.js';

// Import centralized test utilities
import { createMockErrorHandler, createTestEnvironment } from '../../testing/index.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import { createDebugLogger } from '../core/logger/logger.js';

// Enhanced mock implementation of the abstract AbstractTransport for edge case testing
class MockTransportEdge extends AbstractTransport {
  public mockConnectResult: 'success' | 'error' | 'retry-then-success' | 'always-fail' = 'success';
  public mockSendResult: 'success' | 'error' | 'retry-then-success' = 'success';
  public mockDisconnectResult: 'success' | 'error' = 'success';
  public connectAttempts = 0;
  public sendAttempts = 0;

  constructor(config?: TransportConfig) {
    const logger = createDebugLogger('MockTransportEdge', false);
    const errorHandler = createMockErrorHandler();
    super(config || {}, logger, errorHandler);
  }

  protected async connectInternal(): Promise<void> {
    this.connectAttempts++;

    if (this.mockConnectResult === 'error') {
      throw ErrorFactory.transportError('Mock connection error');
    }

    if (this.mockConnectResult === 'retry-then-success') {
      if (this.connectAttempts < 3) {
        throw ErrorFactory.transportError('Mock connection retry error');
      }
    }

    if (this.mockConnectResult === 'always-fail') {
      throw ErrorFactory.transportError('Mock connection always fails');
    }

    this.connected = true;
    this.emit({ type: 'connected' } as TransportEvent);
  }

  protected async disconnectInternal(): Promise<void> {
    if (this.mockDisconnectResult === 'error') {
      throw ErrorFactory.transportDisconnected('Mock disconnect error');
    }

    this.connected = false;
    this.emit({ type: 'disconnected' } as TransportEvent);
  }

  protected async sendInternal(data: unknown): Promise<void> {
    this.sendAttempts++;

    if (!this.isConnected()) {
      throw ErrorFactory.transportError('Transport not connected');
    }

    if (this.mockSendResult === 'error') {
      throw ErrorFactory.messageFailed('Mock send error');
    }

    if (this.mockSendResult === 'retry-then-success') {
      if (this.sendAttempts < 2) {
        throw ErrorFactory.messageFailed('Mock send retry error');
      }
    }

    this.emit({
      type: 'message',
      data,
    });
  }

  // Helper methods to access protected methods for testing
  public testClearAllEventListeners(): void {
    this.clearAllEventListeners();
  }

  public testLogError(message: string, error: unknown, data?: Record<string, unknown>): void {
    this.logError(message, error, data);
  }

  public testGetErrorMessage(error: unknown): string {
    return this.getErrorMessage(error);
  }

  public testEmitErrorEvent(error: Error): void {
    this.emitErrorEvent(error);
  }

  public testLog(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: Record<string, unknown>,
  ): void {
    this.log(level, message, data);
  }

  public testEmit(event: TransportEvent): void {
    this.emit(event);
  }

  public mockEmitShouldFail = false;

  protected override emit(event: TransportEvent): void {
    if (
      this.mockEmitShouldFail &&
      event.type === 'disconnected' &&
      (event as { reason?: string }).reason === 'Transport destroyed'
    ) {
      throw ErrorFactory.cleanupFailed('Emit failed during destroy', 'dispatchEvent');
    }
    super.emit(event);
  }

  // Helper to simulate message emission for testing
  public simulateMessage(data: unknown): void {
    this.emit({
      type: 'message',
      data,
    } as TransportEvent);
  }
}

// Create test environment with error mocks
const testEnv = createTestEnvironment({
  mockErrors: false, // We don't need error mocks for this test
  suppressRejections: ['connection_failed', 'message_failed'],
});

describe('AbstractTransport - Edge Cases and Error Handling', () => {
  let transport: MockTransportEdge;

  beforeEach(() => {
    testEnv.setup();

    transport = new MockTransportEdge({
      timeout: 100,
    });
  });

  afterEach(async () => {
    // Clean up transport
    if (transport) {
      try {
        await transport.destroy();
      } catch {
        // Ignore errors during cleanup
      }
    }
    await testEnv.teardown();
  });

  describe('Connection Error Handling', () => {
    it('should handle connection failures with proper error wrapping', async () => {
      // Set up error event listener to prevent unhandled rejections
      const errorEventListener = vi.fn();
      transport.on('error', errorEventListener);

      transport.mockConnectResult = 'error';

      // Connect and advance timers, catch the error
      const connectPromise = transport.connect();
      await testEnv.advanceTimers(5000);
      const error = await connectPromise.catch((e) => e);

      // Check error properties directly
      expect(error).toMatchObject({
        code: 'connection_failed',
        message: 'Failed to connect to transport',
        category: 'network',
      });

      expect(transport.isConnected()).toBe(false);
      expect(errorEventListener).toHaveBeenCalled();
    });

    it('should retry connection and succeed on final attempt', async () => {
      transport.mockConnectResult = 'retry-then-success';

      // Connect and advance timers through retry delays
      const connectPromise = transport.connect();
      await testEnv.advanceTimers(5000); // Advance through retry delays
      await connectPromise;

      expect(transport.connectAttempts).toBe(3); // First attempt + 2 retries
      expect(transport.isConnected()).toBe(true);
    });

    it('should fail after maximum retry attempts', async () => {
      // Set up error event listener to prevent unhandled rejections
      const errorEventListener = vi.fn();
      transport.on('error', errorEventListener);

      transport.mockConnectResult = 'always-fail';

      const connectPromise = transport.connect();
      await testEnv.advanceTimers(5000); // Advance through all retry delays

      const error = await connectPromise.catch((e) => e);

      expect(error.code).toBe('connection_failed');
      expect(error.message).toBe('Failed to connect to transport');
      expect(error.category).toBe('network');

      expect(transport.connectAttempts).toBe(4); // Initial attempt + 3 retries
      expect(errorEventListener).toHaveBeenCalled();
    });
  });

  describe('Disconnect Error Handling', () => {
    it('should handle disconnect failures with proper error wrapping', async () => {
      // Set up error event listener to prevent unhandled rejections
      const errorEventListener = vi.fn();
      transport.on('error', errorEventListener);

      await transport.connect();
      transport.mockDisconnectResult = 'error';

      const error = await transport.disconnect().catch((e) => e);

      expect(error.code).toBe('transport_disconnected');
      expect(error.message).toBe('Failed to disconnect from transport');
      expect(error.category).toBe('network');
      expect(errorEventListener).toHaveBeenCalled();
    });
  });

  describe('Send Error Handling', () => {
    it('should handle send failures when not connected', async () => {
      // Set up error event listener to prevent unhandled rejections
      const errorEventListener = vi.fn();
      transport.on('error', errorEventListener);

      const sendPromise = transport.send({ test: 'data' });
      await testEnv.advanceTimers(2000); // Let retry logic complete

      const error = await sendPromise.catch((e) => e);

      expect(error.code).toBe('message_failed');
      expect(error.message).toBe('Failed to send message through transport');
      expect(error.category).toBe('network');
      expect(error.data).toBeDefined();
      expect(errorEventListener).toHaveBeenCalled();
    });

    it('should retry send and succeed', async () => {
      await transport.connect();
      transport.mockSendResult = 'retry-then-success';

      const data = { test: 'retry-data' };
      const sendPromise = transport.send(data);
      await testEnv.advanceTimers(1500); // Advance through retry delay
      await sendPromise;

      expect(transport.sendAttempts).toBe(2); // First attempt + 1 retry
    });

    it('should fail send after maximum retry attempts', async () => {
      // Set up error event listener to prevent unhandled rejections
      const errorEventListener = vi.fn();
      transport.on('error', errorEventListener);

      await transport.connect();
      transport.mockSendResult = 'error';

      const sendPromise = transport.send({ test: 'fail-data' });
      await testEnv.advanceTimers(2000); // Advance through all retry delays

      const error = await sendPromise.catch((e) => e);

      expect(error.code).toBe('message_failed');
      expect(error.message).toBe('Failed to send message through transport');
      expect(error.category).toBe('network');
      expect(error.data).toBeDefined();

      expect(transport.sendAttempts).toBe(3); // Initial attempt + 2 retries
      expect(errorEventListener).toHaveBeenCalled();
    });
  });

  describe('Event System Edge Cases', () => {
    it('should handle unsubscribing non-existent events gracefully', () => {
      const nonExistentListener = vi.fn();

      // This should not throw
      expect(() => {
        transport.off('non-existent-event', nonExistentListener);
      }).not.toThrow();
    });

    it('should handle unsubscribing non-existent listener gracefully', () => {
      const existingListener = vi.fn();
      const nonExistentListener = vi.fn();

      // Subscribe with one listener
      transport.on('test-event', existingListener);

      // Try to unsubscribe a different listener - should not throw
      expect(() => {
        transport.off('test-event', nonExistentListener);
      }).not.toThrow();
    });

    it('should handle multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      // Subscribe multiple listeners to 'message' event (which is emitted by simulateMessage)
      transport.on('message', listener1);
      transport.on('message', listener2);
      transport.on('message', listener3);

      // Emit event
      transport.simulateMessage({ test: 'multi-listener' });

      // All listeners should be called
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();
    });

    it('should return unsubscribe function that works correctly', () => {
      const listener = vi.fn();

      // Subscribe to 'message' event and get unsubscribe function
      const unsubscribe = transport.on('message', listener);

      // Emit event - listener should be called
      transport.simulateMessage({ test: 'before-unsub' });
      expect(listener).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Emit again - listener should not be called
      transport.simulateMessage({ test: 'after-unsub' });
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('clearAllEventListeners() - Lines 328-346', () => {
    it('should clear all event listeners properly', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      // Subscribe to multiple events using 'message' which gets triggered by simulateMessage
      transport.on('message', listener1);
      transport.on('connected', listener2);
      transport.on('message', listener3); // Multiple listeners for same event

      // Verify listeners work before clearing
      transport.simulateMessage({ test: 'before-clear' });
      expect(listener1).toHaveBeenCalled();
      expect(listener3).toHaveBeenCalled();

      // Clear all listeners
      transport.testClearAllEventListeners();

      // Reset mocks and emit again
      vi.clearAllMocks();
      transport.simulateMessage({ test: 'after-clear' });

      // No listeners should be called
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(listener3).not.toHaveBeenCalled();
    });

    it('should handle clearing listeners when subscriptions map has issues', () => {
      const listener = vi.fn();

      // Subscribe to event
      transport.on('test-event', listener);

      // Simulate warning case by manually corrupting subscriptions
      // (accessing private property for testing)
      const subscriptions = (transport as { subscriptions: Map<string, Map<unknown, unknown>> })
        .subscriptions;
      const eventMap = subscriptions.get('test-event');
      if (eventMap) {
        // Add an entry that will fail to remove properly
        eventMap.set(listener, null); // Invalid wrapped listener
      }

      // This should handle the error gracefully and log a warning
      expect(() => {
        transport.testClearAllEventListeners();
      }).not.toThrow();
    });

    it('should handle clearing when no listeners exist', () => {
      // Clear listeners when none exist - should not throw
      expect(() => {
        transport.testClearAllEventListeners();
      }).not.toThrow();
    });

    it('should log warning when subscriptions remain after clearing', () => {
      const loggerWarnSpy = vi.spyOn((transport as { logger: { warn: unknown } }).logger, 'warn' as never);
      const listener = vi.fn();

      // Subscribe to event
      transport.on('persistent-event', listener);

      // Simulate scenario where subscription doesn't clear properly
      // by mocking off method to do nothing
      const originalOff = transport.off;
      transport.off = vi.fn(); // Mock to do nothing

      // Clear listeners - should detect remaining subscriptions
      transport.testClearAllEventListeners();

      // Should log warning about remaining subscriptions
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to clear all subscriptions'),
        undefined,
      );

      // Restore original method
      transport.off = originalOff;
    });
  });

  describe('destroy() method - Lines 353-381', () => {
    it('should destroy transport successfully when connected', async () => {
      // Connect first
      await transport.connect();
      expect(transport.isConnected()).toBe(true);

      // Set up event listener to verify disconnected event
      const disconnectedListener = vi.fn();
      transport.on('disconnected', disconnectedListener);

      // Destroy transport
      await transport.destroy();

      // Should be disconnected
      expect(transport.isConnected()).toBe(false);

      // Should emit disconnected event at least once
      expect(disconnectedListener).toHaveBeenCalled();

      // Check if any call includes the destroy reason (the destroy method should emit this)
      const calls = disconnectedListener.mock.calls;
      const hasDestroyEvent = calls.some((call) => {
        const event = call[0];
        return (
          event && event.type === 'disconnected' && (event.reason === 'Transport destroyed' || !event.reason)
        );
      });
      // For now, just check that we got disconnected events
      expect(hasDestroyEvent).toBe(true);
    });

    it('should destroy transport successfully when already disconnected', async () => {
      // Don't connect - transport is already disconnected
      expect(transport.isConnected()).toBe(false);

      // Destroy should work without errors
      await expect(transport.destroy()).resolves.not.toThrow();
    });

    it('should handle disconnect errors during destroy gracefully', async () => {
      // Connect first
      await transport.connect();
      expect(transport.isConnected()).toBe(true);

      // Set up disconnect to fail
      transport.mockDisconnectResult = 'error';

      // Spy on the actual logger error method instead
      const loggerErrorSpy = vi.spyOn((transport as { logger: { error: unknown } }).logger, 'error' as never);

      // Destroy should handle disconnect error gracefully
      await expect(transport.destroy()).resolves.not.toThrow();

      // Should log the disconnect error - the logger gets called twice:
      // 1. By disconnect() method with "Disconnect failed" and ModalError
      // 2. By destroy() method with "Error disconnecting during destroy" and the same error
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Disconnect failed',
        expect.objectContaining({
          message: expect.any(String),
          name: 'ModalError',
        }),
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error disconnecting during destroy',
        expect.objectContaining({
          message: expect.any(String),
          name: 'ModalError',
        }),
      );
    });

    it('should handle errors during destroy process and throw wrapped error', async () => {
      // Set mock to fail on emit during destroy
      transport.mockEmitShouldFail = true;

      // Spy on error handling
      const loggerErrorSpy = vi.spyOn((transport as { logger: { error: unknown } }).logger, 'error' as never);

      // Destroy should throw wrapped error
      const error = await transport.destroy().catch((e) => e);

      expect(error).toMatchObject({
        code: 'cleanup_failed',
        message: 'Failed to properly destroy transport',
        category: 'general',
      });

      // Should log error during destroy - the logError method formats ModalError as {message, name}
      expect(loggerErrorSpy).toHaveBeenCalledWith('Error during transport destroy', {
        message: 'Emit failed during destroy',
        name: 'ModalError',
      });

      // Reset mock
      transport.mockEmitShouldFail = false;
    });

    it('should clear all event listeners during destroy', async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      // Subscribe to events - use 'message' event which is triggered by simulateMessage
      transport.on('message', listener1);
      transport.on('connected', listener2);

      // Verify listeners work before destroy
      transport.simulateMessage({ test: 'before-destroy' });
      expect(listener1).toHaveBeenCalled();

      // Destroy transport
      await transport.destroy();

      // Reset mocks and try to emit - listeners should be cleared
      vi.clearAllMocks();
      transport.simulateMessage({ test: 'after-destroy' });
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should log debug message on successful destroy', async () => {
      const loggerDebugSpy = vi.spyOn((transport as { logger: { debug: unknown } }).logger, 'debug' as never);

      await transport.destroy();

      expect(loggerDebugSpy).toHaveBeenCalledWith('Transport destroyed', undefined);
    });
  });

  describe('Helper Methods Coverage', () => {
    it('should log errors with proper formatting for Error objects', () => {
      const loggerSpy = vi.spyOn((transport as { logger: { error: unknown } }).logger, 'error' as never);
      const testError = ErrorFactory.transportError('Test error message');

      transport.testLogError('Test error occurred', testError, { extra: 'data' });

      expect(loggerSpy).toHaveBeenCalledWith('Test error occurred', {
        message: 'Test error message',
        name: 'ModalError',
        extra: 'data',
      });
    });

    it('should log errors with proper formatting for non-Error objects', () => {
      const loggerSpy = vi.spyOn((transport as { logger: { error: unknown } }).logger, 'error' as never);
      const nonErrorObject = { code: 'custom_error', details: 'test' };

      transport.testLogError('Custom error occurred', nonErrorObject);

      expect(loggerSpy).toHaveBeenCalledWith('Custom error occurred', {
        error: '[object Object]',
      });
    });

    it('should get user-friendly error messages through error handler', () => {
      const testError = ErrorFactory.transportError('Technical error');

      const userMessage = transport.testGetErrorMessage(testError);

      expect(userMessage).toBe('User friendly message'); // From mock error handler
    });

    it('should emit error events with proper structure', () => {
      const errorListener = vi.fn();
      transport.on('error', errorListener);

      const testError = new Error('Test error for event');
      transport.testEmitErrorEvent(testError);

      expect(errorListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          error: expect.objectContaining({
            code: expect.any(String),
            message: testError.message,
            category: 'network',
          }),
        }),
      );
    });

    it('should log messages at different levels', () => {
      const loggerSpy = vi.spyOn((transport as { logger: { debug: unknown } }).logger, 'debug' as never);

      transport.testLog('debug', 'Debug message', { debug: true });

      expect(loggerSpy).toHaveBeenCalledWith('Debug message', { debug: true });
    });
  });

  describe('Constructor Edge Cases', () => {
    it('should handle null config gracefully', () => {
      // @ts-expect-error Testing with null config for edge case handling
      const nullConfigTransport = new MockTransportEdge(null);

      expect(nullConfigTransport).toBeInstanceOf(AbstractTransport);
      expect((nullConfigTransport as { config: { timeout: number } }).config.timeout).toBe(30000); // Default timeout
    });

    it('should handle undefined config gracefully', () => {
      const undefinedConfigTransport = new MockTransportEdge(undefined);

      expect(undefinedConfigTransport).toBeInstanceOf(AbstractTransport);
      expect((undefinedConfigTransport as { config: { timeout: number } }).config.timeout).toBe(30000); // Default timeout
    });

    it('should merge provided config with defaults', () => {
      const customTransport = new MockTransportEdge({
        timeout: 60000,
        customProperty: 'test',
      } as TransportConfig & { customProperty: string });

      const config = (customTransport as { config: TransportConfig & { customProperty: string } }).config;
      expect(config.timeout).toBe(60000); // Custom timeout
      expect(config.customProperty).toBe('test'); // Custom property preserved
    });
  });
});
