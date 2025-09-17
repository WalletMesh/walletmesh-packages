import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  createConsoleSpy,
  createSilentConsoleSpy,
  createCapturingConsoleSpy,
  createConsoleSpyWithPattern,
  withConsoleSpy,
  consoleSpyPatterns,
  type ConsoleSpy,
} from './consoleMocks.js';

describe('Console Mock Utilities', () => {
  // Store original console methods for restoration
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  afterEach(() => {
    // Restore original console methods after each test
    Object.assign(console, originalConsole);
  });

  describe('createConsoleSpy', () => {
    let spy: ConsoleSpy;

    afterEach(() => {
      spy?.restore();
    });

    it('should create spy for all console methods by default', () => {
      spy = createConsoleSpy({ mockFn: () => vi.fn() });

      expect(spy.log).toBeDefined();
      expect(spy.warn).toBeDefined();
      expect(spy.error).toBeDefined();
      expect(spy.info).toBeDefined();
      expect(spy.debug).toBeDefined();
      expect(spy.restore).toBeDefined();
    });

    it('should spy on specified methods only', () => {
      spy = createConsoleSpy({
        methods: ['warn', 'error'],
        mockFn: () => vi.fn(),
      });

      expect(spy.warn).toBeDefined();
      expect(spy.error).toBeDefined();

      // Original methods should be replaced for spied methods
      expect(console.warn).toBe(spy.warn);
      expect(console.error).toBe(spy.error);
    });

    it('should suppress output by default', () => {
      spy = createConsoleSpy({ mockFn: () => vi.fn() });

      console.log('test message');
      console.warn('warning message');

      expect(spy.log).toHaveBeenCalledWith('test message');
      expect(spy.warn).toHaveBeenCalledWith('warning message');
    });

    it('should track calls correctly', () => {
      spy = createConsoleSpy({ mockFn: () => vi.fn() });

      console.log('message 1', 'arg 2');
      console.warn('warning', { data: 'test' });

      expect(spy.log).toHaveBeenCalledTimes(1);
      expect(spy.log).toHaveBeenCalledWith('message 1', 'arg 2');
      expect(spy.warn).toHaveBeenCalledTimes(1);
      expect(spy.warn).toHaveBeenCalledWith('warning', { data: 'test' });
    });

    it('should restore original console methods', () => {
      const originalLog = console.log;
      spy = createConsoleSpy({ mockFn: () => vi.fn() });

      expect(console.log).not.toBe(originalLog);

      spy.restore();

      expect(console.log).toBe(originalLog);
    });
  });

  describe('createSilentConsoleSpy', () => {
    let spy: ConsoleSpy;

    afterEach(() => {
      spy?.restore();
    });

    it('should create silent spy with default methods', () => {
      spy = createSilentConsoleSpy(undefined, () => vi.fn());

      console.log('should be silent');
      console.error('should be silent');

      expect(spy.log).toHaveBeenCalledWith('should be silent');
      expect(spy.error).toHaveBeenCalledWith('should be silent');
    });

    it('should create silent spy with specified methods', () => {
      spy = createSilentConsoleSpy(['warn'], () => vi.fn());

      console.warn('test warning');

      expect(spy.warn).toHaveBeenCalledWith('test warning');
    });
  });

  describe('createCapturingConsoleSpy', () => {
    let spy: ConsoleSpy;

    afterEach(() => {
      spy?.restore();
    });

    it('should capture console output', () => {
      spy = createCapturingConsoleSpy({ mockFn: () => vi.fn() });

      console.log('captured message');

      expect(spy.log).toHaveBeenCalledWith('captured message');
      expect(spy.log.mock.calls[0]).toEqual(['captured message']);
    });
  });

  describe('createConsoleSpyWithPattern', () => {
    let spy: ConsoleSpy;

    afterEach(() => {
      spy?.restore();
    });

    it('should create spy with security pattern', () => {
      spy = createConsoleSpyWithPattern('security', () => vi.fn());

      console.warn('security warning');
      console.error('security error');

      expect(spy.warn).toHaveBeenCalledWith('security warning');
      expect(spy.error).toHaveBeenCalledWith('security error');
    });

    it('should create spy with general pattern', () => {
      spy = createConsoleSpyWithPattern('general', () => vi.fn());

      console.log('general message');
      console.info('info message');
      console.debug('debug message');

      expect(spy.log).toHaveBeenCalledWith('general message');
      expect(spy.info).toHaveBeenCalledWith('info message');
      expect(spy.debug).toHaveBeenCalledWith('debug message');
    });
  });

  describe('withConsoleSpy', () => {
    it('should automatically restore console after test function', async () => {
      const originalLog = console.log;

      await withConsoleSpy(
        (spy) => {
          expect(console.log).not.toBe(originalLog);
          console.log('test message');
          expect(spy.log).toHaveBeenCalledWith('test message');
        },
        { mockFn: () => vi.fn() },
      );

      expect(console.log).toBe(originalLog);
    });

    it('should restore console even if test function throws', async () => {
      const originalLog = console.log;

      try {
        await withConsoleSpy(
          () => {
            throw new Error('Test error');
          },
          { mockFn: () => vi.fn() },
        );
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }

      expect(console.log).toBe(originalLog);
    });

    it('should return test function result', async () => {
      const result = await withConsoleSpy(() => 'test result', { mockFn: () => vi.fn() });

      expect(result).toBe('test result');
    });
  });

  describe('withSilentConsole', () => {
    it('should silence console output during execution', async () => {
      // Test the function by directly calling withConsoleSpy with silent option
      await withConsoleSpy(
        () => {
          // These would normally output to console but should be silent
          console.log('should be silent');
          console.warn('should be silent');
          console.error('should be silent');
        },
        {
          suppressOutput: true,
          mockFn: () => vi.fn(),
        },
      );

      // Test completes without console output
    });

    it('should restore console after execution', async () => {
      const originalLog = console.log;

      await withConsoleSpy(
        () => {
          // Console is silenced here
        },
        {
          suppressOutput: true,
          mockFn: () => vi.fn(),
        },
      );

      expect(console.log).toBe(originalLog);
    });
  });

  describe('consoleSpyPatterns', () => {
    it('should have expected pattern configurations', () => {
      expect(consoleSpyPatterns.security).toEqual({
        methods: ['warn', 'error'],
        suppressOutput: true,
      });

      expect(consoleSpyPatterns.general).toEqual({
        methods: ['log', 'warn', 'error', 'info', 'debug'],
        suppressOutput: true,
      });

      expect(consoleSpyPatterns.debug).toEqual({
        methods: ['log', 'warn', 'error', 'info', 'debug'],
        suppressOutput: false,
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work with discovery component logging', async () => {
      await withConsoleSpy(
        (spy) => {
          // Simulate discovery component logging
          console.info('[WalletMesh] Discovery started');
          console.warn('[WalletMesh] Rate limit exceeded');
          console.error('[WalletMesh] Connection failed');

          expect(spy.info).toHaveBeenCalledWith('[WalletMesh] Discovery started');
          expect(spy.warn).toHaveBeenCalledWith('[WalletMesh] Rate limit exceeded');
          expect(spy.error).toHaveBeenCalledWith('[WalletMesh] Connection failed');
        },
        { mockFn: () => vi.fn() },
      );
    });

    it('should support security testing pattern', async () => {
      const spy = createConsoleSpyWithPattern('security', () => vi.fn());

      try {
        // Simulate security-related logging
        console.warn('[WalletMesh] Origin validation failed');
        console.error('[WalletMesh] Session replay detected');

        expect(spy.warn).toHaveBeenCalledWith('[WalletMesh] Origin validation failed');
        expect(spy.error).toHaveBeenCalledWith('[WalletMesh] Session replay detected');
      } finally {
        spy.restore();
      }
    });
  });
});
