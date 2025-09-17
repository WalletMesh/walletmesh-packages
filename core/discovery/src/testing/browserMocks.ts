/**
 * Browser environment mocking utilities for testing cross-origin discovery protocol
 * in Node.js environments without requiring a real browser.
 *
 * These utilities provide consistent browser environment simulation for testing
 * discovery protocol implementations that rely on browser-specific APIs like
 * window.location, CustomEvent, and MessageEvent.
 *
 * @example Basic window mocking:
 * ```typescript
 * import { withMockWindow } from '@walletmesh/discovery/testing';
 *
 * await withMockWindow({ origin: 'https://example.com' }, async () => {
 *   // Your test code here - window.location.origin is available
 *   expect(window.location.origin).toBe('https://example.com');
 * });
 * ```
 *
 * @example Environment setup/teardown:
 * ```typescript
 * import { mockBrowserEnvironment, restoreBrowserEnvironment } from '@walletmesh/discovery/testing';
 *
 * beforeEach(() => {
 *   mockBrowserEnvironment({ origin: 'https://dapp.com' });
 * });
 *
 * afterEach(() => {
 *   restoreBrowserEnvironment();
 * });
 * ```
 *
 * @module browserMocks
 * @category Testing
 * @since 1.0.0
 */

/**
 * Configuration options for mocking the browser window object.
 */
export interface MockWindowConfig {
  /** The origin to use for window.location.origin */
  origin?: string;
  /** The href to use for window.location.href */
  href?: string;
  /** The hostname to use for window.location.hostname */
  hostname?: string;
  /** The protocol to use for window.location.protocol */
  protocol?: string;
  /** The port to use for window.location.port */
  port?: string;
  /** The pathname to use for window.location.pathname */
  pathname?: string;
  /** Additional custom properties to add to window */
  customProperties?: Record<string, unknown>;
}

/**
 * Configuration options for mocking a content script environment.
 */
export interface ContentScriptMockConfig {
  /** The origin to use for window.location.origin */
  origin?: string;
  /** The user agent string for navigator.userAgent */
  userAgent?: string;
  /** Mock function factory for dependency injection */
  mockFn?: () => ReturnType<typeof import('vitest').vi.fn>;
}

/**
 * Stored reference to the original window object for restoration.
 */
let originalWindow: Window | undefined;

/**
 * Mock the browser window object with the specified configuration.
 *
 * This function creates a mock window object with location properties that can
 * be used for testing discovery protocol implementations. The mock is minimal
 * but includes the essential properties needed for origin validation and
 * cross-origin communication testing.
 *
 * @param config - Configuration options for the mock window
 * @example
 * ```typescript
 * mockBrowserEnvironment({
 *   origin: 'https://my-dapp.com',
 *   pathname: '/wallet-connect',
 *   customProperties: {
 *     crypto: { randomUUID: () => 'test-uuid' }
 *   }
 * });
 *
 * // Now window.location.origin is available
 * console.log(window.location.origin); // 'https://my-dapp.com'
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function mockBrowserEnvironment(config: MockWindowConfig = {}): void {
  // Store original window reference if it exists
  if (typeof globalThis.window !== 'undefined') {
    originalWindow = globalThis.window;
  }

  // Parse the provided origin or use default
  const origin = config.origin || 'https://localhost:3000';
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(origin);
  } catch {
    // Fallback if origin is not a valid URL
    parsedUrl = new URL('https://localhost:3000');
  }

  // Create mock location object
  const mockLocation = {
    origin: config.origin || origin,
    href: config.href || origin,
    hostname: config.hostname || parsedUrl.hostname,
    protocol: config.protocol || parsedUrl.protocol,
    port: config.port || parsedUrl.port,
    pathname: config.pathname || parsedUrl.pathname,
    search: parsedUrl.search,
    hash: parsedUrl.hash,
    host: `${parsedUrl.hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}`,
  };

  // Create minimal window mock with essential properties
  const mockWindow = {
    location: mockLocation,
    origin: mockLocation.origin,
    // Add crypto.randomUUID if not available
    crypto: globalThis.crypto || {
      randomUUID: () => `test-${Math.random().toString(36).substr(2, 9)}`,
    },
    // Add custom properties if provided
    ...(config.customProperties || {}),
  } as Window & typeof globalThis;

  // Set the mock window
  globalThis.window = mockWindow;
}

/**
 * Restore the original browser environment.
 *
 * This function restores the original window object if it existed, or removes
 * the window property entirely if no original window was present. Always call
 * this function after using mockBrowserEnvironment to ensure proper cleanup.
 *
 * @example
 * ```typescript
 * // In a test
 * beforeEach(() => {
 *   mockBrowserEnvironment({ origin: 'https://example.com' });
 * });
 *
 * afterEach(() => {
 *   restoreBrowserEnvironment();
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function restoreBrowserEnvironment(): void {
  if (originalWindow) {
    globalThis.window = originalWindow as Window & typeof globalThis;
    originalWindow = undefined;
  } else {
    // Remove window property if it didn't exist originally
    (globalThis as unknown as Record<string, unknown>)['window'] = undefined;
  }
}

/**
 * Execute a test function with a mocked browser environment.
 *
 * This higher-order function creates a mock browser environment, executes the
 * provided test function, and automatically cleans up afterward. This is the
 * recommended way to use browser mocking for individual tests as it ensures
 * proper cleanup even if the test throws an error.
 *
 * @param config - Configuration options for the mock window
 * @param testFn - The test function to execute with the mocked environment
 * @returns Promise that resolves to the return value of the test function
 * @throws Re-throws any error from the test function after cleanup
 * @example
 * ```typescript
 * await withMockWindow(
 *   { origin: 'https://trusted-dapp.com' },
 *   async () => {
 *     const announcer = new DiscoveryResponder({
 *       responderInfo: testWallet,
 *       securityPolicy: { allowedOrigins: ['https://trusted-dapp.com'] }
 *     });
 *
 *     // Test origin validation
 *     expect(validateOrigin(window.location.origin, policy)).toBe(true);
 *   }
 * );
 * ```
 * @category Testing
 * @since 1.0.0
 */
