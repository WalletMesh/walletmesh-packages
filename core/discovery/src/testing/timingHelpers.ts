/**
 * Timing and async testing helpers for discovery protocol testing.
 *
 * These utilities provide consistent and reliable timing patterns for testing
 * asynchronous discovery protocol operations, timeout scenarios, and time-based
 * state transitions. All utilities are designed to work with Vitest fake timers
 * to ensure fast and deterministic test execution.
 *
 * @example Basic fake timer setup:
 * ```typescript
 * import { setupFakeTimers, cleanupFakeTimers } from '@walletmesh/discovery/testing';
 *
 * beforeEach(() => {
 *   setupFakeTimers();
 * });
 *
 * afterEach(() => {
 *   cleanupFakeTimers();
 * });
 * ```
 *
 * @example Timeout testing:
 * ```typescript
 * import { timeoutTestHelper } from '@walletmesh/discovery/testing';
 *
 * await timeoutTestHelper(
 *   () => listener.startDiscovery(),
 *   3000, // Expected timeout
 *   () => expect(listener.getQualifiedResponders()).toHaveLength(0)
 * );
 * ```
 *
 * @module timingHelpers
 * @category Testing
 * @since 1.0.0
 */

import { vi, expect } from 'vitest';

/**
 * Configuration options for timing helpers.
 */
export interface TimingConfig {
  /** Default timeout in milliseconds for async operations */
  defaultTimeout?: number;
  /** Default polling interval in milliseconds for condition waiting */
  defaultInterval?: number;
  /** Whether to automatically advance timers in time-based operations */
  autoAdvance?: boolean;
}

/**
 * Default timing configuration values.
 */
const DEFAULT_TIMING_CONFIG: Required<TimingConfig> = {
  defaultTimeout: 5000,
  defaultInterval: 100,
  autoAdvance: true,
};

/**
 * Set up fake timers for consistent test timing.
 *
 * This function configures Vitest fake timers with the recommended settings
 * for discovery protocol testing. It should be called in beforeEach hooks
 * to ensure all time-dependent operations in tests are deterministic and fast.
 *
 * @param config - Optional configuration for timer behavior
 * @example
 * ```typescript
 * beforeEach(() => {
 *   setupFakeTimers();
 * });
 *
 * // Or with custom configuration
 * beforeEach(() => {
 *   setupFakeTimers({
 *     shouldAdvanceTime: true,
 *     advanceTimeDelta: 20
 *   });
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function setupFakeTimers(config?: {
  /** Whether timers should automatically advance */
  shouldAdvanceTime?: boolean;
  /** Time delta for automatic advancement */
  advanceTimeDelta?: number;
}): void {
  vi.useFakeTimers({
    shouldAdvanceTime: config?.shouldAdvanceTime || false,
    advanceTimeDelta: config?.advanceTimeDelta || 20,
  });
}

