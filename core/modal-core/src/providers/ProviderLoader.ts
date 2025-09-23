/**
 * Provider Loader for lazy loading blockchain providers
 *
 * This module provides lazy loading functionality for blockchain providers,
 * allowing applications to only load the providers they need.
 *
 * @module providers/ProviderLoader
 * @packageDocumentation
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { ProviderClass, WalletProvider } from '../api/types/providers.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type { Logger } from '../internal/core/logger/logger.js';
import type { ChainType } from '../types.js';

/**
 * Provider factory function that creates provider instances
 *
 * @public
 */
export type ProviderFactory = (
  chainType: ChainType,
  transport: JSONRPCTransport,
  initialChainId: string | undefined,
  logger: Logger,
) => Promise<WalletProvider>;

/**
 * Provider loader function that loads provider modules
 *
 * @public
 */
export type ProviderLoaderFunction = () => Promise<{
  default?: ProviderClass;
  EvmProvider?: ProviderClass;
  SolanaProvider?: ProviderClass;
  AztecProvider?: ProviderClass;
}>;

/**
 * Provider registry entry with loading information
 *
 * @internal
 */
export interface ProviderEntry {
  /** Chain type this provider handles */
  chainType: ChainType;
  /** Loader function for dynamic import */
  loader: ProviderLoaderFunction;
  /** Cached provider class after loading */
  providerClass?: ProviderClass;
  /** Loading promise to prevent duplicate loads */
  loadingPromise?: Promise<void>;
  /** Whether this provider is built-in */
  isBuiltIn: boolean;
}

/**
 * Provider loader configuration
 *
 * @public
 */
export interface ProviderLoaderConfig {
  /** Custom provider loaders */
  customProviders?: Record<ChainType, ProviderLoaderFunction>;
  /** Whether to preload configured providers on initialization */
  preloadOnInit?: boolean;
  /** Chain types to preload (if preloadOnInit is true) */
  preloadChainTypes?: ChainType[];
  /** Logger instance for debugging */
  logger?: Logger;
}

/**
 * Provider loader for lazy loading blockchain providers
 *
 * This class manages dynamic imports of provider implementations,
 * reducing initial bundle size by only loading providers when needed.
 *
 * @public
 * @example
 * ```typescript
 * // Create provider loader
 * const loader = new ProviderLoader({
 *   preloadOnInit: true,
 *   preloadChainTypes: [ChainType.Evm, ChainType.Solana]
 * });
 *
 * // Initialize and preload configured providers
 * await loader.initialize();
 *
 * // Create a provider instance
 * const provider = await loader.createProvider(
 *   ChainType.Evm,
 *   transport,
 *   '0x1',
 *   logger
 * );
 * ```
 */
export class ProviderLoader {
  private readonly providers = new Map<ChainType, ProviderEntry>();
  private readonly config: ProviderLoaderConfig;
  private readonly logger: Logger | undefined;
  private initialized = false;

  /**
   * Built-in provider loaders registry
   *
   * @private
   */
  private readonly builtInLoaders: Record<ChainType, ProviderLoaderFunction> = {
    evm: () => import('./evm/index.js').then((m) => ({ default: m.EvmProvider as ProviderClass })),
    solana: () => import('./solana/index.js').then((m) => ({ default: m.SolanaProvider as ProviderClass })),
    // Aztec providers are handled internally by Aztec adapters using AztecRouterProvider
    // from @walletmesh/aztec-rpc-wallet. No built-in provider class is needed.
    // Return empty object to skip provider class check
    aztec: () => Promise.resolve({}),
  };

  constructor(config: ProviderLoaderConfig = {}) {
    this.config = config;
    this.logger = config.logger;

    // Register built-in providers
    this.registerBuiltInProviders();

    // Register custom providers
    if (config.customProviders) {
      for (const [chainType, loader] of Object.entries(config.customProviders)) {
        this.registerProvider(chainType as ChainType, loader, false);
      }
    }
  }

  /**
   * Initialize the provider loader
   *
   * @returns Promise that resolves when initialization is complete
   * @public
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.logger?.debug('ProviderLoader: Initializing');

    if (this.config.preloadOnInit && this.config.preloadChainTypes) {
      await this.preloadConfiguredProviders(this.config.preloadChainTypes);
    }

    this.initialized = true;
    this.logger?.debug('ProviderLoader: Initialization complete');
  }

  /**
   * Register built-in provider loaders
   *
   * @private
   */
  private registerBuiltInProviders(): void {
    for (const [chainType, loader] of Object.entries(this.builtInLoaders)) {
      this.registerProvider(chainType as ChainType, loader, true);
    }
  }