export async function withMockWindow<T>(config: MockWindowConfig, testFn: () => T | Promise<T>): Promise<T> {
  mockBrowserEnvironment(config);

  try {
    return await testFn();
  } finally {
    restoreBrowserEnvironment();
  }
}

/**
 * Create a mock location object with the specified origin.
 *
 * This utility function creates a mock location object that can be used
 * independently of the full window mocking functionality. Useful when you
 * only need to mock location properties without affecting the global window.
 *
 * @param origin - The origin URL to use for the mock location
 * @returns A mock location object with parsed URL properties
 * @example
 * ```typescript
 * const mockLocation = createMockLocation('https://my-dapp.com:8080/path');
 *
 * expect(mockLocation.origin).toBe('https://my-dapp.com:8080');
 * expect(mockLocation.hostname).toBe('my-dapp.com');
 * expect(mockLocation.pathname).toBe('/path');
 * expect(mockLocation.port).toBe('8080');
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createMockLocation(origin: string): Location {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(origin);
  } catch {
    // Fallback to localhost if origin is not a valid URL
    parsedUrl = new URL('https://localhost:3000');
  }

  return {
    origin,
    href: origin,
    hostname: parsedUrl.hostname,
    protocol: parsedUrl.protocol,
    port: parsedUrl.port,
    pathname: parsedUrl.pathname,
    search: parsedUrl.search,
    hash: parsedUrl.hash,
    host: `${parsedUrl.hostname}${parsedUrl.port ? `:${parsedUrl.port}` : ''}`,
    ancestorOrigins: [] as unknown as DOMStringList,
    // Mock methods that Location interface requires
    assign: () => {},
    reload: () => {},
    replace: () => {},
    toString: () => origin,
  } as Location;
}

/**
 * Create a mock window object with essential discovery protocol properties.
 *
 * This function creates a complete mock window object that includes all the
 * properties needed for discovery protocol testing, including location, origin,
 * and crypto APIs. Use this when you need more control over the window mock
 * than the higher-level utilities provide.
 *
 * @param config - Configuration options for the mock window
 * @returns A mock window object with discovery protocol properties
 * @example
 * ```typescript
 * const mockWindow = createMockWindow({
 *   origin: 'https://wallet-provider.com',
 *   customProperties: {
 *     ethereum: mockEthereumProvider,
 *     solana: mockSolanaProvider
 *   }
 * });
 *
 * // Use the mock window directly
 * expect(mockWindow.location.origin).toBe('https://wallet-provider.com');
 * expect(mockWindow.ethereum).toBeDefined();
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createMockWindow(config: MockWindowConfig = {}): Window {
  const origin = config.origin || 'https://localhost:3000';
  const mockLocation = createMockLocation(origin);

  return {
    location: mockLocation,
    origin: mockLocation.origin,
    crypto: globalThis.crypto || {
      randomUUID: () => `test-${Math.random().toString(36).substr(2, 9)}`,
      // Add other crypto methods if needed for testing
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
    },
    // Add custom properties
    ...(config.customProperties || {}),
    // Add minimal required window methods
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    // Mock console to prevent test output pollution unless explicitly needed
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
      debug: () => {},
    },
  } as unknown as Window;
}

/**
 * Utility to check if we're currently in a mocked browser environment.
 *
 * This function can be used in tests to verify that browser mocking is
 * active and working correctly.
 *
 * @returns True if a window object exists and has the expected mock properties
 * @example
 * ```typescript
 * mockBrowserEnvironment({ origin: 'https://example.com' });
 * expect(isMockBrowserEnvironment()).toBe(true);
 *
 * restoreBrowserEnvironment();
 * // Result depends on whether we're in Node.js or browser
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function isMockBrowserEnvironment(): boolean {
  return (
    typeof globalThis.window !== 'undefined' &&
    typeof globalThis.window.location !== 'undefined' &&
    typeof globalThis.window.location.origin === 'string'
  );
}

/**
 * Create multiple mock browser environments for testing cross-origin scenarios.
 *
 * This utility creates multiple mock window configurations that can be used
 * to test cross-origin communication scenarios where different origins need
 * to be simulated within the same test.
 *
 * @param origins - Array of origin URLs to create mock environments for
 * @returns Array of mock window objects for each origin
 * @example
 * ```typescript
 * const [dappWindow, walletWindow] = createMultipleMockWindows([
 *   'https://my-dapp.com',
 *   'https://my-wallet.com'
 * ]);
 *
 * // Test cross-origin message validation
 * expect(dappWindow.location.origin).toBe('https://my-dapp.com');
 * expect(walletWindow.location.origin).toBe('https://my-wallet.com');
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createMultipleMockWindows(origins: string[]): Window[] {
  return origins.map((origin) => createMockWindow({ origin }));
}

/**
 * Create a mock content script environment with spyable window and navigator objects.
 *
 * This function creates a mock environment specifically designed for testing content scripts
 * that need to interact with window events and navigation APIs. It provides spyable
 * addEventListener, dispatchEvent, and other content script specific functionality.
 *
 * @param config - Configuration options for the content script mock
 * @returns Mock objects for window and navigator with cleanup function
 * @example
 * ```typescript
 * import { createContentScriptMock } from '@walletmesh/discovery/testing';
 * import { vi } from 'vitest';
 *
 * describe('ContentScriptRelay', () => {
 *   let mockEnv: ReturnType<typeof createContentScriptMock>;
 *
 *   beforeEach(() => {
 *     mockEnv = createContentScriptMock({
 *       origin: 'https://dapp.example.com',
 *       mockFn: () => vi.fn()
 *     });
 *   });
 *
 *   afterEach(() => {
 *     mockEnv.cleanup();
 *   });
 *
 *   it('should handle page events', () => {
 *     // mockEnv.window.addEventListener is a spy
 *     expect(mockEnv.window.addEventListener).toHaveBeenCalledWith(
 *       'discovery:wallet:request',
 *       expect.any(Function)
 *     );
 *   });
 * });
 * ```
 * @category Testing
 * @since 1.0.0
 */
