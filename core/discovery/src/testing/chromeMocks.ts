/**
 * Chrome Extension API mocking utilities for testing.
 *
 * Provides standardized Chrome API mocks that replicate the behavior of
 * chrome.runtime, chrome.tabs, and other extension APIs commonly used
 * in discovery protocol testing.
 *
 * @module chromeMocks
 * @category Testing
 * @since 1.0.0
 */

// Use vitest's mock function type - this will be passed from test files
type MockFunction = ReturnType<typeof import('vitest').vi.fn>;

/**
 * Mock function factory type for dependency injection.
 */
type MockFunctionFactory = () => MockFunction;

/**
 * Mock Chrome runtime API.
 *
 * Provides a complete mock of chrome.runtime with the most commonly used
 * methods and properties for extension testing.
 *
 * @example
 * ```typescript
 * import { MockChromeRuntime } from '@walletmesh/discovery/testing';
 *
 * const mockRuntime = new MockChromeRuntime();
 * globalThis.chrome = { runtime: mockRuntime };
 *
 * // Test that messages are sent correctly
 * await chrome.runtime.sendMessage({ type: 'test' });
 * expect(mockRuntime.sendMessage).toHaveBeenCalledWith({ type: 'test' });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export class MockChromeRuntime {
  public readonly id: string;
  public readonly sendMessage: MockFunction;
  public readonly connect: MockFunction;
  public readonly onMessage: {
    addListener: MockFunction;
    removeListener: MockFunction;
    hasListener: MockFunction;
  };

  private messageListeners: Array<
    (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => void
  > = [];

  constructor(extensionId = 'test-extension-id', mockFn?: MockFunctionFactory) {
    this.id = extensionId;

    // Use provided mock function factory or try to get vi.fn from global
    const createMock =
      mockFn ||
      (() => {
        // @ts-expect-error - vi should be available in test environment
        const vi = globalThis.vi || require('vitest').vi;
        return vi.fn();
      });

    this.sendMessage = createMock();

    // Set up default implementation for sendMessage
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.sendMessage as any).mockImplementation(() => Promise.resolve(undefined));

    this.connect = createMock();

    // Set up default implementation for connect (returns mock Port)
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.connect as any).mockImplementation((connectInfo?: { name?: string }) => {
      const mockPort = {
        name: connectInfo?.name || 'test-port',
        onDisconnect: {
          addListener: createMock(),
          removeListener: createMock(),
          hasListener: createMock(),
        },
        onMessage: {
          addListener: createMock(),
          removeListener: createMock(),
          hasListener: createMock(),
        },
        postMessage: createMock(),
        disconnect: createMock(),
      };
      return mockPort;
    });

    this.onMessage = {
      addListener: createMock(),
      removeListener: createMock(),
      hasListener: createMock(),
    };

    // Set up realistic onMessage behavior
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.onMessage.addListener as any).mockImplementation((listener: any) => {
      this.messageListeners.push(
        listener as (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => void,
      );
    });

    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.onMessage.removeListener as any).mockImplementation((listener: any) => {
      const index = this.messageListeners.indexOf(
        listener as (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => void,
      );
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    });

    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.onMessage.hasListener as any).mockImplementation((listener: any) => {
      return this.messageListeners.includes(
        listener as (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => void,
      );
    });
  }

  /**
   * Simulate receiving a message from the background script or content script.
   *
   * @param message - The message to simulate
   * @param sender - Optional sender information
   * @returns Promise resolving to any responses from listeners
   */
  simulateMessage(message: unknown, sender: unknown = { tab: { id: 1 } }): Promise<unknown[]> {
    const responses: unknown[] = [];
    const responsePromises: Promise<unknown>[] = [];

    for (const listener of this.messageListeners) {
      const responsePromise = new Promise<unknown>((resolve) => {
        const sendResponse = (response?: unknown) => {
          responses.push(response);
          resolve(response);
        };

        try {
          const result: unknown = listener(message, sender, sendResponse);
          // If listener returns a promise, wait for it
          if (result && typeof result === 'object' && 'then' in result) {
            (result as Promise<unknown>).then(resolve).catch(() => resolve(undefined));
          } else if (result === true) {
            // Async response expected via sendResponse callback
            // Don't resolve immediately, wait for sendResponse to be called
          } else {
            // Sync response
            resolve(result);
          }
        } catch {
          resolve(undefined);
        }
      });

      responsePromises.push(responsePromise);
    }

    return Promise.all(responsePromises);
  }

  /**
   * Reset all mocks and clear listeners.
   */
  reset(): void {
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.sendMessage as any).mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.onMessage.addListener as any).mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.onMessage.removeListener as any).mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.onMessage.hasListener as any).mockReset();
    this.messageListeners.length = 0;
  }
}

