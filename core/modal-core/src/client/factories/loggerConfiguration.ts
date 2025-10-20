/**
 * Logger configuration helpers
 *
 * @module client/factories/loggerConfiguration
 * @packageDocumentation
 */

import type { Logger } from '../../internal/core/logger/logger.js';
import { createDebugLogger } from '../../internal/core/logger/logger.js';
import type { WalletMeshClientConfig } from '../../internal/client/WalletMeshClient.js';

/**
 * Configures a logger based on client configuration
 *
 * @param config - Client configuration
 * @param defaultLogger - Default logger to use if no custom configuration
 * @returns Configured logger instance
 * @internal
 */
export function configureLogger(config: WalletMeshClientConfig, defaultLogger: Logger): Logger {
  // If no logger config provided, return default
  if (!config.logger) {
    return defaultLogger;
  }

  // Create new logger with config settings
  const debugMode = config.logger.debug ?? config.debug ?? false;
  const prefix = config.logger.prefix ?? 'WalletMeshClient';
  const logger = createDebugLogger(prefix, debugMode);

  // Set log level if specified
  if (config.logger.level) {
    const levelMap = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };
    logger.setLevel(levelMap[config.logger.level]);
  }

  return logger;
}
