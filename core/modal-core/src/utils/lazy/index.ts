/**
 * Lazy loading utilities
 *
 * Comprehensive utilities for creating lazy-loaded modules, functions, and values.
 * These utilities help reduce initial bundle size by deferring module loading
 * until first use.
 *
 * @module utils/lazy
 * @packageDocumentation
 */

// Export new lazy module utilities
export {
  createLazyModule,
  type LazyModuleOptions,
  type LazyModule,
} from './createLazyModule.js';

export {
  createLazyProvider,
  createLazyNamespace,
  createConditionalLazyModule,
  type LazyProviderConfig,
} from './helpers.js';

// Re-export existing lazy utilities from api/utils
export {
  createLazy,
  createLazyAsync,
  createLazyProxy,
  createLazySingleton,
} from '../../api/utils/lazy.js';
