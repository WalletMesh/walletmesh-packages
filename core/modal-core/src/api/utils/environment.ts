/**
 * Environment detection utilities
 *
 * These utilities provide SSR-safe environment detection that can be used
 * by both modal-core and framework adapters. They ensure that browser-specific
 * APIs are only accessed when available.
 *
 * @module utils/environment
 */

/**
 * Check if code is running in browser environment
 *
 * @returns True if running in browser with window, document and navigator defined
 * @remarks This function checks for the existence of window, document, and navigator objects
 * to ensure we're in a proper browser environment, not just a partial environment
 * @example
 * ```typescript
 * if (isBrowser()) {
 *   // Safe to use browser APIs
 *   window.addEventListener('click', handler);
 * }
 * ```
 */
export const isBrowser = (): boolean => {
  return (
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.navigator !== 'undefined'
  );
};

/**
 * Check if code is running in server environment
 *
 * @returns True if running on server (Node.js, Deno, etc.)
 * @remarks This is the inverse of isBrowser() - if we're not in a browser, we're on a server
 * @example
 * ```typescript
 * if (isServer()) {
 *   // Use server-side implementations
 *   const fs = await import('fs');
 * }
 * ```
 */
export const isServer = (): boolean => {
  return !isBrowser();
};

/**
 * Check if Web Workers are available
 *
 * @returns True if Web Workers are supported
 * @remarks Web Workers allow running JavaScript in background threads. This function
 * checks both that we're in a browser and that the Worker constructor is available
 * @example
 * ```typescript
 * if (hasWebWorkerSupport()) {
 *   const worker = new Worker('worker.js');
 *   worker.postMessage({ cmd: 'start' });
 * }
 * ```
 */
export const hasWebWorkerSupport = (): boolean => {
  return isBrowser() && typeof Worker !== 'undefined';
};

/**
 * Check if Service Workers are available
 *
 * @returns True if Service Workers are supported
 * @remarks Service Workers enable powerful features like offline functionality and push notifications.
 * This checks for the serviceWorker property on the navigator object
 * @example
 * ```typescript
 * if (hasServiceWorkerSupport()) {
 *   navigator.serviceWorker.register('/sw.js')
 *     .then(registration => console.log('SW registered:', registration));
 * }
 * ```
 */
export const hasServiceWorkerSupport = (): boolean => {
  return isBrowser() && 'serviceWorker' in navigator;
};

/**
 * Check if localStorage is available
 *
 * @returns True if localStorage is available and working
 * @remarks This function not only checks for localStorage existence but also tests if it's
 * functional by attempting to write and remove a test key. Some browsers in private mode
 * have localStorage defined but throw errors when trying to use it
 * @example
 * ```typescript
 * if (hasLocalStorage()) {
 *   localStorage.setItem('user-preference', 'dark-mode');
 * } else {
 *   // Fall back to in-memory storage
 * }
 * ```
 */
