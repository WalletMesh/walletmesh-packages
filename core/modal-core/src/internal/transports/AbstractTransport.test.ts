/**
 * AbstractTransport Tests
 *
 * Comprehensive testing of the abstract AbstractTransport class with organized structure:
 * - Core Transport Operations (initialization, connection, messaging)
 * - Event Management (subscription, emission, cleanup)
 * - Error Handling & Resilience (retry logic, error propagation)
 * - Lifecycle Management (destroy, cleanup, configuration)
 * - Advanced Scenarios (edge cases, stress testing)
 *
 * @internal
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockErrorHandler,
  createMockLogger,
  setupMocks,
  testSetupPatterns,
} from '../../testing/index.js';
import type { TransportConfig, TransportEvent } from '../../types.js';
import { AbstractTransport } from './AbstractTransport.js';

// Setup mocks using centralized mock system
setupMocks.errorFactory();

// Create test environment
const testEnv = testSetupPatterns.standard();

// Internal interface for accessing protected members in tests
interface TransportInternalProps {
  config: Required<TransportConfig>;
  _connected: boolean;
  eventTarget: EventTarget;
}

// Helper function to cast transport to internal props safely
function asTransportInternals(transport: AbstractTransport): TransportInternalProps {
  return transport as TransportInternalProps;
}

// Mock implementation of the abstract AbstractTransport
class MockTransport extends AbstractTransport {
  public mockConnectResult: 'success' | 'error' = 'success';
  public mockSendResult: 'success' | 'error' = 'success';

  constructor(config?: TransportConfig) {
    const logger = createMockLogger();
    const errorHandler = createMockErrorHandler();
    super(
      {
        timeout: 50,
        ...config,
      },
      logger,
      errorHandler,
    );
  }

  // Implement abstract methods required by AbstractTransport
  protected async connectInternal(): Promise<void> {
    if (this.mockConnectResult === 'error') {
      throw new Error('Mock connection error');
    }
    this.connected = true;
    this.emit({ type: 'connected' } as TransportEvent);
  }

  protected async disconnectInternal(): Promise<void> {
    this.connected = false;
    this.emit({ type: 'disconnected' } as TransportEvent);
  }

  protected async sendInternal(data: unknown): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Transport not connected');
    }

    if (this.mockSendResult === 'error') {
      throw new Error('Mock send error');
    }

    // Implementation-specific event for testing
    // Using TransportMessageEvent compatible structure
    this.emit({
      type: 'message',
      data,
    });
  }

  // Helper method to simulate receiving a message
  public simulateReceiveMessage(data: unknown): void {
    // Implementation-specific event for testing
    // Cast to unknown first, then to TransportEvent to avoid direct type mismatch
    this.emit({
      type: 'message_received',
      data,
    } as TransportEvent);
  }
}

describe('AbstractTransport', () => {
  let transport: MockTransport;

  beforeEach(() => {
    testEnv.setup();

    // Create transport with configuration
    transport = new MockTransport({
      timeout: 100,
    });
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Core Transport Operations', () => {
    describe('Initialization and Configuration', () => {
      it('should have default configuration', () => {
        // Create a transport with default config
        const defaultTransport = new MockTransport();

        // Use the helper function to access internals safely
        const internals = asTransportInternals(defaultTransport);

        expect(internals.config).toMatchObject({
          timeout: expect.any(Number),
        });
      });

      describe('Configuration handling', () => {
        it('should use default timeout when no config provided', () => {
          const defaultTransport = new MockTransport();
          const internals = asTransportInternals(defaultTransport);

          expect(internals.config.timeout).toBe(50); // MockTransport sets 50 as default
        });

        it('should merge custom config with defaults', () => {
          const customTransport = new MockTransport({
            timeout: 120000,
            custom: 'value',
          } as TransportConfig & { custom: string });

          const internals = asTransportInternals(customTransport);

          expect(internals.config.timeout).toBe(120000);
          expect((internals.config as TransportConfig & { custom: string }).custom).toBe('value');
        });

        it('should handle null config safely', () => {
          // @ts-expect-error Testing with null config for edge case handling
          const nullConfigTransport = new MockTransport(null);
          const internals = asTransportInternals(nullConfigTransport);

          expect(internals.config.timeout).toBe(50); // MockTransport default
        });

        it('should handle undefined config safely', () => {
          // @ts-expect-error Testing with undefined config for edge case handling
          const undefinedConfigTransport = new MockTransport(undefined);
          const internals = asTransportInternals(undefinedConfigTransport);

          expect(internals.config.timeout).toBe(50); // MockTransport default
        });
      });
    });

    describe('Connection Management', () => {
      describe('Basic connection operations', () => {
        it('should connect successfully', async () => {
          await expect(transport.connect()).resolves.not.toThrow();
          expect(transport.isConnected()).toBe(true);
        });

        it('should emit connected event', async () => {
          const listener = vi.fn();
          transport.on('connected', listener);

          await transport.connect();

          expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'connected',
            }),
          );
        });

        it('should disconnect successfully', async () => {
          await transport.connect();

          await expect(transport.disconnect()).resolves.not.toThrow();
          expect(transport.isConnected()).toBe(false);
        });

        it('should emit disconnected event', async () => {
          const listener = vi.fn();
          transport.on('disconnected', listener);

          await transport.connect();
          await transport.disconnect();

          expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'disconnected',
            }),
          );
        });
      });

      describe('Connection edge cases', () => {
        it('should handle rapid connect/disconnect cycles', async () => {
          const connectPromise1 = transport.connect();
          const connectPromise2 = transport.connect();

          await Promise.all([connectPromise1, connectPromise2]);

          const disconnectPromise1 = transport.disconnect();
          const disconnectPromise2 = transport.disconnect();

          await Promise.all([disconnectPromise1, disconnectPromise2]);

          expect(transport.isConnected()).toBe(false);
        });
      });
    });

    describe('Message Handling', () => {
      describe('Basic message operations', () => {
        it('should send data successfully', async () => {
          await transport.connect();

          const data = { test: 'data' };
          await expect(transport.send(data)).resolves.not.toThrow();
        });

        it('should prevent sending when not connected', async () => {
          // Add error handler to prevent unhandled rejection
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          // The send method now has retry logic, so we need to advance timers
          const sendPromise = transport.send({ test: 'data' });

          // Advance timers to let the retry logic complete - needs to be async
          await testEnv.advanceTimers(1500); // Cover retry delays (500ms * 2 retries + buffer)

          await expect(sendPromise).rejects.toThrow();

          // Verify error was also emitted as event
          expect(errorHandler).toHaveBeenCalled();
        });

        it('should handle received messages', async () => {
          const listener = vi.fn();
          transport.on('message_received', listener);

          await transport.connect();

          const testData = { type: 'test', value: 123 };
          transport.simulateReceiveMessage(testData);

          expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'message_received',
              data: testData,
            }),
          );
        });
      });

      describe('Message edge cases', () => {
        it('should handle send when transport becomes disconnected during retry', async () => {
          // Add error handler to prevent unhandled rejection
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          await transport.connect();

          let attempts = 0;
          transport['sendInternal'] = vi.fn().mockImplementation(async () => {
            attempts++;
            if (attempts === 1) {
              // Disconnect during first attempt
              transport['connected'] = false;
              throw new Error('Send failed due to disconnection');
            }
            throw new Error('Still disconnected');
          });

          const sendPromise = transport.send({ test: 'data' });

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(2000);

          await expect(sendPromise).rejects.toThrow('Failed to send message through transport');

          // Verify error was also emitted as event
          expect(errorHandler).toHaveBeenCalled();
        }, 10000);
      });
    });
  });

  describe('Event Management', () => {
    describe('Event System', () => {
      describe('Event subscription', () => {
        it('should subscribe to events correctly', async () => {
          // Create handlers
          const connectedHandler = vi.fn();
          const disconnectedHandler = vi.fn();

          // Subscribe
          transport.on('connected', connectedHandler);
          transport.on('disconnected', disconnectedHandler);

          // Initialize and connect
          await transport.connect();
          await transport.disconnect();

          // Verify handlers were called
          expect(connectedHandler).toHaveBeenCalledTimes(1);
          expect(disconnectedHandler).toHaveBeenCalledTimes(1);
        });

        it('should handle multiple subscribers to the same event', () => {
          const handler1 = vi.fn();
          const handler2 = vi.fn();
          const handler3 = vi.fn();

          transport.on('connected', handler1);
          transport.on('connected', handler2);
          transport.on('connected', handler3);

          // Emit event
          transport['emit']({ type: 'connected' });

          expect(handler1).toHaveBeenCalledTimes(1);
          expect(handler2).toHaveBeenCalledTimes(1);
          expect(handler3).toHaveBeenCalledTimes(1);
        });

        it('should return unsubscribe function from on()', () => {
          const handler = vi.fn();
          const unsubscribe = transport.on('connected', handler);

          expect(typeof unsubscribe).toBe('function');

          // Test unsubscribe works
          transport['emit']({ type: 'connected' });
          expect(handler).toHaveBeenCalledTimes(1);

          unsubscribe();
          transport['emit']({ type: 'connected' });
          expect(handler).toHaveBeenCalledTimes(1); // Should not be called again
        });
      });

      describe('Event unsubscription', () => {
        it('should handle unsubscribing from non-existent event', () => {
          const handler = vi.fn();

          // Should not throw when unsubscribing from non-existent event
          expect(() => transport.off('nonexistent', handler)).not.toThrow();
        });

        it('should handle unsubscribing non-existent listener', () => {
          const handler1 = vi.fn();
          const handler2 = vi.fn();

          transport.on('connected', handler1);

          // Should not throw when unsubscribing non-existent listener
          expect(() => transport.off('connected', handler2)).not.toThrow();
        });

        it('should clean up empty event maps after unsubscribing', () => {
          const handler = vi.fn();
          const unsubscribe = transport.on('connected', handler);

          // Verify subscription exists
          const _internals = asTransportInternals(transport);
          expect(transport['subscriptions'].has('connected')).toBe(true);

          unsubscribe();

          // Verify cleanup of empty maps
          expect(transport['subscriptions'].has('connected')).toBe(false);
        });
      });
    });

    describe('Event Listener Cleanup', () => {
      it('should clear all event listeners', () => {
        const handler1 = vi.fn();
        const handler2 = vi.fn();
        const handler3 = vi.fn();

        transport.on('connected', handler1);
        transport.on('connected', handler2);
        transport.on('disconnected', handler3);

        expect(transport['subscriptions'].size).toBe(2);

        transport['clearAllEventListeners']();

        expect(transport['subscriptions'].size).toBe(0);

        // Verify events are no longer received
        transport['emit']({ type: 'connected' });
        transport['emit']({ type: 'disconnected' });

        expect(handler1).not.toHaveBeenCalled();
        expect(handler2).not.toHaveBeenCalled();
        expect(handler3).not.toHaveBeenCalled();
      });

      it('should handle clearing listeners when none exist', () => {
        expect(() => transport['clearAllEventListeners']()).not.toThrow();
        expect(transport['subscriptions'].size).toBe(0);
      });

      it('should warn if some subscriptions remain after clearing', () => {
        const handler = vi.fn();
        transport.on('connected', handler);

        // Mock the off method to fail
        const originalOff = transport.off;
        transport.off = vi.fn().mockImplementation(() => {
          // Simulate failure to unsubscribe
        });

        transport['clearAllEventListeners']();

        expect(transport['logger'].warn).toHaveBeenCalledWith(
          'Failed to clear all subscriptions, 1 remaining',
          undefined,
        );

        transport.off = originalOff;
      });

      it('should handle large number of event subscriptions', () => {
        const handlers = [];

        // Add 100 handlers
        for (let i = 0; i < 100; i++) {
          const handler = vi.fn();
          handlers.push(handler);
          transport.on('connected', handler);
        }

        transport['emit']({ type: 'connected' });

        // All handlers should be called
        for (const handler of handlers) {
          expect(handler).toHaveBeenCalledTimes(1);
        }

        // Clean up
        transport['clearAllEventListeners']();
        expect(transport['subscriptions'].size).toBe(0);
      });
    });
  });

  describe('Error Handling & Resilience', () => {
    describe('Retry Logic', () => {
      describe('Connection retry behavior', () => {
        it('should retry connection attempts', async () => {
          let attempts = 0;
          const _originalConnectInternal = transport['connectInternal'];

          transport['connectInternal'] = vi.fn().mockImplementation(async () => {
            attempts++;
            if (attempts < 3) {
              throw new Error(`Connection attempt ${attempts} failed`);
            }
            transport['connected'] = true;
            transport['emit']({ type: 'connected' });
          });

          const connectPromise = transport.connect();

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(3000);

          await connectPromise;

          expect(attempts).toBe(3);
          expect(transport.isConnected()).toBe(true);
        }, 10000);

        it('should fail after max retry attempts for connection', async () => {
          // Add error handler to prevent unhandled rejection
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          const connectError = new Error('Persistent connection failure');
          transport['connectInternal'] = vi.fn().mockRejectedValue(connectError);

          const connectPromise = transport.connect();

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(5000);

          await expect(connectPromise).rejects.toThrow('Failed to connect to transport');

          // Should have tried 4 times (initial + 3 retries)
          expect(transport['connectInternal']).toHaveBeenCalledTimes(4);

          // Verify error was also emitted as event
          expect(errorHandler).toHaveBeenCalled();
        }, 10000);
      });

      describe('Send retry behavior', () => {
        it('should retry send attempts when connected', async () => {
          await transport.connect();

          let attempts = 0;
          const _originalSendInternal = transport['sendInternal'];

          transport['sendInternal'] = vi.fn().mockImplementation(async (data) => {
            attempts++;
            if (attempts < 2) {
              throw new Error(`Send attempt ${attempts} failed`);
            }
            // Success on second attempt
            transport['emit']({ type: 'message', data });
          });

          const sendPromise = transport.send({ test: 'data' });

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(1000);

          await sendPromise;

          expect(attempts).toBe(2);
        }, 10000);

        it('should fail send after max retry attempts', async () => {
          // Add error handler to prevent unhandled rejection
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          await transport.connect();

          const sendError = new Error('Persistent send failure');
          transport['sendInternal'] = vi.fn().mockRejectedValue(sendError);

          const sendPromise = transport.send({ test: 'data' });

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(2000);

          await expect(sendPromise).rejects.toThrow('Failed to send message through transport');

          // Should have tried 3 times (initial + 2 retries)
          expect(transport['sendInternal']).toHaveBeenCalledTimes(3);

          // Verify error was also emitted as event
          expect(errorHandler).toHaveBeenCalled();
        }, 10000);

        it('should advance timers during retry delays', async () => {
          let attempts = 0;
          transport['connectInternal'] = vi.fn().mockImplementation(async () => {
            attempts++;
            if (attempts < 3) {
              throw new Error('Connection failed');
            }
            transport['connected'] = true;
          });

          const connectPromise = transport.connect();

          // Advance timers to skip the retry delays
          await testEnv.advanceTimers(3000); // 3 seconds should cover all delays

          await connectPromise;
          expect(attempts).toBe(3);
        });
      });
    });

    describe('Error Handling and Emission', () => {
      describe('Error event emission', () => {
        it('should emit error events on connection failure', async () => {
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          const connectError = new Error('Connection failed');
          transport['connectInternal'] = vi.fn().mockRejectedValue(connectError);

          const connectPromise = transport.connect();

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(5000);

          await expect(connectPromise).rejects.toThrow();

          expect(errorHandler).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'error',
              error: expect.objectContaining({
                code: 'connection_failed', // connectionFailed error code
                message: 'Failed to connect to transport',
              }),
            }),
          );
        }, 10000);

        it('should emit error events on disconnect failure', async () => {
          await transport.connect();

          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          const disconnectError = new Error('Disconnect failed');
          transport['disconnectInternal'] = vi.fn().mockRejectedValue(disconnectError);

          await expect(transport.disconnect()).rejects.toThrow();

          expect(errorHandler).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'error',
              error: expect.objectContaining({
                code: 'transport_disconnected', // transportDisconnected error code
                message: 'Failed to disconnect from transport',
              }),
            }),
          );
        }, 10000);

        it('should emit error events on send failure', async () => {
          await transport.connect();

          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          const sendError = new Error('Send failed');
          transport['sendInternal'] = vi.fn().mockRejectedValue(sendError);

          const sendPromise = transport.send({ test: 'data' });

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(2000);

          await expect(sendPromise).rejects.toThrow();

          expect(errorHandler).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'error',
              error: expect.objectContaining({
                code: 'message_failed', // messageFailed error code
                message: 'Failed to send message through transport',
              }),
            }),
          );
        }, 10000);

        it('should handle errors in error event emission', async () => {
          const connectError = new Error('Connection failed');
          transport['connectInternal'] = vi.fn().mockRejectedValue(connectError);

          // Mock emit to throw error
          const originalEmit = transport['emit'];
          transport['emit'] = vi.fn().mockImplementation(() => {
            throw new Error('Event emission failed');
          });

          const connectPromise = transport.connect();

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(5000);

          // Should not throw despite emit failure
          await expect(connectPromise).rejects.toThrow('Failed to connect to transport');

          transport['emit'] = originalEmit;
        }, 10000);
      });

      describe('Error logging', () => {
        it('should log errors properly', async () => {
          // Add error handler to prevent unhandled rejection
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          const connectError = new Error('Connection failed');
          transport['connectInternal'] = vi.fn().mockRejectedValue(connectError);

          const connectPromise = transport.connect();

          // Advance timers to handle retry delays
          await testEnv.advanceTimers(5000);

          await expect(connectPromise).rejects.toThrow();

          // Verify error was logged (logError converts ModalError to { error: string })
          expect(transport['logger'].error).toHaveBeenCalledWith(
            'Connection failed',
            expect.objectContaining({
              error: expect.stringContaining('[object Object]'),
            }),
          );
        }, 10000);
      });

      describe('Advanced error event handling', () => {
        it('should convert non-ModalError to ModalError in emitErrorEvent', () => {
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          const genericError = new Error('Generic error');
          transport['emitErrorEvent'](genericError);

          expect(errorHandler).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'error',
              error: expect.objectContaining({
                code: 'transport_unavailable', // transportError error code
                message: 'Generic error',
              }),
            }),
          );
        });

        it('should preserve ModalError in emitErrorEvent', () => {
          const errorHandler = vi.fn();
          transport.on('error', errorHandler);

          const modalError = {
            code: 'custom_error',
            message: 'Custom modal error',
            category: 'transport',
            fatal: false,
          };

          transport['emitErrorEvent'](modalError);

          expect(errorHandler).toHaveBeenCalledWith(
            expect.objectContaining({
              type: 'error',
              error: modalError,
            }),
          );
        });
      });
    });
  });

  describe('Lifecycle Management', () => {
    describe('Destroy Functionality', () => {
      it('should destroy transport when connected', async () => {
        await transport.connect();
        expect(transport.isConnected()).toBe(true);

        const disconnectedHandler = vi.fn();
        transport.on('disconnected', disconnectedHandler);

        await transport.destroy();

        expect(transport.isConnected()).toBe(false);
        expect(transport['subscriptions'].size).toBe(0);
        // Handler should be called during disconnect, before clearAllEventListeners
        expect(disconnectedHandler).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'disconnected',
          }),
        );
      });

      it('should destroy transport when not connected', async () => {
        expect(transport.isConnected()).toBe(false);

        const disconnectedHandler = vi.fn();
        transport.on('disconnected', disconnectedHandler);

        await transport.destroy();

        expect(transport.isConnected()).toBe(false);
        expect(transport['subscriptions'].size).toBe(0);
        // Handler should not be called since transport wasn't connected (no disconnect call)
        // and clearAllEventListeners removes listeners before final emit
        expect(disconnectedHandler).not.toHaveBeenCalled();
      });

      it('should handle disconnect errors during destroy', async () => {
        await transport.connect();

        const disconnectError = new Error('Disconnect failed during destroy');
        transport['disconnectInternal'] = vi.fn().mockRejectedValue(disconnectError);

        // Should not throw despite disconnect error
        await expect(transport.destroy()).resolves.not.toThrow();

        // Should log both the disconnect error and the destroy error
        expect(transport['logger'].error).toHaveBeenCalledWith('Disconnect failed', expect.any(Object));
        expect(transport['logger'].error).toHaveBeenCalledWith(
          'Error disconnecting during destroy',
          expect.any(Object),
        );
      });

      it('should handle errors during destroy process', async () => {
        await transport.connect();

        // Mock clearAllEventListeners to throw
        transport['clearAllEventListeners'] = vi.fn().mockImplementation(() => {
          throw new Error('Cleanup failed');
        });

        await expect(transport.destroy()).rejects.toThrow('Failed to properly destroy transport');

        expect(transport['logger'].error).toHaveBeenCalledWith(
          'Error during transport destroy',
          expect.objectContaining({
            message: 'Cleanup failed',
          }),
        );
      });

      it('should handle errors in error emission during destroy', async () => {
        await transport.connect();

        // Mock both clearAllEventListeners and emit to throw
        transport['clearAllEventListeners'] = vi.fn().mockImplementation(() => {
          throw new Error('Cleanup failed');
        });

        const originalEmit = transport['emit'];
        transport['emit'] = vi.fn().mockImplementation(() => {
          throw new Error('Event emission failed');
        });

        await expect(transport.destroy()).rejects.toThrow('Failed to properly destroy transport');

        expect(transport['logger'].error).toHaveBeenCalledWith(
          'Failed to emit error event during destroy',
          expect.objectContaining({
            message: 'Event emission failed',
          }),
        );

        transport['emit'] = originalEmit;
      });
    });

    describe('Logger Methods', () => {
      it('should log debug messages', () => {
        transport['log']('debug', 'Debug message', { data: 'test' });

        expect(transport['logger'].debug).toHaveBeenCalledWith('Debug message', { data: 'test' });
      });

      it('should log info messages', () => {
        transport['log']('info', 'Info message');

        expect(transport['logger'].info).toHaveBeenCalledWith('Info message', undefined);
      });

      it('should log warn messages', () => {
        transport['log']('warn', 'Warning message', { warning: true });

        expect(transport['logger'].warn).toHaveBeenCalledWith('Warning message', { warning: true });
      });

      it('should log error messages', () => {
        transport['log']('error', 'Error message', { error: 'details' });

        expect(transport['logger'].error).toHaveBeenCalledWith('Error message', { error: 'details' });
      });

      it('should log Error objects correctly', () => {
        const error = new Error('Test error');
        error.name = 'TestError';

        transport['logError']('Error occurred', error, { context: 'test' });

        expect(transport['logger'].error).toHaveBeenCalledWith('Error occurred', {
          message: 'Test error',
          name: 'TestError',
          context: 'test',
        });
      });

      it('should log non-Error objects correctly', () => {
        const error = 'String error';

        transport['logError']('Error occurred', error);

        expect(transport['logger'].error).toHaveBeenCalledWith('Error occurred', {
          error: 'String error',
        });
      });

      it('should get user-friendly error messages', () => {
        const mockError = new Error('Technical error');
        const mockUserMessage = 'User-friendly message';

        transport['errorHandler'].getUserMessage = vi.fn().mockReturnValue(mockUserMessage);

        const result = transport['getErrorMessage'](mockError);

        expect(result).toBe(mockUserMessage);
        expect(transport['errorHandler'].getUserMessage).toHaveBeenCalledWith(mockError);
      });
    });
  });
});
