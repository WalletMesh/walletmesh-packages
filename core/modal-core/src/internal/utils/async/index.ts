/**
 * Async utilities for the modal system
 *
 * Provides async-related utilities including debug controls,
 * promise helpers, and other asynchronous operation utilities.
 *
 * @example
 * ```typescript
 * import { debug } from './async';
 *
 * // Enable debug mode for detailed logging
 * debug.enable();
 *
 * // Perform operations with debug output
 * const result = await debug.with(async () => {
 *   // This code will have debug logging
 *   return await someOperation();
 * });
 * ```
 *
 * @packageDocumentation
 * @module internal/utils/async
 * @internal
 */

export * from './debug.js';
