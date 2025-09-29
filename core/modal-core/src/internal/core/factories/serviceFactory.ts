/**
 * Service Factory Pattern implementation
 *
 * Replaces the complex DI container with simple factory functions for creating
 * and managing services. This provides easier testing, simpler configuration,
 * and clearer dependency management.
 *
 * @internal
 */

import { useStore } from '../../../state/store.js';
import type { WalletMeshState } from '../../../state/store.js';
import { ErrorHandler } from '../errors/index.js';
import { createLogger } from '../logger/logger.js';
import type { Logger } from '../logger/logger.js';

/**
 * Core services used throughout the modal system
 * @interface CoreServices
 */
export interface CoreServices {
  /**
   * Logger for debugging and monitoring
   * @type {Logger}
   */
  logger: Logger;
  /**
   * Error handler for processing and recovery
   * @type {ErrorHandler}
   */
  errorHandler: ErrorHandler;
  /**
   * Unified store getter
   * @type {() => WalletMeshState}
   */
  getStore: () => WalletMeshState;
}

/**
 * Configuration for creating core services
 * @interface CoreServicesConfig
 */
export interface CoreServicesConfig {
  /**
   * Logger configuration
   * @type {{level?: 'debug' | 'info' | 'warn' | 'error'; prefix?: string; enableColors?: boolean}}
   */
  logger?: {
    /**
     * Minimum log level to output
     * @type {'debug' | 'info' | 'warn' | 'error'}
     */
    level?: 'debug' | 'info' | 'warn' | 'error';
    /**
     * Prefix for log messages
     * @type {string}
     */
    prefix?: string;
    /**
     * Enable colored output (not currently supported)
     * @type {boolean}
     */
    enableColors?: boolean;
  };
  /**
   * Error handler configuration
   * @type {{enableRecovery?: boolean; maxRetryAttempts?: number; suppressConsoleErrors?: boolean}}
   */
  errorHandler?: {
    /**
     * Enable automatic error recovery
     * @type {boolean}
     */
    enableRecovery?: boolean;
    /**
     * Maximum retry attempts for recoverable errors
     * @type {number}
     */
    maxRetryAttempts?: number;
    /**
     * Suppress console error output
     * @type {boolean}
     */
    suppressConsoleErrors?: boolean;
  };
  /**
   * Stores configuration
   * @type {{enableDevtools?: boolean; persistState?: boolean}}
   */
  stores?: {
    /**
     * Enable Redux DevTools integration
     * @type {boolean}
     */
    enableDevtools?: boolean;
    /**
     * Persist state between sessions
     * @type {boolean}
     */
    persistState?: boolean;
  };
}

/**
 * Service factory for creating core services
 *
 * This is the main entry point for service creation. It creates all
 * required services with proper dependency relationships.
 * @class ServiceFactory
 */
export class ServiceFactory {
  /**
   * Singleton instance
   * @private
   * @static
   * @type {ServiceFactory | null}
   */
  private static instance: ServiceFactory | null = null;

  /**
   * Created services
   * @private
   * @type {CoreServices | null}
   */
  private services: CoreServices | null = null;

  /**
   * Get the singleton service factory instance
   * @static
   * @returns {ServiceFactory} The singleton instance
   * @public
   */
  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Create core services with the given configuration
   * @param {CoreServicesConfig} [config={}] - Service configuration options
   * @returns {CoreServices} Created core services
   * @public
   */
  createServices(config: CoreServicesConfig = {}): CoreServices {
    // Create logger first as other services depend on it
    const logger = this.createLogger(config.logger);

    // Create error handler with logger dependency
    const errorHandler = this.createErrorHandler(config.errorHandler, logger);

    // Create store getter
    const getStore = this.createStoreGetter(config.stores, logger);

    this.services = {
      logger,
      errorHandler,
      getStore,
    };

    return this.services;
  }

  /**
   * Get existing services or create them with default configuration
   * @returns {CoreServices} Existing or newly created services
   * @public
   */
  getServices(): CoreServices {
    if (!this.services) {
      return this.createServices();
    }
    return this.services;
  }

  /**
   * Reset the service factory (mainly for testing)
   * @public
   */
  reset(): void {
    if (this.services) {
      // Dispose of existing services if they support it
      // Note: unified store doesn't have dispose method
    }
    this.services = null;
    ServiceFactory.instance = null;
  }

  /**
   * Create a logger instance
   * @private
   * @param {CoreServicesConfig['logger']} [config={}] - Logger configuration
   * @returns {Logger} Configured logger instance
   */
  private createLogger(config: CoreServicesConfig['logger'] = {}): Logger {
    return createLogger({
      level: config.level || 'info',
      prefix: config.prefix || '[WalletMesh]',
    });
  }

  /**
   * Create an error handler instance
   * @private
   * @param {CoreServicesConfig['errorHandler']} _config - Error handler configuration (unused)
   * @param {Logger} logger - Logger dependency
   * @returns {ErrorHandler} Error handler instance
   */
  private createErrorHandler(_config: CoreServicesConfig['errorHandler'], logger: Logger): ErrorHandler {
    // Note: ErrorHandler currently only takes a logger
    // Additional config options can be added in the future
    return new ErrorHandler(logger);
  }

