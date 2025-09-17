/**
 * Console mocking utilities for testing discovery protocol implementations
 * in test environments. These utilities provide standardized console spying
 * and mocking for consistent test behavior.
 *
 * These utilities enable testing of logging behavior without polluting test
 * output while still allowing verification that appropriate log messages
 * are generated.
 *
 * @example Basic console spy usage:
 * ```typescript
 * import { createConsoleSpy } from '@walletmesh/discovery/testing';
 *
 * describe('Component with logging', () => {
 *   let consoleSpy: ReturnType<typeof createConsoleSpy>;
 *
 *   beforeEach(() => {
 *     consoleSpy = createConsoleSpy();
 *   });
 *
 *   afterEach(() => {
 *     consoleSpy.restore();
 *   });
 *
 *   it('should log errors', () => {
 *     component.doSomethingThatLogs();
 *     expect(consoleSpy.error).toHaveBeenCalledWith('Expected error message');
 *   });
 * });
 * ```
 *
 * @example Scoped console spy:
 * ```typescript
 * import { withConsoleSpy } from '@walletmesh/discovery/testing';
 *
 * it('should handle errors with proper logging', async () => {
 *   await withConsoleSpy(async (spy) => {
 *     component.triggerError();
 *     expect(spy.error).toHaveBeenCalledWith(expect.stringContaining('Error'));
 *   });
 * });
 * ```
 *
 * @module consoleMocks
 * @category Testing
 * @since 1.0.0
 */

// Use vitest's mock function type
type MockFunction = ReturnType<typeof import('vitest').vi.fn>;

// Type for globalThis with vi
interface GlobalWithVi {
  vi?: {
    fn: () => MockFunction;
  };
}

/**
 * Console spy interface with mock functions for each console method.
 */
export interface ConsoleSpy {
  /** Mock function for console.log calls */
  log: MockFunction;
  /** Mock function for console.warn calls */
  warn: MockFunction;
  /** Mock function for console.error calls */
  error: MockFunction;
  /** Mock function for console.info calls */
  info: MockFunction;
  /** Mock function for console.debug calls */
  debug: MockFunction;
  /** Restore original console methods */
  restore: () => void;
}

/**
 * Configuration options for console spy creation.
 */
export interface ConsoleSpyOptions {
  /** Methods to spy on (defaults to all) */
  methods?: Array<'log' | 'warn' | 'error' | 'info' | 'debug'>;
  /** Whether to suppress actual console output (defaults to true) */
  suppressOutput?: boolean;
  /** Mock function factory for dependency injection */
  mockFn?: () => MockFunction;
}

