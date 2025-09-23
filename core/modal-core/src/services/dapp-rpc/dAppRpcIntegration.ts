/**
 * Integration layer for dApp RPC service with WalletMesh client
 *
 * This module provides the integration between the dApp RPC service and the
 * WalletMesh client, allowing automatic configuration from chain configs.
 *
 * @module services/dapp-rpc/DAppRpcIntegration
 * @packageDocumentation
 */

import type { ChainConfig } from '../../internal/client/WalletMeshClient.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import type { ChainType } from '../../types.js';
import { DAppRpcService } from './dAppRpcService.js';

/**
 * Integration service for dApp RPC functionality
 *
 * This service handles the setup and configuration of dApp RPC endpoints
 * based on the WalletMesh client configuration.
 *
 * @public
 */
export class DAppRpcIntegration {
  private dappRpcService: DAppRpcService;
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.dappRpcService = new DAppRpcService({ logger });
  }

  /**
   * Initialize dApp RPC service with chain configurations
   *
   * @param chainConfigs - Array of chain configurations from WalletMesh client
   * @public
   */
  initializeFromChainConfigs(chainConfigs: ChainConfig[]): void {
    this.logger.debug('Initializing dApp RPC service from chain configs', {
      chainCount: chainConfigs.length,
    });

    for (const chainConfig of chainConfigs) {
      if (chainConfig.dappRpcUrls && chainConfig.dappRpcUrls.length > 0) {
        this.logger.debug('Registering dApp RPC endpoint for chain', {
          chainId: chainConfig.chainId,
          chainType: chainConfig.chainType,
          urls: chainConfig.dappRpcUrls,
          config: chainConfig.dappRpcConfig,
        });

        this.dappRpcService.registerEndpoint({
          chain: {
            chainId: chainConfig.chainId,
            chainType: chainConfig.chainType as ChainType,
            name: chainConfig.name,
            required: chainConfig.required,
          },
          chainType: chainConfig.chainType as ChainType,
          urls: chainConfig.dappRpcUrls,
          ...(chainConfig.dappRpcConfig && { config: chainConfig.dappRpcConfig }),
        });
      }
    }

    this.logger.info('dApp RPC service initialized', {
      registeredChains: this.dappRpcService.getRegisteredChains(),
      stats: this.dappRpcService.getStats(),
    });
  }

  /**
   * Get the dApp RPC service instance
   *
   * @returns The dApp RPC service instance
   * @public
   */
  getDAppRpcService(): DAppRpcService {
    return this.dappRpcService;
  }

  /**
   * Test connectivity to all configured dApp RPC endpoints
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
    const results = await this.dappRpcService.testConnectivity();
    return results.map((result) => ({
      ...result,
      chainId: String(result.chainId),
    }));
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
    const stats = this.dappRpcService.getStats();
    return {
      ...stats,
      chainIds: stats.chainIds.map((id) => String(id)),
    };
  }
}
