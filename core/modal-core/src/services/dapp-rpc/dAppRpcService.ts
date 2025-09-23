/**
 * dApp RPC Service for managing dApp-specific blockchain node communication
 *
 * This service handles RPC communication that is separate from wallet providers,
 * allowing dApps to use their own infrastructure for reading blockchain data
 * while wallets use their own nodes for transaction submission.
 *
 * @module services/dapp-rpc/DAppRpcService
 * @packageDocumentation
 */

import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import { createDebugLogger } from '../../internal/core/logger/logger.js';
import type { ChainType, SupportedChain } from '../../types.js';
import type { BaseServiceDependencies } from '../base/ServiceDependencies.js';

/**
 * Configuration for dApp RPC endpoint behavior
 */
export interface DAppRpcConfig {
  /** Timeout for RPC requests in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts on failure (default: 3) */
  retries?: number;
  /** Whether to use round-robin load balancing across endpoints (default: true) */
  loadBalance?: boolean;
  /** Custom headers to include in RPC requests */
  headers?: Record<string, string>;
}

/**
 * dApp RPC endpoint configuration
 */
export interface DAppRpcEndpoint {
  /** Chain this endpoint serves */
  chain: SupportedChain;
  /** Chain type */
  chainType: ChainType;
  /** RPC endpoint URLs (primary and fallbacks) */
  urls: string[];
  /** Configuration for this endpoint */
  config?: DAppRpcConfig;
}

/**
 * Result of an RPC request
 */
export interface RpcResult<T = unknown> {
  /** The result data */
  data: T;
  /** Which endpoint was used */
  endpoint: string;
  /** Response time in milliseconds */
  responseTime: number;
  /** Whether this was a retry */
  isRetry: boolean;
}

/**
 * Dependencies required by DAppRpcService
 *
 * @public
 */
export interface DAppRpcServiceDependencies extends BaseServiceDependencies {}

/**
 * dApp RPC Service for managing blockchain node communication
 *
 * This service provides a dedicated RPC layer for dApps to communicate with
 * blockchain nodes using their own infrastructure, separate from wallet providers.
 *
 * @public
 * @example
 * ```typescript
 * const dappRpcService = new DAppRpcService({
 *   logger: createDebugLogger('DAppRpc', true)
 * });
 *
 * // Register dApp RPC endpoints
 * dappRpcService.registerEndpoint({
 *   chainId: '1',
 *   chainType: ChainType.Evm,
 *   urls: [
 *     'https://your-primary-ethereum-node.com/rpc',
 *     'https://your-backup-ethereum-node.com/rpc'
 *   ],
 *   config: {
 *     timeout: 30000,
 *     retries: 3,
 *     loadBalance: true,
 *     headers: {
 *       'Authorization': 'Bearer your-api-key'
 *     }
 *   }
 * });
 *
 * // Make RPC calls
 * const blockNumber = await dappRpcService.call('1', 'eth_blockNumber');
 * const balance = await dappRpcService.call('1', 'eth_getBalance', ['0x...', 'latest']);
 * ```
 */
export class DAppRpcService {
  private endpoints = new Map<string, DAppRpcEndpoint>();
  private currentEndpointIndex = new Map<string, number>();
  private logger: Logger;

  /**
   * Creates a new DAppRpcService instance
   *
   * @param dependencies - Optional service dependencies
   * @public
   */
  constructor(dependencies?: Partial<DAppRpcServiceDependencies>) {
    this.logger = dependencies?.logger || createDebugLogger('DAppRpcService', true); // Enable debug logging
  }

  /**
   * Register a dApp RPC endpoint for a specific chain
   *
   * @param endpoint - The endpoint configuration
   * @public
   */
  registerEndpoint(endpoint: DAppRpcEndpoint): void {
    this.logger.debug('Registering dApp RPC endpoint', {
      chainId: endpoint.chain.chainId,
      chainType: endpoint.chainType,
      urls: endpoint.urls,
      config: endpoint.config,
    });

    this.endpoints.set(endpoint.chain.chainId, endpoint);
    this.currentEndpointIndex.set(endpoint.chain.chainId, 0);
  }

