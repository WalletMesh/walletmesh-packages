import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestEnvironment, installCustomMatchers } from '../../testing/index.js';
import { createLazy, createLazyAsync, createLazyProxy, createLazySingleton } from './lazy.js';

// Install custom matchers
installCustomMatchers();

describe('Lazy Utilities', () => {
  const testEnv = createTestEnvironment();

  beforeEach(async () => {
    await testEnv.setup();
  });

  afterEach(async () => {
    await testEnv.teardown();
  });
  describe('createLazy', () => {
    it('should create a lazy getter function', () => {
      const factory = vi.fn(() => 'test-value');

      const lazyGetter = createLazy(factory);

      expect(factory).not.toHaveBeenCalled();
      expect(typeof lazyGetter).toBe('function');
    });

    it('should call factory only on first access', () => {
      const factory = vi.fn(() => 'test-value');
      const lazyGetter = createLazy(factory);

      expect(factory).not.toHaveBeenCalled();

      const result = lazyGetter();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result).toBe('test-value');
    });

    it('should cache the result and not call factory again', () => {
      const factory = vi.fn(() => 'test-value');
      const lazyGetter = createLazy(factory);

      const result1 = lazyGetter();
      const result2 = lazyGetter();
      const result3 = lazyGetter();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result1).toBe('test-value');
      expect(result2).toBe('test-value');
      expect(result3).toBe('test-value');
      expect(result1).toBe(result2); // Same reference
    });

    it('should work with complex objects', () => {
      const complexObject = { data: 'test', method: vi.fn() };
      const factory = vi.fn(() => complexObject);
      const lazyGetter = createLazy(factory);

      const result = lazyGetter();

      expect(result).toBe(complexObject);
      expect(result.data).toBe('test');
      expect(typeof result.method).toBe('function');
    });

    it('should handle factory functions that return different types', () => {
      const numberLazy = createLazy(() => 42);
      const stringLazy = createLazy(() => 'hello');
      const arrayLazy = createLazy(() => [1, 2, 3]);
      const objectLazy = createLazy(() => ({ key: 'value' }));

      expect(numberLazy()).toBe(42);
      expect(stringLazy()).toBe('hello');
      expect(arrayLazy()).toEqual([1, 2, 3]);
      expect(objectLazy()).toEqual({ key: 'value' });
    });

    it('should handle factory that throws error', () => {
      const factory = vi.fn(() => {
        throw new Error('Factory error');
      });
      const lazyGetter = createLazy(factory);

      expect(() => lazyGetter()).toThrow('Factory error');
      expect(factory).toHaveBeenCalledTimes(1);

      // Should throw again on subsequent calls
      expect(() => lazyGetter()).toThrow('Factory error');
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('should handle factory that returns null or undefined', () => {
      const nullLazy = createLazy(() => null);
      const undefinedLazy = createLazy(() => undefined);

      expect(nullLazy()).toBeNull();
      expect(undefinedLazy()).toBeUndefined();
    });

    it('should work with DOM API example', () => {
      // Mock localStorage for testing
      const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      const factory = vi.fn(() => mockStorage);
      const getStorage = createLazy(factory);

      expect(factory).not.toHaveBeenCalled();

      const storage = getStorage();
      storage.setItem('key', 'value');

      expect(factory).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('createLazyAsync', () => {
    it('should create a lazy async getter function', () => {
      const factory = vi.fn(() => Promise.resolve('test-value'));

      const lazyAsyncGetter = createLazyAsync(factory);

      expect(factory).not.toHaveBeenCalled();
      expect(typeof lazyAsyncGetter).toBe('function');
    });

    it('should call factory only on first access', async () => {
      const factory = vi.fn(() => Promise.resolve('test-value'));
      const lazyAsyncGetter = createLazyAsync(factory);

      expect(factory).not.toHaveBeenCalled();

      const result = await lazyAsyncGetter();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result).toBe('test-value');
    });

    it('should cache the promise and not call factory again', async () => {
      const factory = vi.fn(() => Promise.resolve('test-value'));
      const lazyAsyncGetter = createLazyAsync(factory);

      const promise1 = lazyAsyncGetter();
      const promise2 = lazyAsyncGetter();
      const promise3 = lazyAsyncGetter();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(promise1).toBe(promise2); // Same promise reference
      expect(promise2).toBe(promise3);

      const result1 = await promise1;
      const result2 = await promise2;
      const result3 = await promise3;

      expect(result1).toBe('test-value');
      expect(result2).toBe('test-value');
      expect(result3).toBe('test-value');
    });

    it('should handle async factory with complex data', async () => {
      const mockApiResponse = {
        wallets: [
          { id: 'metamask', name: 'MetaMask' },
          { id: 'coinbase', name: 'Coinbase' },
        ],
      };

      const factory = vi.fn(async () => {
        // Use fake timer advance instead of real timeout
        await testEnv.advanceTimers(10);
        return mockApiResponse;
      });

      const getWalletList = createLazyAsync(factory);

      const result = await getWalletList();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockApiResponse);
      expect(result.wallets).toHaveLength(2);
    });

    it('should handle rejected promises and allow retry', async () => {
      let callCount = 0;
      const factory = vi.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Async error'));
        }
        return Promise.resolve('success');
      });
      const lazyAsyncGetter = createLazyAsync(factory);

      // First call fails
      await expect(lazyAsyncGetter()).rejects.toThrow('Async error');
      expect(factory).toHaveBeenCalledTimes(1);

      // Retry should work (factory called again since failed promise is not cached)
      const result = await lazyAsyncGetter();
      expect(result).toBe('success');
      expect(factory).toHaveBeenCalledTimes(2);

      // Subsequent calls should return cached successful result
      const result2 = await lazyAsyncGetter();
      expect(result2).toBe('success');
      expect(factory).toHaveBeenCalledTimes(2); // Not called again
    });

    it('should handle factory that returns resolved promise', async () => {
      const factory = vi.fn(() => Promise.resolve(42));
      const lazyAsyncGetter = createLazyAsync(factory);

      const result = await lazyAsyncGetter();

      expect(result).toBe(42);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should work with fetch API example', async () => {
      const mockResponse = {
        json: vi.fn().mockResolvedValue({ data: 'test' }),
        ok: true,
        status: 200,
      };

      const mockFetch = vi.fn().mockResolvedValue(mockResponse);
      global.fetch = mockFetch;

      const factory = vi.fn(async () => {
        const response = await fetch('/api/wallets');
        return response.json();
      });

      const getWalletList = createLazyAsync(factory);

      const result = await getWalletList();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/wallets');
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('createLazyProxy', () => {
    it('should create a proxy that initializes on first property access', () => {
      const mockObject = {
        property: 'value',
        method: vi.fn(() => 'result'),
      };
      const factory = vi.fn(() => mockObject);

      const proxy = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      // Access property - should trigger initialization
      const value = proxy.property;

      expect(factory).toHaveBeenCalledTimes(1);
      expect(value).toBe('value');
    });

    it('should only initialize once across multiple property accesses', () => {
      const mockObject = {
        prop1: 'value1',
        prop2: 'value2',
        method: vi.fn(() => 'result'),
      };
      const factory = vi.fn(() => mockObject);

      const proxy = createLazyProxy(factory);

      const val1 = proxy.prop1;
      const val2 = proxy.prop2;
      const methodResult = proxy.method();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(val1).toBe('value1');
      expect(val2).toBe('value2');
      expect(methodResult).toBe('result');
      expect(mockObject.method).toHaveBeenCalledTimes(1);
    });

    it('should initialize on property write', () => {
      const mockObject: Record<string, unknown> = {};
      const factory = vi.fn(() => mockObject);

      const proxy = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      proxy['property'] = 'updated';

      expect(factory).toHaveBeenCalledTimes(1);
      // The proxy set operation correctly triggers initialization
      // The actual property value is set on the underlying object
    });

    it('should initialize on has operator', () => {
      const mockObject = { property: 'value' };
      const factory = vi.fn(() => mockObject);

      const proxy = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      const hasProperty = 'property' in proxy;

      expect(factory).toHaveBeenCalledTimes(1);
      expect(hasProperty).toBe(true);
    });

    it('should initialize on Object.keys', () => {
      const mockObject = { prop1: 'value1', prop2: 'value2' };
      const factory = vi.fn(() => mockObject);

      const proxy = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      const keys = Object.keys(proxy);

      expect(factory).toHaveBeenCalledTimes(1);
      expect(keys).toEqual(['prop1', 'prop2']);
    });

    it('should initialize on getOwnPropertyDescriptor', () => {
      const mockObject = { property: 'value' };
      const factory = vi.fn(() => mockObject);

      const proxy = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      const descriptor = Object.getOwnPropertyDescriptor(proxy, 'property');

      expect(factory).toHaveBeenCalledTimes(1);
      expect(descriptor?.value).toBe('value');
    });

    it('should work with complex objects and methods', () => {
      const mockController = {
        data: { value: 'test' },

        processData() {
          return `processed: ${this.data.value}`;
        },

        transform(suffix: string) {
          return `${this.data.value}${suffix}`;
        },

        getData() {
          return this.data;
        },
      };

      const factory = vi.fn(() => mockController);
      const controller = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      // Method call should initialize
      const result = controller.processData();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(result).toBe('processed: test');

      // Subsequent operations should not re-initialize
      const transformResult = controller.transform('-transformed');
      const data = controller.getData();

      expect(factory).toHaveBeenCalledTimes(1); // Still only once
      expect(transformResult).toBe('test-transformed');
      expect(data).toEqual({ value: 'test' });
    });

    it('should handle factory that throws error', () => {
      const factory = vi.fn(() => {
        throw new Error('Factory error');
      });

      const proxy = createLazyProxy(factory);

      expect(() => (proxy as Record<string, unknown>)['someProperty']).toThrow('Factory error');
      expect(factory).toHaveBeenCalledTimes(1);

      // Should throw again on subsequent access
      expect(() => (proxy as Record<string, unknown>)['anotherProperty']).toThrow('Factory error');
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('should work with modal controller example', () => {
      const mockModalController = {
        isOpen: false,
        eventEmitter: new EventTarget(),
        open: vi.fn(() => {
          mockModalController.isOpen = true;
        }),
        close: vi.fn(() => {
          mockModalController.isOpen = false;
        }),
      };

      const factory = vi.fn(() => mockModalController);
      const controller = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      // Actual usage triggers initialization
      controller.open();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(mockModalController.open).toHaveBeenCalled();
      expect(controller.isOpen).toBe(true);
    });
  });

  describe('createLazySingleton', () => {
    it('should create a singleton manager', () => {
      const factory = vi.fn(() => ({ value: 'test' }));

      const singleton = createLazySingleton(factory);

      expect(factory).not.toHaveBeenCalled();
      expect(typeof singleton.getInstance).toBe('function');
      expect(typeof singleton.reset).toBe('function');
    });

    it('should call factory only on first getInstance call', () => {
      const factory = vi.fn(() => ({ value: 'test' }));
      const singleton = createLazySingleton(factory);

      expect(factory).not.toHaveBeenCalled();

      const instance = singleton.getInstance();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(instance.value).toBe('test');
    });

    it('should return the same instance on multiple calls', () => {
      const factory = vi.fn(() => ({ value: 'test' }));
      const singleton = createLazySingleton(factory);

      const instance1 = singleton.getInstance();
      const instance2 = singleton.getInstance();
      const instance3 = singleton.getInstance();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });

    it('should reset the singleton when reset is called', () => {
      const factory = vi.fn(() => ({ value: Math.random() }));
      const singleton = createLazySingleton(factory);

      const instance1 = singleton.getInstance();
      const value1 = instance1.value;

      singleton.reset();

      const instance2 = singleton.getInstance();
      const value2 = instance2.value;

      expect(factory).toHaveBeenCalledTimes(2);
      expect(instance1).not.toBe(instance2);
      expect(value1).not.toBe(value2);
    });

    it('should handle multiple resets', () => {
      const factory = vi.fn(() => ({ id: Math.random() }));
      const singleton = createLazySingleton(factory);

      const instance1 = singleton.getInstance();
      singleton.reset();

      const instance2 = singleton.getInstance();
      singleton.reset();

      const instance3 = singleton.getInstance();

      expect(factory).toHaveBeenCalledTimes(3);
      expect(instance1).not.toBe(instance2);
      expect(instance2).not.toBe(instance3);
    });

    it('should work with complex objects', () => {
      class MockModal {
        public id: string;
        public isOpen = false;

        constructor() {
          this.id = `modal-${Math.random()}`;
        }

        open() {
          this.isOpen = true;
        }

        close() {
          this.isOpen = false;
        }
      }

      const factory = vi.fn(() => new MockModal());
      const singleton = createLazySingleton(factory);

      const modal1 = singleton.getInstance();
      modal1.open();
      const modal2 = singleton.getInstance();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(modal1).toBe(modal2);
      expect(modal2.isOpen).toBe(true); // State is preserved

      singleton.reset();
      const modal3 = singleton.getInstance();

      expect(factory).toHaveBeenCalledTimes(2);
      expect(modal3).not.toBe(modal1);
      expect(modal3.isOpen).toBe(false); // New instance
    });

    it('should handle factory that throws error', () => {
      const factory = vi.fn(() => {
        throw new Error('Singleton factory error');
      });
      const singleton = createLazySingleton(factory);

      expect(() => singleton.getInstance()).toThrow('Singleton factory error');
      expect(factory).toHaveBeenCalledTimes(1);

      // Should throw again on subsequent calls
      expect(() => singleton.getInstance()).toThrow('Singleton factory error');
      expect(factory).toHaveBeenCalledTimes(2);
    });

    it('should work with modal singleton example', () => {
      const createModal = vi.fn(() => ({
        id: `modal-${Date.now()}`,
        isOpen: false,
        config: { theme: 'dark' },
        open: vi.fn(),
        close: vi.fn(),
      }));

      const modalSingleton = createLazySingleton(() => createModal());

      expect(createModal).not.toHaveBeenCalled();

      const modal = modalSingleton.getInstance();
      modal.open();

      expect(createModal).toHaveBeenCalledTimes(1);
      expect(modal.open).toHaveBeenCalled();

      // Get same instance
      const sameModal = modalSingleton.getInstance();
      expect(sameModal).toBe(modal);
      expect(createModal).toHaveBeenCalledTimes(1);

      // Reset for testing
      modalSingleton.reset();
      const newModal = modalSingleton.getInstance();

      expect(newModal).not.toBe(modal);
      expect(createModal).toHaveBeenCalledTimes(2);
    });
  });

  describe('Integration scenarios', () => {
    it('should work with nested lazy patterns', () => {
      const innerFactory = vi.fn(() => ({ data: 'inner' }));
      const outerFactory = vi.fn(() => ({
        inner: createLazy(innerFactory),
        value: 'outer',
      }));

      const lazyOuter = createLazy(outerFactory);

      expect(innerFactory).not.toHaveBeenCalled();
      expect(outerFactory).not.toHaveBeenCalled();

      const outer = lazyOuter();
      expect(outerFactory).toHaveBeenCalledTimes(1);
      expect(innerFactory).not.toHaveBeenCalled();

      const inner = outer.inner();
      expect(innerFactory).toHaveBeenCalledTimes(1);
      expect(inner.data).toBe('inner');
    });

    it('should combine lazy and singleton patterns', () => {
      const factory = vi.fn(() => ({ id: Math.random(), data: 'test' }));
      const singleton = createLazySingleton(factory);
      const lazyGetter = createLazy(() => singleton.getInstance());

      expect(factory).not.toHaveBeenCalled();

      const instance1 = lazyGetter();
      const instance2 = lazyGetter();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(instance1).toBe(instance2);
    });

    it('should work with lazy proxy containing async operations', async () => {
      const mockController = {
        loadData: vi.fn(async () => {
          // Use fake timer advance instead of real timeout
          await testEnv.advanceTimers(1);
          return { loaded: true };
        }),
        data: null as { loaded?: boolean } | null,
      };

      const factory = vi.fn(() => mockController);
      const proxy = createLazyProxy(factory);

      expect(factory).not.toHaveBeenCalled();

      const result = await proxy.loadData();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(mockController.loadData).toHaveBeenCalled();
      expect(result).toEqual({ loaded: true });
    });

    it('should handle browser environment detection patterns', () => {
      const mockWindow = {
        localStorage: {
          getItem: vi.fn(),
          setItem: vi.fn(),
        },
        document: {
          createElement: vi.fn(),
        },
      };

      const browserApiFactory = vi.fn(() => mockWindow);
      const getBrowserApis = createLazy(browserApiFactory);

      // In SSR, this wouldn't be called
      expect(browserApiFactory).not.toHaveBeenCalled();

      // Only when actually needed in browser
      const apis = getBrowserApis();
      apis.localStorage.setItem('key', 'value');

      expect(browserApiFactory).toHaveBeenCalledTimes(1);
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle undefined factory results consistently', () => {
      const lazyUndefined = createLazy(() => undefined);
      const singletonUndefined = createLazySingleton(() => undefined);

      expect(lazyUndefined()).toBeUndefined();
      expect(singletonUndefined.getInstance()).toBeUndefined();
    });

    it('should handle null factory results consistently', () => {
      const lazyNull = createLazy(() => null);
      const singletonNull = createLazySingleton(() => null);

      expect(lazyNull()).toBeNull();
      expect(singletonNull.getInstance()).toBeNull();
    });

    it('should handle factory with side effects', () => {
      const sideEffects: string[] = [];

      const factory = vi.fn(() => {
        sideEffects.push('factory called');
        return { value: 'test' };
      });

      const lazyGetter = createLazy(factory);

      expect(sideEffects).toEqual([]);

      lazyGetter();
      expect(sideEffects).toEqual(['factory called']);

      lazyGetter();
      expect(sideEffects).toEqual(['factory called']); // Still only once
    });

    it('should handle concurrent access to lazy values', () => {
      const factory = vi.fn(() => ({ id: Math.random() }));
      const lazyGetter = createLazy(factory);

      // Simulate concurrent access
      const results = Array.from({ length: 10 }, () => lazyGetter());

      expect(factory).toHaveBeenCalledTimes(1);

      // All results should be the same instance
      const firstResult = results[0];
      for (const result of results) {
        expect(result).toBe(firstResult);
      }
    });

    it('should handle factories that return functions', () => {
      const mockFunction = vi.fn(() => 'function result');
      const factory = vi.fn(() => mockFunction);
      const lazyGetter = createLazy(factory);

      const fn = lazyGetter();
      const result = fn();

      expect(factory).toHaveBeenCalledTimes(1);
      expect(mockFunction).toHaveBeenCalledTimes(1);
      expect(result).toBe('function result');
    });
  });
});