export const hasLocalStorage = (): boolean => {
  if (!isBrowser()) return false;

  try {
    const testKey = '__walletmesh_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if sessionStorage is available
 *
 * @returns True if sessionStorage is available and working
 * @remarks Similar to hasLocalStorage, this function tests sessionStorage functionality
 * by attempting to write and remove a test key. Session storage persists only for the
 * duration of the page session
 * @example
 * ```typescript
 * if (hasSessionStorage()) {
 *   sessionStorage.setItem('temp-data', JSON.stringify(data));
 * }
 * ```
 */
export const hasSessionStorage = (): boolean => {
  if (!isBrowser()) return false;

  try {
    const testKey = '__walletmesh_test__';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if browser extension APIs are available
 *
 * @returns True if running in a browser extension context
 * @remarks Detects if the code is running inside a browser extension by checking for
 * the chrome.runtime.id property. Works for Chrome, Edge, and other Chromium-based browsers
 * @example
 * ```typescript
 * if (isBrowserExtension()) {
 *   // Safe to use chrome.runtime APIs
 *   chrome.runtime.sendMessage({ action: 'wallet-connected' });
 * }
 * ```
 */
export const isBrowserExtension = (): boolean => {
  if (!isBrowser()) return false;

  // Check for chrome global safely
  const globalWithChrome = globalThis as typeof globalThis & { chrome?: { runtime?: { id?: string } } };
  return (
    typeof globalWithChrome.chrome !== 'undefined' &&
    globalWithChrome.chrome !== null &&
    globalWithChrome.chrome.runtime !== undefined &&
    globalWithChrome.chrome.runtime.id !== undefined
  );
};

/**
 * Check if IndexedDB is available
 *
 * @returns True if IndexedDB is supported
 * @remarks IndexedDB is a low-level API for client-side storage of significant amounts
 * of structured data. This function checks for its availability
 * @example
 * ```typescript
 * if (hasIndexedDB()) {
 *   const request = indexedDB.open('MyDatabase', 1);
 *   request.onsuccess = () => {
 *     const db = request.result;
 *     // Use the database
 *   };
 * }
 * ```
 */
export const hasIndexedDB = (): boolean => {
  if (!isBrowser()) return false;

  return typeof indexedDB !== 'undefined';
};

/**
 * Check if the page is in an iframe
 *
 * @returns True if running inside an iframe
 * @remarks Detects if the current page is loaded inside an iframe by comparing window.self
 * to window.top. If they differ, we're in an iframe. Cross-origin iframes will throw an
 * error when accessing window.top, which we catch and interpret as being in an iframe
 * @example
 * ```typescript
 * if (isInIframe()) {
 *   console.log('Running inside an iframe');
 *   // May need to handle postMessage communication
 * }
 * ```
 */
export const isInIframe = (): boolean => {
  if (!isBrowser()) return false;

  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin iframe will throw, which means we are in an iframe
    return true;
  }
};

/**
 * Get the current origin in a safe way
 *
 * @returns The current origin (protocol + domain + port) or undefined if not available
 * @remarks Safely retrieves the current page's origin. Returns undefined on server or if
 * access to location.origin fails (rare edge cases)
 * @example
 * ```typescript
 * const origin = getCurrentOrigin();
 * if (origin) {
 *   console.log(`Running on: ${origin}`);
 *   // e.g., "https://example.com:3000"
 * }
 * ```
 */
export const getCurrentOrigin = (): string | undefined => {
  if (!isBrowser()) return undefined;

  try {
    return window.location.origin;
  } catch {
    return undefined;
  }
};

/**
 * Safe window getter that returns undefined on server
 *
 * @returns Window object or undefined if not in browser
 * @remarks Use this function when you need to access the window object in code that
 * might run on the server. It prevents ReferenceError in SSR environments
 * @example
 * ```typescript
 * const win = getWindow();
 * if (win) {
 *   win.addEventListener('resize', handleResize);
 * }
 * ```
 */
export const getWindow = (): Window | undefined => {
  return isBrowser() ? window : undefined;
};

/**
 * Safe document getter that returns undefined on server
 *
 * @returns Document object or undefined if not in browser
 * @remarks Use this function when you need to access the document object in code that
 * might run on the server. Essential for SSR-compatible DOM manipulation
 * @example
 * ```typescript
 * const doc = getDocument();
 * if (doc) {
 *   const element = doc.createElement('div');
 *   doc.body.appendChild(element);
 * }
 * ```
 */
export const getDocument = (): Document | undefined => {
  return isBrowser() ? document : undefined;
};

/**
 * Safe navigator getter that returns undefined on server
 *
 * @returns Navigator object or undefined if not in browser
 * @remarks Use this function when you need to access the navigator object in code that
 * might run on the server. Useful for feature detection and browser capabilities
 * @example
 * ```typescript
 * const nav = getNavigator();
 * if (nav && nav.geolocation) {
 *   nav.geolocation.getCurrentPosition(position => {
 *     console.log('User location:', position);
 *   });
 * }
 * ```
 */
export const getNavigator = (): Navigator | undefined => {
  return isBrowser() ? navigator : undefined;
};

/**
 * Create a safe storage wrapper that works in all environments
 *
 * @param type - Storage type to create wrapper for ('local' or 'session')
 * @returns Safe storage interface that won't throw errors
 * @remarks This function creates a Storage-compatible wrapper that gracefully handles
 * environments where storage is unavailable (SSR, private browsing, etc.). All methods
 * are no-op when storage is unavailable, preventing runtime errors
 * @example
 * ```typescript
 * const storage = createSafeStorage('local');
 * storage.setItem('key', 'value'); // Won't throw even if localStorage is unavailable
 * const value = storage.getItem('key'); // Returns null if unavailable
 * ```
 */
export const createSafeStorage = (type: 'local' | 'session'): Storage => {
  const isAvailable = type === 'local' ? hasLocalStorage() : hasSessionStorage();
  const storage = type === 'local' ? localStorage : sessionStorage;

  return {
    get length() {
      return isAvailable ? storage.length : 0;
    },

    key(index: number): string | null {
      return isAvailable ? storage.key(index) : null;
    },

    getItem(key: string): string | null {
      if (!isAvailable) return null;
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },

    setItem(key: string, value: string): void {
      if (!isAvailable) return;
      try {
        storage.setItem(key, value);
      } catch {
        // Ignore errors (e.g., quota exceeded)
      }
    },

    removeItem(key: string): void {
      if (!isAvailable) return;
      try {
        storage.removeItem(key);
      } catch {
        // Ignore errors
      }
    },

    clear(): void {
      if (!isAvailable) return;
      try {
        storage.clear();
      } catch {
        // Ignore errors
      }
    },
  };
};

/**
 * Safe localStorage instance
 *
 * @remarks Pre-created safe localStorage wrapper that can be used anywhere without
 * worrying about SSR or browser compatibility issues
 * @example
 * ```typescript
 * import { safeLocalStorage } from '@walletmesh/modal-core';
 *
 * // Use it like regular localStorage, but it won't throw errors
 * safeLocalStorage.setItem('theme', 'dark');
 * const theme = safeLocalStorage.getItem('theme') || 'light';
 * ```
 */
export const safeLocalStorage = createSafeStorage('local');

/**
 * Safe sessionStorage instance
 *
 * @remarks Pre-created safe sessionStorage wrapper that can be used anywhere without
 * worrying about SSR or browser compatibility issues
 * @example
 * ```typescript
 * import { safeSessionStorage } from '@walletmesh/modal-core';
 *
 * // Use it like regular sessionStorage, but it won't throw errors
 * safeSessionStorage.setItem('tempData', JSON.stringify(data));
 * const saved = safeSessionStorage.getItem('tempData');
 * ```
 */
export const safeSessionStorage = createSafeStorage('session');