export function createContentScriptMock(config: ContentScriptMockConfig = {}) {
  const {
    origin = 'https://dapp.example.com',
    userAgent = 'Test Browser',
    mockFn = () => {
      const globalWithVi = globalThis as unknown as {
        vi?: { fn: () => ReturnType<typeof import('vitest').vi.fn> };
      };
      if (globalWithVi.vi?.fn) {
        return globalWithVi.vi.fn();
      }
      throw new Error(
        'Vitest is required for createContentScriptMock. Ensure tests are running in vitest environment and pass mockFn option.',
      );
    },
  } = config;

  // Store original globals for cleanup
  const originalWindow = globalThis.window;
  const originalNavigator = globalThis.navigator;

  // Create mock window with spyable methods
  const mockWindow = {
    addEventListener: mockFn(),
    removeEventListener: mockFn(),
    dispatchEvent: mockFn().mockReturnValue(true),
    location: {
      origin,
      href: origin,
      hostname: new URL(origin).hostname,
      protocol: new URL(origin).protocol,
      port: new URL(origin).port,
      pathname: new URL(origin).pathname,
      search: '',
      hash: '',
      host: new URL(origin).host,
    },
  };

  // Create mock navigator
  const mockNavigator = {
    userAgent,
  };

  // Set up global mocks
  // @ts-expect-error - Intentionally mocking globals
  globalThis.window = mockWindow;
  // @ts-expect-error - Intentionally mocking globals
  globalThis.navigator = mockNavigator;

  return {
    window: mockWindow,
    navigator: mockNavigator,
    cleanup: () => {
      // Restore original globals
      if (originalWindow) {
        globalThis.window = originalWindow;
      } else {
        // @ts-expect-error - Remove window if it didn't exist originally
        globalThis.window = undefined;
      }

      if (originalNavigator) {
        globalThis.navigator = originalNavigator;
      } else {
        // @ts-expect-error - Remove navigator if it didn't exist originally
        globalThis.navigator = undefined;
      }
    },
  };
}
