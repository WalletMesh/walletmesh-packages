/**
 * Chain Service Registry
 *
 * Manages lazy loading and caching of chain-specific service implementations.
 * Only loads chain services when they are actually needed by the application.
 *
 * @module services/chains/ChainServiceRegistry
 */

import type { BlockchainProvider } from '../../api/types/chainProviders.js';
import { ErrorFactory } from '../../internal/core/errors/errorFactory.js';
import type { Logger } from '../../internal/core/logger/logger.js';
import { ChainType } from '../../types.js';
// ChainId type has been removed
import { getChainTypeFromId } from '../../utils/chainTypeUtils.js';
import type {
  BaseChainService,
  ChainBalanceInfo,
  ChainServiceFactory,
  ChainServiceLoader,
  ChainTokenInfo,
  ChainTransactionParams,
  ChainTransactionResult,
} from './BaseChainService.js';

/**
 * Registry entry for chain services
 * @internal
 */
export interface ChainServiceEntry {
  /** Chain type */
  chainType: ChainType;
  /** Loader function for dynamic import */
  loader: ChainServiceLoader;
  /** Cached service instance */
  service?: BaseChainService | undefined;
  /** Loading promise to prevent duplicate loads */
  loadingPromise?: Promise<BaseChainService> | undefined;
  /** Whether this is a built-in service */
  isBuiltIn: boolean;
  /** When the service was last used (for cleanup) */
  lastUsed: number;
}

/**
 * Configuration for chain service registry
 */
export interface ChainServiceRegistryConfig {
  /** Whether to preload services on initialization */
  preloadOnInit?: boolean;
  /** Chain types to preload */
  preloadChainTypes?: ChainType[];
  /** Cache timeout in milliseconds (0 = never expire) */
  cacheTimeout?: number;
}

/**
 * Status information for a chain service
 */
export interface ChainServiceStatus {
  /** Whether the service is registered */
  isRegistered: boolean;
  /** Whether the service is loaded */
  isLoaded: boolean;
  /** Whether the service is currently loading */
  isLoading: boolean;
  /** Whether this is a built-in service */
  isBuiltIn: boolean;
  /** Last usage timestamp */
  lastUsed?: number;
}

/**
 * Registry for managing chain-specific service implementations
 *
 * Provides lazy loading, caching, and a unified interface for accessing
 * blockchain-specific operations across different chains.
 */
export class ChainServiceRegistry {
  private services = new Map<ChainType, ChainServiceEntry>();
  private logger: Logger;
  private config: Required<ChainServiceRegistryConfig>;
  private cleanupInterval?: ReturnType<typeof setInterval> | undefined;

  constructor(logger: Logger, config: ChainServiceRegistryConfig = {}) {
    this.logger = logger;
    this.config = {
      preloadOnInit: false,
      preloadChainTypes: [],
      cacheTimeout: 30 * 60 * 1000, // 30 minutes
      ...config,
    };

    this.registerBuiltInServices();
    this.setupCleanup();
  }

  /**
   * Initialize the registry and optionally preload services
   */
  async initialize(): Promise<void> {
    this.logger.debug('Initializing ChainServiceRegistry', { config: this.config });

    if (this.config.preloadOnInit) {
      await this.preloadServices(this.config.preloadChainTypes);
    }
  }

  /**
   * Get a chain service by chain type (for testing/compatibility)
   */
  async getService(chainType: ChainType): Promise<BaseChainService> {
    const entry = this.services.get(chainType);
    if (!entry) {
      throw ErrorFactory.configurationError(`No service registered for chain type: ${chainType}`, {
        chainType,
      });
    }

    // Return cached service if available
    if (entry.service) {
      entry.lastUsed = Date.now();
      return entry.service;
    }

    // If already loading, wait for the existing promise
    if (entry.loadingPromise) {
      return entry.loadingPromise;
    }

    // Load the service
    entry.loadingPromise = this.loadChainService(entry);
    const service = await entry.loadingPromise;
    return service;
  }

