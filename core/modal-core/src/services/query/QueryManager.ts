/**
 * Query management service using TanStack Query Core
 *
 * This service provides a framework-agnostic query client for managing
 * data fetching, caching, and synchronization across the WalletMesh modal.
 * It uses TanStack Query Core to enable efficient data management patterns
 * that can be adapted to any UI framework.
 *
 * @module services/query/QueryManager
 * @category Services
 */

import { QueryClient, type QueryClientConfig } from '@tanstack/query-core';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';

/**
 * Dependencies required by QueryManager
 *
 * Extends the base service dependencies with optional query configuration.
 * The QueryManager uses TanStack Query Core for framework-agnostic data management.
 *
 * @example
 * ```typescript
 * const dependencies: QueryManagerDependencies = {
 *   logger: createLogger('QueryManager'),
 *   queryConfig: {
 *     defaultOptions: {
 *       queries: { staleTime: 60000 }
 *     }
 *   }
 * };
 * ```
 */
export interface QueryManagerDependencies extends BaseServiceDependencies {
  /**
   * Optional TanStack Query configuration
   *
   * Allows customization of query client behavior including
   * default query options, mutation options, and cache settings.
   * If not provided, sensible defaults will be used.
   */
  queryConfig?: QueryClientConfig;
}

/**
 * Service for managing queries and mutations using TanStack Query Core
 *
 * The QueryManager provides a central query client that can be used across
 * all WalletMesh services for consistent data fetching and caching. It's
 * designed to be framework-agnostic, allowing UI frameworks to create their
 * own adapters on top of this core functionality.
 *
 * @remarks
 * This service integrates with other WalletMesh services to provide:
 * - Automatic cache invalidation on wallet events
 * - Standardized query key patterns
 * - Consistent error handling
 * - Smart refetching strategies
 *
 * @example
 * ```typescript
 * const queryManager = new QueryManager({
 *   logger: createLogger('QueryManager'),
 *   queryConfig: {
 *     defaultOptions: {
 *       queries: {
 *         staleTime: 30 * 1000,      // 30 seconds
 *         gcTime: 5 * 60 * 1000,      // 5 minutes
 *         retry: 3,
 *         refetchOnWindowFocus: true,
 *       },
 *       mutations: {
 *         retry: 1,
 *       },
 *     },
 *   },
 * });
 *
 * // Get the query client for direct usage
 * const queryClient = queryManager.getQueryClient();
 *
 * // Fetch data using the query client
 * const data = await queryClient.fetchQuery({
 *   queryKey: ['balance', address, chainId],
 *   queryFn: () => fetchBalance(address, chainId),
 * });
 * ```
 */
export class QueryManager {
  private queryClient: QueryClient;
  private logger: Logger;

  /**
   * Default query client configuration
   *
   * Provides sensible defaults for Web3 applications:
   * - 30 second stale time for frequently changing data
   * - 5 minute garbage collection time
   * - 3 retries with exponential backoff
   * - Refetch on window focus for fresh data
   * - Single retry for mutations
   */
  private static readonly defaultConfig: QueryClientConfig = {
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // Data is fresh for 30 seconds
        gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
        retry: 3, // Retry failed queries 3 times
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true, // Refetch when window regains focus
        refetchOnReconnect: 'always', // Always refetch on reconnect
      },
      mutations: {
        retry: 1, // Retry failed mutations once
        retryDelay: 1000, // Wait 1 second before retry
      },
    },
  };

  /**
   * Creates a new QueryManager instance
   *
   * @param dependencies - Required service dependencies
   * @param dependencies.logger - Logger instance for debugging and error tracking
   * @param dependencies.queryConfig - Optional query client configuration
   *
   * @example
   * ```typescript
   * const queryManager = new QueryManager({
   *   logger: createLogger('QueryManager'),
   *   queryConfig: {
   *     defaultOptions: {
   *       queries: { staleTime: 60000 }
   *     }
   *   }
   * });
   * ```
   */
  constructor(dependencies: QueryManagerDependencies) {
    this.logger = dependencies.logger;

    // Merge user config with defaults
    const config: QueryClientConfig = {
      ...QueryManager.defaultConfig,
      ...dependencies.queryConfig,
      defaultOptions: {
        ...QueryManager.defaultConfig.defaultOptions,
        ...dependencies.queryConfig?.defaultOptions,
        queries: {
          ...QueryManager.defaultConfig.defaultOptions?.queries,
          ...dependencies.queryConfig?.defaultOptions?.queries,
        },
        mutations: {
          ...QueryManager.defaultConfig.defaultOptions?.mutations,
          ...dependencies.queryConfig?.defaultOptions?.mutations,
        },
      },
    };

    this.queryClient = new QueryClient(config);

    this.logger.debug('QueryManager initialized', {
      config: {
        queries: config.defaultOptions?.queries,
        mutations: config.defaultOptions?.mutations,
      },
    });
  }

  /**
   * Get the underlying QueryClient instance
   *
   * Returns the TanStack Query client for direct usage. This allows
   * framework adapters and services to access all query client methods
   * including fetchQuery, prefetchQuery, invalidateQueries, etc.
   *
   * @returns The QueryClient instance
   *
   * @example
   * ```typescript
   * const queryClient = queryManager.getQueryClient();
   *
   * // Invalidate all balance queries
   * await queryClient.invalidateQueries({
   *   queryKey: ['balance']
   * });
   *
   * // Remove all queries on disconnect
   * queryClient.removeQueries();
   * ```
   */
  getQueryClient(): QueryClient {
    return this.queryClient;
  }

  /**
   * Clear all queries and reset the cache
   *
   * Removes all cached data and cancels any in-flight queries.
   * Useful when disconnecting a wallet or switching accounts.
   *
   * @example
   * ```typescript
   * // On wallet disconnect
   * queryManager.clear();
   * ```
   */
  clear(): void {
    this.queryClient.clear();
    this.logger.debug('Query cache cleared');
  }

  /**
   * Clean up resources
   *
   * Cancels all queries and clears the cache. Should be called
   * when the QueryManager is no longer needed.
   *
   * @example
   * ```typescript
   * // On service cleanup
   * queryManager.cleanup();
   * ```
   */
  cleanup(): void {
    this.queryClient.cancelQueries();
    this.queryClient.clear();
    this.logger.debug('QueryManager cleaned up');
  }
}

/**
 * Factory function to create QueryManager with dependencies
 *
 * Provides a convenient way to instantiate QueryManager with proper
 * dependency injection. This is the recommended way to create instances.
 *
 * @param dependencies - Required service dependencies
 * @returns Configured QueryManager instance
 *
 * @example
 * ```typescript
 * const queryManager = createQueryManager({
 *   logger: createLogger('QueryManager'),
 *   queryConfig: {
 *     defaultOptions: {
 *       queries: { staleTime: 60000 }
 *     }
 *   }
 * });
 * ```
 */
export function createQueryManager(dependencies: QueryManagerDependencies): QueryManager {
  return new QueryManager(dependencies);
}
