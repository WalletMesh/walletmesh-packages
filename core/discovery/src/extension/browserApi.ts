/**
 * @module discovery/extension/browserApi
 *
 * Cross-browser extension API abstraction layer.
 *
 * This module provides a unified interface for WebExtension APIs that works
 * across different browsers (Chrome, Firefox, Edge, Opera) by auto-detecting
 * the available API namespace (`chrome` or `browser`) and handling the
 * differences between callback-based and Promise-based implementations.
 *
 * @category Extension
 * @since 0.8.0
 */

import type { Logger } from '../core/logger.js';
import { ConsoleLogger } from '../core/logger.js';

/**
 * Type definitions for the unified browser API.
 */
export interface BrowserRuntime {
  id: string;
  connect?: (connectInfo?: { name?: string }) => chrome.runtime.Port;
  sendMessage: (message: unknown) => Promise<unknown>;
  onMessage: {
    addListener: (
      callback: (
        message: unknown,
        sender: MessageSender,
        sendResponse: (response?: unknown) => void,
      ) => boolean | undefined,
    ) => void;
    removeListener: (
      callback: (
        message: unknown,
        sender: MessageSender,
        sendResponse: (response?: unknown) => void,
      ) => boolean | undefined,
    ) => void;
  };
}

export interface BrowserTabs {
  sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
  query: (queryInfo: object) => Promise<Array<{ id?: number; url?: string }>>;
  get: (tabId: number) => Promise<{ id: number; url?: string }>;
}

export interface MessageSender {
  tab?: {
    id: number;
    url?: string;
  };
  id?: string;
  url?: string;
  origin?: string;
}

export interface BrowserAPI {
  runtime: BrowserRuntime;
  tabs?: BrowserTabs;
  isAvailable: boolean;
  apiType: 'chrome' | 'browser' | 'none';
}

/**
 * Type for message listener callback functions.
 */
type MessageListenerCallback = (
  message: unknown,
  sender: MessageSender,
  sendResponse: (response?: unknown) => void,
) => boolean | undefined;

/**
 * Type for the native Chrome/browser API listener callback.
 */
type NativeMessageListener = (
  message: unknown,
  sender: unknown,
  sendResponse: (response?: unknown) => void,
) => boolean | undefined;

/**
 * Type for the native browser runtime object.
 */
type NativeBrowserRuntime = {
  id: string;
  sendMessage?: (message: unknown) => Promise<unknown>;
  onMessage?: {
    addListener?: (callback: MessageListenerCallback) => void;
    removeListener?: (callback: NativeMessageListener) => void;
  };
};

/**
 * Type for the native browser tabs object.
 */
type NativeBrowserTabs = {
  sendMessage?: (tabId: number, message: unknown) => Promise<unknown>;
  query?: (queryInfo: object) => Promise<Array<{ id?: number; url?: string }>>;
  get?: (tabId: number) => Promise<{ id: number; url?: string }>;
};

/**
 * Logger for browser API operations.
 */
const logger: Logger = new ConsoleLogger('[WalletMesh:BrowserAPI]');

/**
 * Convert a Chrome callback-based API to a Promise-based API.
 *
 * @param fn - The Chrome API function that uses callbacks
 * @param args - Arguments to pass to the function (excluding the callback)
 * @returns Promise that resolves with the API response
 */
function callbackToPromise<T>(fn: (...args: unknown[]) => void, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const callback = (result: T) => {
      // Check for Chrome runtime errors
      if (chrome?.runtime?.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result);
      }
    };

    // Call the function with args and callback
    fn(...args, callback);
  });
}

/**
 * Create a unified runtime API that works with both chrome and browser namespaces.
 */
