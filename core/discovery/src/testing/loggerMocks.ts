import type { Logger } from '../core/logger.js';
import { ConsoleLogger } from '../core/logger.js';

/**
 * Silent logger that discards all log messages.
 *
 * Useful for testing when you want to suppress console output
 * without losing the ability to inject a logger into components.
 *
 * @example
 * ```typescript
 * import { SilentLogger } from '@walletmesh/discovery/testing';
 *
 * const initiator = createDiscoveryInitiator({
 *   requirements: { ... },
 *   initiatorInfo: { ... },
 *   logger: new SilentLogger()  // No console output during tests
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export class SilentLogger implements Logger {
  debug(_message: string, _data?: unknown): void {
    // Silent - do nothing
  }

  info(_message: string, _data?: unknown): void {
    // Silent - do nothing
  }

  warn(_message: string, _data?: unknown): void {
    // Silent - do nothing
  }

  error(_message: string, _error?: unknown): void {
    // Silent - do nothing
  }
}

/**
 * Mock logger that captures all log calls for testing assertions.
 *
 * Uses Vitest mock functions to track calls and enable assertions
 * about what messages were logged during test execution.
 *
 * Note: This class requires Vitest to be available and should only
 * be used in testing environments.
 *
 * @example
 * ```typescript
 * import { MockLogger } from '@walletmesh/discovery/testing';
 *
 * const mockLogger = new MockLogger();
 * const responder = createDiscoveryResponder({
 *   responderInfo: { ... },
 *   securityPolicy: { ... },
 *   logger: mockLogger
 * });
 *
 * // Trigger some operation that should log
 * responder.startListening();
 *
 * // Assert on log calls
 * expect(mockLogger.info).toHaveBeenCalledWith('Started listening for discovery requests');
 * expect(mockLogger.debug).toHaveBeenCalledTimes(2);
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
interface MockFunction {
  (...args: unknown[]): void;
  mock: { calls: unknown[][] };
  mockReset: () => void;
}

export class MockLogger implements Logger {
  private _debugFn: MockFunction;
  private _infoFn: MockFunction;
  private _warnFn: MockFunction;
  private _errorFn: MockFunction;

  constructor() {
    // Dynamically import vitest to avoid errors outside test environment
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { vi } = require('vitest');
      this._debugFn = vi.fn();
      this._infoFn = vi.fn();
      this._warnFn = vi.fn();
      this._errorFn = vi.fn();
    } catch {
      // Fallback to simple tracking if vitest is not available
      const createTracker = (): MockFunction => {
        const calls: unknown[][] = [];
        const fn = (...args: unknown[]) => calls.push(args);
        fn.mock = { calls };
        fn.mockReset = () => {
          calls.length = 0;
        };
        return fn as MockFunction;
      };

      this._debugFn = createTracker();
      this._infoFn = createTracker();
      this._warnFn = createTracker();
      this._errorFn = createTracker();
    }
  }

  get debug() {
    return this._debugFn;
  }
  get info() {
    return this._infoFn;
  }
  get warn() {
    return this._warnFn;
  }
  get error() {
    return this._errorFn;
  }

  /**
   * Reset all mock call history.
   *
   * Clears the call count and history for all logging methods.
   * Useful for resetting state between test cases.
   *
   * @example
   * ```typescript
   * afterEach(() => {
   *   mockLogger.reset();
   * });
   * ```
   */
  reset(): void {
    this._debugFn.mockReset();
    this._infoFn.mockReset();
    this._warnFn.mockReset();
    this._errorFn.mockReset();
  }

  /**
   * Get statistics about logger usage.
   *
   * Returns count information for each log level, useful for
   * test assertions about logging behavior.
   *
   * @returns Object containing call counts for each log level
   * @example
   * ```typescript
   * const stats = mockLogger.getStats();
   * expect(stats.totalCalls).toBe(5);
   * expect(stats.errorCalls).toBe(1);
   * ```
   */
  getStats() {
    return {
      debugCalls: this._debugFn.mock.calls.length,
      infoCalls: this._infoFn.mock.calls.length,
      warnCalls: this._warnFn.mock.calls.length,
      errorCalls: this._errorFn.mock.calls.length,
      totalCalls:
        this._debugFn.mock.calls.length +
        this._infoFn.mock.calls.length +
        this._warnFn.mock.calls.length +
        this._errorFn.mock.calls.length,
    };
  }

  /**
   * Get all log messages in chronological order.
   *
   * Returns an array of all logged messages with their levels
   * and timestamps, useful for testing log sequence and content.
   *
   * @returns Array of log entries with level, message, and data
   * @example
   * ```typescript
   * const logs = mockLogger.getAllLogs();
   * expect(logs[0]).toEqual({
   *   level: 'info',
   *   message: 'Discovery started',
   *   data: undefined
   * });
   * ```
   */
  getAllLogs(): Array<{
    level: 'debug' | 'info' | 'warn' | 'error';
    message: string;
    data?: unknown;
  }> {
    const logs: Array<{
      level: 'debug' | 'info' | 'warn' | 'error';
      message: string;
      data?: unknown;
    }> = [];

    // Add debug logs
    for (const call of this._debugFn.mock.calls) {
      const [message, data] = call as [string, unknown?];
      logs.push({ level: 'debug', message, data });
    }

    // Add info logs
    for (const call of this._infoFn.mock.calls) {
      const [message, data] = call as [string, unknown?];
      logs.push({ level: 'info', message, data });
    }

    // Add warn logs
    for (const call of this._warnFn.mock.calls) {
      const [message, data] = call as [string, unknown?];
      logs.push({ level: 'warn', message, data });
    }

    // Add error logs
    for (const call of this._errorFn.mock.calls) {
      const [message, data] = call as [string, unknown?];
      logs.push({ level: 'error', message, data });
    }

    return logs;
  }

  /**
   * Check if a specific message was logged at any level.
   *
   * @param message - The message to search for
   * @returns True if the message was logged, false otherwise
   * @example
   * ```typescript
   * expect(mockLogger.hasMessage('Discovery completed')).toBe(true);
   * ```
   */
  hasMessage(message: string): boolean {
    return this.getAllLogs().some((log) => log.message.includes(message));
  }

  /**
   * Get all messages for a specific log level.
   *
   * @param level - The log level to filter by
   * @returns Array of messages for the specified level
   * @example
   * ```typescript
   * const errors = mockLogger.getMessagesForLevel('error');
   * expect(errors).toContain('Validation failed');
   * ```
   */
  getMessagesForLevel(level: 'debug' | 'info' | 'warn' | 'error'): string[] {
    return this.getAllLogs()
      .filter((log) => log.level === level)
      .map((log) => log.message);
  }
}

