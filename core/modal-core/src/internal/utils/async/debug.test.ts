/**
 * Tests for debug.ts
 * @internal
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment } from '../../../testing/index.js';
import { modalLogger } from '../../core/logger/globalLogger.js';
import { LogLevel } from '../../core/logger/logger.js';
import { debug, isDebugEnabled, setDebugMode, withDebug } from './debug.js';

describe('debug utilities', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let modalLoggerSpy: ReturnType<typeof vi.spyOn>;

  // Use centralized test setup pattern
  const testEnv = createTestEnvironment({
    customSetup: () => {
      // Reset debug state to false before each test
      setDebugMode(false);
      consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      modalLoggerSpy = vi.spyOn(modalLogger, 'info').mockImplementation(() => {});
    },
    customTeardown: () => {
      consoleSpy.mockRestore();
      modalLoggerSpy.mockRestore();
      // Clean up debug state after each test
      setDebugMode(false);
    },
  });

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('setDebugMode', () => {
    it('should enable debug mode', () => {
      setDebugMode(true);

      expect(isDebugEnabled()).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('[WalletMesh] Debug mode enabled');
      expect(modalLoggerSpy).toHaveBeenCalledWith(`Log level set to ${LogLevel[LogLevel.Debug]}`);
    });

    it('should disable debug mode', () => {
      setDebugMode(true); // First enable it
      consoleSpy.mockClear();
      modalLoggerSpy.mockClear();

      setDebugMode(false);

      expect(isDebugEnabled()).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('[WalletMesh] Debug mode disabled');
      expect(modalLoggerSpy).toHaveBeenCalledWith(`Log level set to ${LogLevel[LogLevel.Info]}`);
    });

    it('should handle multiple calls correctly', () => {
      setDebugMode(true);
      setDebugMode(true); // Should still work
      expect(isDebugEnabled()).toBe(true);

      setDebugMode(false);
      setDebugMode(false); // Should still work
      expect(isDebugEnabled()).toBe(false);
    });
  });

  describe('isDebugEnabled', () => {
    it('should return false by default', () => {
      expect(isDebugEnabled()).toBe(false);
    });

    it('should return true when debug is enabled', () => {
      setDebugMode(true);
      expect(isDebugEnabled()).toBe(true);
    });

    it('should return false when debug is disabled', () => {
      setDebugMode(true);
      setDebugMode(false);
      expect(isDebugEnabled()).toBe(false);
    });

    it('should reflect current state accurately', () => {
      expect(isDebugEnabled()).toBe(false);

      setDebugMode(true);
      expect(isDebugEnabled()).toBe(true);

      setDebugMode(false);
      expect(isDebugEnabled()).toBe(false);

      setDebugMode(true);
      expect(isDebugEnabled()).toBe(true);
    });
  });

  describe('withDebug', () => {
    it('should temporarily enable debug for function execution', async () => {
      setDebugMode(false);
      let debugStateInFunction = false;

      const result = await withDebug(async () => {
        debugStateInFunction = isDebugEnabled();
        return 'test-result';
      });

      expect(debugStateInFunction).toBe(true);
      expect(isDebugEnabled()).toBe(false);
      expect(result).toBe('test-result');
    });

    it('should not change debug state if already enabled', async () => {
      setDebugMode(true);
      consoleSpy.mockClear();

      const result = await withDebug(async () => {
        expect(isDebugEnabled()).toBe(true);
        return 'already-enabled';
      });

      expect(isDebugEnabled()).toBe(true);
      expect(result).toBe('already-enabled');
      // Should not have called setDebugMode again
      expect(consoleSpy).not.toHaveBeenCalledWith('[WalletMesh] Debug mode enabled');
    });

    it('should restore debug state after function completes', async () => {
      setDebugMode(false);

      await withDebug(async () => {
        expect(isDebugEnabled()).toBe(true);
        // Simulate some async work
        await Promise.resolve();
      });

      expect(isDebugEnabled()).toBe(false);
    });

    it('should restore debug state even if function throws', async () => {
      setDebugMode(false);
      const testError = new Error('test error');

      await expect(
        withDebug(async () => {
          expect(isDebugEnabled()).toBe(true);
          throw testError;
        }),
      ).rejects.toThrow('test error');

      expect(isDebugEnabled()).toBe(false);
    });

    it('should handle nested withDebug calls', async () => {
      setDebugMode(false);

      const result = await withDebug(async () => {
        expect(isDebugEnabled()).toBe(true);

        const nestedResult = await withDebug(async () => {
          expect(isDebugEnabled()).toBe(true);
          return 'nested';
        });

        expect(isDebugEnabled()).toBe(true);
        return nestedResult;
      });

      expect(isDebugEnabled()).toBe(false);
      expect(result).toBe('nested');
    });

    it('should work with complex async operations', async () => {
      setDebugMode(false);
      const stateHistory: boolean[] = [];

      const result = await withDebug(async () => {
        stateHistory.push(isDebugEnabled());

        await Promise.all([Promise.resolve(), Promise.resolve()]);

        stateHistory.push(isDebugEnabled());

        return 'complex-result';
      });

      expect(stateHistory).toEqual([true, true]);
      expect(isDebugEnabled()).toBe(false);
      expect(result).toBe('complex-result');
    });
  });

  describe('debug namespace', () => {
    describe('debug.enable', () => {
      it('should enable debug mode', () => {
        debug.enable();
        expect(isDebugEnabled()).toBe(true);
        expect(consoleSpy).toHaveBeenCalledWith('[WalletMesh] Debug mode enabled');
      });
    });

    describe('debug.disable', () => {
      it('should disable debug mode', () => {
        debug.enable();
        consoleSpy.mockClear();

        debug.disable();
        expect(isDebugEnabled()).toBe(false);
        expect(consoleSpy).toHaveBeenCalledWith('[WalletMesh] Debug mode disabled');
      });
    });

    describe('debug.isEnabled', () => {
      it('should return current debug state', () => {
        expect(debug.isEnabled()).toBe(false);

        debug.enable();
        expect(debug.isEnabled()).toBe(true);

        debug.disable();
        expect(debug.isEnabled()).toBe(false);
      });

      it('should be the same as isDebugEnabled function', () => {
        expect(debug.isEnabled()).toBe(isDebugEnabled());

        setDebugMode(true);
        expect(debug.isEnabled()).toBe(isDebugEnabled());

        setDebugMode(false);
        expect(debug.isEnabled()).toBe(isDebugEnabled());
      });
    });

    describe('debug.with', () => {
      it('should be the same as withDebug function', async () => {
        setDebugMode(false);

        const withDebugResult = await withDebug(async () => {
          return isDebugEnabled();
        });

        setDebugMode(false); // Reset

        const debugWithResult = await debug.with(async () => {
          return isDebugEnabled();
        });

        expect(withDebugResult).toBe(debugWithResult);
        expect(withDebugResult).toBe(true);
        expect(isDebugEnabled()).toBe(false);
      });

      it('should work with the namespace pattern', async () => {
        const result = await debug.with(async () => {
          if (debug.isEnabled()) {
            return 'debug-active';
          }
          return 'debug-inactive';
        });

        expect(result).toBe('debug-active');
        expect(debug.isEnabled()).toBe(false);
      });
    });

    describe('namespace integration', () => {
      it('should provide consistent interface', () => {
        // Test that all methods exist
        expect(typeof debug.enable).toBe('function');
        expect(typeof debug.disable).toBe('function');
        expect(typeof debug.isEnabled).toBe('function');
        expect(typeof debug.with).toBe('function');
      });

      it('should work with fluent interface style', async () => {
        debug.enable();
        expect(debug.isEnabled()).toBe(true);

        const result = await debug.with(async () => {
          return 'fluent-result';
        });

        debug.disable();
        expect(debug.isEnabled()).toBe(false);
        expect(result).toBe('fluent-result');
      });

      it('should handle mixed usage of namespace and individual functions', async () => {
        debug.enable();
        expect(isDebugEnabled()).toBe(true);

        setDebugMode(false);
        expect(debug.isEnabled()).toBe(false);

        const result = await withDebug(async () => {
          return debug.isEnabled();
        });

        expect(result).toBe(true);
        expect(debug.isEnabled()).toBe(false);
      });
    });
  });

  describe('log level configuration', () => {
    it('should configure debug log level when enabled', () => {
      setDebugMode(true);
      expect(modalLoggerSpy).toHaveBeenCalledWith(`Log level set to ${LogLevel[LogLevel.Debug]}`);
    });

    it('should configure info log level when disabled', () => {
      setDebugMode(true);
      consoleSpy.mockClear();
      modalLoggerSpy.mockClear();

      setDebugMode(false);
      expect(modalLoggerSpy).toHaveBeenCalledWith(`Log level set to ${LogLevel[LogLevel.Info]}`);
    });

    it('should handle log level changes consistently', () => {
      // Test the actual expected behavior rather than counting all calls
      setDebugMode(true);
      expect(modalLoggerSpy).toHaveBeenCalledWith(`Log level set to ${LogLevel[LogLevel.Debug]}`);

      modalLoggerSpy.mockClear();
      setDebugMode(false);
      expect(modalLoggerSpy).toHaveBeenCalledWith(`Log level set to ${LogLevel[LogLevel.Info]}`);

      modalLoggerSpy.mockClear();
      setDebugMode(true);
      expect(modalLoggerSpy).toHaveBeenCalledWith(`Log level set to ${LogLevel[LogLevel.Debug]}`);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle errors in withDebug function', async () => {
      setDebugMode(false);
      const testError = new Error('Async operation failed');

      await expect(
        withDebug(async () => {
          throw testError;
        }),
      ).rejects.toThrow('Async operation failed');

      expect(isDebugEnabled()).toBe(false);
    });

    it('should handle synchronous errors in async wrapper', async () => {
      setDebugMode(false);

      await expect(
        withDebug(async () => {
          // Synchronous error in async function
          JSON.parse('invalid json');
          return 'should not reach';
        }),
      ).rejects.toThrow();

      expect(isDebugEnabled()).toBe(false);
    });

    it('should handle rapid state changes', () => {
      for (let i = 0; i < 10; i++) {
        setDebugMode(i % 2 === 0);
        expect(isDebugEnabled()).toBe(i % 2 === 0);
      }
    });

    it('should maintain state consistency across multiple operations', async () => {
      // Ensure we start with debug disabled
      setDebugMode(false);
      expect(isDebugEnabled()).toBe(false);

      // Run operations sequentially to avoid race conditions
      const results: boolean[] = [];

      for (let i = 0; i < 3; i++) {
        const result = await withDebug(async () => {
          // Small delay
          await Promise.resolve();
          return isDebugEnabled();
        });
        results.push(result);
      }

      // All should have been true during execution
      expect(results.every((result) => result === true)).toBe(true);
      // Final state should be false
      expect(isDebugEnabled()).toBe(false);
    });
  });
});