function createRuntimeAPI(): BrowserRuntime | null {
  // Check for 'browser' namespace first (Firefox, polyfilled extensions)
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { browser?: { runtime?: unknown } }).browser?.runtime
  ) {
    const runtime = (window as unknown as { browser: { runtime: NativeBrowserRuntime } }).browser.runtime;

    if (runtime.id !== undefined && runtime.sendMessage && runtime.onMessage) {
      logger.debug('Using browser.runtime API (Firefox/polyfill)');

      const result: BrowserRuntime = {
        id: runtime.id,
        sendMessage: (message: unknown) => {
          // browser.* APIs return Promises natively
          return runtime.sendMessage?.(message) as Promise<unknown>;
        },
        onMessage: {
          addListener: (callback) => {
            runtime.onMessage?.addListener?.((message, sender, sendResponse) => {
              // Convert browser's sender to our MessageSender format
              const normalizedSender: MessageSender = {
                ...(sender.tab?.id !== undefined && {
                  tab: {
                    id: sender.tab.id,
                    ...(sender.tab.url && { url: sender.tab.url }),
                  },
                }),
                ...(sender.id && { id: sender.id }),
                ...(sender.url && { url: sender.url }),
                ...(sender.origin && { origin: sender.origin }),
              };
              return callback(message, normalizedSender, sendResponse);
            });
          },
          removeListener: (callback) => {
            // For removeListener, we need to keep a reference to the wrapper
            // This is a limitation - users should manage their own listener references
            runtime.onMessage?.removeListener?.(callback as NativeMessageListener);
          },
        },
      };

      // Add connect method if available
      if ('connect' in runtime && typeof runtime.connect === 'function') {
        result.connect = runtime.connect.bind(runtime);
      }

      return result;
    }
  }

  // Check for 'chrome' namespace (Chrome, Edge, Opera)
  // In ES modules/Node.js tests, check globalThis.chrome first, then fall back to bare chrome identifier
  const globalThisChrome = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  const chromeGlobal = globalThisChrome || (typeof chrome !== 'undefined' ? chrome : undefined);
  if (chromeGlobal?.runtime) {
    const runtime = chromeGlobal.runtime;

    if (runtime.id !== undefined && runtime.sendMessage && runtime.onMessage) {
      logger.debug('Using chrome.runtime API');

      const result: BrowserRuntime = {
        id: runtime.id,
        sendMessage: (message: unknown) => {
          // Convert callback-based API to Promise
          return callbackToPromise<unknown>(
            runtime.sendMessage.bind(runtime) as (...args: unknown[]) => void,
            message,
          ).catch((error: unknown) => {
            // Handle common Chrome extension errors gracefully
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (
              errorMessage.includes('Extension context invalidated') ||
              errorMessage.includes('The message port closed') ||
              errorMessage.includes('Cannot access a chrome://')
            ) {
              logger.debug('Expected Chrome API error:', errorMessage);
              return undefined;
            }
            throw error;
          });
        },
        onMessage: {
          addListener: (callback) => {
            runtime.onMessage?.addListener((message, sender, sendResponse) => {
              // Convert Chrome's sender to our MessageSender format
              const normalizedSender: MessageSender = {
                ...(sender.tab?.id !== undefined && {
                  tab: {
                    id: sender.tab.id,
                    ...(sender.tab.url && { url: sender.tab.url }),
                  },
                }),
                ...(sender.id && { id: sender.id }),
                ...(sender.url && { url: sender.url }),
                ...(sender.origin && { origin: sender.origin }),
              };
              return callback(message, normalizedSender, sendResponse);
            });
          },
          removeListener: (callback) => {
            // For removeListener, we need to keep a reference to the wrapper
            // This is a limitation - users should manage their own listener references
            runtime.onMessage?.removeListener(callback as NativeMessageListener);
          },
        },
      };

      // Add connect method if available
      if ('connect' in runtime && typeof runtime.connect === 'function') {
        result.connect = runtime.connect.bind(runtime);
      }

      return result;
    }
  }

  return null;
}

/**
 * Create a unified tabs API that works with both chrome and browser namespaces.
 */
