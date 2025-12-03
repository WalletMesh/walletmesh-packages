/**
 * Test helpers for asynchronous testing
 *
 * @internal
 * @module core/testing/testingHelpers
 */

/**
 * Check if we're running in a Vitest environment
 */
function isVitestAvailable(): boolean {
  return (
    typeof global !== 'undefined' &&
    // biome-ignore lint/suspicious/noExplicitAny: Global vi object not well typed
    typeof (global as any).vi !== 'undefined' &&
    // biome-ignore lint/suspicious/noExplicitAny: Global vi object not well typed
    typeof (global as any).vi.fn === 'function'
  );
}

/**
 * Get the vi object if available
 * @returns {any} The Vitest vi object if available, undefined otherwise
 */
// biome-ignore lint/suspicious/noExplicitAny: Vi object type not available in this context
function getVi(): any {
  if (isVitestAvailable()) {
    // biome-ignore lint/suspicious/noExplicitAny: Global vi object not well typed
    return (global as any).vi;
  }
  return null;
}

/**
 * Check if fake timers are enabled
 * @returns {boolean} True if fake timers are enabled in the test environment, false otherwise
 */
function areFakeTimersEnabled(): boolean {
  const vi = getVi();
  if (!vi) return false;

  try {
    // This is a safe way to check if fake timers are enabled
    // without causing an error
    const fakeTimersEnabled = typeof vi.getTimerCount === 'function';
    return fakeTimersEnabled;
  } catch (_e) {
    return false;
  }
}

/**
 * Wait for Events Options
 * @interface WaitForEventsOptions
 */
export interface WaitForEventsOptions {
  /**
   * Wait time in ms (default: 10ms)
   */
  waitTime?: number;

  /**
   * Whether to force using real timers even in test environments
   */
  forceRealTimers?: boolean;
}

/**
 * Wait for all events to be emitted
 * This is useful for tests that need to wait for asynchronous events
 *
 * @param {WaitForEventsOptions} options - Options for waiting
 */
export async function waitForEvents(options: WaitForEventsOptions = {}): Promise<void> {
  const waitTime = options.waitTime || 10;

  // If we have vi and fake timers are enabled, use vi.advanceTimersByTime
  if (!options.forceRealTimers && areFakeTimersEnabled()) {
    const vi = getVi();
    // Need to return a promise that resolves after advancing timers
    return new Promise((resolve) => {
      // First advance by 0 to flush any immediate operations
      vi.advanceTimersByTime(0);
      // Then advance by waitTime
      vi.advanceTimersByTime(waitTime);
      // Resolve on next tick
      setTimeout(resolve, 0);
    });
  }

  // Otherwise use regular setTimeout
  return new Promise((resolve) => setTimeout(resolve, waitTime));
}

/**
 * Wait for error events to be emitted
 * @param {WaitForEventsOptions} [options={}] - Configuration for event waiting
 */
export async function waitForErrorEvents(options: WaitForEventsOptions = {}): Promise<void> {
  return waitForEvents(options);
}

/**
 * Execute a function and wait for any events it emits
 * @param {() => T | Promise<T>} fn - Function to execute
 * @param {WaitForEventsOptions} [options={}] - Configuration for event waiting
 * @returns {Promise<T>} The result of the function execution
 * @template T - Return type of the function
 */
export async function execAndWaitForEvents<T>(
  fn: () => T | Promise<T>,
  options: WaitForEventsOptions = {},
): Promise<T> {
  const result = await fn();
  await waitForEvents(options);
  return result;
}

/**
 * Flush all pending timers and events
 * Useful alternative to vi.runAllTimers() that won't cause infinite loops
 *
 * @param {number} [advanceTime=100] - Time to advance in ms
 */
export async function flushTimersAndEvents(advanceTime = 100): Promise<void> {
  // If we have vi and fake timers are enabled, use vi.advanceTimersByTime
  if (areFakeTimersEnabled()) {
    const vi = getVi();
    // Use a safer approach that doesn't rely on vi.advanceTimersByTimeAsync
    return new Promise<void>((resolve) => {
      vi.advanceTimersByTime(advanceTime);
      // Resolve on next tick
      setTimeout(resolve, 0);
    });
  }

  // Otherwise use regular setTimeout
  return new Promise<void>((resolve) => setTimeout(resolve, advanceTime));
}

/**
 * Create a spy function that resolves after being called
 * @returns {Object} An object containing a spy function and a waitForCall method
 * @returns {Function} .spy - The spy function that can be called and tracks invocations
 * @returns {Function} .waitForCall - A method that returns a promise resolving to the arguments of the first call
 */
export function createResolvableSpy(): {
  // biome-ignore lint/suspicious/noExplicitAny: Test spy needs flexible typing
  spy: any & { waitForCall: () => Promise<any[]> };
  // biome-ignore lint/suspicious/noExplicitAny: Test spy needs flexible typing
  waitForCall: () => Promise<any[]>;
} {
  // biome-ignore lint/suspicious/noExplicitAny: Test arguments are flexible
  let resolve: (args: any[]) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Test arguments are flexible
  const promise = new Promise<any[]>((r) => {
    resolve = r;
  });

  // Use vi if available, otherwise fallback to an empty spy
  const vi = getVi();
  const spy = vi ? vi.fn() : () => {};
  const originalSpy = spy;

  // Create a wrapper that resolves the promise
  // biome-ignore lint/suspicious/noExplicitAny: Test spy needs flexible typing
  const wrappedSpy = function (this: any, ...args: any[]) {
    const result = originalSpy.apply(this, args);
    resolve(args);
    return result;
  };

  // Copy all properties from the original spy
  Object.assign(wrappedSpy, originalSpy);

  // Add the waitForCall method
  wrappedSpy.waitForCall = () => promise;

  return {
    spy: wrappedSpy,
    waitForCall: () => promise,
  };
}