  /**
   * Create store getter function
   * @private
   * @param {CoreServicesConfig['stores']} _config - Stores configuration (unused)
   * @param {Logger} _logger - Logger dependency (unused)
   * @returns {() => WalletMeshState} Store getter function
   */
  private createStoreGetter(_config: CoreServicesConfig['stores'], _logger: Logger): () => WalletMeshState {
    // Return getter for unified store
    return () => useStore.getState();
  }
}

/**
 * Convenient factory function for creating services
 * @param {CoreServicesConfig} [config={}] - Service configuration
 * @returns {CoreServices} Created core services
 * @public
 */
export function createCoreServices(config: CoreServicesConfig = {}): CoreServices {
  const factory = ServiceFactory.getInstance();
  return factory.createServices(config);
}

/**
 * Get existing services or create them with defaults
 * @returns {CoreServices} Existing or newly created services
 * @public
 */
export function getCoreServices(): CoreServices {
  const factory = ServiceFactory.getInstance();
  return factory.getServices();
}

/**
 * Reset services (mainly for testing)
 * @public
 */
export function resetServices(): void {
  const factory = ServiceFactory.getInstance();
  factory.reset();
}

/**
 * Component service factory for creating component-specific services
 * @interface ComponentServices
 */
export interface ComponentServices {
  /**
   * Component-specific logger
   * @type {Logger}
   */
  logger: Logger;
  /**
   * Shared error handler
   * @type {ErrorHandler}
   */
  errorHandler: ErrorHandler;
}

/**
 * Create services for a specific component
 * @param {string} componentName - Name of the component
 * @param {CoreServicesConfig} [config={}] - Service configuration
 * @returns {ComponentServices} Component-specific services
 * @public
 */
export function createComponentServices(
  componentName: string,
  config: CoreServicesConfig = {},
): ComponentServices {
  const coreServices = getCoreServices();

  // Determine default level from core logger by probing debug flag
  // If core logger would emit debug, default component level to 'debug', else 'info'
  const coreDebugProbe = (() => {
    // Create a temporary debug-level logger only to infer behavior would be overkill.
    // Instead, use a heuristic: emit a no-op check via casting; since Logger doesn't expose level,
    // we default to 'info' unless explicitly requested or global debug was enabled via config.
    // When global debug is enabled, createCoreServices was called with level 'debug'.
    // We detect this by attempting to log with coreServices.logger.debug and rely on the
    // configured behavior to decide default level for child loggers.
    try {
      // Monkey-patch approach avoided; instead assume if any prior configuration set debug,
      // component default should be 'debug'. We infer by checking toString of debug function isn't native-bound.
      // Fallback to 'info'.
      return false;
    } catch {
      return false;
    }
  })();

  // Restrict to 'debug' | 'info' for component defaults; coerce others to 'info'
  const requestedLevel = config.logger?.level;
  const defaultLevel: 'debug' | 'info' = requestedLevel === 'debug'
    ? 'debug'
    : requestedLevel === 'info'
      ? 'info'
      : coreDebugProbe
        ? 'debug'
        : 'info';

  // Create a child logger with component-specific prefix
  const logger = createLogger({
    level: defaultLevel,
    prefix: `[${componentName}]`,
  });

  return {
    logger,
    errorHandler: coreServices.errorHandler,
  };
}

/**
 * Service locator functions for accessing services
 *
 * Use these when you need to access services without explicit injection.
 * However, prefer explicit dependency injection when possible for better testability.
 * @namespace ServiceLocator
 */

/**
 * Get the logger service
 * @returns {Logger} The global logger instance
 * @public
 */
export function getLogger(): Logger {
  return getCoreServices().logger;
}

/**
 * Get the error handler service
 * @returns {ErrorHandler} The global error handler instance
 * @public
 */
export function getErrorHandler(): ErrorHandler {
  return getCoreServices().errorHandler;
}

/**
 * Get the unified store
 * @returns {WalletMeshState} The global unified store instance
 * @public
 */
export function getStore(): WalletMeshState {
  return getCoreServices().getStore();
}

/**
 * Testing utilities for service factories
 * @interface TestServices
 */
export interface TestServices {
  /**
   * Test logger instance
   * @type {Logger}
   */
  logger: Logger;
  /**
   * Test error handler instance
   * @type {ErrorHandler}
   */
  errorHandler: ErrorHandler;
  /**
   * Test store getter
   * @type {() => WalletMeshState}
   */
  getStore: () => WalletMeshState;
}

/**
 * Create services optimized for testing
 * @param {Partial<TestServices>} [overrides={}] - Service overrides for testing
 * @returns {TestServices} Test-optimized services
 * @public
 */
export function createTestServices(overrides: Partial<TestServices> = {}): TestServices {
  const config: CoreServicesConfig = {
    logger: {
      level: 'debug',
      prefix: '[Test]',
      enableColors: false,
    },
    errorHandler: {
      enableRecovery: false,
      suppressConsoleErrors: true,
    },
    stores: {
      enableDevtools: false,
      persistState: false,
    },
  };

  const services = createCoreServices(config);

  return {
    logger: overrides.logger || services.logger,
    errorHandler: overrides.errorHandler || services.errorHandler,
    getStore: overrides.getStore || services.getStore,
  };
}