function createTabsAPI(): BrowserTabs | null {
  // Check for 'browser' namespace first (Firefox, polyfilled extensions)
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { browser?: { tabs?: unknown } }).browser?.tabs
  ) {
    const tabs = (window as unknown as { browser: { tabs: NativeBrowserTabs } }).browser.tabs;

    if (tabs.sendMessage) {
      logger.debug('Using browser.tabs API (Firefox/polyfill)');

      return {
        sendMessage: (tabId: number, message: unknown) => {
          return tabs.sendMessage?.(tabId, message) as Promise<unknown>;
        },
        query: (queryInfo: object) => {
          return (tabs.query?.(queryInfo) || Promise.resolve([])) as Promise<
            Array<{ id?: number; url?: string }>
          >;
        },
        get: (tabId: number) => {
          return (tabs.get?.(tabId) || Promise.resolve({ id: tabId })) as Promise<{
            id: number;
            url?: string;
          }>;
        },
      };
    }
  }

  // Check for 'chrome' namespace (Chrome, Edge, Opera)
  // In ES modules/Node.js tests, check globalThis.chrome first, then fall back to bare chrome identifier
  const globalThisChrome = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  const chromeGlobal = globalThisChrome || (typeof chrome !== 'undefined' ? chrome : undefined);
  if (chromeGlobal?.tabs) {
    const tabs = chromeGlobal.tabs;

    if (tabs.sendMessage) {
      logger.debug('Using chrome.tabs API');

      return {
        sendMessage: (tabId: number, message: unknown) => {
          return callbackToPromise<unknown>(
            tabs.sendMessage.bind(tabs) as (...args: unknown[]) => void,
            tabId,
            message,
          ).catch((error: unknown) => {
            // Handle common Chrome extension errors gracefully
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Could not establish connection')) {
              logger.debug('Tab does not have content script:', errorMessage);
              return undefined;
            }
            throw error;
          });
        },
        query: (queryInfo: object) => {
          if (tabs.query) {
            return callbackToPromise<Array<{ id?: number; url?: string }>>(
              tabs.query.bind(tabs) as (...args: unknown[]) => void,
              queryInfo,
            );
          }
          return Promise.resolve([]);
        },
        get: (tabId: number) => {
          if (tabs.get) {
            return callbackToPromise<{ id: number; url?: string }>(
              tabs.get.bind(tabs) as (...args: unknown[]) => void,
              tabId,
            );
          }
          return Promise.resolve({ id: tabId });
        },
      };
    }
  }

  return null;
}

/**
 * Detect and return the available browser API type.
 */
function detectAPIType(): 'chrome' | 'browser' | 'none' {
  if (
    typeof window !== 'undefined' &&
    (window as unknown as { browser?: { runtime?: { id?: string } } }).browser?.runtime?.id !== undefined
  ) {
    return 'browser';
  }
  // Check globalThis.chrome first for ES modules/Node.js tests, then fall back to bare chrome identifier
  const globalThisChrome = (globalThis as unknown as { chrome?: typeof chrome }).chrome;
  const chromeGlobal = globalThisChrome || (typeof chrome !== 'undefined' ? chrome : undefined);
  if (chromeGlobal?.runtime?.id !== undefined) {
    return 'chrome';
  }
  return 'none';
}

/**
 * Get the unified browser API instance.
 *
 * This function auto-detects the available browser API namespace and returns
 * a unified interface that works across different browsers.
 *
 * @returns The unified browser API instance
 *
 * @example
 * ```typescript
 * import { getBrowserAPI } from '@walletmesh/discovery/extension';
 *
 * const api = getBrowserAPI();
 *
 * if (api.isAvailable) {
 *   // Send a message using the appropriate API
 *   await api.runtime.sendMessage({ type: 'discovery:request' });
 *
 *   // Listen for messages
 *   api.runtime.onMessage.addListener((message, sender, sendResponse) => {
 *     console.log('Received message:', message);
 *     sendResponse({ success: true });
 *     return false;
 *   });
 * }
 * ```
 */
export function getBrowserAPI(): BrowserAPI {
  const runtime = createRuntimeAPI();
  const tabs = createTabsAPI();
  const apiType = detectAPIType();

  if (runtime) {
    const result: BrowserAPI = {
      runtime,
      isAvailable: true,
      apiType,
    };

    if (tabs) {
      result.tabs = tabs;
    }

    return result;
  }

  // Return a stub API when no browser extension API is available
  logger.warn('No browser extension API detected - running in non-extension environment');

  return {
    runtime: {
      id: 'non-extension-environment',
      sendMessage: () => Promise.resolve(undefined),
      onMessage: {
        addListener: () => {},
        removeListener: () => {},
      },
    },
    isAvailable: false,
    apiType: 'none',
  };
}

/**
 * Check if the code is running in a browser extension environment.
 *
 * @returns True if running in an extension, false otherwise
 */
export function isExtensionEnvironment(): boolean {
  return getBrowserAPI().isAvailable;
}

/**
 * Get the extension ID if running in an extension environment.
 *
 * @returns The extension ID or null if not in an extension
 */
export function getExtensionId(): string | null {
  const api = getBrowserAPI();
  return api.isAvailable ? api.runtime.id : null;
}
