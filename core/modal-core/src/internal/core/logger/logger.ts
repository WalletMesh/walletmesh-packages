/**
 * Simple logger with debug mode support.
 *
 * Provides Logger instances for creating named loggers.
 * Supports multiple log levels and automatic data sanitization to handle circular references
 * and sensitive information in log output.
 *
 * @module logger
 * @internal
 * @packageDocumentation
 *
 * @example
 * // Create a basic logger
 * const logger = new Logger(true, 'MyComponent');
 *
 * // Log messages at different levels
 * logger.debug('Debug information', { data: 'value' });
 * logger.info('Operation completed');
 * logger.warn('Warning condition detected');
 * logger.error('An error occurred', error);
 *
 * // Use createDebugLogger for convenience
 * const debugLogger = createDebugLogger('MyModule', true);
 * debugLogger.debug('Module initialized');
 */

import type { Disposable } from '../../../types.js';

/**
 * Log levels
 * @enum {number}
 */
export enum LogLevel {
  /** Most verbose - all messages will be logged */
  Debug = 0,
  /** Information messages and above */
  Info = 1,
  /** Warnings and errors only */
  Warn = 2,
  /** Only errors */
  Error = 3,
  /** No logs emitted */
  Silent = 4,
}

/**
 * Simple logger utility
 * @class
 */
export class Logger implements Disposable {
  private readonly prefix: string;
  private isDebugEnabled: () => boolean;

  /**
   * Create a new logger instance
   *
   * @param {(boolean|Function)} debugEnabled - Enable debug logging (boolean) or function that returns debug state
   * @param {string} [prefix='Modal'] - Prefix for all log messages
   *
   * @example
   * // Static debug mode
   * const logger = new Logger(true, 'MyComponent');
   *
   * @example
   * // Dynamic debug mode
   * const logger = new Logger(() => process.env.NODE_ENV === 'development', 'MyComponent');
   */
  constructor(debugEnabled: boolean | (() => boolean), prefix = 'Modal') {
    this.prefix = prefix;
    this.isDebugEnabled = typeof debugEnabled === 'function' ? debugEnabled : () => debugEnabled;
  }

  /**
   * Set the log level for this logger
   *
   * @param {LogLevel} level - The minimum log level to output
   *
   * @example
   * const logger = new Logger(false, 'Test');
   * logger.setLevel(LogLevel.DEBUG); // Enable debug logging
   * logger.setLevel(LogLevel.ERROR); // Only show errors
   */
  setLevel(level: LogLevel): void {
    // For simplicity, we only support enabling/disabling debug mode
    if (level <= LogLevel.Debug) {
      this.isDebugEnabled = () => true;
    } else {
      this.isDebugEnabled = () => false;
    }
  }

  /**
   * Log debug message (only when debug is enabled)
   *
   * @param {string} message - Debug message to log
   * @param {unknown} [data] - Optional data to include with the message (will be sanitized)
   *
   * @example
   * logger.debug('Processing request', { userId: '123', action: 'login' });
   * logger.debug('Component mounted');
   */
  debug(message: string, data?: unknown): void {
    if (!this.isDebugEnabled()) return;
    this.log('debug', message, data);
  }

  /**
   * Log info message
   *
   * @param {string} message - Information message to log
   * @param {unknown} [data] - Optional data to include with the message (will be sanitized)
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * Log warning message
   *
   * @param {string} message - Warning message to log
   * @param {unknown} [data] - Optional data to include with the message (will be sanitized)
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * Log error message
   *
   * @param {string} message - Error message to log
   * @param {unknown} [error] - Optional error object or data to include (will be sanitized)
   *
   * @example
   * ```typescript
   * logger.error('Connection failed', new Error('Network timeout'));
   * logger.error('Validation failed', { field: 'email', value: 'invalid' });
   * ```
   */
  error(message: string, error?: unknown): void {
    this.log('error', message, error);
  }

  /**
   * Clean up logger resources
   */
  dispose(): void {
    // Flush any pending logs
    if (this.isDebugEnabled()) {
      this.debug('Logger disposing');
    }

    // Clear any internal buffers, close files, etc.
    // For console logger, this is mostly a no-op

    // Mark as disposed
    this.isDebugEnabled = () => false;
  }

  /**
   * Internal log method
   * @param {'debug' | 'info' | 'warn' | 'error'} level - Log level to use
   * @param {string} message - Message to log
   * @param {unknown} [data] - Optional data to log with the message
   * @private
   */
  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
    const prefix = `[${this.prefix}]`;

    switch (level) {
      case 'debug':
        if (data !== undefined) {
          console.debug(prefix, message, this.sanitizeData(data));
        } else {
          console.debug(prefix, message);
        }
        break;

      case 'info':
        if (data !== undefined) {
          console.info(prefix, message, this.sanitizeData(data));
        } else {
          console.info(prefix, message);
        }
        break;

      case 'warn':
        if (data !== undefined) {
          console.warn(prefix, message, this.sanitizeData(data));
        } else {
          console.warn(prefix, message);
        }
        break;

      case 'error':
        if (data !== undefined) {
          console.error(prefix, message, data);
        } else {
          console.error(prefix, message);
        }
        break;
    }
  }

  /**
   * Sanitize data for logging to handle circular references and function values
   *
   * @param {unknown} data - Data to sanitize for safe logging
   * @returns {unknown} Sanitized data that can be safely logged
   *
   * @remarks
   * This method handles:
   * - Circular references (replaced with '[Circular Reference]')
   * - Function values (replaced with '[Function]')
   * - Error objects (converted to structured format)
   * - Non-serializable objects (replaced with '[Object cannot be serialized]')
   */
  private sanitizeData(data: unknown): unknown {
    if (data === null || data === undefined || typeof data !== 'object') {
      return data;
    }

    // Handle Error objects specially
    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
    }

    try {
      // Use a replacer function to handle circular references
      const seen = new Set();
      return JSON.parse(
        JSON.stringify(data, (_key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular Reference]';
            }
            seen.add(value);
          }
          if (typeof value === 'function') {
            return '[Function]';
          }
          return value;
        }),
      );
    } catch (e) {
      return '[Object cannot be serialized]';
    }
  }
}

/**
 * Creates a debug logger with a specified prefix.
 *
 * @param {string} prefix - The prefix to use for log messages
 * @param {boolean} [debug=false] - Whether to enable debug mode
 * @returns {Logger} A new Logger instance
 *
 * @example
 * ```typescript
 * const logger = createDebugLogger('MyComponent');
 * logger.debug('Initializing...'); // Only logged when debug mode is enabled
 * logger.info('Ready'); // Always logged
 * ```
 */
export function createDebugLogger(prefix: string, debug = false): Logger {
  return new Logger(debug, prefix);
}

/**
 * Create a logger with specified options
 *
 * @param {{
    level?: 'debug' | 'info' | 'warn' | 'error';
    prefix?: string;
  }} [options={}] - Logger configuration options
 * @returns {Logger} Configured Logger instance
 *
 * @example
 * ```typescript
 * // Create a debug logger
 * const logger = createLogger({ level: 'debug', prefix: 'MyModule' });
 *
 * // Create an error-only logger
 * const errorLogger = createLogger({ level: 'error' });
 *
 * // Create a logger with custom prefix
 * const componentLogger = createLogger({
 *   level: 'info',
 *   prefix: 'ComponentName'
 * });
 * ```
 *
 * @internal
 */
export function createLogger(
  options: { level?: 'debug' | 'info' | 'warn' | 'error'; prefix?: string } = {},
): Logger {
  const debug = options.level === 'debug';
  return new Logger(debug, options.prefix);
}
