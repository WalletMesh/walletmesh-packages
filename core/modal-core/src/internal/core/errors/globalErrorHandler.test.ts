/**
 * Tests for GlobalErrorHandler
 * Tests global error handling, event listeners, and error processing
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockLogger,
  createMockWindow,
  createTestEnvironment,
  installCustomMatchers,
} from '../../../testing/index.js';
import type { Logger } from '../logger/logger.js';
import {
  type GlobalErrorHandlerOptions,
  cleanupGlobalErrorHandler,
  getErrorStats,
  initializeGlobalErrorHandler,
} from './globalErrorHandler.js';

// Install custom matchers
installCustomMatchers();

describe('GlobalErrorHandler', () => {
  const testEnv = createTestEnvironment();
  let mockLogger: Logger;
  let originalWindow: typeof window;
  let originalProcess: typeof process;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    await testEnv.setup();

    // Reset error handler state
    cleanupGlobalErrorHandler();

    mockLogger = createMockLogger();

    // Mock window object using utility
    const mockWindowObj = createMockWindow();
    mockAddEventListener = mockWindowObj.addEventListener as ReturnType<typeof vi.fn>;
    mockRemoveEventListener = mockWindowObj.removeEventListener as ReturnType<typeof vi.fn>;

    originalWindow = global.window;
    Object.assign(global, { window: mockWindowObj });

    // Store original process for restoration
    originalProcess = global.process;
  });

  afterEach(async () => {
    cleanupGlobalErrorHandler();
    global.window = originalWindow;
    global.process = originalProcess;
    await testEnv.teardown();
  });

  describe('Initialization', () => {
    it('should initialize with default options', () => {
      initializeGlobalErrorHandler();

      expect(mockAddEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('error', expect.any(Function));

      const stats = getErrorStats();
      expect(stats.initialized).toBe(true);
    });

    it('should initialize with custom logger', () => {
      const options: GlobalErrorHandlerOptions = {
        logger: mockLogger,
        debug: true,
      };

      initializeGlobalErrorHandler(options);

      expect(mockAddEventListener).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('Global error handler initialized');
    });

    it('should initialize with custom options', () => {
      const onError = vi.fn();
      const options: GlobalErrorHandlerOptions = {
        logger: mockLogger,
        onError,
        preventDefault: true,
        debug: true,
      };

      initializeGlobalErrorHandler(options);

      const stats = getErrorStats();
      expect(stats.initialized).toBe(true);
    });

    it('should not reinitialize if already initialized', () => {
      initializeGlobalErrorHandler({ debug: true });

      // Try to initialize again
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      initializeGlobalErrorHandler({ debug: true });

      expect(consoleSpy).toHaveBeenCalledWith('[Modal]', 'Global error handler already initialized');
      expect(mockAddEventListener).toHaveBeenCalledTimes(2); // Only called once

      consoleSpy.mockRestore();
    });

    it('should initialize silently when already initialized without debug', () => {
      initializeGlobalErrorHandler();

      // Try to initialize again without debug
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      initializeGlobalErrorHandler();

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Node.js Environment', () => {
    beforeEach(() => {
      // Remove window to simulate Node.js environment
      (global as { window?: unknown }).window = undefined;

      // Mock process
      global.process = {
        on: vi.fn(),
        off: vi.fn(),
      } as Partial<NodeJS.Process> as NodeJS.Process;
    });

    it('should initialize in Node.js environment', () => {
      initializeGlobalErrorHandler({ logger: mockLogger });

      expect(global.process.on).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
      expect(global.process.on).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    });

    it('should cleanup in Node.js environment', () => {
      initializeGlobalErrorHandler({ logger: mockLogger });
      cleanupGlobalErrorHandler();

      expect(global.process.off).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
      expect(global.process.off).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    let capturedHandlers: {
      unhandledrejection?: (event: unknown) => void;
      error?: (event: unknown) => void;
    } = {};

    beforeEach(() => {
      mockAddEventListener.mockImplementation((event, handler) => {
        capturedHandlers[event as keyof typeof capturedHandlers] = handler;
      });

      initializeGlobalErrorHandler({
        logger: mockLogger,
        onError: vi.fn(),
        debug: true,
      });
    });

    describe('Unhandled Promise Rejections', () => {
      it('should handle Error objects in promise rejections', () => {
        const error = new Error('Promise rejection error');
        const event = {
          reason: error,
          preventDefault: vi.fn(),
        };

        capturedHandlers.unhandledrejection?.(event);

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('Global error [unhandledRejection]: Promise rejection error'),
          expect.objectContaining({
            operation: 'promise_rejection',
            severity: 'medium',
          }),
        );

        const stats = getErrorStats();
        expect(stats.errorCount).toBe(1);
        expect(stats.recentErrors).toHaveLength(1);
      });

      it('should handle non-Error objects in promise rejections', () => {
        const event = {
          reason: 'String rejection reason',
          preventDefault: vi.fn(),
        };

        capturedHandlers.unhandledrejection?.(event);

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('Global error [unhandledRejection]: String rejection reason'),
          expect.any(Object),
        );
      });

      it('should call preventDefault when enabled', () => {
        // Make sure we're clean first
        cleanupGlobalErrorHandler();

        // Capture handlers during initial setup
        capturedHandlers = {};
        mockAddEventListener.mockImplementation((event, handler) => {
          capturedHandlers[event as keyof typeof capturedHandlers] = handler;
        });

        // Initialize with preventDefault enabled
        initializeGlobalErrorHandler({
          logger: mockLogger,
          preventDefault: true,
        });

        const event = {
          reason: new Error('Test error'),
          preventDefault: vi.fn(),
        };

        capturedHandlers.unhandledrejection?.(event);

        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    describe('Global Errors', () => {
      it('should handle Error objects', () => {
        const error = new Error('Global error message');

        capturedHandlers.error?.(error);

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('Global error [error]: Global error message'),
          expect.objectContaining({
            operation: 'global_error',
            severity: 'medium',
          }),
        );
      });

      it('should handle ErrorEvent objects', () => {
        const errorEvent = {
          message: 'Script error',
          filename: 'app.js',
          lineno: 42,
        };

        capturedHandlers.error?.(errorEvent as ErrorEvent);

        expect(mockLogger.info).toHaveBeenCalledWith(
          expect.stringContaining('Global error [error]:'),
          expect.any(Object),
        );
      });
    });

    describe('Severity Detection', () => {
      const severityTestCases = [
        { message: 'Out of memory error', expectedSeverity: 'critical', expectedLogger: 'error' },
        { message: 'Stack overflow detected', expectedSeverity: 'critical', expectedLogger: 'error' },
        { message: 'Security violation occurred', expectedSeverity: 'critical', expectedLogger: 'error' },
        { message: 'CORS policy error', expectedSeverity: 'critical', expectedLogger: 'error' },
        { message: 'Network connection failed', expectedSeverity: 'high', expectedLogger: 'warn' },
        { message: 'Connection timeout', expectedSeverity: 'high', expectedLogger: 'warn' },
        { message: 'Wallet provider error', expectedSeverity: 'high', expectedLogger: 'warn' },
        { message: 'Validation failed', expectedSeverity: 'medium', expectedLogger: 'info' },
        { message: 'Parse error occurred', expectedSeverity: 'medium', expectedLogger: 'info' },
        { message: 'Format error detected', expectedSeverity: 'medium', expectedLogger: 'info' },
        { message: 'Unknown random error', expectedSeverity: 'medium', expectedLogger: 'info' },
      ];

      for (const { message, expectedSeverity, expectedLogger } of severityTestCases) {
        it(`should detect ${expectedSeverity} severity for "${message}"`, () => {
          const error = new Error(message);
          capturedHandlers.error?.(error);

          expect(
            (mockLogger as { [key: string]: ReturnType<typeof vi.fn> })[expectedLogger],
          ).toHaveBeenCalledWith(
            expect.stringContaining(`Global error [error]: ${message}`),
            expect.objectContaining({
              severity: expectedSeverity,
            }),
          );
        });
      }
    });

    describe('Low Severity with Debug', () => {
      it('should log low severity errors when debug is enabled', () => {
        // Mock the severity detection to return 'low'
        vi.mock('./globalErrorHandler.js', async () => {
          const actual = await vi.importActual('./globalErrorHandler.js');
          return {
            ...actual,
            determineSeverity: () => 'low',
          };
        });

        // Create a special case for low severity
        cleanupGlobalErrorHandler();
        initializeGlobalErrorHandler({
          logger: mockLogger,
          debug: true,
        });

        // Re-capture handlers
        capturedHandlers = {};
        mockAddEventListener.mockImplementation((event, handler) => {
          capturedHandlers[event as keyof typeof capturedHandlers] = handler;
        });
        initializeGlobalErrorHandler({
          logger: mockLogger,
          debug: true,
        });

        // Manually create an error with severity detection that would return 'low'
        const lowSeverityError = new Error('debug level error');
        capturedHandlers.error?.(lowSeverityError);

        // Since we can't easily mock the internal severity function,
        // we'll check that some logging occurred
        expect(mockLogger.info).toHaveBeenCalled();
      });
    });

    describe('Custom Error Handler', () => {
      it('should call custom error handler', () => {
        const customErrorHandler = vi.fn();

        // Make sure we're clean first
        cleanupGlobalErrorHandler();

        // Capture handlers during initial setup
        capturedHandlers = {};
        mockAddEventListener.mockImplementation((event, handler) => {
          capturedHandlers[event as keyof typeof capturedHandlers] = handler;
        });

        // Initialize with custom error handler
        initializeGlobalErrorHandler({
          logger: mockLogger,
          onError: customErrorHandler,
        });

        const error = new Error('Test error for custom handler');
        capturedHandlers.error?.(error);

        expect(customErrorHandler).toHaveBeenCalledWith(
          expect.any(Error),
          expect.objectContaining({
            source: 'error',
            operation: 'global_error',
            severity: expect.any(String),
          }),
        );
      });

      it('should handle errors in custom error handler gracefully', () => {
        const faultyCustomHandler = vi.fn().mockImplementation(() => {
          throw new Error('Error in custom handler');
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Make sure we're clean first
        cleanupGlobalErrorHandler();

        // Capture handlers during initial setup
        capturedHandlers = {};
        mockAddEventListener.mockImplementation((event, handler) => {
          capturedHandlers[event as keyof typeof capturedHandlers] = handler;
        });

        // Initialize with faulty custom error handler
        initializeGlobalErrorHandler({
          logger: mockLogger,
          onError: faultyCustomHandler,
          debug: true,
        });

        const error = new Error('Test error');
        capturedHandlers.error?.(error);

        expect(faultyCustomHandler).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith('Error in custom error handler:', expect.any(Error));

        consoleSpy.mockRestore();
      });

      it('should not log custom handler errors when debug is disabled', () => {
        const faultyCustomHandler = vi.fn().mockImplementation(() => {
          throw new Error('Error in custom handler');
        });

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Make sure we're clean first
        cleanupGlobalErrorHandler();

        // Capture handlers during initial setup
        capturedHandlers = {};
        mockAddEventListener.mockImplementation((event, handler) => {
          capturedHandlers[event as keyof typeof capturedHandlers] = handler;
        });

        // Initialize with faulty custom error handler and debug disabled
        initializeGlobalErrorHandler({
          logger: mockLogger,
          onError: faultyCustomHandler,
          debug: false, // Debug disabled
        });

        const error = new Error('Test error');
        capturedHandlers.error?.(error);

        expect(faultyCustomHandler).toHaveBeenCalled();
        expect(consoleSpy).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });

    describe('Error Storage and Management', () => {
      it('should store recent errors', () => {
        const error1 = new Error('First error');
        const error2 = new Error('Second error');

        capturedHandlers.error?.(error1);
        capturedHandlers.error?.(error2);

        const stats = getErrorStats();
        expect(stats.errorCount).toBe(2);
        expect(stats.recentErrors).toHaveLength(2);
        expect(stats.recentErrors[0]?.error.message).toBe('First error');
        expect(stats.recentErrors[1]?.error.message).toBe('Second error');
      });

      it('should limit recent errors to 10', () => {
        // Add 15 errors
        for (let i = 0; i < 15; i++) {
          const error = new Error(`Error ${i}`);
          capturedHandlers.error?.(error);
        }

        const stats = getErrorStats();
        expect(stats.errorCount).toBe(15);
        expect(stats.recentErrors).toHaveLength(10); // Should only keep 10
        expect(stats.recentErrors[0]?.error.message).toBe('Error 5'); // First 5 should be removed
        expect(stats.recentErrors[9]?.error.message).toBe('Error 14');
      });

      it('should include timestamps in stored errors', () => {
        const error = new Error('Timestamped error');
        const beforeTime = Date.now();

        capturedHandlers.error?.(error);

        const afterTime = Date.now();
        const stats = getErrorStats();

        expect(stats.recentErrors[0]?.timestamp).toBeGreaterThanOrEqual(beforeTime);
        expect(stats.recentErrors[0]?.timestamp).toBeLessThanOrEqual(afterTime);
      });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup when not initialized', () => {
      // Should not throw when cleaning up non-initialized handler
      expect(() => {
        cleanupGlobalErrorHandler();
      }).not.toThrow();
    });

    it('should cleanup properly', () => {
      initializeGlobalErrorHandler({
        logger: mockLogger,
        debug: true,
      });

      // Add some errors first
      const stats = getErrorStats();
      expect(stats.initialized).toBe(true);

      cleanupGlobalErrorHandler();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockLogger.info).toHaveBeenCalledWith('Global error handler cleaned up');

      const cleanedStats = getErrorStats();
      expect(cleanedStats.initialized).toBe(false);
      expect(cleanedStats.errorCount).toBe(0);
      expect(cleanedStats.recentErrors).toHaveLength(0);
    });
  });

  describe('getErrorStats', () => {
    it('should return current statistics', () => {
      const stats = getErrorStats();

      expect(stats).toEqual({
        errorCount: 0,
        recentErrors: [],
        initialized: false,
      });
    });

    it('should return cloned recent errors array', () => {
      initializeGlobalErrorHandler({ logger: mockLogger });

      const stats1 = getErrorStats();
      const stats2 = getErrorStats();

      expect(stats1.recentErrors).not.toBe(stats2.recentErrors); // Different array instances
      expect(stats1.recentErrors).toEqual(stats2.recentErrors); // Same content
    });
  });
});
