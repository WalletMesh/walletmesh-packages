import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import {
  createSafeStorage,
  getCurrentOrigin,
  getDocument,
  getNavigator,
  getWindow,
  hasIndexedDB,
  hasLocalStorage,
  hasServiceWorkerSupport,
  hasSessionStorage,
  hasWebWorkerSupport,
  isBrowser,
  isBrowserExtension,
  isInIframe,
  isServer,
  safeLocalStorage,
  safeSessionStorage,
} from './environment.js';

// Mock localStorage
const localStorageMock = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => localStorageMock.data.get(key) || null),
  setItem: vi.fn((key: string, value: string) => localStorageMock.data.set(key, value)),
  removeItem: vi.fn((key: string) => localStorageMock.data.delete(key)),
  clear: vi.fn(() => localStorageMock.data.clear()),
  get length() {
    return localStorageMock.data.size;
  },
  key: vi.fn((index: number) => Array.from(localStorageMock.data.keys())[index] || null),
};

// Mock sessionStorage
const sessionStorageMock = {
  data: new Map<string, string>(),
  getItem: vi.fn((key: string) => sessionStorageMock.data.get(key) || null),
  setItem: vi.fn((key: string, value: string) => sessionStorageMock.data.set(key, value)),
  removeItem: vi.fn((key: string) => sessionStorageMock.data.delete(key)),
  clear: vi.fn(() => sessionStorageMock.data.clear()),
  get length() {
    return sessionStorageMock.data.size;
  },
  key: vi.fn((index: number) => Array.from(sessionStorageMock.data.keys())[index] || null),
};

// Setup global localStorage and sessionStorage mocks
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Install custom matchers
installCustomMatchers();

