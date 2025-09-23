/**
 * Lazy initialization utilities
 *
 * These utilities provide patterns for lazy initialization of browser-dependent
 * resources, ensuring that browser APIs are only accessed when needed and not
 * during module import.
 *
 * @module utils/lazy
 */

// Re-export advanced lazy loading utilities from internal module
export {
  createLazyModule,
  type LazyModule,
  type LazyModuleOptions,
} from '../../utils/lazy/createLazyModule.js';

/**
 * Create a lazily initialized value
 *
 * The factory function is only called on first access, not at creation time.
 * This is useful for browser APIs that shouldn't be accessed during SSR.
 *
 * @template T
 * @param {() => T} factory - Factory function to create the value
 * @returns {() => T} Getter function that returns the lazily initialized value
 *
 * @example
 * ```typescript
 * // Create a lazy storage instance
 * const getStorage = createLazy(() => window.localStorage);
 *
 * // Later, when actually needed (not during import)
 * const storage = getStorage();
 * ```
 */
export function createLazy<T>(factory: () => T): () => T {
  let instance: T | undefined;
  let initialized = false;

  return () => {
    if (!initialized) {
      instance = factory();
      initialized = true;
    }
    return instance as T;
  };
}

/**
 * Create a lazily initialized async value
 *
 * Similar to createLazy but for async factory functions. The promise is
 * cached after first call.
 *
 * @template T
 * @param {() => Promise<T>} factory - Async factory function
 * @returns {() => Promise<T>} Getter function that returns the promise
 *
 * @example
 * ```typescript
 * const getWalletList = createLazyAsync(async () => {
 *   const response = await fetch('/api/wallets');
 *   return response.json();
 * });
 *
 * // First call triggers the fetch
 * const wallets = await getWalletList();
 * // Subsequent calls return the same promise
 * const sameWallets = await getWalletList();
 * ```
 */
export function createLazyAsync<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;

  return () => {
    if (!promise) {
      promise = factory();
    }
    return promise;
  };
}

/**
 * Create a lazy proxy that initializes on first property access
 *
 * This creates a proxy object that delays initialization until the first
 * time any property is accessed. Useful for complex objects with browser
 * dependencies.
 *
 * @template T
 * @param {() => T} factory - Factory function to create the target object
 * @returns {T} Proxy that initializes on first access
 *
 * @example
 * ```typescript
 * const controller = createLazyProxy(() => {
 *   // This code won't run until first property access
 *   return new ModalController({
 *     eventEmitter: new EventTarget(),
 *     // ... other browser-dependent config
 *   });
 * });
 *
 * // Later, when actually used
 * controller.open(); // Initialization happens here
 * ```
 */
export function createLazyProxy<T extends object>(factory: () => T): T {
  let instance: T | undefined;
  let initialized = false;

  const handler: ProxyHandler<object> = {
    get(_target, prop, receiver) {
      if (!initialized) {
        instance = factory();
        initialized = true;
      }
      // instance is guaranteed to be non-null after initialization
      return Reflect.get(instance as T, prop, receiver);
    },

    set(_target, prop, value, receiver) {
      if (!initialized) {
        instance = factory();
        initialized = true;
      }
      // instance is guaranteed to be non-null after initialization
      return Reflect.set(instance as T, prop, value, receiver);
    },

    has(_target, prop) {
      if (!initialized) {
        instance = factory();
        initialized = true;
      }
      // instance is guaranteed to be non-null after initialization
      return Reflect.has(instance as T, prop);
    },

    ownKeys(_target) {
      if (!initialized) {
        instance = factory();
        initialized = true;
      }
      // instance is guaranteed to be non-null after initialization
      return Reflect.ownKeys(instance as T);
    },

    getOwnPropertyDescriptor(_target, prop) {
      if (!initialized) {
        instance = factory();
        initialized = true;
      }
      // instance is guaranteed to be non-null after initialization
      return Reflect.getOwnPropertyDescriptor(instance as T, prop);
    },
  };

  return new Proxy({}, handler) as T;
}

/**
 * Create a singleton factory with lazy initialization
 *
 * This ensures that only one instance is created, and it's created
 * lazily on first access.
 *
 * @template T
 * @param {() => T} factory - Factory function
 * @returns {{ getInstance: () => T, reset: () => void }} Singleton manager
 *
 * @example
 * ```typescript
 * const modalSingleton = createLazySingleton(() => createModal({
 *   // configuration
 * }));
 *
 * // Get the singleton instance
 * const modal = modalSingleton.getInstance();
 *
 * // Reset for testing
 * modalSingleton.reset();
 * ```
 */
export function createLazySingleton<T>(factory: () => T): {
  getInstance: () => T;
  reset: () => void;
} {
  let instance: T | undefined;
  let initialized = false;

  return {
    getInstance: () => {
      if (!initialized) {
        instance = factory();
        initialized = true;
      }
      return instance as T;
    },

    reset: () => {
      instance = undefined;
      initialized = false;
    },
  };
}
