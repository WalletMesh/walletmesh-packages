/**
 * Framework-agnostic chain management utilities
 *
 * This module provides utilities for managing blockchain chains,
 * including switching chains, adding new chains, and chain validation.
 * Used across all framework packages for consistent chain handling.
 *
 * @module chainManager
 * @public
 */

import { ErrorFactory } from '../core/errors/errorFactory.js';

/**
 * Chain configuration for chain manager utilities
 *
 * @remarks
 * Used by ChainManager for adding EVM chains to wallets.
 * Uses 'id' instead of 'chainId' for backward compatibility.
 * For the canonical chain information type, use ChainInfo from services.
 *
 * @public
 */
export interface ChainManagerConfig {
  id: string;
  name: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/**
 * Common chain configurations for popular blockchains
 * @public
 */
export const CHAIN_CONFIGS: Record<string, ChainManagerConfig> = {
  'eip155:1': {
    id: 'eip155:1',
    name: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  'eip155:137': {
    id: 'eip155:137',
    name: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  'eip155:42161': {
    id: 'eip155:42161',
    name: 'Arbitrum One',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  'eip155:10': {
    id: 'eip155:10',
    name: 'Optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  'eip155:56': {
    id: 'eip155:56',
    name: 'BNB Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed1.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
};

/**
 * Framework-agnostic chain management utilities
 *
 * Provides utilities for switching chains, adding new chains,
 * and validating chain configurations consistently across
 * all framework packages.
 *
 * @public
 */
export class ChainManager {
  private provider: unknown;
  private supportedChains: string[];

  constructor(provider: unknown, supportedChains: string[] = []) {
    this.provider = provider;
    this.supportedChains = supportedChains;
  }

  /**
   * Switch to a different blockchain network
   * @param chainId - The chain ID to switch to
   * @throws Error if provider doesn't support switching or chain is not supported
   */
  async switchChain(chainId: string): Promise<void> {
    this.validateProvider();

    const provider = this.provider as {
      request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
    };

    try {
      // Try to switch to the chain
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (switchError: unknown) {
      // If the chain is not added to the wallet, try to add it
      if (this.isChainNotAddedError(switchError)) {
        const chainConfig = CHAIN_CONFIGS[chainId];
        if (!chainConfig) {
          throw ErrorFactory.configurationError(`Chain ${chainId} is not supported`);
        }

        await this.addChain(chainConfig);
      } else {
        throw switchError;
      }
    }
  }

  /**
   * Add a new blockchain network to the wallet
   * @param chainInfo - Chain configuration information
   * @throws Error if provider doesn't support adding chains
   */
  async addChain(chainInfo: ChainManagerConfig): Promise<void> {
    this.validateProvider();
    this.validateChainConfig(chainInfo);

    const provider = this.provider as {
      request: (args: { method: string; params: unknown[] }) => Promise<unknown>;
    };

    await provider.request({
      method: 'wallet_addEthereumChain',
      params: [chainInfo],
    });
  }

  /**
   * Check if a chain is supported by this instance
   * @param chainId - The chain ID to check (CAIP-2 format)
   * @returns True if the chain is supported
   */
  isChainSupported(chainId: string): boolean {
    return this.supportedChains.includes(chainId);
  }

  /**
   * Get chain configuration by ID
   * @param chainId - The chain ID to get configuration for
   * @returns Chain configuration or null if not found
   */
  static getChainConfig(chainId: string): ChainManagerConfig | null {
    return CHAIN_CONFIGS[chainId] || null;
  }

  /**
   * Get all available chain configurations
   * @returns Array of all chain configurations
   */
  static getAllChainConfigs(): ChainManagerConfig[] {
    return Object.values(CHAIN_CONFIGS);
  }

  /**
   * Validate chain configuration
   * @param chainInfo - Chain configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateChainConfig(chainInfo: ChainManagerConfig): void {
    if (!chainInfo.id) {
      throw ErrorFactory.invalidParams('Chain configuration must have an id');
    }
    if (!chainInfo.name) {
      throw ErrorFactory.invalidParams('Chain configuration must have a name');
    }
    if (!chainInfo.nativeCurrency) {
      throw ErrorFactory.invalidParams('Chain configuration must have nativeCurrency');
    }
    if (!chainInfo.rpcUrls || chainInfo.rpcUrls.length === 0) {
      throw ErrorFactory.invalidParams('Chain configuration must have at least one RPC URL');
    }
  }

  /**
   * Validate that provider supports required methods
   * @throws Error if provider is invalid
   */
  private validateProvider(): void {
    if (!this.provider) {
      throw ErrorFactory.connectionFailed('No wallet provider available');
    }

    const provider = this.provider as { request?: unknown };
    if (!provider.request || typeof provider.request !== 'function') {
      throw ErrorFactory.configurationError('Provider does not support request method');
    }
  }

  /**
   * Check if error indicates chain is not added to wallet
   * @param error - Error from chain switch attempt
   * @returns True if error indicates chain needs to be added
   */
  private isChainNotAddedError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 4902
    );
  }
}
