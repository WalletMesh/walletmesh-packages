/**
 * Tests for strictModeLogger utility
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { strictModeLogger, useStrictModeLogger } from './strictModeLogger.js';

describe('strictModeLogger', () => {
  // Save original NODE_ENV
  const originalNodeEnv = process.env['NODE_ENV'];

  // Mock console methods
  const mockConsole = {
    debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  };

  // Mock timers for testing cleanup
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    // Set to development mode by default
    process.env['NODE_ENV'] = 'development';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    // Restore original NODE_ENV
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env['NODE_ENV'] = 'development';
    });

    it('should log unique messages', () => {
      strictModeLogger.debug('Debug message', { data: 1 });
      strictModeLogger.info('Info message', { data: 2 });
      strictModeLogger.warn('Warn message', { data: 3 });
      strictModeLogger.error('Error message', { data: 4 });

      expect(mockConsole.debug).toHaveBeenCalledWith('Debug message', { data: 1 });
      expect(mockConsole.info).toHaveBeenCalledWith('Info message', { data: 2 });
      expect(mockConsole.warn).toHaveBeenCalledWith('Warn message', { data: 3 });
      expect(mockConsole.error).toHaveBeenCalledWith('Error message', { data: 4 });
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('should deduplicate messages within the time window', () => {
      // Log the same message multiple times rapidly
      strictModeLogger.debug('Duplicate message', { data: 1 });
      strictModeLogger.debug('Duplicate message', { data: 1 });
      strictModeLogger.debug('Duplicate message', { data: 1 });

      // Should only log once
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledWith('Duplicate message', { data: 1 });
    });

    it('should allow same message after deduplication window', () => {
      strictModeLogger.info('Test message', { count: 1 });

      // Advance time beyond deduplication window (100ms)
      vi.advanceTimersByTime(101);

      strictModeLogger.info('Test message', { count: 1 });

      expect(mockConsole.info).toHaveBeenCalledTimes(2);
    });

    it('should treat different data as different messages', () => {
      strictModeLogger.warn('Same message', { data: 1 });
      strictModeLogger.warn('Same message', { data: 2 });
      strictModeLogger.warn('Same message', { data: 3 });

      expect(mockConsole.warn).toHaveBeenCalledTimes(3);
      expect(mockConsole.warn).toHaveBeenNthCalledWith(1, 'Same message', { data: 1 });
      expect(mockConsole.warn).toHaveBeenNthCalledWith(2, 'Same message', { data: 2 });
      expect(mockConsole.warn).toHaveBeenNthCalledWith(3, 'Same message', { data: 3 });
    });

    it('should treat different levels as different messages', () => {
      const message = 'Multi-level message';
      const data = { value: 42 };

      strictModeLogger.debug(message, data);
      strictModeLogger.info(message, data);
      strictModeLogger.warn(message, data);
      strictModeLogger.error(message, data);

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    it('should handle undefined data', () => {
      strictModeLogger.debug('Message without data');
      strictModeLogger.debug('Message without data');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledWith('Message without data', undefined);
    });

    it('should handle complex data objects', () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' },
        },
        boolean: true,
        null: null,
      };

      strictModeLogger.info('Complex data', complexData);
      strictModeLogger.info('Complex data', complexData);

      expect(mockConsole.info).toHaveBeenCalledTimes(1);
      expect(mockConsole.info).toHaveBeenCalledWith('Complex data', complexData);
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env['NODE_ENV'] = 'production';
    });

    it('should always log in production mode', () => {
      // Log the same message multiple times
      strictModeLogger.debug('Production message', { data: 1 });
      strictModeLogger.debug('Production message', { data: 1 });
      strictModeLogger.debug('Production message', { data: 1 });

      // Should log all times (no deduplication in production)
      expect(mockConsole.debug).toHaveBeenCalledTimes(3);
    });

    it('should log all levels in production', () => {
      const message = 'Production log';
      const data = { env: 'prod' };

      strictModeLogger.debug(message, data);
      strictModeLogger.debug(message, data);
      strictModeLogger.info(message, data);
      strictModeLogger.info(message, data);
      strictModeLogger.warn(message, data);
      strictModeLogger.warn(message, data);
      strictModeLogger.error(message, data);
      strictModeLogger.error(message, data);

      expect(mockConsole.debug).toHaveBeenCalledTimes(2);
      expect(mockConsole.info).toHaveBeenCalledTimes(2);
      expect(mockConsole.warn).toHaveBeenCalledTimes(2);
      expect(mockConsole.error).toHaveBeenCalledTimes(2);
    });
  });

  describe('log method', () => {
    it('should always log regardless of environment', () => {
      process.env['NODE_ENV'] = 'development';

      strictModeLogger.log('Important message', { always: true });
      strictModeLogger.log('Important message', { always: true });
      strictModeLogger.log('Important message', { always: true });

      expect(mockConsole.log).toHaveBeenCalledTimes(3);
    });

    it('should log in production too', () => {
      process.env['NODE_ENV'] = 'production';

      strictModeLogger.log('Production log message', { prod: true });
      strictModeLogger.log('Production log message', { prod: true });

      expect(mockConsole.log).toHaveBeenCalledTimes(2);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      process.env['NODE_ENV'] = 'development';
    });

    it('should clean up old entries after threshold', () => {
      // Log some messages
      strictModeLogger.debug('Message 1');
      strictModeLogger.info('Message 2');

      // Advance time past cleanup threshold (5 seconds)
      vi.advanceTimersByTime(5001);

      // Trigger cleanup by advancing to next interval (10 seconds)
      vi.advanceTimersByTime(5000);

      // These should be treated as new messages (not deduplicated)
      strictModeLogger.debug('Message 1');
      strictModeLogger.info('Message 2');

      expect(mockConsole.debug).toHaveBeenCalledTimes(2);
      expect(mockConsole.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('useStrictModeLogger hook', () => {
    it('should prefix messages with component name', () => {
      const logger = useStrictModeLogger('TestComponent');

      logger.debug('Debug from component', { id: 1 });
      logger.info('Info from component', { id: 2 });
      logger.warn('Warn from component', { id: 3 });
      logger.error('Error from component', { id: 4 });
      logger.log('Log from component', { id: 5 });

      expect(mockConsole.debug).toHaveBeenCalledWith('[TestComponent] Debug from component', { id: 1 });
      expect(mockConsole.info).toHaveBeenCalledWith('[TestComponent] Info from component', { id: 2 });
      expect(mockConsole.warn).toHaveBeenCalledWith('[TestComponent] Warn from component', { id: 3 });
      expect(mockConsole.error).toHaveBeenCalledWith('[TestComponent] Error from component', { id: 4 });
      expect(mockConsole.log).toHaveBeenCalledWith('[TestComponent] Log from component', { id: 5 });
    });

    it('should deduplicate prefixed messages', () => {
      process.env['NODE_ENV'] = 'development';
      const logger = useStrictModeLogger('DuplicateTest');

      logger.debug('Same message');
      logger.debug('Same message');
      logger.debug('Same message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.debug).toHaveBeenCalledWith('[DuplicateTest] Same message', undefined);
    });

    it('should allow different components to log same message', () => {
      const logger1 = useStrictModeLogger('Component1');
      const logger2 = useStrictModeLogger('Component2');

      logger1.info('Shared message');
      logger2.info('Shared message');

      expect(mockConsole.info).toHaveBeenCalledTimes(2);
      expect(mockConsole.info).toHaveBeenNthCalledWith(1, '[Component1] Shared message', undefined);
      expect(mockConsole.info).toHaveBeenNthCalledWith(2, '[Component2] Shared message', undefined);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null and undefined in data', () => {
      strictModeLogger.debug('Null data', null);
      strictModeLogger.debug('Undefined data', undefined);
      strictModeLogger.debug('No data');

      expect(mockConsole.debug).toHaveBeenCalledTimes(3);
      expect(mockConsole.debug).toHaveBeenNthCalledWith(1, 'Null data', null);
      expect(mockConsole.debug).toHaveBeenNthCalledWith(2, 'Undefined data', undefined);
      expect(mockConsole.debug).toHaveBeenNthCalledWith(3, 'No data', undefined);
    });

    it('should handle circular references in data', () => {
      const circular: { a: number; self?: unknown } = { a: 1 };
      circular.self = circular;

      // This will throw during JSON.stringify, but should not crash
      expect(() => {
        strictModeLogger.info('Circular data', circular);
      }).toThrow(); // JSON.stringify will throw on circular reference
    });

    it('should handle empty strings', () => {
      strictModeLogger.warn('', { empty: true });
      strictModeLogger.warn('', { empty: true });

      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      strictModeLogger.error(longMessage, { long: true });
      strictModeLogger.error(longMessage, { long: true });

      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('Test Environment', () => {
    it('should work in test environment', () => {
      process.env['NODE_ENV'] = 'test';

      // Should behave like production (no deduplication)
      strictModeLogger.debug('Test message');
      strictModeLogger.debug('Test message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(2);
    });
  });
});