  /**
   * Register a provider loader
   *
   * @param chainType - Chain type this provider handles
   * @param loader - Loader function for dynamic import
   * @param isBuiltIn - Whether this is a built-in provider
   * @private
   */
  private registerProvider(chainType: ChainType, loader: ProviderLoaderFunction, isBuiltIn: boolean): void {
    this.providers.set(chainType, {
      chainType,
      loader,
      isBuiltIn,
    });
  }

  /**
   * Preload configured providers
   *
   * @param chainTypes - Chain types to preload
   * @returns Promise that resolves when all providers are loaded
   * @public
   */
  async preloadConfiguredProviders(chainTypes: ChainType[]): Promise<void> {
    this.logger?.debug('ProviderLoader: Preloading providers', { chainTypes });

    const loadPromises = chainTypes.map(async (chainType) => {
      try {
        await this.loadProviderClass(chainType);
        this.logger?.debug(`ProviderLoader: Preloaded provider for ${chainType}`);
      } catch (error) {
        this.logger?.error(`ProviderLoader: Failed to preload provider for ${chainType}`, error);
        // Don't throw - allow other providers to load
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Create a provider instance
   *
   * @param chainType - Chain type to create provider for
   * @param transport - JSON-RPC transport for communication
   * @param initialChainId - Initial chain ID (optional)
   * @param logger - Logger instance for debugging
   * @returns Promise resolving to provider instance
   * @throws If no provider is registered or loading fails
   * @public
   */
  async createProvider(
    chainType: ChainType,
    transport: JSONRPCTransport,
    initialChainId: string | undefined,
    logger: Logger,
  ): Promise<WalletProvider> {
    // Special handling for Aztec - providers are created by wallet adapters
    if (chainType === 'aztec') {
      throw ErrorFactory.configurationError(
        'Aztec providers must be created by wallet adapters using AztecRouterProvider',
      );
    }

    const providerClass = await this.loadProviderClass(chainType);

    try {
      const provider = new providerClass(chainType, transport, initialChainId, logger);
      this.logger?.debug(`ProviderLoader: Created provider instance for ${chainType}`);
      return provider;
    } catch (error) {
      throw ErrorFactory.configurationError(
        `Failed to create provider for ${chainType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get provider class for a chain type
   *
   * @param chainType - Chain type to get provider for
   * @returns Promise resolving to provider class
   * @throws If no provider is registered or loading fails
   * @public
   */
  async getProviderClass(chainType: ChainType): Promise<ProviderClass> {
    return await this.loadProviderClass(chainType);
  }

  /**
   * Load a provider class
   *
   * @param chainType - Chain type to load provider for
   * @returns Promise resolving to provider class
   * @throws If no provider is registered or loading fails
   * @private
   */
  private async loadProviderClass(chainType: ChainType): Promise<ProviderClass> {
    const entry = this.providers.get(chainType);
    if (!entry) {
      throw ErrorFactory.configurationError(`No provider registered for chain type: ${chainType}`);
    }

    // Return cached provider if available
    if (entry.providerClass) {
      return entry.providerClass;
    }

    // Wait for existing load if in progress
    if (entry.loadingPromise) {
      await entry.loadingPromise;
      // Special handling for Aztec - it doesn't need a provider class
      if (chainType === 'aztec' && !entry.providerClass) {
        this.logger?.debug('ProviderLoader: Aztec provider handled by wallet adapter');
        return null as unknown as ProviderClass; // Aztec providers are handled by adapters
      }
      if (!entry.providerClass) {
        throw ErrorFactory.configurationError(`Failed to load provider for ${chainType}`);
      }
      return entry.providerClass;
    }

    // Start loading
    entry.loadingPromise = this.performLoad(entry);

    try {
      await entry.loadingPromise;
      // Special handling for Aztec - it doesn't need a provider class
      if (chainType === 'aztec' && !entry.providerClass) {
        this.logger?.debug('ProviderLoader: Aztec provider handled by wallet adapter');
        // Clear loading promise after successful load
        // biome-ignore lint/performance/noDelete: Need to remove optional property
        delete entry.loadingPromise;
        return null as unknown as ProviderClass; // Aztec providers are handled by adapters
      }
      if (!entry.providerClass) {
        throw ErrorFactory.configurationError(`Failed to load provider for ${chainType}`);
      }
      // Clear loading promise after successful load
      // biome-ignore lint/performance/noDelete: Need to remove optional property
      delete entry.loadingPromise;
      return entry.providerClass;
    } catch (error) {
      // Clear loading promise on error
      // biome-ignore lint/performance/noDelete: Need to remove optional property
      delete entry.loadingPromise;
      throw error;
    }
  }

  /**
   * Perform the actual loading of a provider
   *
   * @param entry - Provider entry to load
   * @private
   */
  private async performLoad(entry: ProviderEntry): Promise<void> {
    try {
      this.logger?.debug(`ProviderLoader: Loading provider for ${entry.chainType}`);

      const module = await entry.loader();

      // Check for provider class in various export formats
      let providerClass: ProviderClass | undefined;

      if (module.default) {
        providerClass = module.default;
      } else if (module.EvmProvider && entry.chainType === 'evm') {
        providerClass = module.EvmProvider;
      } else if (module.SolanaProvider && entry.chainType === 'solana') {
        providerClass = module.SolanaProvider;
      } else if (module.AztecProvider && entry.chainType === 'aztec') {
        providerClass = module.AztecProvider;
      }

      // Special handling for Aztec - it doesn't need a provider class
      if (entry.chainType === 'aztec' && !providerClass) {
        // Aztec doesn't require a provider class - handled by wallet adapters
        this.logger?.debug('ProviderLoader: Skipping provider class check for Aztec');
        return;
      }

      if (!providerClass) {
        throw ErrorFactory.configurationError(
          `Provider module for ${entry.chainType} must export a provider class`,
        );
      }

      entry.providerClass = providerClass;
      this.logger?.debug(`ProviderLoader: Successfully loaded provider for ${entry.chainType}`);
    } catch (error) {
      this.logger?.error(`ProviderLoader: Failed to load provider for ${entry.chainType}`, error);
      throw ErrorFactory.configurationError(
        `Failed to load provider module for ${entry.chainType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Check if a provider is registered
   *
   * @param chainType - Chain type to check
   * @returns Whether a provider is registered
   * @public
   */
  hasProvider(chainType: ChainType): boolean {
    return this.providers.has(chainType);
  }

  /**
   * Get registered chain types
   *
   * @returns Array of registered chain types
   * @public
   */
  getRegisteredChainTypes(): ChainType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get provider loading status
   *
   * @param chainType - Chain type to check
   * @returns Loading status information
   * @public
   */
  getProviderStatus(chainType: ChainType): {
    isRegistered: boolean;
    isLoaded: boolean;
    isLoading: boolean;
    isBuiltIn: boolean;
  } {
    const entry = this.providers.get(chainType);

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
      isLoaded: !!entry.providerClass,
      isLoading: !!entry.loadingPromise,
      isBuiltIn: entry.isBuiltIn,
    };
  }

  /**
   * Clear all cached providers
   *
   * @remarks
   * This method clears all cached provider classes, forcing them to be
   * reloaded on next use. Useful for testing or hot reloading scenarios.
   *
   * @public
   */
  clearCache(): void {
    for (const entry of this.providers.values()) {
      // biome-ignore lint/performance/noDelete: Need to remove optional properties
      delete entry.providerClass;
      // biome-ignore lint/performance/noDelete: Need to remove optional properties
      delete entry.loadingPromise;
    }
    this.logger?.debug('ProviderLoader: Cleared provider cache');
  }

  /**
   * Get provider information for all registered providers
   *
   * @returns Array of provider information
   * @public
   */
  getProviderInfo(): Array<{
    chainType: ChainType;
    isLoaded: boolean;
    isBuiltIn: boolean;
  }> {
    return Array.from(this.providers.entries()).map(([chainType, entry]) => ({
      chainType,
      isLoaded: !!entry.providerClass,
      isBuiltIn: entry.isBuiltIn,
    }));
  }

  /**
   * Create a provider factory function
   *
   * @returns Provider factory function
   * @public
   */
  createProviderFactory(): ProviderFactory {
    return (chainType, transport, initialChainId, logger) => {
      return this.createProvider(chainType, transport, initialChainId, logger).then((provider) => provider);
    };
  }
}

/**
 * Create a default provider loader instance
 *
 * @param config - Provider loader configuration
 * @returns Provider loader instance
 * @public
 * @example
 * ```typescript
 * const loader = createProviderLoader({
 *   preloadOnInit: true,
 *   preloadChainTypes: [ChainType.Evm]
 * });
 * ```
 */
export function createProviderLoader(config: ProviderLoaderConfig = {}): ProviderLoader {
  return new ProviderLoader(config);
}