describe('Environment Detection Utilities', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
    localStorageMock.data.clear();
    sessionStorageMock.data.clear();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });

  describe('isBrowser', () => {
    it('should return true when all browser globals are available', () => {
      expect(isBrowser()).toBe(true);
    });

    it('should return false when window is undefined', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(isBrowser()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });

    it('should return false when window.document is undefined', () => {
      const originalDocument = window.document;
      Object.defineProperty(window, 'document', {
        value: undefined,
        configurable: true,
      });

      expect(isBrowser()).toBe(false);

      Object.defineProperty(window, 'document', {
        value: originalDocument,
        configurable: true,
      });
    });

    it('should return false when window.navigator is undefined', () => {
      const originalNavigator = window.navigator;
      Object.defineProperty(window, 'navigator', {
        value: undefined,
        configurable: true,
      });

      expect(isBrowser()).toBe(false);

      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
    });
  });

  describe('isServer', () => {
    it('should return true when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(isServer()).toBe(true);

      (global as { window?: Window }).window = originalWindow;
    });

    it('should return false when in browser', () => {
      expect(isServer()).toBe(false);
    });
  });

  describe('hasWebWorkerSupport', () => {
    it('should return true when Worker is available in browser', () => {
      const originalWorker = global.Worker;
      global.Worker = class MockWorker {} as typeof Worker;

      expect(hasWebWorkerSupport()).toBe(true);

      global.Worker = originalWorker;
    });

    it('should return false when Worker is not available', () => {
      const originalWorker = global.Worker;
      Reflect.deleteProperty(global, 'Worker');

      expect(hasWebWorkerSupport()).toBe(false);

      global.Worker = originalWorker;
    });

    it('should return false when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(hasWebWorkerSupport()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('hasServiceWorkerSupport', () => {
    it('should return true when serviceWorker is available', () => {
      const originalNavigator = window.navigator;
      Object.defineProperty(window, 'navigator', {
        value: { serviceWorker: {} },
        configurable: true,
      });

      expect(hasServiceWorkerSupport()).toBe(true);

      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
    });

    it('should return false when serviceWorker is not available', () => {
      const originalNavigator = window.navigator;
      Object.defineProperty(window, 'navigator', {
        value: {},
        configurable: true,
      });

      expect(hasServiceWorkerSupport()).toBe(false);

      Object.defineProperty(window, 'navigator', {
        value: originalNavigator,
        configurable: true,
      });
    });

    it('should return false when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(hasServiceWorkerSupport()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('hasLocalStorage', () => {
    it('should return true when localStorage works correctly', () => {
      expect(hasLocalStorage()).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('__walletmesh_test__', 'test');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('__walletmesh_test__');
    });

    it('should return false when localStorage throws on setItem', () => {
      vi.mocked(localStorageMock.setItem).mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(hasLocalStorage()).toBe(false);
    });

    it('should return false when localStorage throws on removeItem', () => {
      vi.mocked(localStorageMock.removeItem).mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(hasLocalStorage()).toBe(false);
    });

    it('should return false when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(hasLocalStorage()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('hasSessionStorage', () => {
    it('should return true when sessionStorage works correctly', () => {
      expect(hasSessionStorage()).toBe(true);
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith('__walletmesh_test__', 'test');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('__walletmesh_test__');
    });

    it('should return false when sessionStorage throws on setItem', () => {
      vi.mocked(sessionStorageMock.setItem).mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      expect(hasSessionStorage()).toBe(false);
    });

    it('should return false when sessionStorage throws on removeItem', () => {
      vi.mocked(sessionStorageMock.removeItem).mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      expect(hasSessionStorage()).toBe(false);
    });

    it('should return false when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(hasSessionStorage()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('isBrowserExtension', () => {
    it('should return true when chrome.runtime.id is available', () => {
      const originalChrome = (globalThis as typeof globalThis & { chrome?: unknown }).chrome;
      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = {
        runtime: { id: 'extension-id' },
      };

      expect(isBrowserExtension()).toBe(true);

      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = originalChrome;
    });

    it('should return false when chrome is undefined', () => {
      const originalChrome = (globalThis as typeof globalThis & { chrome?: unknown }).chrome;
      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = undefined;

      expect(isBrowserExtension()).toBe(false);

      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = originalChrome;
    });

    it('should return false when chrome.runtime is undefined', () => {
      const originalChrome = (globalThis as typeof globalThis & { chrome?: unknown }).chrome;
      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = {
        runtime: undefined,
      };

      expect(isBrowserExtension()).toBe(false);

      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = originalChrome;
    });

    it('should return false when chrome.runtime.id is undefined', () => {
      const originalChrome = (globalThis as typeof globalThis & { chrome?: unknown }).chrome;
      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = {
        runtime: {},
      };

      expect(isBrowserExtension()).toBe(false);

      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = originalChrome;
    });

    it('should return false when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(isBrowserExtension()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('hasIndexedDB', () => {
    it('should return true when indexedDB is available', () => {
      const originalIndexedDB = global.indexedDB;
      global.indexedDB = {} as IDBFactory;

      expect(hasIndexedDB()).toBe(true);

      global.indexedDB = originalIndexedDB;
    });

    it('should return false when indexedDB is undefined', () => {
      const originalIndexedDB = global.indexedDB;
      (global as { indexedDB?: IDBFactory }).indexedDB = undefined;

      expect(hasIndexedDB()).toBe(false);

      global.indexedDB = originalIndexedDB;
    });

    it('should return false when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(hasIndexedDB()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('isInIframe', () => {
    it('should return false when window.self equals window.top', () => {
      const originalSelf = window.self;
      const originalTop = window.top;

      Object.defineProperty(window, 'self', {
        value: window,
        configurable: true,
      });
      Object.defineProperty(window, 'top', {
        value: window,
        configurable: true,
      });

      expect(isInIframe()).toBe(false);

      Object.defineProperty(window, 'self', {
        value: originalSelf,
        configurable: true,
      });
      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });
    });

    it('should return true when window.self does not equal window.top', () => {
      const originalSelf = window.self;
      const originalTop = window.top;
      const mockParent = {} as Window;

      Object.defineProperty(window, 'self', {
        value: window,
        configurable: true,
      });
      Object.defineProperty(window, 'top', {
        value: mockParent,
        configurable: true,
      });

      expect(isInIframe()).toBe(true);

      Object.defineProperty(window, 'self', {
        value: originalSelf,
        configurable: true,
      });
      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });
    });

    it('should return true when accessing window.top throws (cross-origin)', () => {
      const originalTop = window.top;

      Object.defineProperty(window, 'top', {
        get() {
          throw new Error('Cross-origin access denied');
        },
        configurable: true,
      });

      expect(isInIframe()).toBe(true);

      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });
    });

    it('should return false when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(isInIframe()).toBe(false);

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('getCurrentOrigin', () => {
    it('should return origin when available', () => {
      expect(getCurrentOrigin()).toBe(window.location.origin);
    });

    it('should return undefined when window.location throws', () => {
      const originalLocation = window.location;

      Object.defineProperty(window, 'location', {
        get() {
          throw new Error('Access denied');
        },
        configurable: true,
      });

      expect(getCurrentOrigin()).toBeUndefined();

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    });

    it('should return undefined when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(getCurrentOrigin()).toBeUndefined();

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('getWindow', () => {
    it('should return window when in browser', () => {
      expect(getWindow()).toBe(window);
    });

    it('should return undefined when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(getWindow()).toBeUndefined();

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('getDocument', () => {
    it('should return document when in browser', () => {
      expect(getDocument()).toBe(document);
    });

    it('should return undefined when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(getDocument()).toBeUndefined();

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('getNavigator', () => {
    it('should return navigator when in browser', () => {
      expect(getNavigator()).toBe(navigator);
    });

    it('should return undefined when not in browser', () => {
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(getNavigator()).toBeUndefined();

      (global as { window?: Window }).window = originalWindow;
    });
  });

  describe('createSafeStorage', () => {
    describe('local storage', () => {
      it('should create working local storage when available', () => {
        const storage = createSafeStorage('local');

        expect(storage.length).toBe(0);
        expect(storage.key(0)).toBe(null);

        storage.getItem('test');
        expect(localStorageMock.getItem).toHaveBeenCalledWith('test');

        storage.setItem('key', 'value');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('key', 'value');

        storage.removeItem('key');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('key');

        storage.clear();
        expect(localStorageMock.clear).toHaveBeenCalled();
      });

      it('should handle storage errors gracefully', () => {
        vi.mocked(localStorageMock.getItem).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });
        vi.mocked(localStorageMock.setItem).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });
        vi.mocked(localStorageMock.removeItem).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });
        vi.mocked(localStorageMock.clear).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });

        const storage = createSafeStorage('local');

        expect(storage.getItem('test')).toBe(null);
        expect(() => storage.setItem('key', 'value')).not.toThrow();
        expect(() => storage.removeItem('key')).not.toThrow();
        expect(() => storage.clear()).not.toThrow();
      });

      it('should return safe values when localStorage is not available', () => {
        const originalWindow = global.window;
        (global as { window?: Window }).window = undefined;

        const storage = createSafeStorage('local');

        expect(storage.length).toBe(0);
        expect(storage.key(0)).toBe(null);
        expect(storage.getItem('test')).toBe(null);
        expect(() => storage.setItem('key', 'value')).not.toThrow();
        expect(() => storage.removeItem('key')).not.toThrow();
        expect(() => storage.clear()).not.toThrow();

        (global as { window?: Window }).window = originalWindow;
      });
    });

    describe('session storage', () => {
      it('should create working session storage when available', () => {
        const storage = createSafeStorage('session');

        expect(storage.length).toBe(0);
        expect(storage.key(0)).toBe(null);

        storage.getItem('test');
        expect(sessionStorageMock.getItem).toHaveBeenCalledWith('test');

        storage.setItem('key', 'value');
        expect(sessionStorageMock.setItem).toHaveBeenCalledWith('key', 'value');

        storage.removeItem('key');
        expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('key');

        storage.clear();
        expect(sessionStorageMock.clear).toHaveBeenCalled();
      });

      it('should handle storage errors gracefully', () => {
        vi.mocked(sessionStorageMock.getItem).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });
        vi.mocked(sessionStorageMock.setItem).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });
        vi.mocked(sessionStorageMock.removeItem).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });
        vi.mocked(sessionStorageMock.clear).mockImplementationOnce(() => {
          throw new Error('Storage error');
        });

        const storage = createSafeStorage('session');

        expect(storage.getItem('test')).toBe(null);
        expect(() => storage.setItem('key', 'value')).not.toThrow();
        expect(() => storage.removeItem('key')).not.toThrow();
        expect(() => storage.clear()).not.toThrow();
      });

      it('should return safe values when sessionStorage is not available', () => {
        const originalWindow = global.window;
        (global as { window?: Window }).window = undefined;

        const storage = createSafeStorage('session');

        expect(storage.length).toBe(0);
        expect(storage.key(0)).toBe(null);
        expect(storage.getItem('test')).toBe(null);
        expect(() => storage.setItem('key', 'value')).not.toThrow();
        expect(() => storage.removeItem('key')).not.toThrow();
        expect(() => storage.clear()).not.toThrow();

        (global as { window?: Window }).window = originalWindow;
      });
    });
  });

  describe('safeLocalStorage', () => {
    it('should be a safe local storage instance', () => {
      expect(safeLocalStorage).toBeDefined();
      expect(typeof safeLocalStorage.getItem).toBe('function');
      expect(typeof safeLocalStorage.setItem).toBe('function');
      expect(typeof safeLocalStorage.removeItem).toBe('function');
      expect(typeof safeLocalStorage.clear).toBe('function');
      expect(typeof safeLocalStorage.key).toBe('function');
    });

    it('should work safely even when localStorage is not available', () => {
      expect(() => safeLocalStorage.getItem('test')).not.toThrow();
      expect(() => safeLocalStorage.setItem('key', 'value')).not.toThrow();
      expect(() => safeLocalStorage.removeItem('key')).not.toThrow();
      expect(() => safeLocalStorage.clear()).not.toThrow();
    });
  });

  describe('safeSessionStorage', () => {
    it('should be a safe session storage instance', () => {
      expect(safeSessionStorage).toBeDefined();
      expect(typeof safeSessionStorage.getItem).toBe('function');
      expect(typeof safeSessionStorage.setItem).toBe('function');
      expect(typeof safeSessionStorage.removeItem).toBe('function');
      expect(typeof safeSessionStorage.clear).toBe('function');
      expect(typeof safeSessionStorage.key).toBe('function');
    });

    it('should work safely even when sessionStorage is not available', () => {
      expect(() => safeSessionStorage.getItem('test')).not.toThrow();
      expect(() => safeSessionStorage.setItem('key', 'value')).not.toThrow();
      expect(() => safeSessionStorage.removeItem('key')).not.toThrow();
      expect(() => safeSessionStorage.clear()).not.toThrow();
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle globalThis edge cases for browser extension detection', () => {
      // Test with null chrome
      const originalChrome = (globalThis as typeof globalThis & { chrome?: unknown }).chrome;
      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = null;

      expect(isBrowserExtension()).toBe(false);

      (globalThis as typeof globalThis & { chrome?: unknown }).chrome = originalChrome;
    });

    it('should handle complex iframe scenarios', () => {
      const originalSelf = window.self;
      const originalTop = window.top;
      const parentWindow = {} as Window;

      Object.defineProperty(window, 'self', {
        value: window,
        configurable: true,
      });
      Object.defineProperty(window, 'top', {
        value: parentWindow,
        configurable: true,
      });

      expect(isInIframe()).toBe(true);

      Object.defineProperty(window, 'self', {
        value: originalSelf,
        configurable: true,
      });
      Object.defineProperty(window, 'top', {
        value: originalTop,
        configurable: true,
      });
    });

    it('should handle storage length property correctly', () => {
      localStorageMock.data.set('key1', 'value1');
      localStorageMock.data.set('key2', 'value2');
      localStorageMock.data.set('key3', 'value3');
      localStorageMock.data.set('key4', 'value4');
      localStorageMock.data.set('key5', 'value5');

      const storage = createSafeStorage('local');
      expect(storage.length).toBe(5);
    });

    it('should handle storage key method correctly', () => {
      localStorageMock.data.set('testKey', 'value');
      vi.mocked(localStorageMock.key).mockReturnValue('testKey');

      const storage = createSafeStorage('local');
      expect(storage.key(0)).toBe('testKey');
      expect(localStorageMock.key).toHaveBeenCalledWith(0);
    });

    it('should handle multiple environment checks in sequence', () => {
      // Start in server environment
      const originalWindow = global.window;
      (global as { window?: Window }).window = undefined;

      expect(isServer()).toBe(true);
      expect(isBrowser()).toBe(false);
      expect(hasWebWorkerSupport()).toBe(false);
      expect(getCurrentOrigin()).toBeUndefined();

      // Switch to browser environment
      (global as { window?: Window }).window = originalWindow;

      expect(isServer()).toBe(false);
      expect(isBrowser()).toBe(true);
      expect(getCurrentOrigin()).toBe(window.location.origin);
    });

    it('should handle storage when only test operations fail', () => {
      // Create a mock storage where only the test key fails
      const mockFailingStorage = {
        ...localStorageMock,
        setItem: vi.fn((key: string, value: string) => {
          if (key === '__walletmesh_test__') {
            throw new Error('Test key fails');
          }
          localStorageMock.data.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          if (key === '__walletmesh_test__') {
            throw new Error('Test key fails');
          }
          localStorageMock.data.delete(key);
        }),
      };

      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, 'localStorage', {
        value: mockFailingStorage,
        configurable: true,
      });

      expect(hasLocalStorage()).toBe(false);

      // But the safe storage should still work for regular operations
      const storage = createSafeStorage('local');
      expect(() => storage.setItem('regular-key', 'value')).not.toThrow();

      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        configurable: true,
      });
    });
  });
});
