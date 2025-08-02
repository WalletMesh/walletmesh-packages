import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ConsoleLogger, createLogger, defaultLogger } from './logger.js';
import type { Logger } from './logger.js';

describe('Logger', () => {
  describe('ConsoleLogger', () => {
    let consoleSpy: {
      debug: ReturnType<typeof vi.spyOn>;
      info: ReturnType<typeof vi.spyOn>;
      warn: ReturnType<typeof vi.spyOn>;
      error: ReturnType<typeof vi.spyOn>;
    };

    beforeEach(() => {
      consoleSpy = {
        debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
        info: vi.spyOn(console, 'info').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      };
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should use default prefix when none provided', () => {
      const logger = new ConsoleLogger();

      logger.debug('test message');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[WalletMesh] test message');

      logger.info('test message');
      expect(consoleSpy.info).toHaveBeenCalledWith('[WalletMesh] test message');

      logger.warn('test message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WalletMesh] test message');

      logger.error('test message');
      expect(consoleSpy.error).toHaveBeenCalledWith('[WalletMesh] test message');
    });

    it('should use custom prefix when provided', () => {
      const logger = new ConsoleLogger('[CustomPrefix]');

      logger.debug('test message');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[CustomPrefix] test message');
    });

    it('should handle data parameter correctly', () => {
      const logger = new ConsoleLogger();
      const testData = { foo: 'bar', count: 42 };

      logger.debug('test message', testData);
      expect(consoleSpy.debug).toHaveBeenCalledWith('[WalletMesh] test message', testData);

      logger.info('test message', testData);
      expect(consoleSpy.info).toHaveBeenCalledWith('[WalletMesh] test message', testData);

      logger.warn('test message', testData);
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WalletMesh] test message', testData);

      logger.error('test message', testData);
      expect(consoleSpy.error).toHaveBeenCalledWith('[WalletMesh] test message', testData);
    });

    it('should handle undefined data parameter', () => {
      const logger = new ConsoleLogger();

      logger.debug('test message', undefined);
      expect(consoleSpy.debug).toHaveBeenCalledWith('[WalletMesh] test message');

      logger.info('test message', undefined);
      expect(consoleSpy.info).toHaveBeenCalledWith('[WalletMesh] test message');

      logger.warn('test message', undefined);
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WalletMesh] test message');

      logger.error('test message', undefined);
      expect(consoleSpy.error).toHaveBeenCalledWith('[WalletMesh] test message');
    });

    it('should handle error objects', () => {
      const logger = new ConsoleLogger();
      const error = new Error('Test error');

      logger.error('Error occurred', error);
      expect(consoleSpy.error).toHaveBeenCalledWith('[WalletMesh] Error occurred', error);
    });
  });

  describe('createLogger', () => {
    it('should return ConsoleLogger with default prefix when no options provided', () => {
      const logger = createLogger();
      expect(logger).toBeInstanceOf(ConsoleLogger);

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      logger.info('test');
      expect(consoleSpy).toHaveBeenCalledWith('[WalletMesh] test');
      consoleSpy.mockRestore();
    });

    it('should return ConsoleLogger with custom prefix', () => {
      const logger = createLogger({ prefix: '[Custom]' });
      expect(logger).toBeInstanceOf(ConsoleLogger);

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      logger.info('test');
      expect(consoleSpy).toHaveBeenCalledWith('[Custom] test');
      consoleSpy.mockRestore();
    });

    it('should return provided logger instance', () => {
      const customLogger: Logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const logger = createLogger({ logger: customLogger });
      expect(logger).toBe(customLogger);

      logger.info('test');
      expect(customLogger.info).toHaveBeenCalledWith('test');
    });
  });

  describe('defaultLogger', () => {
    it('should be a ConsoleLogger instance with default prefix', () => {
      expect(defaultLogger).toBeInstanceOf(ConsoleLogger);

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      defaultLogger.info('test');
      expect(consoleSpy).toHaveBeenCalledWith('[WalletMesh] test');
      consoleSpy.mockRestore();
    });
  });

  describe('Logger usage in components', () => {
    it('should allow custom logger injection', () => {
      const mockLogger: Logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      // Example of how components would use the logger
      class TestComponent {
        private logger: Logger;

        constructor(logger?: Logger) {
          this.logger = logger ?? defaultLogger;
        }

        doSomething() {
          this.logger.info('Doing something');
        }

        handleError(error: Error) {
          this.logger.error('An error occurred', error);
        }
      }

      const component = new TestComponent(mockLogger);
      component.doSomething();
      component.handleError(new Error('Test error'));

      expect(mockLogger.info).toHaveBeenCalledWith('Doing something');
      expect(mockLogger.error).toHaveBeenCalledWith('An error occurred', expect.any(Error));
    });
  });
});
