/**
 * Public Provider implementation for read-only blockchain operations
 *
 * This provider uses dApp-specified RPC endpoints for read operations,
 * separating infrastructure concerns between read and write operations.
 *
 * @module providers/PublicProvider
 * @packageDocumentation
 */

import type { PublicProvider } from '../api/types/providers.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type { DAppRpcService } from '../services/dapp-rpc/dAppRpcService.js';
import type { ChainType } from '../types.js';

/**
 * Public provider wrapper that routes read operations through dApp RPC
 *
 * @public
 */
export class PublicProviderWrapper implements PublicProvider {
  /**
   * Create a new public provider
   *
   * @param dappRpcService - The dApp RPC service instance
   * @param chainId - Chain ID this provider is for
   * @param chainType - Type of blockchain
   */
  constructor(
    private readonly dappRpcService: DAppRpcService,
    public readonly chainId: string,
    public readonly chainType: ChainType,
  ) {}

  /**
   * Make a read-only JSON-RPC request through dApp infrastructure
   *
   * @param args - RPC method and parameters
   * @returns The RPC response
   * @throws If the RPC call fails
   */
  async request<T = unknown>(args: {
    method: string;
    params?: unknown[] | Record<string, unknown>;
  }): Promise<T> {
    try {
      const result = await this.dappRpcService.call(
        this.chainId,
        args.method,
        Array.isArray(args.params) ? args.params : args.params ? [args.params] : undefined,
      );
      return result.data as T;
    } catch (error) {
      // Re-throw with proper error context
      throw ErrorFactory.transportError(`Public provider RPC call failed: ${args.method}`, 'PublicProvider');
    }
  }
}
