/**
 * Helper utilities for common lazy loading patterns
 *
 * @module utils/lazy/helpers
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import { type LazyModuleOptions, createLazyModule } from './createLazyModule.js';

/**
 * Configuration for creating a lazy provider
 *
 * @public
 */
export interface LazyProviderConfig {
  /** Module path or import function */
  module: string | (() => Promise<unknown>);
  /** List of function names to wrap */
  functions: string[];
  /** Display name for error messages */
  displayName: string;
  /** Custom installation message */
  installMessage?: string;
}

/**
 * Create a lazy provider with all specified functions wrapped
 *
 * This is a convenience function for blockchain providers and similar modules
 * where you want to wrap many functions at once.
 *
 * @param config - Provider configuration
 * @returns Object with all specified functions lazily wrapped
 *
 * @example
 * ```typescript
 * export const aztecProvider = createLazyProvider({
 *   module: () => import('./implementation.js'),
 *   functions: ['deployContract', 'executeTx', 'simulateTx'],
 *   displayName: 'Aztec',
 *   installMessage: 'Aztec requires @walletmesh/aztec-rpc-wallet'
 * });
 * ```
 *
 * @public
 */
export function createLazyProvider<T extends Record<string, (...args: never[]) => unknown>>(
  config: LazyProviderConfig,
): T {
  const lazyModule = createLazyModule(config.module, {
    displayName: config.displayName,
    ...(config.installMessage && { errorMessage: config.installMessage }),
  });

  return lazyModule.wrapAll(config.functions) as T;
}

/**
 * Create a lazy namespace that mimics the original module structure
 *
 * This creates an object with getters that lazily load functions on first access.
 * Useful when you want the lazy-loaded module to feel like a regular import.
 *
 * @param importPath - Module path or import function
 * @param exportedNames - Names of exports to include
 * @param displayName - Display name for error messages
 * @returns Namespace object with lazy getters
 *
 * @example
 * ```typescript
 * // Create a namespace that looks like the original module
 * export const analytics = createLazyNamespace(
 *   () => import('@analytics/browser'),
 *   ['track', 'identify', 'page', 'reset'],
 *   'Analytics'
 * );
 *
 * // Use it like a regular import
 * analytics.track('event', { data: 'value' });
 * ```
 *
 * @public
 */
export function createLazyNamespace<T>(
  importPath: string | (() => Promise<unknown>),
  exportedNames: string[],
  displayName: string,
): T {
  const lazyModule = createLazyModule(importPath, { displayName });
  const namespace = {} as T;

  // Create getters for each exported name
  for (const name of exportedNames) {
    let cachedFunction: unknown;

    Object.defineProperty(namespace, name, {
      get() {
        // Cache the wrapped function after first access
        if (!cachedFunction) {
          cachedFunction = lazyModule.wrap(name);
        }
        return cachedFunction;
      },
      enumerable: true,
      configurable: true,
    });
  }

  return namespace as T;
}

/**
 * Create a conditional lazy module that only loads if a condition is met
 *
 * Useful for feature flags, environment checks, or user permissions.
 *
 * @param condition - Function that returns whether to load the module
 * @param importPath - Module path or import function
 * @param options - Lazy module options
 * @param fallback - Optional fallback module if condition is false
 * @returns Lazy module or fallback
 *
 * @example
 * ```typescript
 * export const debugTools = createConditionalLazyModule(
 *   () => process.env.NODE_ENV === 'development',
 *   () => import('./debug-tools.js'),
 *   { displayName: 'Debug Tools' },
 *   { log: () => {} } // No-op fallback in production
 * );
 * ```
 *
 * @public
 */
export function createConditionalLazyModule<T = unknown>(
  condition: () => boolean,
  importPath: string | (() => Promise<unknown>),
  options: LazyModuleOptions,
  fallback?: T,
): T | ReturnType<typeof createLazyModule> {
  if (condition()) {
    return createLazyModule(importPath, options);
  }

  if (fallback) {
    return fallback;
  }

  // Return a module that always throws
  return createLazyModule(async () => {
    throw ErrorFactory.configurationError(`${options.displayName} is not available in this environment`);
  }, options);
}
