/**
 * Test utilities for transport tests to improve performance
 * @internal
 */

import { vi } from 'vitest';

/**
 * Interface description
 * @interface
 */
export interface TransportTestConfig {
  timeout?: number;
  retryDelay?: number;
  retries?: number;
}

/**
 * Set up transport tests with fake timers for better performance
 */
export const setupTransportTest = () => {
  // Use fake timers for fast test execution
  vi.useFakeTimers();

  return {
    /**
     * Configuration optimized for fake timers
     */
    config: {
      timeout: 1000, // 1 second is plenty for fake timers
      retryDelay: 100, // 100ms for fake timers
      retries: 3,
    },

    /**
     * Advance timers to trigger a timeout
     */
    advanceToTimeout: async (timeout = 2000) => {
      await vi.advanceTimersByTimeAsync(timeout);
    },

    /**
     * Advance through retry attempts
     */
    advanceThroughRetries: async (retries = 3, delay = 100) => {
      // Advance through all retry delays plus buffer
      await vi.advanceTimersByTimeAsync((retries + 1) * delay + 100);
    },

    /**
     * Run all pending timers
     */
    runAllTimers: async () => {
      await vi.runAllTimersAsync();
    },

    /**
     * Cleanup fake timers
     */
    cleanup: () => {
      vi.useRealTimers();
    },
  };
};

/**
 * Mock queueMicrotask for synchronous execution in tests
 */
export const mockQueueMicrotask = () => {
  const original = global.queueMicrotask;

  global.queueMicrotask = ((callback: VoidFunction) => {
    // Execute immediately in tests
    callback();
  }) as typeof queueMicrotask;

  return () => {
    global.queueMicrotask = original;
  };
};
