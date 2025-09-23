/**
 * Base service dependencies interface
 *
 * All services in the WalletMesh system share common dependencies.
 * This base interface provides the foundation that service-specific
 * dependency interfaces can extend.
 *
 * @module services/base/ServiceDependencies
 */

import type { Logger } from '../../internal/core/logger/logger.js';

/**
 * Base dependencies required by all services
 *
 * This interface defines the common dependencies that every service
 * in the WalletMesh system requires. Service-specific dependency
 * interfaces should extend this base interface.
 *
 * @public
 */
export interface BaseServiceDependencies {
  /**
   * Logger instance for service debugging and error tracking
   */
  logger: Logger;
}

/**
 * Optional dependencies that services might need
 *
 * This interface provides a type-safe way to define optional
 * dependencies that some services might require.
 *
 * @public
 */
export interface OptionalServiceDependencies {
  /**
   * Error handler for centralized error management
   */
  errorHandler?: unknown;

  /**
   * Event emitter for pub/sub communication
   */
  eventEmitter?: unknown;

  /**
   * Storage provider for persistence
   */
  storage?: unknown;
}

/**
 * Type helper for creating service-specific dependencies
 *
 * @example
 * ```typescript
 * export interface MyServiceDependencies extends ServiceDependencies<{
 *   customDep: CustomType;
 *   anotherDep?: OptionalType;
 * }> {}
 * ```
 *
 * @public
 */
export type ServiceDependencies<T = Record<string, unknown>> = BaseServiceDependencies & T;