  /**
   * Get a chain service for the given chain ID
   */
  async getChainService(chainId: string | number): Promise<BaseChainService> {
    const chainType = getChainTypeFromId(chainId);
    const entry = this.services.get(chainType);
    if (!entry) {
      throw ErrorFactory.configurationError(`No chain service registered for chain type: ${chainType}`, {
        chainType,
        chainId,
      });
    }

    // Return cached service if available
    if (entry.service) {
      entry.lastUsed = Date.now();

      // Verify the service supports this specific chain
      if (!entry.service.supportsChain(chainId.toString())) {
        throw ErrorFactory.configurationError(
          `Chain service for ${chainType} does not support chain ID: ${chainId}`,
          { chainType, chainId },
        );
      }

      return entry.service;
    }

    // If already loading, wait for the existing promise
    if (entry.loadingPromise) {
      return entry.loadingPromise;
    }

    // Load the service
    entry.loadingPromise = this.loadChainService(entry);
    const service = await entry.loadingPromise;

    // Verify the loaded service supports this chain
    if (!service.supportsChain(String(chainId))) {
      throw ErrorFactory.configurationError(
        `Chain service for ${chainType} does not support chain ID: ${chainId}`,
        { chainType, chainId },
      );
    }

    return service;
  }

  /**
   * Get native balance using the appropriate chain service
   */
  async getNativeBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string | number,
  ): Promise<ChainBalanceInfo> {
    const service = await this.getChainService(chainId);
    return service.getNativeBalance(provider, address, chainId.toString());
  }

  /**
   * Get token balance using the appropriate chain service
   */
  async getTokenBalance(
    provider: BlockchainProvider,
    address: string,
    chainId: string | number,
    token: ChainTokenInfo,
  ): Promise<ChainBalanceInfo> {
    const service = await this.getChainService(chainId);
    return service.getTokenBalance(provider, address, chainId.toString(), token);
  }

  /**
   * Send transaction using the appropriate chain service
   */
  async sendTransaction(
    provider: BlockchainProvider,
    params: ChainTransactionParams,
    chainId: string | number,
  ): Promise<ChainTransactionResult> {
    const service = await this.getChainService(chainId);
    return service.sendTransaction(provider, params, chainId.toString());
  }

  /**
   * Get transaction receipt using the appropriate chain service
   */
  async getTransactionReceipt(
    provider: BlockchainProvider,
    hash: string,
    chainId: string | number,
  ): Promise<ChainTransactionResult | null> {
    const service = await this.getChainService(chainId);
    return service.getTransactionReceipt(provider, hash, chainId.toString());
  }

  /**
   * Register a custom chain service
   */
  registerChainService(chainType: ChainType, loader: ChainServiceLoader, replace = false): void {
    if (!chainType) {
      throw ErrorFactory.configurationError('Chain type is required for service registration');
    }

    if (this.services.has(chainType) && !replace) {
      throw ErrorFactory.configurationError(`Chain service for ${chainType} is already registered`, {
        chainType,
      });
    }

    this.services.set(chainType, {
      chainType,
      loader,
      isBuiltIn: false,
      lastUsed: 0,
    });

    this.logger.debug('Registered custom chain service', { chainType });
  }

  /**
   * Preload specific chain services
   */
  async preloadServices(chainTypes: ChainType[]): Promise<void> {
    this.logger.debug('Preloading chain services', { chainTypes });

    const loadPromises = chainTypes
      .filter((chainType) => this.services.has(chainType))
      .map(async (chainType) => {
        try {
          const entry = this.services.get(chainType);
          if (!entry) return;
          if (!entry.service && !entry.loadingPromise) {
            await this.loadChainService(entry);
          }
        } catch (error) {
          this.logger.warn('Failed to preload chain service', { chainType, error });
        }
      });

    await Promise.all(loadPromises);
  }

  /**
   * Get status of a chain service
   */
  getServiceStatus(chainType: ChainType): ChainServiceStatus {
    const entry = this.services.get(chainType);
    if (!entry) {
      return {
        isRegistered: false,
        isLoaded: false,
        isLoading: false,
        isBuiltIn: false,
      };
    }

    return {
      isRegistered: true,
      isLoaded: !!entry.service,
      isLoading: !!entry.loadingPromise && !entry.service,
      isBuiltIn: entry.isBuiltIn,
      ...(entry.lastUsed > 0 && { lastUsed: entry.lastUsed }),
    };
  }

  /**
   * Clear cached services
   */
  clearCache(chainType?: ChainType): void {
    if (chainType) {
      const entry = this.services.get(chainType);
      if (entry) {
        entry.service = undefined;
        entry.loadingPromise = undefined;
        entry.lastUsed = 0;
      }
    } else {
      for (const entry of this.services.values()) {
        entry.service = undefined;
        entry.loadingPromise = undefined;
        entry.lastUsed = 0;
      }
    }

    this.logger.debug('Cleared chain service cache', { chainType });
  }

  /**
   * Cleanup and destroy the registry
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    this.clearCache();
    this.services.clear();

    this.logger.debug('ChainServiceRegistry destroyed');
  }

  // Private methods

  private async loadChainService(entry: ChainServiceEntry): Promise<BaseChainService> {
    this.logger.debug('Loading chain service', { chainType: entry.chainType });

    try {
      const module = await entry.loader();
      let factory: ChainServiceFactory;

      // Handle different export patterns
      if (module.default) {
        factory = module.default;
      } else if (entry.chainType === 'evm' && module.createEVMChainService) {
        factory = module.createEVMChainService;
      } else if (entry.chainType === 'solana' && module.createSolanaChainService) {
        factory = module.createSolanaChainService;
      } else if (entry.chainType === 'aztec' && module.createAztecChainService) {
        factory = module.createAztecChainService;
      } else {
        throw ErrorFactory.configurationError(
          `No valid factory found in chain service module for ${entry.chainType}`,
        );
      }

      const service = await factory(this.logger);
      entry.service = service;
      entry.lastUsed = Date.now();
      entry.loadingPromise = undefined;

      this.logger.debug('Chain service loaded successfully', { chainType: entry.chainType });
      return service;
    } catch (error) {
      entry.loadingPromise = undefined;
      this.logger.error('Failed to load chain service', {
        chainType: entry.chainType,
        error,
      });

      throw ErrorFactory.configurationError(`Failed to load chain service for ${entry.chainType}: ${error}`, {
        chainType: entry.chainType,
        originalError: String(error),
      });
    }
  }

  private registerBuiltInServices(): void {
    // Register built-in chain services with lazy loading
    this.services.set(ChainType.Evm, {
      chainType: ChainType.Evm,
      loader: () => import('./evm/EvmChainService.js'),
      isBuiltIn: true,
      lastUsed: 0,
    });

    this.services.set(ChainType.Solana, {
      chainType: ChainType.Solana,
      loader: () => import('./solana/SolanaChainService.js'),
      isBuiltIn: true,
      lastUsed: 0,
    });

    this.services.set(ChainType.Aztec, {
      chainType: ChainType.Aztec,
      loader: () => import('./aztec/AztecChainService.js'),
      isBuiltIn: true,
      lastUsed: 0,
    });
  }

  /**
   * Dispose of all chain services and cleanup resources
   */
  async dispose(): Promise<void> {
    // Stop cleanup timer
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }

    // Clear all services
    this.services.clear();
    this.logger.info('ChainServiceRegistry disposed');
  }

  private setupCleanup(): void {
    if (this.config.cacheTimeout <= 0) return;

    // Clean up unused services periodically
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        const servicesToRemove: ChainType[] = [];

        for (const [chainType, entry] of this.services.entries()) {
          if (entry.service && now - entry.lastUsed > this.config.cacheTimeout) {
            servicesToRemove.push(chainType);
          }
        }

        for (const chainType of servicesToRemove) {
          this.clearCache(chainType);
          this.logger.debug('Cleaned up unused chain service', { chainType });
        }
      },
      Math.min(this.config.cacheTimeout / 2, 5 * 60 * 1000),
    ); // Check every 5 minutes max
  }
}

/**
 * Create a chain service registry
 */
export function createChainServiceRegistry(
  logger: Logger,
  config: ChainServiceRegistryConfig = {},
): ChainServiceRegistry {
  return new ChainServiceRegistry(logger, config);
}
