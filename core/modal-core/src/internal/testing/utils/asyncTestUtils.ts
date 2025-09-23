/**
 * Async testing utilities for modal-core testing
 *
 * Provides utilities for testing async operations, timers, promises,
 * and time-dependent behavior. Includes helpers for controlling time
 * in tests and testing async error scenarios.
 *
 * @packageDocumentation
 * @internal
 */

import { expect, vi } from 'vitest';

/**
 * Configuration for async test scenarios
 * @interface AsyncTestConfig
 */
export interface AsyncTestConfig {
  /** Timeout for async operations */
  timeout?: number;
  /** Number of retries for flaky operations */
  retries?: number;
  /** Delay between operations */
  delay?: number;
  /** Whether to use fake timers */
  useFakeTimers?: boolean;
}

/**
 * Timer management utilities for testing time-dependent behavior
 */
export const timerUtils = {
  /**
   * Sets up fake timers with automatic cleanup
   *
   * @param config - Timer configuration
   * @returns Cleanup function
   *
   * @example
   * ```typescript
   * beforeEach(() => {
   *   timerUtils.setupFakeTimers();
   * });
   *
   * afterEach(() => {
   *   timerUtils.cleanupFakeTimers();
   * });
   * ```
   */
  setupFakeTimers: (config: { shouldAdvanceTime?: boolean } = {}) => {
    vi.useFakeTimers();

    if (config.shouldAdvanceTime) {
      // Auto-advance timers for tests that need time progression
      vi.setSystemTime(new Date('2024-01-01'));
    }

    return () => timerUtils.cleanupFakeTimers();
  },

  /**
   * Cleans up fake timers and restores real timers
   */
  cleanupFakeTimers: () => {
    vi.useRealTimers();
  },

  /**
   * Advances fake timers by specified time
   *
   * @param ms - Milliseconds to advance
   *
   * @example
   * ```typescript
   * // In a test with fake timers
   * const promise = delayedOperation(1000);
   * timerUtils.advanceTime(1000);
   * await expect(promise).resolves.toBeDefined();
   * ```
   */
  advanceTime: (ms: number) => {
    vi.advanceTimersByTime(ms);
  },

  /**
   * Advances fake timers to next timer
   */
  advanceToNextTimer: () => {
    vi.advanceTimersToNextTimer();
  },

  /**
   * Runs all pending timers
   */
  runAllTimers: () => {
    vi.runAllTimers();
  },

  /**
   * Gets the current fake time
   */
  getCurrentTime: () => {
    return vi.getMockedSystemTime() || Date.now();
  },

  /**
   * Creates a test that advances time automatically
   *
   * @param duration - Duration to advance
   * @param interval - Interval between advances
   * @returns Timer control object
   */
  createTimerTest: (duration: number, interval = 100) => {
    let elapsed = 0;

    return {
      advance: () => {
        if (elapsed < duration) {
          const step = Math.min(interval, duration - elapsed);
          vi.advanceTimersByTime(step);
          elapsed += step;
        }
        return elapsed;
      },

      advanceToEnd: () => {
        if (elapsed < duration) {
          vi.advanceTimersByTime(duration - elapsed);
          elapsed = duration;
        }
        return elapsed;
      },

      getElapsed: () => elapsed,
      isComplete: () => elapsed >= duration,
    };
  },
};

/**
 * Promise utilities for testing async operations
 */
