/**
 * Tests for Logger module
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LogLevel, Logger, createDebugLogger } from '../../../api/system/logger.js';
import { createTestEnvironment, installCustomMatchers } from '../../../testing/index.js';

// Install custom matchers
installCustomMatchers();

describe('Logger', () => {
  const testEnv = createTestEnvironment();

  // Mock console methods
  beforeEach(async () => {
    await testEnv.setup();
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('Basic functionality', () => {
    it('should create a logger with default prefix', () => {
      const logger = new Logger(true);
      logger.info('Test message');

      expect(console.info).toHaveBeenCalledWith('[Modal]', 'Test message');
    });

    it('should create a logger with custom prefix', () => {
      const logger = new Logger(false, 'TestLogger');
      logger.info('Test message');

      expect(console.info).toHaveBeenCalledWith('[TestLogger]', 'Test message');
    });

    it('should log at different levels', () => {
      const logger = new Logger(true, 'Test');

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.debug).toHaveBeenCalledWith('[Test]', 'Debug message');
      expect(console.info).toHaveBeenCalledWith('[Test]', 'Info message');
      expect(console.warn).toHaveBeenCalledWith('[Test]', 'Warning message');
      expect(console.error).toHaveBeenCalledWith('[Test]', 'Error message');
    });
  });

  describe('Debug mode', () => {
    it('should respect debug flag when false', () => {
      const logger = new Logger(false, 'Test');

      logger.debug('Debug message');
      logger.info('Info message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalled();
    });

    it('should respect debug flag when true', () => {
      const logger = new Logger(true, 'Test');

      logger.debug('Debug message');

      expect(console.debug).toHaveBeenCalled();
    });

    it('should respect debug function', () => {
      let debugEnabled = false;
      const debugFn = () => debugEnabled;
      const logger = new Logger(debugFn, 'Test');

      // Initially debug is disabled
      logger.debug('First debug message');
      expect(console.debug).not.toHaveBeenCalled();

      // Enable debug and check again
      debugEnabled = true;
      logger.debug('Second debug message');
      expect(console.debug).toHaveBeenCalledWith('[Test]', 'Second debug message');
    });
  });

  describe('setLevel method', () => {
    it('should enable debug when level is Debug', () => {
      const logger = new Logger(false, 'Test');

      // Initially debug is disabled
      logger.debug('First debug message');
      expect(console.debug).not.toHaveBeenCalled();

      // Set level to Debug
      logger.setLevel(LogLevel.Debug);

      // Debug should now be enabled
      logger.debug('Second debug message');
      expect(console.debug).toHaveBeenCalledWith('[Test]', 'Second debug message');
    });

    it('should disable debug when level is above Debug', () => {
      const logger = new Logger(true, 'Test');

      // Initially debug is enabled
      logger.debug('First debug message');
      expect(console.debug).toHaveBeenCalled();

      // Clear mocks
      vi.clearAllMocks();

      // Set level to Info
      logger.setLevel(LogLevel.Info);

      // Debug should now be disabled
      logger.debug('Second debug message');
      expect(console.debug).not.toHaveBeenCalled();
    });
  });

  describe('Data handling', () => {
    it('should log additional data when provided', () => {
      const logger = new Logger(true, 'Test');
      const data = { key: 'value' };

      logger.info('Message with data', data);

      expect(console.info).toHaveBeenCalledWith('[Test]', 'Message with data', data);
    });

    it('should handle Error objects specially', () => {
      const logger = new Logger(true, 'Test');
      const error = new Error('Test error');

      logger.error('An error occurred', error);

      expect(console.error).toHaveBeenCalledWith('[Test]', 'An error occurred', error);
    });

    it('should handle circular references', () => {
      const logger = new Logger(true, 'Test');

      // Create an object with circular reference
      // biome-ignore lint/suspicious/noExplicitAny: Testing circular reference handling
      const circularObj: any = { name: 'circular' };
      circularObj.self = circularObj;

      // Log the object
      logger.info('Object with circular reference', circularObj);

      expect(console.info).toHaveBeenCalledWith(
        '[Test]',
        'Object with circular reference',
        expect.objectContaining({ name: 'circular', self: '[Circular Reference]' }),
      );
    });

    it('should handle functions in data', () => {
      const logger = new Logger(true, 'Test');
      const dataWithFunction = {
        name: 'test',
        callback: () => console.log('function'),
      };

      logger.info('Data with function', dataWithFunction);

      expect(console.info).toHaveBeenCalledWith(
        '[Test]',
        'Data with function',
        expect.objectContaining({ name: 'test', callback: '[Function]' }),
      );
    });
  });

  describe('createDebugLogger factory', () => {
    it('should create a logger with the specified prefix', () => {
      const logger = createDebugLogger('Factory');

      logger.info('Test message');

      expect(console.info).toHaveBeenCalledWith('[Factory]', 'Test message');
    });

    it('should respect debug parameter', () => {
      // Create with debug disabled (default)
      const loggerNoDebug = createDebugLogger('NoDebug');
      loggerNoDebug.debug('Should not log');
      expect(console.debug).not.toHaveBeenCalled();

      // Create with debug enabled
      const loggerWithDebug = createDebugLogger('WithDebug', true);
      loggerWithDebug.debug('Should log');
      expect(console.debug).toHaveBeenCalledWith('[WithDebug]', 'Should log');
    });
  });
});
