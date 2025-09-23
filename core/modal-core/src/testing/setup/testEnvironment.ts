/**
 * Standardized test environment setup utilities
 *
 * Provides consistent setup/teardown patterns used across modal-core tests
 * to eliminate boilerplate and ensure proper resource cleanup.
 */

import { vi } from 'vitest';
import type { MockedFunction } from 'vitest';

/**
 * Configuration options for test environment setup
 */
export interface TestEnvironmentConfig {
  /** Enable fake timers (default: true) */
  useFakeTimers?: boolean;
  /** Clear all mocks in setup (default: true) */
  clearMocks?: boolean;
  /** Restore all mocks in teardown (default: true) */
  restoreMocks?: boolean;
  /** Custom setup function to run after standard setup */
  customSetup?: () => void | Promise<void>;
  /** Custom teardown function to run before standard teardown */
  customTeardown?: () => void | Promise<void>;
}

/**
 * Test environment manager for consistent setup/teardown
 */
export class TestEnvironment {
  private config: Required<TestEnvironmentConfig>;

  constructor(config: TestEnvironmentConfig = {}) {
    this.config = {
      useFakeTimers: true,
      clearMocks: true,
      restoreMocks: true,
      customSetup: () => {},
      customTeardown: () => {},
      ...config,
    };
  }

  /**
   * Setup test environment (call in beforeEach)
   */
  async setup(): Promise<void> {
    if (this.config.clearMocks) {
      vi.clearAllMocks();
    }

    if (this.config.useFakeTimers) {
      vi.useFakeTimers();
    }

    await this.config.customSetup();
  }

  /**
   * Teardown test environment (call in afterEach)
   */
  async teardown(): Promise<void> {
    await this.config.customTeardown();

    if (this.config.restoreMocks) {
      vi.restoreAllMocks();
    }

    if (this.config.useFakeTimers) {
      vi.useRealTimers();
    }
  }

  /**
   * Advance fake timers by specified time
   */
  async advanceTimers(time: number): Promise<void> {
    if (this.config.useFakeTimers) {
      await vi.advanceTimersByTimeAsync(time);
    }
  }

  /**
   * Run all pending timers
   */
  async runAllTimers(): Promise<void> {
    if (this.config.useFakeTimers) {
      await vi.runAllTimersAsync();
    }
  }
}

/**
 * Creates a standard test environment manager
 *
 * @example
 * ```typescript
 * describe('MyComponent', () => {
 *   const testEnv = createTestEnvironment();
 *
 *   beforeEach(async () => {
 *     await testEnv.setup();
 *   });
 *
 *   afterEach(async () => {
 *     await testEnv.teardown();
 *   });
 *
 *   it('should work with timers', async () => {
 *     // Test with fake timers
 *     await testEnv.advanceTimers(1000);
 *   });
 * });
 * ```
 */
export function createTestEnvironment(config?: TestEnvironmentConfig): TestEnvironment {
  return new TestEnvironment(config);
}

/**
 * Common test setup patterns
 */
export const testSetupPatterns = {
  /**
   * Standard pattern: fake timers, clear mocks, restore mocks
   */
  standard: () => createTestEnvironment(),

  /**
   * Real timers pattern: for integration tests that need real timing
   */
  realTimers: () => createTestEnvironment({ useFakeTimers: false }),

  /**
   * Minimal pattern: no automatic setup, manual control
   */
  minimal: () =>
    createTestEnvironment({
      useFakeTimers: false,
      clearMocks: false,
      restoreMocks: false,
    }),

  /**
   * Service testing pattern: includes service-specific cleanup
   */
  serviceTest: (cleanup?: () => void | Promise<void>) =>
    createTestEnvironment({
      ...(cleanup && { customTeardown: cleanup }),
    }),
} as const;

/**
 * Timer utilities for tests using fake timers
 */
export const timerUtils = {
  /**
   * Wait for next tick
   */
  nextTick: () => new Promise((resolve) => setTimeout(resolve, 0)),

  /**
   * Advance timers and wait for all promises
   */
  advanceAndFlush: async (time: number) => {
    await vi.advanceTimersByTimeAsync(time);
    await timerUtils.nextTick();
  },

  /**
   * Advance timers in steps for gradual testing
   */
  advanceInSteps: async (totalTime: number, steps: number) => {
    const stepTime = totalTime / steps;
    for (let i = 0; i < steps; i++) {
      await vi.advanceTimersByTimeAsync(stepTime);
      await timerUtils.nextTick();
    }
  },
} as const;

/**
 * Mock utilities for common patterns
 */
export const mockUtils = {
  /**
   * Create a mock function with type safety
   */
  createTypedMock: <T extends (...args: unknown[]) => unknown>(): MockedFunction<T> => {
    return vi.fn() as MockedFunction<T>;
  },

  /**
   * Create a mock with default implementation
   */
  createMockWithDefaults: <T extends (...args: unknown[]) => unknown>(defaults: T): MockedFunction<T> => {
    return vi.fn().mockImplementation(defaults) as MockedFunction<T>;
  },

  /**
   * Reset all calls on multiple mocks
   */
  resetMocks: (...mocks: MockedFunction<(...args: unknown[]) => unknown>[]) => {
    for (const mock of mocks) {
      mock.mockClear();
    }
  },
} as const;
