/**
 * Generic lazy module loading utilities
 *
 * Provides utilities for creating lazy-loaded modules that are only imported
 * when first accessed. This is useful for optional dependencies or large
 * modules that shouldn't be loaded until needed.
 *
 * @module utils/lazy/createLazyModule
 * @packageDocumentation
 */

import { createLazyAsync } from '../../api/utils/lazy.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';

/**
 * Options for creating a lazy module
 *
 * @public
 */
export interface LazyModuleOptions {
  /** Display name used in error messages */
  displayName: string;
  /** Custom error message when module fails to load */
  errorMessage?: string;
  /** Optional transform function applied to the loaded module */
  transform?: (module: unknown) => unknown;
}

/**
 * Result of creating a lazy module
 *
 * @public
 */
export interface LazyModule<T = unknown> {
  /** Get the loaded module (triggers import on first call) */
  getModule: () => Promise<T>;
  /** Create a lazy wrapper for a specific function from the module */
  wrap: <F>(functionName: string) => F;
  /** Create lazy wrappers for multiple functions */
  wrapAll: <M extends Record<string, (...args: never[]) => unknown>>(functionNames: (keyof M)[]) => M;
}

/**
 * Create a lazy-loaded module with automatic error handling
 *
 * This utility creates a module that is only imported when first accessed,
 * with helpful error messages if the import fails (e.g., missing dependencies).
 *
 * @param importPath - Module path or import function
 * @param options - Configuration options
 * @returns Lazy module with helper methods
 *
 * @example
 * ```typescript
 * // Create a lazy module for an optional dependency
 * const analyticsModule = createLazyModule(
 *   () => import('@analytics/browser'),
 *   {
 *     displayName: 'Analytics',
 *     errorMessage: 'Analytics requires @analytics/browser to be installed'
 *   }
 * );
 *
 * // Wrap individual functions
 * export const track = analyticsModule.wrap('track');
 * export const identify = analyticsModule.wrap('identify');
 *
 * // Or wrap multiple functions at once
 * export const { track, identify, page } = analyticsModule.wrapAll([
 *   'track', 'identify', 'page'
 * ]);
 * ```
 *
 * @public
 */
export function createLazyModule<T = unknown>(
  importPath: string | (() => Promise<unknown>),
  options: LazyModuleOptions,
): LazyModule<T> {
  // Create a lazy-loaded promise for the module
  const getModule = createLazyAsync(async () => {
    try {
      const module =
        typeof importPath === 'string' ? await import(/* @vite-ignore */ importPath) : await importPath();

      return options.transform ? options.transform(module) : module;
    } catch (error) {
      const message =
        options.errorMessage ||
        `${options.displayName} functionality requires additional dependencies to be installed.`;

      // Include original error for debugging
      const lazyError = new Error(message);
      if (error instanceof Error) {
        lazyError.cause = error;
      }
      throw lazyError;
    }
  });

  // Create a wrapper for a single function
  function wrap<F>(functionName: string): F {
    return (async (...args: unknown[]) => {
      const module = await getModule();

      if (typeof module[functionName] !== 'function') {
        throw ErrorFactory.notFound(
          `Function '${functionName}' not found in ${options.displayName} module. ` +
            `Available functions: ${Object.keys(module)
              .filter((k) => typeof module[k] === 'function')
              .join(', ')}`,
        );
      }

      return module[functionName](...args);
    }) as F;
  }

  // Create wrappers for multiple functions
  function wrapAll<M extends Record<string, (...args: never[]) => unknown>>(functionNames: (keyof M)[]): M {
    const wrapped = {} as M;

    for (const name of functionNames) {
      wrapped[name] = wrap(String(name));
    }

    return wrapped;
  }

  return {
    getModule,
    wrap,
    wrapAll,
  };
}
