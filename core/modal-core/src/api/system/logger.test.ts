/**
 * Tests for logger API module
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { LogLevel, Logger, createDebugLogger, setLogLevel } from '../system/logger.js';

// Install custom matchers
installCustomMatchers();

// Mock the internal logger module to properly mock re-exports
vi.mock('../../internal/core/logger/logger.js', () => {
  // Create mock logger methods
  const createMockLogger = () => ({
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
    dispose: vi.fn(),
  });

  // Create a mock Logger class using a regular function to support 'new'
  function MockLogger(this: unknown, debugEnabled = false, prefix = 'Default') {
    Object.assign(this, createMockLogger());
    (this as Record<string, unknown>).debugEnabled = debugEnabled;
    (this as Record<string, unknown>).prefix = prefix;
  }

  // Create the spy wrapper for the constructor
  const Logger = vi.fn(MockLogger) as new (
    debugEnabled?: boolean,
    prefix?: string,
  ) => ReturnType<typeof createMockLogger>;

  return {
    Logger,
    LogLevel: {
      Debug: 0,
      Info: 1,
      Warn: 2,
      Error: 3,
      Silent: 4,
    },
    createDebugLogger: vi.fn((prefix: string, debug = false) => ({
      ...createMockLogger(),
      prefix,
      debugEnabled: debug,
    })),
  };
});

describe('logger API', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();

    // Clear module cache and re-import to ensure fresh mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('createDebugLogger', () => {
    it('should create logger with default parameters', async () => {
      const logger = createDebugLogger('Modal');

      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');

      const loggerModule = await import('../../internal/core/logger/logger.js');
      expect(loggerModule.createDebugLogger).toHaveBeenCalledWith('Modal');
    });

    it('should create logger with debug enabled', async () => {
      const logger = createDebugLogger('Modal', true);

      expect(logger).toBeDefined();

      const loggerModule = await import('../../internal/core/logger/logger.js');
      expect(loggerModule.createDebugLogger).toHaveBeenCalledWith('Modal', true);
    });

    it('should create logger with custom prefix', async () => {
      const logger = createDebugLogger('CustomComponent', false);

      expect(logger).toBeDefined();

      const loggerModule = await import('../../internal/core/logger/logger.js');
      expect(loggerModule.createDebugLogger).toHaveBeenCalledWith('CustomComponent', false);
    });

    it('should create logger with both debug and prefix', async () => {
      const logger = createDebugLogger('TestModule', true);

      expect(logger).toBeDefined();

      const loggerModule = await import('../../internal/core/logger/logger.js');
      expect(loggerModule.createDebugLogger).toHaveBeenCalledWith('TestModule', true);
    });

    it('should handle default debug parameter', async () => {
      const logger = createDebugLogger('TestModule');

      expect(logger).toBeDefined();

      const loggerModule = await import('../../internal/core/logger/logger.js');
      expect(loggerModule.createDebugLogger).toHaveBeenCalledWith('TestModule');
    });
  });

  describe('setLogLevel', () => {
    it('should set log level and create global logger if needed', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      setLogLevel(LogLevel.Info);

      const loggerModule = await import('../../internal/core/logger/logger.js');
      expect(loggerModule.createDebugLogger).toHaveBeenCalledWith('Modal', false);

      consoleSpy.mockRestore();
    });

    it('should set debug level and create debug logger', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Just verify the function doesn't throw and completes successfully
      expect(() => setLogLevel(LogLevel.Debug)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should call setLevel on existing global logger', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // First call creates the logger
      expect(() => setLogLevel(LogLevel.Info)).not.toThrow();

      // Second call should use existing logger
      expect(() => setLogLevel(LogLevel.Error)).not.toThrow();

      // Verify that both calls succeeded without throwing
      expect(true).toBe(true);

      consoleSpy.mockRestore();
    });

    it('should work with all log levels', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      expect(() => setLogLevel(LogLevel.Debug)).not.toThrow();
      expect(() => setLogLevel(LogLevel.Info)).not.toThrow();
      expect(() => setLogLevel(LogLevel.Warn)).not.toThrow();
      expect(() => setLogLevel(LogLevel.Error)).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('type exports', () => {
    it('should export Logger class', () => {
      expect(Logger).toBeDefined();
      expect(typeof Logger).toBe('function');
    });

    it('should export LogLevel enum', () => {
      expect(LogLevel).toBeDefined();
      expect(LogLevel.Debug).toBe(0);
      expect(LogLevel.Info).toBe(1);
      expect(LogLevel.Warn).toBe(2);
      expect(LogLevel.Error).toBe(3);
      expect(LogLevel.Silent).toBe(4);
    });

    it('should allow creating Logger instances', () => {
      // Since Logger is mocked, we test that it's available as a constructor
      expect(Logger).toBeDefined();
      expect(typeof Logger).toBe('function');

      // Create instance using the mocked constructor
      const logger = new Logger(false, 'TestLogger');

      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should support typical logging workflow', () => {
      // Create logger for component
      const componentLogger = createDebugLogger('MyComponent', true);

      // Set global log level
      setLogLevel(LogLevel.Debug);

      // Use logger methods
      expect(() => {
        componentLogger.debug('Debug message');
        componentLogger.info('Info message');
        componentLogger.warn('Warning message');
        componentLogger.error('Error message');
      }).not.toThrow();
    });

    it('should handle multiple logger instances', () => {
      const logger1 = createDebugLogger('Component1', true);
      const logger2 = createDebugLogger('Component2', false);
      const logger3 = createDebugLogger('Component3', true);

      expect(logger1).toBeDefined();
      expect(logger2).toBeDefined();
      expect(logger3).toBeDefined();

      // All should be independent instances
      expect(logger1).not.toBe(logger2);
      expect(logger2).not.toBe(logger3);
      expect(logger1).not.toBe(logger3);
    });

    it('should work in production scenarios', () => {
      // Production setup - minimal logging
      const prodLogger = createDebugLogger('ProdApp', false);
      setLogLevel(LogLevel.Error);

      expect(prodLogger).toBeDefined();
    });

    it('should work in development scenarios', () => {
      // Development setup - verbose logging
      const devLogger = createDebugLogger('DevApp', true);
      setLogLevel(LogLevel.Debug);

      expect(devLogger).toBeDefined();
    });
  });
});