/**
 * Create a console spy that intercepts console method calls.
 *
 * This function creates mock implementations for console methods that can be
 * used to verify logging behavior in tests while optionally suppressing
 * actual console output to keep test output clean.
 *
 * @param options - Configuration options for the spy
 * @returns ConsoleSpy object with mock functions and restore method
 *
 * @example
 * ```typescript
 * describe('Error handling', () => {
 *   let consoleSpy: ConsoleSpy;
 *
 *   beforeEach(() => {
 *     consoleSpy = createConsoleSpy();
 *   });
 *
 *   afterEach(() => {
 *     consoleSpy.restore();
 *   });
 *
 *   it('should log security warnings', () => {
 *     securityValidator.checkOrigin('http://malicious.com');
 *
 *     expect(consoleSpy.warn).toHaveBeenCalledWith(
 *       '[WalletMesh] Origin blocked: http://malicious.com'
 *     );
 *   });
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createConsoleSpy(options: ConsoleSpyOptions = {}): ConsoleSpy {
  const {
    methods = ['log', 'warn', 'error', 'info', 'debug'],
    suppressOutput = true,
    mockFn = () => {
      const globalWithVi = globalThis as unknown as GlobalWithVi;
      if (globalWithVi.vi?.fn) {
        return globalWithVi.vi.fn();
      }
      throw new Error(
        'Vitest is required for ConsoleSpy. Ensure tests are running in vitest environment and pass mockFn option.',
      );
    },
  } = options;

  // Store original console methods
  const originalMethods: Partial<Record<keyof ConsoleSpy, (...args: unknown[]) => void>> = {};

  // Create mock functions for each method
  const mockLog = mockFn();
  const mockWarn = mockFn();
  const mockError = mockFn();
  const mockInfo = mockFn();
  const mockDebug = mockFn();

  // Map methods to their mocks
  const methodMap = {
    log: mockLog,
    warn: mockWarn,
    error: mockError,
    info: mockInfo,
    debug: mockDebug,
  };

  for (const method of methods) {
    // Store original method
    originalMethods[method] = console[method];

    // Get mock function for this method
    const mockFunction = methodMap[method];

    // Set up mock implementation
    if (suppressOutput) {
      // Silent implementation - just track calls
      mockFunction.mockImplementation?.(() => {});
    } else {
      // Pass-through implementation - call original but still track
      mockFunction.mockImplementation?.((...args: unknown[]) => {
        const original = originalMethods[method];
        if (original) {
          return original.apply(console, args);
        }
      });
    }

    // Replace console method with mock
    (console as unknown as Record<string, MockFunction>)[method] = mockFunction;
  }

  const restore = () => {
    for (const method of methods) {
      const original = originalMethods[method];
      if (original) {
        (console as unknown as Record<string, (...args: unknown[]) => void>)[method] = original;
      }
    }
  };

  return {
    log: mockLog,
    warn: mockWarn,
    error: mockError,
    info: mockInfo,
    debug: mockDebug,
    restore,
  };
}

/**
 * Create a silent console spy that suppresses all output.
 *
 * This is a convenience function for the most common use case - creating
 * a console spy that tracks calls but doesn't output anything to the console.
 *
 * @param methods - Optional array of methods to spy on
 * @param mockFn - Optional mock function factory
 * @returns ConsoleSpy object with silent mock functions
 *
 * @example
 * ```typescript
 * import { createSilentConsoleSpy } from '@walletmesh/discovery/testing';
 *
 * describe('Noisy component', () => {
 *   let consoleSpy: ConsoleSpy;
 *
 *   beforeEach(() => {
 *     consoleSpy = createSilentConsoleSpy();
 *   });
 *
 *   afterEach(() => {
 *     consoleSpy.restore();
 *   });
 *
 *   it('should not pollute test output', () => {
 *     noisyComponent.doLotsOfLogging();
 *     // Test runs silently but we can still check calls
 *     expect(consoleSpy.log).toHaveBeenCalled();
 *   });
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createSilentConsoleSpy(
  methods?: Array<'log' | 'warn' | 'error' | 'info' | 'debug'>,
  mockFn?: () => MockFunction,
): ConsoleSpy {
  return createConsoleSpy({
    ...(methods && { methods }),
    suppressOutput: true,
    ...(mockFn && { mockFn }),
  });
}

/**
 * Execute a test function with console spying enabled.
 *
 * This higher-order function creates a console spy, executes the provided
 * test function with the spy as an argument, and automatically restores
 * console methods afterward. This ensures proper cleanup even if the test
 * throws an error.
 *
 * @param testFn - Test function to execute with console spy
 * @param options - Optional console spy configuration
 * @returns Promise that resolves to the return value of the test function
 * @throws Re-throws any error from the test function after cleanup
 *
 * @example
 * ```typescript
 * import { withConsoleSpy } from '@walletmesh/discovery/testing';
 *
 * it('should log appropriate messages', async () => {
 *   await withConsoleSpy(async (spy) => {
 *     initiator.startDiscovery();
 *
 *     expect(spy.info).toHaveBeenCalledWith(
 *       expect.stringContaining('Discovery started')
 *     );
 *
 *     // Error in test won't leave console in a bad state
 *     expect(spy.warn).toHaveBeenCalledTimes(0);
 *   });
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export async function withConsoleSpy<T>(
  testFn: (spy: ConsoleSpy) => T | Promise<T>,
  options?: ConsoleSpyOptions,
): Promise<T> {
  const spy = createConsoleSpy(options);

  try {
    return await testFn(spy);
  } finally {
    spy.restore();
  }
}

/**
 * Create a console spy that captures output for inspection.
 *
 * This utility creates a console spy that not only tracks method calls
 * but also captures the actual output that would have been logged. This
 * is useful for testing the exact content of log messages.
 *
 * @param options - Console spy configuration options
 * @returns ConsoleSpy with additional output capture methods
 *
 * @example
 * ```typescript
 * import { createCapturingConsoleSpy } from '@walletmesh/discovery/testing';
 *
 * it('should capture exact log messages', () => {
 *   const spy = createCapturingConsoleSpy();
 *
 *   logger.warn('Rate limit exceeded for origin:', 'https://bad-actor.com');
 *
 *   const warnCalls = spy.warn.mock.calls;
 *   expect(warnCalls[0]).toEqual([
 *     'Rate limit exceeded for origin:',
 *     'https://bad-actor.com'
 *   ]);
 *
 *   spy.restore();
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createCapturingConsoleSpy(options?: ConsoleSpyOptions): ConsoleSpy {
  return createConsoleSpy({
    ...options,
    suppressOutput: false, // Don't suppress output for capturing
  });
}

/**
 * Utility to temporarily silence console output during test execution.
 *
 * This is useful for tests that need to run components that log heavily
 * but where you don't need to verify the logging behavior.
 *
 * @param testFn - Function to execute with silenced console
 * @returns Promise that resolves to the return value of the test function
 *
 * @example
 * ```typescript
 * import { withSilentConsole } from '@walletmesh/discovery/testing';
 *
 * it('should work without console noise', async () => {
 *   await withSilentConsole(async () => {
 *     // This component logs a lot but we don't care about the output
 *     const result = await noisyComponent.doComplexOperation();
 *     expect(result.status).toBe('success');
 *   });
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export async function withSilentConsole<T>(testFn: () => T | Promise<T>): Promise<T> {
  return withConsoleSpy(testFn, {
    suppressOutput: true,
    mockFn: () => {
      const globalWithVi = globalThis as unknown as GlobalWithVi;
      if (globalWithVi.vi?.fn) {
        return globalWithVi.vi.fn();
      }
      throw new Error(
        'Vitest is required for withSilentConsole. Ensure tests are running in vitest environment.',
      );
    },
  });
}

/**
 * Common console spy patterns for discovery protocol testing.
 *
 * This object provides pre-configured console spy setups for common
 * testing scenarios in the discovery protocol.
 */
