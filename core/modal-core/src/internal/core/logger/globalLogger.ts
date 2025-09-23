/**
 * Global logger instance for Modal Core
 *
 * Provides a centralized logger for all modal-core components to use.
 * The logger can be configured globally and all components will use the same settings.
 *
 * @module logger/globalLogger
 * @internal
 */

import { type Logger, createDebugLogger } from './logger.js';

// Re-export createDebugLogger for external use
export { createDebugLogger };

/**
 * Global logger instance for Modal Core
 *
 * By default, debug logging is disabled. Enable it by calling:
 * ```typescript
 * import { modalLogger } from '@walletmesh/modal-core';
 * modalLogger.setLevel(LogLevel.Debug);
 * ```
 */
export const modalLogger: Logger = createDebugLogger('ModalCore', false);

/**
 * Configure the global modal logger
 *
 * @param debug - Whether to enable debug logging
 * @param prefix - Optional custom prefix for log messages
 * @returns The configured logger instance
 *
 * @example
 * ```typescript
 * import { configureModalLogger } from '@walletmesh/modal-core';
 *
 * // Enable debug logging
 * configureModalLogger(true);
 *
 * // Custom prefix
 * configureModalLogger(true, 'MyApp:Modal');
 * ```
 */
export function configureModalLogger(debug: boolean, prefix?: string): Logger {
  if (prefix) {
    return createDebugLogger(prefix, debug);
  }

  modalLogger.setLevel(debug ? 0 : 4); // Debug or Silent
  return modalLogger;
}