export const promiseUtils = {
  /**
   * Creates a controllable promise for testing
   *
   * @returns Controllable promise object
   *
   * @example
   * ```typescript
   * const { promise, resolve, reject } = promiseUtils.createControllablePromise();
   *
   * // In test
   * const operation = someAsyncOperation();
   * resolve('test-value');
   * await expect(operation).resolves.toBe('test-value');
   * ```
   */
  createControllablePromise: <T = unknown>() => {
    let resolvePromise: (value: T | PromiseLike<T>) => void;
    let rejectPromise: (reason?: unknown) => void;

    const promise = new Promise<T>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    return {
      promise,
      // biome-ignore lint/style/noNonNullAssertion: Promises are assigned in constructor
      resolve: resolvePromise!,
      // biome-ignore lint/style/noNonNullAssertion: Promises are assigned in constructor
      reject: rejectPromise!,

      // Utility methods
      resolveAfter: (value: T, delay: number) => {
        setTimeout(() => resolvePromise(value), delay);
      },

      rejectAfter: (reason: unknown, delay: number) => {
        setTimeout(() => rejectPromise(reason), delay);
      },
    };
  },

  /**
   * Creates a promise that resolves after a delay
   *
   * @param value - Value to resolve with
   * @param delay - Delay in milliseconds
   * @returns Promise that resolves with value after delay
   */
  delay: <T>(value: T, delay: number): Promise<T> => {
    return new Promise((resolve) => {
      if (vi.isFakeTimers()) {
        // If using fake timers, resolve immediately and let the test advance time
        resolve(value);
      } else {
        setTimeout(() => resolve(value), delay);
      }
    });
  },

  /**
   * Creates a promise that rejects after a delay
   *
   * @param reason - Reason for rejection
   * @param delay - Delay in milliseconds
   * @returns Promise that rejects after delay
   */
  delayedReject: (reason: unknown, delay: number): Promise<never> => {
    return new Promise((_, reject) => {
      if (vi.isFakeTimers()) {
        // If using fake timers, reject immediately and let the test advance time
        reject(reason);
      } else {
        setTimeout(() => reject(reason), delay);
      }
    });
  },

  /**
   * Waits for all promises to settle (resolve or reject)
   *
   * @param promises - Array of promises
   * @returns Promise that resolves when all settle
   */
  waitForAll: async <T>(promises: Promise<T>[]): Promise<PromiseSettledResult<T>[]> => {
    return Promise.allSettled(promises);
  },

  /**
   * Waits for condition to be true with polling
   *
   * @param condition - Function that returns boolean or promise of boolean
   * @param options - Polling configuration
   * @returns Promise that resolves when condition is true
   *
   * @example
   * ```typescript
   * await promiseUtils.waitForCondition(
   *   () => mockObject.someProperty === 'expected',
   *   { timeout: 1000, interval: 100 }
   * );
   * ```
   */
  waitForCondition: async (
    condition: () => boolean | Promise<boolean>,
    options: { timeout?: number; interval?: number } = {},
  ): Promise<void> => {
    const { timeout = 5000, interval = 100 } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const result = await condition();
      if (result) {
        return;
      }
      if (vi.isFakeTimers()) {
        // With fake timers, we need to advance time and flush promises
        await vi.advanceTimersByTimeAsync(interval);
      } else {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Creates a timeout promise that rejects after specified time
   *
   * @param ms - Timeout in milliseconds
   * @param message - Error message
   * @returns Promise that rejects after timeout
   */
  timeout: (ms: number, message = `Operation timed out after ${ms}ms`): Promise<never> => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  },

  /**
   * Races a promise against a timeout
   *
   * @param promise - Promise to race
   * @param timeoutMs - Timeout in milliseconds
   * @returns Promise that resolves with original promise or rejects on timeout
   */
  withTimeout: async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return Promise.race([promise, promiseUtils.timeout(timeoutMs)]);
  },
};

/**
 * Utilities for testing async sequences and workflows
 */
