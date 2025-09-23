import { afterEach, beforeEach, vi } from 'vitest';
import type { Mock } from 'vitest';

/**
 * Set up common test environment for modal-core tests
 */
export function setupModalCoreTestEnvironment() {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock timers
    vi.useFakeTimers();

    // Mock random values for consistent tests
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // Mock Date.now for consistent timestamps
    vi.spyOn(Date, 'now').mockReturnValue(1234567890000);
  });

  afterEach(() => {
    // Restore real timers
    vi.useRealTimers();

    // Restore all mocks
    vi.restoreAllMocks();
  });
}

/**
 * Wait for all pending promises to resolve
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Advance timers and flush promises
 */
export async function advanceTimersAndFlush(ms: number): Promise<void> {
  await vi.advanceTimersByTimeAsync(ms);
  await flushPromises();
}

/**
 * Create a deferred promise for testing async flows
 */
export function createDeferredPromise<T>() {
  let resolve!: (value: T) => void;
  // biome-ignore lint/suspicious/noExplicitAny: Error type needs to be flexible
  let reject!: (error: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

/**
 * Wait for a mock to be called with specific arguments
 */
// biome-ignore lint/suspicious/noExplicitAny: Mock args need flexible structure for comparison
export async function waitForMockCall(mock: Mock, expectedArgs?: any[], timeout = 1000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (mock.mock.calls.length > 0) {
      if (
        !expectedArgs ||
        mock.mock.calls.some((call) => JSON.stringify(call) === JSON.stringify(expectedArgs))
      ) {
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error(`Mock was not called with expected args within ${timeout}ms`);
}

/**
 * Create a mock that tracks call order across multiple mocks
 */
export function createOrderedMock(name: string) {
  const callOrder: string[] = [];
  // biome-ignore lint/suspicious/noExplicitAny: Mock function args need flexible types
  const mock = vi.fn().mockImplementation((...args: any[]) => {
    callOrder.push(name);
    return { name, args, order: callOrder.length };
  });

  return {
    mock,
    getCallOrder: () => [...callOrder],
    wasCalledBefore: (otherName: string) => {
      const thisIndex = callOrder.indexOf(name);
      const otherIndex = callOrder.indexOf(otherName);
      return thisIndex !== -1 && otherIndex !== -1 && thisIndex < otherIndex;
    },
    wasCalledAfter: (otherName: string) => {
      const thisIndex = callOrder.indexOf(name);
      const otherIndex = callOrder.indexOf(otherName);
      return thisIndex !== -1 && otherIndex !== -1 && thisIndex > otherIndex;
    },
  };
}

/**
 * Mock browser APIs for testing
 */
export function mockBrowserAPIs() {
  // Mock window.postMessage
  const postMessageMock = vi.fn();
  Object.defineProperty(window, 'postMessage', {
    value: postMessageMock,
    writable: true,
  });

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  return {
    postMessage: postMessageMock,
    localStorage: localStorageMock,
    sessionStorage: sessionStorageMock,
  };
}

/**
 * Create a test timeout helper
 */
export function createTimeoutHelper(defaultTimeout = 5000) {
  let currentTimeout = defaultTimeout;

  return {
    set: (timeout: number) => {
      currentTimeout = timeout;
    },
    wait: async (ms?: number) => {
      const timeout = ms || currentTimeout;
      await new Promise((resolve) => setTimeout(resolve, timeout));
    },
    race: async <T>(promise: Promise<T>, timeoutMessage = 'Operation timed out') => {
      const timeoutPromise = new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), currentTimeout),
      );
      return Promise.race([promise, timeoutPromise]);
    },
  };
}

/**
 * Suppress console output during tests
 */
export function suppressConsole() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.info = vi.fn();
    console.debug = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  });

  return {
    expectLog: (message: string) => {
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining(message));
    },
    expectWarn: (message: string) => {
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining(message));
    },
    expectError: (message: string) => {
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining(message));
    },
  };
}
