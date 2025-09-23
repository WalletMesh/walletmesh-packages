/**
 * Logging utilities for the modal system
 *
 * This module provides logging-related interfaces and utilities
 * for debugging and monitoring the modal system.
 *
 * @module logger
 * @packageDocumentation
 */

import { LogLevel, Logger, createDebugLogger } from '../../internal/core/logger/logger.js';

/**
 * Re-export logger types and interfaces
 * @public
 */
export { LogLevel };

/**
 * Re-export logger class and functions
 * @public
 */
export { Logger, createDebugLogger };

// Global logger instance for internal use
let globalLogger: Logger;

/**
 * Set the global log level
 *
 * @function setLogLevel
 * @param {LogLevel} level - Log level to set
 *
 * @example
 * // Set global log level
 * setLogLevel(LogLevel.Info);
 *
 * @public
 */
export function setLogLevel(level: LogLevel): void {
  if (!globalLogger) {
    globalLogger = createDebugLogger('Modal', level === LogLevel.Debug);
  }
  globalLogger.setLevel(level);
}