export const sequenceUtils = {
  /**
   * Creates a sequence of async operations for testing
   *
   * @param operations - Array of async operations
   * @param config - Sequence configuration
   * @returns Sequence executor
   *
   * @example
   * ```typescript
   * const sequence = sequenceUtils.createSequence([
   *   () => connectToWallet(),
   *   () => getAccounts(),
   *   () => signTransaction()
   * ]);
   *
   * const results = await sequence.execute();
   * ```
   */
  createSequence: <T>(
    operations: Array<() => Promise<T>>,
    config: { delay?: number; stopOnError?: boolean } = {},
  ) => {
    const { delay = 0, stopOnError = true } = config;

    return {
      async execute(): Promise<T[]> {
        const results: T[] = [];

        for (let i = 0; i < operations.length; i++) {
          try {
            if (delay > 0 && i > 0) {
              if (vi.isFakeTimers()) {
                await vi.advanceTimersByTimeAsync(delay);
              } else {
                await new Promise((resolve) => setTimeout(resolve, delay));
              }
            }

            const operation = operations[i];
            if (!operation) continue;
            const result = await operation();
            results.push(result);
          } catch (error) {
            if (stopOnError) {
              throw error;
            }
            // Continue with next operation
          }
        }

        return results;
      },

      async executeWithResults(): Promise<PromiseSettledResult<T>[]> {
        const promises = operations.map(async (op, index) => {
          if (delay > 0 && index > 0) {
            if (vi.isFakeTimers()) {
              await vi.advanceTimersByTimeAsync(delay * index);
            } else {
              await new Promise((resolve) => setTimeout(resolve, delay * index));
            }
          }
          return op();
        });

        return Promise.allSettled(promises);
      },
    };
  },

  /**
   * Creates a parallel execution utility
   *
   * @param operations - Array of async operations
   * @param config - Parallel execution configuration
   * @returns Parallel executor
   */
  createParallel: <T>(operations: Array<() => Promise<T>>, config: { concurrency?: number } = {}) => {
    const { concurrency = operations.length } = config;

    return {
      async execute(): Promise<T[]> {
        const results: T[] = [];

        for (let i = 0; i < operations.length; i += concurrency) {
          const batch = operations.slice(i, i + concurrency);
          const batchPromises = batch.map((op) => op());
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        }

        return results;
      },

      async executeSettled(): Promise<PromiseSettledResult<T>[]> {
        const batches: Promise<T>[][] = [];

        for (let i = 0; i < operations.length; i += concurrency) {
          const batch = operations.slice(i, i + concurrency);
          batches.push(batch.map((op) => op()));
        }

        const allResults: PromiseSettledResult<T>[] = [];

        for (const batch of batches) {
          const batchResults = await Promise.allSettled(batch);
          allResults.push(...batchResults);
        }

        return allResults;
      },
    };
  },
};

/**
 * Utilities for testing retry and backoff strategies
 */
export const retryUtils = {
  /**
   * Creates a retry mechanism for testing
   *
   * @param config - Retry configuration
   * @returns Retry utility
   *
   * @example
   * ```typescript
   * const retry = retryUtils.createRetry({
   *   maxAttempts: 3,
   *   backoff: 'exponential',
   *   baseDelay: 100
   * });
   *
   * const result = await retry.execute(() => flakeyOperation());
   * ```
   */
  createRetry: (
    config: {
      maxAttempts?: number;
      backoff?: 'linear' | 'exponential' | 'fixed';
      baseDelay?: number;
      maxDelay?: number;
    } = {},
  ) => {
    const { maxAttempts = 3, backoff = 'exponential', baseDelay = 100, maxDelay = 5000 } = config;

    const calculateDelay = (attempt: number): number => {
      let delay: number;

      switch (backoff) {
        case 'linear':
          delay = baseDelay * attempt;
          break;
        case 'exponential':
          delay = baseDelay * 2 ** (attempt - 1);
          break;
        default:
          delay = baseDelay;
          break;
      }

      return Math.min(delay, maxDelay);
    };

    return {
      async execute<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: unknown;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await operation();
          } catch (error) {
            lastError = error;

            if (attempt === maxAttempts) {
              throw error;
            }

            const delay = calculateDelay(attempt);
            if (vi.isFakeTimers()) {
              await vi.advanceTimersByTimeAsync(delay);
            } else {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }

        throw lastError;
      },

      getDelay: calculateDelay,
      getMaxAttempts: () => maxAttempts,
    };
  },

  /**
   * Creates a mock function that fails N times before succeeding
   *
   * @param failuresToSimulate - Number of failures to simulate
   * @param successValue - Value to return on success
   * @param errorToThrow - Error to throw on failure
   * @returns Mock function
   */
  createFlakeyMock: <T>(
    failuresToSimulate: number,
    successValue: T,
    errorToThrow: Error = new Error('Simulated failure'),
  ) => {
    let attempts = 0;

    return vi.fn().mockImplementation(async (): Promise<T> => {
      attempts++;

      if (attempts <= failuresToSimulate) {
        throw errorToThrow;
      }

      return successValue;
    });
  },
};