/**
 * Create a test logger based on the testing environment and requirements.
 *
 * Factory function that creates the appropriate logger for testing scenarios.
 * Provides a consistent way to create loggers across different test types.
 *
 * @param options - Logger creation options for testing
 * @returns A logger instance appropriate for the specified testing scenario
 *
 * @example
 * ```typescript
 * // Silent logger for tests that don't need logging
 * const logger = createTestLogger({ type: 'silent' });
 *
 * // Mock logger for tests that need to assert on log calls
 * const logger = createTestLogger({ type: 'mock' });
 *
 * // Console logger for debugging tests
 * const logger = createTestLogger({ type: 'console', prefix: '[Test]' });
 *
 * // Custom logger
 * const logger = createTestLogger({ logger: myCustomLogger });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createTestLogger(
  options: {
    /** Type of logger to create */
    type?: 'silent' | 'mock' | 'console';
    /** Custom prefix for console logger */
    prefix?: string;
    /** Custom logger implementation to use instead */
    logger?: Logger;
  } = {},
): Logger {
  if (options.logger) {
    return options.logger;
  }

  switch (options.type) {
    case 'silent':
      return new SilentLogger();
    case 'mock':
      return new MockLogger();
    default:
      return new ConsoleLogger(options.prefix);
  }
}

/**
 * Create a silent logger instance.
 *
 * Convenience function for creating silent loggers, which is the most
 * common logger type needed in tests.
 *
 * @returns A new SilentLogger instance
 * @example
 * ```typescript
 * const logger = createSilentLogger();
 *
 * const initiator = createDiscoveryInitiator({
 *   requirements: { ... },
 *   initiatorInfo: { ... },
 *   logger
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createSilentLogger(): SilentLogger {
  return new SilentLogger();
}

/**
 * Create a mock logger instance.
 *
 * Convenience function for creating mock loggers for testing scenarios
 * where you need to assert on log calls.
 *
 * @returns A new MockLogger instance
 * @example
 * ```typescript
 * const mockLogger = createMockLogger();
 *
 * const responder = createDiscoveryResponder({
 *   responderInfo: { ... },
 *   securityPolicy: { ... },
 *   logger: mockLogger
 * });
 *
 * // ... perform operations ...
 *
 * expect(mockLogger.info).toHaveBeenCalled();
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createMockLogger(): MockLogger {
  return new MockLogger();
}
