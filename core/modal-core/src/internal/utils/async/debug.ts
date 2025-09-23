/**
 * Debug utilities for WalletMesh.
 * Provides functions for controlling debug behavior across components.
 *
 * @module internal/utils/debug
 * @internal
 */

import { modalLogger } from '../../core/logger/globalLogger.js';
import { LogLevel } from '../../core/logger/logger.js';

/**
 * Global debug state to track debug mode
 */
let globalDebugEnabled = false;

/**
 * Configure logging level based on debug mode
 */
const configureLogging = (opts: { level?: LogLevel }) => {
  if (opts.level !== undefined) {
    // Configure the actual modal logger with the specified level
    modalLogger.setLevel(opts.level);
  }
};

/**
 * Toggle debug mode globally across all components.
 *
 * Affects connectors, transports, and general logging throughout
 * the modal system. When enabled, provides detailed logging for
 * debugging connection issues and system behavior.
 *
 * @param enabled - Whether debug mode should be enabled
 *
 * @example
 * ```typescript
 * import { setDebugMode } from '../utils/async/debug';
 *
 * // Enable debug logging
 * setDebugMode(true);
 *
 * // Now all components will log debug information
 * // ... perform operations ...
 *
 * // Disable debug logging
 * setDebugMode(false);
 * ```
 *
 * @internal
 * @param {boolean} enabled - Whether to enable or disable debug mode
 */
export function setDebugMode(enabled: boolean): void {
  globalDebugEnabled = enabled;

  // Log debug mode state changes
  if (enabled) {
    console.log('[WalletMesh] Debug mode enabled');
  } else {
    console.log('[WalletMesh] Debug mode disabled');
  }

  // Set logging level on the modal logger
  configureLogging({
    level: enabled ? LogLevel.Debug : LogLevel.Info,
  });

  // Log level setting change
  modalLogger.info(`Log level set to ${LogLevel[enabled ? LogLevel.Debug : LogLevel.Info]}`);
}

/**
 * Check if debug mode is enabled.
 *
 * @returns Whether debug mode is currently enabled
 *
 * @example
 * ```typescript
 * import { isDebugEnabled } from '../utils/async/debug';
 *
 * if (isDebugEnabled()) {
 *   console.log('Debug mode is active');
 * }
 * ```
 *
 * @internal
 */
export function isDebugEnabled(): boolean {
  return globalDebugEnabled;
}

/**
 * Temporarily enable debug mode for the duration of a function call.
 *
 * Restores the previous debug setting afterwards. Useful for debugging
 * specific operations without affecting the global debug state.
 *
 * @param {() => Promise<T>} fn - Async function to execute with debug enabled
 * @returns Promise that resolves to the result of the function
 *
 * @throws {Error} Rethrows any error from the function after restoring debug state
 *
 * @example
 * ```typescript
 * import { withDebug } from '../utils/async/debug';
 *
 * // Debug was disabled
 * setDebugMode(false);
 *
 * // Temporarily enable debug for this operation
 * const result = await withDebug(async () => {
 *   // This will have debug logging enabled
 *   return await someComplexOperation();
 * });
 *
 * // Debug is automatically restored to disabled state
 * console.log(result);
 * ```
 *
 * @internal
 */
export async function withDebug<T>(fn: () => Promise<T>): Promise<T> {
  const previousSetting = isDebugEnabled();

  try {
    // Only change if not already enabled
    if (!previousSetting) {
      setDebugMode(true);
    }

    return await fn();
  } finally {
    // Restore previous setting if we changed it
    if (!previousSetting) {
      setDebugMode(false);
    }
  }
}

/**
 * Debug utility functions namespace.
 *
 * Provides a convenient namespace for grouped debug functions.
 * Offers both individual functions and a unified object interface.
 *
 * @example
 * ```typescript
 * import { debug } from '../utils/async/debug';
 *
 * // Enable debug mode
 * debug.enable();
 *
 * // Check debug status
 * if (debug.isEnabled()) {
 *   console.log('Debug is active');
 * }
 *
 * // Run something with temporary debug
 * const result = await debug.with(async () => {
 *   return await performDebuggableOperation();
 * });
 *
 * // Disable debug mode
 * debug.disable();
 * ```
 *
 * @internal
 */
export const debug = {
  /**
   * Enable debug mode globally
   * @example debug.enable()
   */
  enable: () => setDebugMode(true),

  /**
   * Disable debug mode globally
   * @example debug.disable()
   */
  disable: () => setDebugMode(false),

  /**
   * Check if debug mode is enabled
   * @returns True if debug mode is active
   * @example const isActive = debug.isEnabled()
   */
  isEnabled: isDebugEnabled,

  /**
   * Run a function with debug temporarily enabled
   * @param fn - Async function to execute with debug
   * @returns Promise with function result
   * @example const result = await debug.with(() => doSomething())
   */
  with: withDebug,
};
