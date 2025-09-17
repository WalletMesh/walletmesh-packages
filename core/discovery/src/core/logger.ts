/**
 * Logger interface for the discovery package.
 * Compatible with modal-core's Logger interface.
 *
 * @category Core
 * @since 0.1.0
 */
export interface Logger {
  /**
   * Log debug message (only when debug is enabled)
   * @param message - Debug message to log
   * @param data - Optional data to include with the message
   */
  debug(message: string, data?: unknown): void;

  /**
   * Log info message
   * @param message - Information message to log
   * @param data - Optional data to include with the message
   */
  info(message: string, data?: unknown): void;

  /**
   * Log warning message
   * @param message - Warning message to log
   * @param data - Optional data to include with the message
   */
  warn(message: string, data?: unknown): void;

  /**
   * Log error message
   * @param message - Error message to log
   * @param error - Optional error object or data to include
   */
  error(message: string, error?: unknown): void;
}

/**
 * Console logger implementation that writes to console.
 * Used as the default logger when none is provided.
 *
 * @category Core
 * @since 0.1.0
 */
export class ConsoleLogger implements Logger {
  private readonly prefix: string;

  constructor(prefix = '[WalletMesh]') {
    this.prefix = prefix;
  }

  debug(message: string, data?: unknown): void {
    if (data !== undefined) {
      console.debug(`${this.prefix} ${message}`, data);
    } else {
      console.debug(`${this.prefix} ${message}`);
    }
  }

  info(message: string, data?: unknown): void {
    if (data !== undefined) {
      console.info(`${this.prefix} ${message}`, data);
    } else {
      console.info(`${this.prefix} ${message}`);
    }
  }

  warn(message: string, data?: unknown): void {
    if (data !== undefined) {
      console.warn(`${this.prefix} ${message}`, data);
    } else {
      console.warn(`${this.prefix} ${message}`);
    }
  }

  error(message: string, error?: unknown): void {
    if (error !== undefined) {
      console.error(`${this.prefix} ${message}`, error);
    } else {
      console.error(`${this.prefix} ${message}`);
    }
  }
}

/**
 * Create a logger instance with the specified options.
 *
 * @param options - Logger creation options
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * // Use default console logger
 * const logger = createLogger();
 *
 * // Use custom prefix
 * const logger = createLogger({ prefix: '[Discovery]' });
 *
 * // Use custom logger implementation
 * const logger = createLogger({ logger: myCustomLogger });
 * ```
 *
 * @category Core
 * @since 0.1.0
 */
export function createLogger(options?: { prefix?: string; logger?: Logger }): Logger {
  if (options?.logger) {
    return options.logger;
  }
  return new ConsoleLogger(options?.prefix);
}

/**
 * Default logger instance for the discovery package.
 * Can be overridden by providing a custom logger in component configuration.
 */
export const defaultLogger = new ConsoleLogger();