/**
 * Clean up fake timers and restore real timers.
 *
 * This function restores real timers and cleans up any pending mock state.
 * It should be called in afterEach hooks to ensure proper cleanup between tests.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   cleanupFakeTimers();
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function cleanupFakeTimers(): void {
  vi.useRealTimers();
  vi.restoreAllMocks();
}

/**
 * Advance fake timers and wait for any async operations to complete.
 *
 * This function combines timer advancement with async waiting to ensure that
 * all pending async operations have a chance to complete after time advances.
 * This is essential for testing time-dependent discovery protocol operations.
 *
 * @param ms - Number of milliseconds to advance
 * @returns Promise that resolves after time advancement and async operations
 * @example
 * ```typescript
 * // Start a discovery operation with 3-second timeout
 * const discoveryPromise = listener.startDiscovery();
 *
 * // Advance time to trigger timeout
 * await advanceTimeAndWait(3000);
 *
 * // Now check the result
 * expect(listener.getStats().isDiscovering).toBe(false);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function advanceTimeAndWait(ms: number): Promise<void> {
  // Check if fake timers are set up
  if (vi.isFakeTimers()) {
    await vi.advanceTimersByTimeAsync(ms);
  } else {
    // Fall back to real timer wait
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
  // Allow any additional microtasks to process
  await new Promise((resolve) => process.nextTick(resolve));
}

/**
 * Test helper for operations that should timeout after a specific duration.
 *
 * This utility function helps test timeout scenarios by starting an operation,
 * advancing time to trigger the timeout, and then validating the expected
 * timeout behavior. It ensures consistent timeout testing across the discovery protocol.
 *
 * @param operation - Function that returns a promise representing the operation to test
 * @param expectedTimeoutMs - Expected timeout duration in milliseconds
 * @param timeoutValidation - Optional function to validate timeout behavior
 * @returns Promise that resolves after timeout testing is complete
 * @throws Error if the operation doesn't timeout as expected
 * @example
 * ```typescript
 * await timeoutTestHelper(
 *   () => listener.startDiscovery(),
 *   3000,
 *   () => {
 *     expect(listener.isDiscoveryInProgress()).toBe(false);
 *     expect(listener.getQualifiedResponders()).toHaveLength(0);
 *   }
 * );
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function timeoutTestHelper<T>(
  operation: () => Promise<T>,
  expectedTimeoutMs: number,
  timeoutValidation?: () => void | Promise<void>,
): Promise<void> {
  // Start the operation
  const operationPromise = operation();

  // Advance time to just before timeout
  await advanceTimeAndWait(expectedTimeoutMs - 100);

  // Operation should still be pending
  let operationCompleted = false;
  operationPromise
    .then(() => {
      operationCompleted = true;
    })
    .catch(() => {
      operationCompleted = true;
    });

  // Give a brief moment for any synchronous completion
  await new Promise((resolve) => process.nextTick(resolve));

  // Advanced time should not have completed the operation yet
  expect(operationCompleted).toBe(false);

  // Now advance past the timeout
  await advanceTimeAndWait(200);

  // Operation should be completed/timed out
  await new Promise((resolve) => process.nextTick(resolve));

  // Run timeout validation if provided
  if (timeoutValidation) {
    await timeoutValidation();
  }
}

/**
 * Wait for an event to be dispatched on an EventTarget with timeout.
 *
 * This utility waits for a specific event type to be dispatched on an EventTarget,
 * with support for timeout and fake timer advancement. Useful for testing event-driven
 * discovery protocol interactions.
 *
 * @param eventTarget - The EventTarget to listen for events on
 * @param eventType - The type of event to wait for
 * @param timeout - Maximum time to wait in milliseconds
 * @param advanceTime - Whether to automatically advance fake timers while waiting
 * @returns Promise that resolves with the event when it's dispatched
 * @throws Error if timeout is reached before event is dispatched
 * @example
 * ```typescript
 * const announcer = new MockDiscoveryResponder(config);
 * announcer.startListening();
 *
 * // Start discovery and wait for announcement
 * const discoveryPromise = listener.startDiscovery();
 * const event = await waitForEventDispatch(
 *   eventTarget,
 *   'responder:announce',
 *   2000
 * );
 *
 * expect(event.detail.name).toBe('Test Wallet');
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function waitForEventDispatch(
  eventTarget: EventTarget,
  eventType: string,
  timeout: number = DEFAULT_TIMING_CONFIG.defaultTimeout,
  advanceTime = true,
): Promise<Event> {
  return new Promise((resolve, reject) => {
    // biome-ignore lint/style/useConst: timeoutId is used in event listener callback
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    // Set up event listener
    const eventListener = (event: Event) => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
      eventTarget.removeEventListener(eventType, eventListener);
      resolve(event);
    };

    eventTarget.addEventListener(eventType, eventListener);

    // Set up timeout
    timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
      eventTarget.removeEventListener(eventType, eventListener);
      reject(new Error(`Event '${eventType}' was not dispatched within ${timeout}ms`));
    }, timeout);

    // If using fake timers and advanceTime is enabled, periodically advance time
    if (advanceTime && typeof vi !== 'undefined') {
      intervalId = setInterval(async () => {
        await advanceTimeAndWait(DEFAULT_TIMING_CONFIG.defaultInterval);
      }, DEFAULT_TIMING_CONFIG.defaultInterval);
    }
  });
}

/**
 * Wait for a condition to become true with fake timer support.
 *
 * This function polls a condition function at regular intervals until it returns true
 * or the timeout is reached. It works seamlessly with fake timers by automatically
 * advancing time during the polling process.
 *
 * @param condition - Function that returns true when the condition is met
 * @param timeout - Maximum time to wait in milliseconds
 * @param interval - Polling interval in milliseconds
 * @param advanceTime - Whether to automatically advance fake timers while waiting
 * @returns Promise that resolves when the condition is met
 * @throws Error if the condition is not met within the timeout
 * @example
 * ```typescript
 * // Wait for discovery to complete
 * await waitForCondition(
 *   () => listener.getQualifiedResponders().length > 0,
 *   5000,
 *   100
 * );
 *
 * expect(listener.getQualifiedResponders()).toHaveLength(1);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function waitForCondition(
  condition: () => boolean | Promise<boolean>,
  timeout: number = DEFAULT_TIMING_CONFIG.defaultTimeout,
  interval: number = DEFAULT_TIMING_CONFIG.defaultInterval,
  advanceTime = true,
): Promise<void> {
  const startTime = Date.now();

  while (true) {
    try {
      const result = await condition();
      if (result) {
        return;
      }
    } catch (error) {
      // Continue polling if condition throws an error
      console.debug('Condition check threw error:', error);
    }

    if (Date.now() - startTime > timeout) {
      throw new Error(`Condition not met within ${timeout}ms`);
    }

    if (advanceTime) {
      await advanceTimeAndWait(interval);
    } else {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
}

/**
 * Create a timeout promise that rejects after specified time.
 *
 * This utility creates a promise that will reject after a specified timeout,
 * useful for testing race conditions and timeout scenarios in combination
 * with other promises.
 *
 * @param ms - Timeout duration in milliseconds
 * @param message - Optional error message for timeout
 * @returns Promise that rejects after the timeout
 * @example
 * ```typescript
 * const timeoutPromise = createTimeoutPromise(3000, 'Discovery timeout');
 * const discoveryPromise = listener.startDiscovery();
 *
 * // Race between discovery and timeout
 * try {
 *   await Promise.race([discoveryPromise, timeoutPromise]);
 *   // Discovery completed successfully
 * } catch (error) {
 *   // Timeout occurred
 *   expect(error.message).toBe('Discovery timeout');
 * }
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createTimeoutPromise(ms: number, message?: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Test multiple timing scenarios with fake timers.
 *
 * This utility function tests multiple timing-related scenarios in sequence,
 * automatically managing fake timer advancement and providing consistent
 * timing behavior validation.
 *
 * @param scenarios - Array of timing scenarios to test
 * @returns Promise that resolves when all scenarios are tested
 * @example
 * ```typescript
 * await testTimingScenarios([
 *   {
 *     name: 'Immediate response',
 *     operation: () => announcer.simulateDiscoveryRequest(request),
 *     expectedDuration: 0,
 *     validation: (result) => expect(result).toBeTruthy()
 *   },
 *   {
 *     name: 'Discovery timeout',
 *     operation: () => listener.startDiscovery(),
 *     expectedDuration: 3000,
 *     validation: () => expect(listener.isDiscoveryInProgress()).toBe(false)
 *   }
 * ]);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function testTimingScenarios(
  scenarios: Array<{
    name: string;
    operation: () => Promise<unknown> | unknown;
    expectedDuration: number;
    validation?: (result: unknown) => void | Promise<void>;
    tolerance?: number;
  }>,
): Promise<void> {
  for (const scenario of scenarios) {
    const startTime = Date.now();

    try {
      const result = await scenario.operation();

      // Advance time if this is a time-dependent operation
      if (scenario.expectedDuration > 0) {
        await advanceTimeAndWait(scenario.expectedDuration);
      }

      const endTime = Date.now();
      const actualDuration = endTime - startTime;
      const tolerance = scenario.tolerance || 100;

      // Validate timing (with tolerance for fake timers)
      if (scenario.expectedDuration > 0) {
        expect(actualDuration).toBeGreaterThanOrEqual(scenario.expectedDuration - tolerance);
        expect(actualDuration).toBeLessThanOrEqual(scenario.expectedDuration + tolerance);
      }

      // Run custom validation if provided
      if (scenario.validation) {
        await scenario.validation(result);
      }
    } catch (error) {
      throw new Error(`Timing scenario '${scenario.name}' failed: ${error}`);
    }
  }
}

/**
 * Measure the execution time of an async operation.
 *
 * This utility measures how long an async operation takes to complete,
 * accounting for fake timer usage. Useful for performance testing and
 * validating timing expectations.
 *
 * @param operation - The async operation to measure
 * @param expectedMaxMs - Optional maximum expected duration
 * @returns Promise that resolves with timing information
 * @example
 * ```typescript
 * const timing = await measureAsyncOperation(
 *   () => announcer.simulateDiscoveryRequest(request),
 *   100 // Should complete within 100ms
 * );
 *
 * console.log(`Operation took ${timing.duration}ms`);
 * expect(timing.duration).toBeLessThan(100);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function measureAsyncOperation<T>(
  operation: () => Promise<T>,
  expectedMaxMs?: number,
): Promise<{ result: T; duration: number; withinExpectation: boolean }> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const endTime = Date.now();
    const duration = endTime - startTime;
    const withinExpectation = expectedMaxMs ? duration <= expectedMaxMs : true;

    return {
      result,
      duration,
      withinExpectation,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    throw new Error(`Operation failed after ${duration}ms: ${error}`);
  }
}

/**
 * Create a debounced test function that waits for rapid successive calls to settle.
 *
 * This utility is useful for testing scenarios where multiple rapid events might
 * occur and you want to wait for them to settle before running validation.
 *
 * @param testFn - The test function to debounce
 * @param delayMs - Debounce delay in milliseconds
 * @returns Debounced test function
 * @example
 * ```typescript
 * const debouncedTest = createDebouncedTest(
 *   () => expect(listener.getQualifiedResponders()).toHaveLength(3),
 *   500
 * );
 *
 * // These rapid calls will be debounced
 * debouncedTest();
 * debouncedTest();
 * debouncedTest();
 *
 * // Wait for debounce to complete
 * await advanceTimeAndWait(600);
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createDebouncedTest(testFn: () => void | Promise<void>, delayMs: number): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      try {
        await testFn();
      } catch (error) {
        console.error('Debounced test failed:', error);
        throw error;
      }
    }, delayMs);
  };
}