  /**
   * Remove a dApp RPC endpoint for a specific chain
   *
   * @param chainId - The chain ID to remove
   * @returns Whether the endpoint was removed
   * @public
   */
  removeEndpoint(chainId: string): boolean {
    const removed = this.endpoints.delete(chainId);
    if (removed) {
      this.currentEndpointIndex.delete(chainId);
      this.logger.debug('Removed dApp RPC endpoint', { chainId });
    }
    return removed;
  }

  /**
   * Check if a dApp RPC endpoint is registered for a chain
   *
   * @param chainId - The chain ID to check
   * @returns Whether an endpoint is registered
   * @public
   */
  hasEndpoint(chainId: string): boolean {
    return this.endpoints.has(chainId);
  }

  /**
   * Get all registered chain IDs
   *
   * @returns Array of chain IDs with dApp RPC endpoints
   * @public
   */
  getRegisteredChains(): string[] {
    return Array.from(this.endpoints.keys());
  }

  /**
   * Make an RPC call to a specific chain
   *
   * @param chainId - The chain ID to call
   * @param method - The RPC method name
   * @param params - Optional parameters for the RPC call
   * @returns Promise resolving to the RPC result
   * @throws If no endpoint is registered for the chain or all endpoints fail
   * @public
   */
  async call<T = unknown>(chainId: string, method: string, params?: unknown[]): Promise<RpcResult<T>> {
    const endpoint = this.endpoints.get(chainId);
    if (!endpoint) {
      // Note: Wallet RPC fallback not implemented - dApp RPC endpoint required
      throw ErrorFactory.configurationError(
        `No dApp RPC endpoint registered for chain ${chainId}. Wallet RPC fallback not yet implemented.`,
      );
    }

    const config = {
      timeout: 30000,
      retries: 3,
      loadBalance: true,
      ...endpoint.config,
    };

    let lastError: Error | null = null;
    const startTime = Date.now();

    // Try each endpoint with retries
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      const url = this.selectEndpointUrl(chainId, endpoint, config.loadBalance);

      try {
        this.logger.debug('Making dApp RPC call', {
          chainId,
          method,
          params,
          url,
          attempt: attempt + 1,
          maxAttempts: config.retries + 1,
        });

        const result = await this.makeHttpRequest<T>(url, method, params || [], config);
        const responseTime = Date.now() - startTime;

        this.logger.debug('dApp RPC call successful', {
          chainId,
          method,
          url,
          responseTime,
          attempt: attempt + 1,
        });

        // Rotate endpoint for load balancing after successful call
        if (config.loadBalance && endpoint.urls.length > 1) {
          this.rotateEndpoint(chainId, endpoint);
        }

        return {
          data: result,
          endpoint: url,
          responseTime,
          isRetry: attempt > 0,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        this.logger.warn('dApp RPC call failed', {
          chainId,
          method,
          url,
          attempt: attempt + 1,
          error: lastError.message,
        });

        // If load balancing is enabled, try the next endpoint
        if (config.loadBalance && attempt < config.retries) {
          this.rotateEndpoint(chainId, endpoint);
        }
      }
    }

    // All attempts failed
    throw ErrorFactory.messageFailed(
      `dApp RPC call failed after ${config.retries + 1} attempts: ${lastError?.message}`,
      {
        chainId,
        method,
        params,
        lastError: lastError?.message || 'Unknown error',
      },
    );
  }

  /**
   * Make a batch RPC call to a specific chain
   *
   * @param chainId - The chain ID to call
   * @param requests - Array of RPC requests
   * @returns Promise resolving to array of RPC results
   * @public
   */
  async batchCall<T = unknown>(
    chainId: string,
    requests: Array<{ method: string; params?: unknown[] }>,
  ): Promise<Array<RpcResult<T>>> {
    const results: Array<RpcResult<T>> = [];

    // For now, execute sequentially. Could be optimized to batch at HTTP level
    for (const request of requests) {
      const result = await this.call<T>(chainId, request.method, request.params);
      results.push(result);
    }

    return results;
  }

