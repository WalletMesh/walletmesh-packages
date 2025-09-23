import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSONRPCError } from '../error.js';
import {
  ErrorSeverity,
  ReceiveErrorCategory,
  ReceiveErrorHandler,
  type ReceiveErrorHandlerConfig,
} from './receiveErrorHandler.js';

describe('ReceiveErrorHandler', () => {
  let errorHandler: ReceiveErrorHandler;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Error Categorization', () => {
    it('should categorize JSON-RPC parse errors correctly', async () => {
      const config: ReceiveErrorHandlerConfig = {
        handlers: {
          [ReceiveErrorCategory.PARSE]: vi.fn(),
        },
      };
      errorHandler = new ReceiveErrorHandler(config);

      const error = new JSONRPCError(-32700, 'Parse error');
      await errorHandler.handleError(error, '{"invalid json}');

      // biome-ignore lint/style/noNonNullAssertion: Config handlers are defined in test setup
      expect(config.handlers![ReceiveErrorCategory.PARSE]).toHaveBeenCalledWith(
        expect.objectContaining({
          category: ReceiveErrorCategory.PARSE,
          severity: ErrorSeverity.HIGH,
          error,
        }),
      );
    });

    it('should categorize validation errors correctly', async () => {
      const config: ReceiveErrorHandlerConfig = {
        handlers: {
          [ReceiveErrorCategory.VALIDATION]: vi.fn(),
        },
      };
      errorHandler = new ReceiveErrorHandler(config);

      const error = new JSONRPCError(-32600, 'Invalid Request');
      await errorHandler.handleError(error, { jsonrpc: '1.0' });

      // biome-ignore lint/style/noNonNullAssertion: Config handlers are defined in test setup
      expect(config.handlers![ReceiveErrorCategory.VALIDATION]).toHaveBeenCalledWith(
        expect.objectContaining({
          category: ReceiveErrorCategory.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
        }),
      );
    });

    it('should categorize method errors correctly', async () => {
      const config: ReceiveErrorHandlerConfig = {
        handlers: {
          [ReceiveErrorCategory.METHOD]: vi.fn(),
        },
      };
      errorHandler = new ReceiveErrorHandler(config);

      const error = new JSONRPCError(-32601, 'Method not found');
      await errorHandler.handleError(error, { jsonrpc: '2.0', method: 'unknown', id: 1 });

      // biome-ignore lint/style/noNonNullAssertion: Config handlers are defined in test setup
      expect(config.handlers![ReceiveErrorCategory.METHOD]).toHaveBeenCalledWith(
        expect.objectContaining({
          category: ReceiveErrorCategory.METHOD,
          severity: ErrorSeverity.LOW,
        }),
      );
    });

    it('should categorize transport errors correctly', async () => {
      const config: ReceiveErrorHandlerConfig = {
        handlers: {
          [ReceiveErrorCategory.TRANSPORT]: vi.fn(),
        },
      };
      errorHandler = new ReceiveErrorHandler(config);

      const error = new Error('Transport connection failed');
      await errorHandler.handleError(error, null);

      // biome-ignore lint/style/noNonNullAssertion: Config handlers are defined in test setup
      expect(config.handlers![ReceiveErrorCategory.TRANSPORT]).toHaveBeenCalledWith(
        expect.objectContaining({
          category: ReceiveErrorCategory.TRANSPORT,
          severity: ErrorSeverity.HIGH,
        }),
      );
    });

    it('should categorize unknown errors correctly', async () => {
      const config: ReceiveErrorHandlerConfig = {
        handlers: {
          [ReceiveErrorCategory.UNKNOWN]: vi.fn(),
        },
      };
      errorHandler = new ReceiveErrorHandler(config);

      const error = new Error('Something unexpected happened');
      await errorHandler.handleError(error, null);

      // biome-ignore lint/style/noNonNullAssertion: Config handlers are defined in test setup
      expect(config.handlers![ReceiveErrorCategory.UNKNOWN]).toHaveBeenCalledWith(
        expect.objectContaining({
          category: ReceiveErrorCategory.UNKNOWN,
          severity: ErrorSeverity.CRITICAL,
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should call global handler for all errors', async () => {
      const globalHandler = vi.fn();
      const config: ReceiveErrorHandlerConfig = {
        globalHandler,
      };
      errorHandler = new ReceiveErrorHandler(config);

      const errors = [
        new JSONRPCError(-32700, 'Parse error'),
        new JSONRPCError(-32600, 'Invalid Request'),
        new Error('Unknown error'),
      ];

      for (const error of errors) {
        await errorHandler.handleError(error, null);
      }

      expect(globalHandler).toHaveBeenCalledTimes(3);
    });

    it('should handle errors in handlers gracefully', async () => {
      const failingHandler = vi.fn().mockRejectedValue(new Error('Handler error'));
      const config: ReceiveErrorHandlerConfig = {
        handlers: {
          [ReceiveErrorCategory.PARSE]: failingHandler,
        },
        logger: vi.fn(),
      };
      errorHandler = new ReceiveErrorHandler(config);

      const error = new JSONRPCError(-32700, 'Parse error');
      await errorHandler.handleError(error, null);

      expect(config.logger).toHaveBeenCalledWith(
        'Error in error handler',
        expect.objectContaining({ category: ReceiveErrorCategory.PARSE }),
      );
    });

    it('should provide recovery suggestions', async () => {
      const handler = vi.fn();
      const config: ReceiveErrorHandlerConfig = {
        handlers: {
          [ReceiveErrorCategory.METHOD]: handler,
        },
      };
      errorHandler = new ReceiveErrorHandler(config);

      const error = new JSONRPCError(-32601, 'Method not found');
      await errorHandler.handleError(error, { method: 'unknownMethod' });

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          recoveryAction: 'Register the missing method handler',
        }),
      );
    });
  });

  describe('Circuit Breaker', () => {
    it('should activate circuit breaker on high error rate', async () => {
      const fakeTime = 1000000; // Start at a reasonable timestamp
      const logger = vi.fn();
      const config: ReceiveErrorHandlerConfig = {
        maxErrorRate: 3,
        errorRateWindow: 1000,
        logger,
        logToConsole: false, // Disable default console logging
        recoveryStrategy: {
          disconnectOnCritical: false, // Disable critical disconnect logging
        },
        timeSource: () => fakeTime, // Use fake time that we can control
        disableThrottling: true, // Disable throttling for testing
      };
      errorHandler = new ReceiveErrorHandler(config);

      // Check current stats before
      const statsBefore = errorHandler.getErrorStats();
      expect(statsBefore.circuitBreakerOpen).toBe(false);

      // Generate first error
      await errorHandler.handleError(new Error('Error 0'), null);
      const statsAfterOne = errorHandler.getErrorStats();
      expect(statsAfterOne.totalErrors).toBe(1);
      expect(statsAfterOne.circuitBreakerOpen).toBe(false);

      // Generate second error
      await errorHandler.handleError(new Error('Error 1'), null);
      const statsAfterTwo = errorHandler.getErrorStats();
      expect(statsAfterTwo.totalErrors).toBe(2);
      expect(statsAfterTwo.circuitBreakerOpen).toBe(false);

      // Generate third error to trigger circuit breaker
      await errorHandler.handleError(new Error('Error 2'), null);
      const statsAfterThree = errorHandler.getErrorStats();
      expect(statsAfterThree.totalErrors).toBe(3);
      expect(statsAfterThree.circuitBreakerOpen).toBe(true);

      expect(logger).toHaveBeenCalledWith(
        'Circuit breaker activated due to high error rate',
        expect.any(Object),
      );

      // Additional errors should be dropped
      await errorHandler.handleError(new Error('Dropped error'), null);
      expect(logger).toHaveBeenCalledWith('Error dropped by circuit breaker', expect.any(Object));

      // Verify total errors is still 3 (dropped error not counted)
      const finalStats = errorHandler.getErrorStats();
      expect(finalStats.totalErrors).toBe(3);
    });

    it('should deactivate circuit breaker when error rate drops', async () => {
      let fakeTime = 1000000; // Start at a reasonable timestamp
      const logger = vi.fn();
      const config: ReceiveErrorHandlerConfig = {
        maxErrorRate: 3,
        errorRateWindow: 1000,
        logger,
        logToConsole: false, // Disable default console logging
        recoveryStrategy: {
          disconnectOnCritical: false, // Disable critical disconnect logging
        },
        timeSource: () => fakeTime, // Use fake time that we can control
        disableThrottling: true, // Disable throttling for testing
      };
      errorHandler = new ReceiveErrorHandler(config);

      // Trigger circuit breaker first by generating 3 errors
      await errorHandler.handleError(new Error('Error 0'), null);
      await errorHandler.handleError(new Error('Error 1'), null);
      await errorHandler.handleError(new Error('Error 2'), null);

      // Verify circuit breaker is active
      expect(errorHandler.getErrorStats().circuitBreakerOpen).toBe(true);

      // Wait for errors to expire from window
      fakeTime += 1500;

      // Generate a new error to trigger circuit breaker check
      await errorHandler.handleError(new Error('New error'), null);

      expect(logger).toHaveBeenCalledWith('Circuit breaker deactivated', expect.any(Object));
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics correctly', async () => {
      errorHandler = new ReceiveErrorHandler();

      const errors = [
        new JSONRPCError(-32700, 'Parse error'),
        new JSONRPCError(-32600, 'Invalid Request'),
        new JSONRPCError(-32601, 'Method not found'),
        new Error('Transport error: connection lost'),
        new Error('Unknown error'),
      ];

      for (const error of errors) {
        await errorHandler.handleError(error, null);
      }

      const stats = errorHandler.getErrorStats();

      expect(stats.totalErrors).toBe(5);
      expect(stats.errorsByCategory[ReceiveErrorCategory.PARSE]).toBe(1);
      expect(stats.errorsByCategory[ReceiveErrorCategory.VALIDATION]).toBe(1);
      expect(stats.errorsByCategory[ReceiveErrorCategory.METHOD]).toBe(1);
      expect(stats.errorsByCategory[ReceiveErrorCategory.TRANSPORT]).toBe(1);
      expect(stats.errorsByCategory[ReceiveErrorCategory.UNKNOWN]).toBe(1);
      expect(stats.recentErrors).toHaveLength(5);
    });

    it('should clear error history', async () => {
      errorHandler = new ReceiveErrorHandler();

      await errorHandler.handleError(new Error('Error 1'), null);
      await errorHandler.handleError(new Error('Error 2'), null);

      errorHandler.clearHistory();
      const stats = errorHandler.getErrorStats();

      expect(stats.totalErrors).toBe(0);
      expect(stats.recentErrors).toHaveLength(0);
      expect(stats.circuitBreakerOpen).toBe(false);
    });
  });

  describe('Handler Registration', () => {
    it('should register and unregister handlers dynamically', async () => {
      errorHandler = new ReceiveErrorHandler();

      const dynamicHandler = vi.fn();
      const cleanup = errorHandler.registerHandler(ReceiveErrorCategory.PARSE, dynamicHandler);

      const error = new JSONRPCError(-32700, 'Parse error');
      await errorHandler.handleError(error, null);

      expect(dynamicHandler).toHaveBeenCalledTimes(1);

      // Unregister handler
      cleanup();

      await errorHandler.handleError(error, null);
      expect(dynamicHandler).toHaveBeenCalledTimes(1); // Not called again
    });
  });

  describe('Logging', () => {
    it('should log errors based on severity', async () => {
      errorHandler = new ReceiveErrorHandler({ logToConsole: true });

      // Low severity
      await errorHandler.handleError(new JSONRPCError(-32601, 'Method not found'), null);
      expect(consoleDebugSpy).toHaveBeenCalled();

      // Medium severity
      await errorHandler.handleError(new JSONRPCError(-32600, 'Invalid Request'), null);
      expect(consoleWarnSpy).toHaveBeenCalled();

      // High severity
      await errorHandler.handleError(new JSONRPCError(-32700, 'Parse error'), null);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Critical severity
      await errorHandler.handleError(new Error('Unknown critical error'), null);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should respect logToConsole setting', async () => {
      errorHandler = new ReceiveErrorHandler({ logToConsole: false });

      await errorHandler.handleError(new Error('Test error'), null);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should use custom logger if provided', async () => {
      const customLogger = vi.fn();
      errorHandler = new ReceiveErrorHandler({
        logToConsole: true,
        logger: customLogger,
      });

      await errorHandler.handleError(new Error('Test error'), null);

      expect(customLogger).toHaveBeenCalled();
    });
  });

  describe('Enhanced Node Integration', () => {
    it('should enhance JSONRPCNode with error handling', () => {
      const originalOnMessage = vi.fn();
      const mockTransport = {
        send: vi.fn(),
        onMessage: originalOnMessage,
      };

      const mockNode = {
        transport: mockTransport,
        // biome-ignore lint/suspicious/noExplicitAny: Mock node for testing enhanceNode functionality
      } as any;

      const { node, errorHandler: enhancedErrorHandler } = ReceiveErrorHandler.enhanceNode(mockNode, {
        logToConsole: false, // Disable console logging
      });

      expect(node).toBe(mockNode);
      expect(enhancedErrorHandler).toBeInstanceOf(ReceiveErrorHandler);

      // Verify transport was replaced with enhanced version
      expect(node.transport).not.toBe(mockTransport);
      expect(node.transport.send).toBe(mockTransport.send);
      expect(typeof node.transport.onMessage).toBe('function');

      // Test that the enhanced onMessage works
      const testCallback = vi.fn();
      node.transport.onMessage(testCallback);
      expect(originalOnMessage).toHaveBeenCalled();
    });
  });
});