export const consoleSpyPatterns = {
  /**
   * Spy configuration for security-related tests.
   * Focuses on warn and error methods commonly used for security logging.
   */
  security: {
    methods: ['warn', 'error'],
    suppressOutput: true,
  },

  /**
   * Spy configuration for general component testing.
   * Includes all console methods with output suppression.
   */
  general: {
    methods: ['log', 'warn', 'error', 'info', 'debug'],
    suppressOutput: true,
  },

  /**
   * Spy configuration for debugging test issues.
   * Allows output to pass through while still tracking calls.
   */
  debug: {
    methods: ['log', 'warn', 'error', 'info', 'debug'],
    suppressOutput: false,
  },
} as const;

/**
 * Create a console spy using a predefined pattern.
 *
 * @param pattern - The pattern name to use
 * @param mockFn - Optional mock function factory
 * @returns ConsoleSpy configured for the specified pattern
 *
 * @example
 * ```typescript
 * import { createConsoleSpyWithPattern } from '@walletmesh/discovery/testing';
 *
 * it('should handle security violations', () => {
 *   const spy = createConsoleSpyWithPattern('security');
 *
 *   securityManager.blockOrigin('https://malicious.com');
 *
 *   expect(spy.warn).toHaveBeenCalled();
 *   spy.restore();
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createConsoleSpyWithPattern(
  pattern: keyof typeof consoleSpyPatterns,
  mockFn?: () => MockFunction,
): ConsoleSpy {
  const patternConfig = consoleSpyPatterns[pattern];
  return createConsoleSpy({
    methods: [...patternConfig.methods] as Array<'log' | 'warn' | 'error' | 'info' | 'debug'>,
    suppressOutput: patternConfig.suppressOutput,
    ...(mockFn && { mockFn }),
  });
}