  /**
   * Get endpoint information for a chain
   *
   * @param chainId - The chain ID
   * @returns Endpoint information or undefined if not registered
   * @public
   */
  getEndpointInfo(chainId: string): DAppRpcEndpoint | undefined {
    return this.endpoints.get(chainId);
  }

  /**
   * Test connectivity to all registered endpoints
   *
   * @returns Promise resolving to connectivity test results
   * @public
   */
  async testConnectivity(): Promise<
    Array<{
      chainId: string;
      url: string;
      success: boolean;
      responseTime?: number;
      error?: string;
    }>
  > {
    const results: Array<{
      chainId: string;
      url: string;
      success: boolean;
      responseTime?: number;
      error?: string;
    }> = [];

    for (const [chainId, endpoint] of this.endpoints) {
      for (const url of endpoint.urls) {
        const startTime = Date.now();

        try {
          // Simple connectivity test - usually a lightweight method
          const testMethod =
            endpoint.chainType === 'evm'
              ? 'eth_chainId'
              : endpoint.chainType === 'aztec'
                ? 'node_getChainId'
                : 'getHealth';
          await this.makeHttpRequest(url, testMethod, [], endpoint.config || {});

          results.push({
            chainId,
            url,
            success: true,
            responseTime: Date.now() - startTime,
          });
        } catch (error) {
          results.push({
            chainId,
            url,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    return results;
  }

  /**
   * Select which endpoint URL to use for a request
   *
   * @private
   */
  private selectEndpointUrl(chainId: string, endpoint: DAppRpcEndpoint, loadBalance: boolean): string {
    if (!loadBalance || endpoint.urls.length === 1) {
      return endpoint.urls[0] || '';
    }

    const currentIndex = this.currentEndpointIndex.get(chainId) || 0;
    return endpoint.urls[currentIndex % endpoint.urls.length] || '';
  }

  /**
   * Rotate to the next endpoint for load balancing
   *
   * @private
   */
  private rotateEndpoint(chainId: string, endpoint: DAppRpcEndpoint): void {
    const currentIndex = this.currentEndpointIndex.get(chainId) || 0;
    const nextIndex = (currentIndex + 1) % endpoint.urls.length;
    this.currentEndpointIndex.set(chainId, nextIndex);
  }

  /**
   * Make HTTP request to RPC endpoint
   *
   * @private
   */
  private async makeHttpRequest<T>(
    url: string,
    method: string,
    params: unknown[],
    config: DAppRpcConfig,
  ): Promise<T> {
    // Use a simple incrementing ID for better testability
    const requestBody = {
      jsonrpc: '2.0',
      id: Math.floor(Math.random() * 1000000000000000),
      method,
      params,
    };

    const headers = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

    try {
      this.logger.debug('Making HTTP request', {
        url,
        requestBody,
        headers,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error('HTTP request failed', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          url,
          method,
        });
        throw ErrorFactory.networkError(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw ErrorFactory.messageFailed(result.error.message);
      }

      return result.result;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Clear all registered endpoints
   *
   * @public
   */
  clear(): void {
    this.endpoints.clear();
    this.currentEndpointIndex.clear();
    this.logger.debug('Cleared all dApp RPC endpoints');
  }

  /**
   * Get service statistics
   *
   * @returns Service statistics
   * @public
   */
  getStats(): {
    totalEndpoints: number;
    chainIds: string[];
    totalUrls: number;
  } {
    const chainIds = Array.from(this.endpoints.keys());
    const totalUrls = Array.from(this.endpoints.values()).reduce(
      (sum, endpoint) => sum + endpoint.urls.length,
      0,
    );

    return {
      totalEndpoints: this.endpoints.size,
      chainIds,
      totalUrls,
    };
  }
}