/**
 * Mock Chrome tabs API.
 *
 * Provides a mock of chrome.tabs with commonly used methods for
 * extension-to-page communication testing.
 *
 * @example
 * ```typescript
 * import { MockChromeTabs } from '@walletmesh/discovery/testing';
 *
 * const mockTabs = new MockChromeTabs();
 * globalThis.chrome = { tabs: mockTabs };
 *
 * // Test tab messaging
 * await chrome.tabs.sendMessage(1, { type: 'discovery:wallet:response' });
 * expect(mockTabs.sendMessage).toHaveBeenCalledWith(1, expect.objectContaining({ type: 'discovery:wallet:response' }));
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export class MockChromeTabs {
  public readonly sendMessage: MockFunction;
  public readonly query: MockFunction;
  public readonly get: MockFunction;

  constructor(mockFn?: MockFunctionFactory) {
    // Use provided mock function factory or try to get vi.fn from global
    const createMock =
      mockFn ||
      (() => {
        // @ts-expect-error - vi should be available in test environment
        const vi = globalThis.vi || require('vitest').vi;
        return vi.fn();
      });

    this.sendMessage = createMock();
    this.query = createMock();
    this.get = createMock();

    // Set up default implementations - ensure they always return promises
    // Force the mock to return a Promise (handling the tabId and message arguments)
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.sendMessage as any).mockImplementation((_tabId: number, _message: any) =>
      Promise.resolve(undefined),
    );
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.query as any).mockImplementation(() => Promise.resolve([]));
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.get as any).mockImplementation((tabId: number) =>
      Promise.resolve({ id: tabId, url: 'https://example.com' }),
    );
  }

  /**
   * Reset all mocks.
   */
  reset(): void {
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.sendMessage as any).mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.query as any).mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: Mock function setup requires any for test utilities
    (this.get as any).mockReset();
  }
}

/**
 * Complete Chrome Extension API mock.
 *
 * Provides a comprehensive mock of the Chrome extension APIs
 * commonly used in discovery protocol testing.
 *
 * @example
 * ```typescript
 * import { MockChromeAPI } from '@walletmesh/discovery/testing';
 *
 * const mockChrome = new MockChromeAPI();
 * globalThis.chrome = mockChrome;
 *
 * // Now all chrome.* APIs are available for testing
 * expect(chrome.runtime.id).toBe('test-extension-id');
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export class MockChromeAPI {
  public readonly runtime: MockChromeRuntime;
  public readonly tabs: MockChromeTabs;

  constructor(options: { extensionId?: string; mockFn?: MockFunctionFactory } = {}) {
    this.runtime = new MockChromeRuntime(options.extensionId, options.mockFn);
    this.tabs = new MockChromeTabs(options.mockFn);
  }

  /**
   * Reset all Chrome API mocks.
   */
  reset(): void {
    this.runtime.reset();
    this.tabs.reset();
  }
}

/**
 * Create a mock Chrome API instance.
 *
 * Factory function for creating Chrome API mocks with optional configuration.
 *
 * @param options - Configuration options for the mock
 * @returns A new MockChromeAPI instance
 *
 * @example
 * ```typescript
 * import { createMockChromeAPI } from '@walletmesh/discovery/testing';
 *
 * const mockChrome = createMockChromeAPI({
 *   extensionId: 'abcdefghijklmnopqrstuvwxyz123456'
 * });
 * globalThis.chrome = mockChrome;
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function createMockChromeAPI(
  options: { extensionId?: string; mockFn?: MockFunctionFactory } = {},
): MockChromeAPI {
  return new MockChromeAPI(options);
}

/**
 * Set up Chrome extension environment for testing.
 *
 * Configures global chrome object and provides cleanup function.
 * Use this in test setup to ensure a consistent Chrome extension environment.
 *
 * @param options - Configuration options for the Chrome API mock
 * @returns Object with chrome mock instance and cleanup function
 *
 * @example
 * ```typescript
 * import { setupChromeEnvironment } from '@walletmesh/discovery/testing';
 *
 * describe('Chrome Extension Tests', () => {
 *   let cleanup: () => void;
 *   let mockChrome: MockChromeAPI;
 *
 *   beforeEach(() => {
 *     const result = setupChromeEnvironment();
 *     mockChrome = result.chrome;
 *     cleanup = result.cleanup;
 *   });
 *
 *   afterEach(() => {
 *     cleanup();
 *   });
 *
 *   it('should have chrome available', () => {
 *     expect(globalThis.chrome).toBeDefined();
 *   });
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function setupChromeEnvironment(
  options: { extensionId?: string; mockFn?: MockFunctionFactory } = {},
): {
  chrome: MockChromeAPI;
  cleanup: () => void;
} {
  const originalGlobalThisChrome = (globalThis as unknown as { chrome?: unknown }).chrome;
  const originalGlobalChrome = (global as unknown as { chrome?: unknown }).chrome;
  const mockChrome = createMockChromeAPI(options);

  // Set up chrome on both globalThis and global for Node.js compatibility
  (globalThis as unknown as { chrome: MockChromeAPI }).chrome = mockChrome;
  // @ts-expect-error - Setting up chrome on global for Node.js environment
  global.chrome = mockChrome;

  const cleanup = () => {
    if (originalGlobalThisChrome !== undefined) {
      (globalThis as unknown as { chrome: unknown }).chrome = originalGlobalThisChrome;
    } else {
      (globalThis as unknown as { chrome?: unknown }).chrome = undefined;
    }
    if (originalGlobalChrome !== undefined) {
      (global as unknown as { chrome: unknown }).chrome = originalGlobalChrome;
    } else {
      // @ts-expect-error - Cleaning up chrome on global
      global.chrome = undefined;
    }
  };

  return { chrome: mockChrome, cleanup };
}

/**
 * Clean up Chrome extension environment.
 *
 * Removes chrome global and restores original state.
 * Use this to clean up after Chrome extension testing.
 *
 * @param originalChrome - Original chrome object to restore (if any)
 *
 * @example
 * ```typescript
 * import { cleanupChromeEnvironment } from '@walletmesh/discovery/testing';
 *
 * afterEach(() => {
 *   cleanupChromeEnvironment();
 * });
 * ```
 *
 * @category Testing
 * @since 1.0.0
 */
export function cleanupChromeEnvironment(originalChrome?: unknown): void {
  if (originalChrome !== undefined) {
    (globalThis as unknown as { chrome: unknown }).chrome = originalChrome;
  } else {
    (globalThis as unknown as { chrome?: unknown }).chrome = undefined;
  }
}