/**
 * Performance testing utilities
 */
export const performanceUtils = {
  /**
   * Measures execution time of async operations
   *
   * @param operation - Async operation to measure
   * @returns Execution time in milliseconds and result
   *
   * @example
   * ```typescript
   * const { duration, result } = await performanceUtils.measureTime(
   *   () => expensiveAsyncOperation()
   * );
   *
   * expect(duration).toBeLessThan(1000); // Should complete in under 1 second
   * ```
   */
  measureTime: async <T>(
    operation: () => Promise<T>,
  ): Promise<{
    duration: number;
    result: T;
  }> => {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();

    return {
      duration: endTime - startTime,
      result,
    };
  },

  /**
   * Creates a performance benchmark for comparing operations
   *
   * @param operations - Object with named operations
   * @param iterations - Number of iterations to run
   * @returns Benchmark results
   */
  benchmark: async <T extends Record<string, () => Promise<unknown>>>(
    operations: T,
    iterations = 10,
  ): Promise<Record<keyof T, { average: number; min: number; max: number }>> => {
    const results = {} as Record<keyof T, { average: number; min: number; max: number }>;

    for (const [name, operation] of Object.entries(operations)) {
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const { duration } = await performanceUtils.measureTime(operation);
        times.push(duration);
      }

      results[name as keyof T] = {
        average: times.reduce((sum, time) => sum + time, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
      };
    }

    return results;
  },
};

/**
 * Test assertion utilities for async operations
 */
export const asyncAssertions = {
  /**
   * Asserts that a promise resolves within a specified time
   *
   * @param promise - Promise to test
   * @param maxTime - Maximum time in milliseconds
   * @param message - Custom error message
   */
  expectResolvesWithin: async <T>(promise: Promise<T>, maxTime: number, message?: string): Promise<T> => {
    const { duration, result } = await performanceUtils.measureTime(() => promise);

    expect(duration).toBeLessThanOrEqual(maxTime);

    if (message && duration > maxTime) {
      throw new Error(message);
    }

    return result;
  },

  /**
   * Asserts that a promise rejects within a specified time
   *
   * @param promise - Promise to test
   * @param maxTime - Maximum time in milliseconds
   */
  expectRejectsWithin: async (promise: Promise<unknown>, maxTime: number): Promise<unknown> => {
    const start = performance.now();
    let rejectionReason: unknown;

    try {
      await promise;
      throw new Error('Promise was expected to reject but resolved');
    } catch (error) {
      rejectionReason = error;
    }

    const duration = performance.now() - start;
    expect(duration).toBeLessThanOrEqual(maxTime);

    return rejectionReason;
  },

  /**
   * Asserts that async operations complete in order
   *
   * @param operations - Array of async operations
   */
  expectCompletesInOrder: async <T>(operations: Array<() => Promise<T>>): Promise<T[]> => {
    const startTimes: number[] = [];
    const endTimes: number[] = [];
    const results: T[] = [];

    // Start all operations
    const promises = operations.map((operation, index) => {
      startTimes[index] = performance.now();
      return operation().then((result) => {
        endTimes[index] = performance.now();
        return result;
      });
    });

    // Wait for all to complete
    const allResults = await Promise.all(promises);
    results.push(...allResults);

    // Verify order (each operation should complete after it started)
    for (let i = 0; i < operations.length; i++) {
      const endTime = endTimes[i];
      const startTime = startTimes[i];
      if (endTime !== undefined && startTime !== undefined) {
        expect(endTime).toBeGreaterThan(startTime);
      }
    }

    return results;
  },
};
