import { vi } from 'vitest';

/**
 * Global test setup for modal-core
 * This file is loaded by Vitest before running tests
 */

// Mock browser globals
if (typeof window !== 'undefined') {
  // Mock window.crypto for tests
  Object.defineProperty(window, 'crypto', {
    value: {
      randomUUID: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`,
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      },
    },
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  class MockIntersectionObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: MockIntersectionObserver,
  });

  // Mock ResizeObserver
  class MockResizeObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  }

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });
}

// Set up global test utilities
const flushPromisesImpl = () => new Promise<void>((resolve) => setImmediate(resolve));

declare global {
  var flushPromises: () => Promise<void>;
}
(globalThis as typeof globalThis & { flushPromises: () => Promise<void> }).flushPromises = flushPromisesImpl;

// Configure console mocking
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
};

// Restore console after each test to prevent interference
afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});

// Set test environment
process.env['NODE_ENV'] = 'test';

// Export test utilities
export { flushPromisesImpl as flushPromises };
