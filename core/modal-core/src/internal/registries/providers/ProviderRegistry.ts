/**
 * Provider registry for managing and lazy loading wallet provider classes
 *
 * @module internal/providers/ProviderRegistry
 * @packageDocumentation
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { ProviderClass, WalletProvider } from '../../../api/types/providers.js';
import type { ChainType } from '../../../types.js';
import { ErrorFactory } from '../../core/errors/errorFactory.js';
import type { Logger } from '../../core/logger/logger.js';

/**
 * Provider loader function for lazy loading
 *
 * @public
 */
export type ProviderLoader = () => Promise<{ default: ProviderClass }>;

/**
 * Provider registration entry
 *
 * @public
 */
export interface ProviderEntry {
  /** Provider class constructor (if already loaded) */
  providerClass?: ProviderClass;
  /** Loader function for lazy loading */
  loader?: ProviderLoader;
  /** Loading promise to prevent duplicate loads */
  loadingPromise?: Promise<void>;
  /** Whether this provider is built-in */
  isBuiltIn: boolean;
}

/**
 * Registry for managing wallet provider classes with lazy loading support
 *
 * This registry allows registration of provider classes either directly
 * or via lazy loaders. This is particularly useful for heavy providers
 * like Aztec (40+ MB) that should only be loaded when needed.
 *
 * @public
 * @example
 * ```typescript
 * // Register a provider directly
 * registry.registerProvider(ChainType.Evm, EvmProvider);
 *
 * // Register a provider with lazy loading
 * registry.registerProviderLoader(
 *   ChainType.Aztec,
 *   () => import('@walletmesh/modal-core/providers/aztec')
 * );
 *
 * // Create a provider instance
 * const provider = await registry.createProvider(
 *   ChainType.Evm,
 *   transport,
 *   '0x1',
 *   logger
 * );
 * ```
 */
export class ProviderRegistry {
  private readonly providers = new Map<ChainType, ProviderEntry>();
  private static instance?: ProviderRegistry;

  /**
   * Get the singleton instance of the provider registry
   *
   * @returns The provider registry instance
   */
  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Register a provider class directly
   *
   * @param chainType - The chain type this provider handles
   * @param providerClass - The provider class constructor
   * @param isBuiltIn - Whether this is a built-in provider (default: false)
   */
  registerProvider(chainType: ChainType, providerClass: ProviderClass, isBuiltIn = false): void {
    this.providers.set(chainType, {
      providerClass,
      isBuiltIn,
    });
  }

  /**
   * Register a provider with lazy loading
   *
   * @param chainType - The chain type this provider handles
   * @param loader - Function that loads the provider module
   * @param isBuiltIn - Whether this is a built-in provider (default: false)
   */
  registerProviderLoader(chainType: ChainType, loader: ProviderLoader, isBuiltIn = false): void {
    this.providers.set(chainType, {
      loader,
      isBuiltIn,
    });
  }

  /**
   * Check if a provider is registered for a chain type
   *
   * @param chainType - The chain type to check
   * @returns Whether a provider is registered
   */
  hasProvider(chainType: ChainType): boolean {
    return this.providers.has(chainType);
  }

  /**
   * Get registered chain types
   *
   * @returns Array of registered chain types
   */
  getRegisteredChainTypes(): ChainType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Create a provider instance for the specified chain type
   *
   * @param chainType - The chain type to create a provider for
   * @param transport - JSON-RPC transport for communication
   * @param initialChainId - Initial chain ID (optional)
   * @returns Promise resolving to the provider instance
   * @throws If no provider is registered for the chain type
   */
  async createProvider(
    chainType: ChainType,
    transport: JSONRPCTransport,
    initialChainId: string | undefined,
    logger: Logger,
  ): Promise<WalletProvider> {
    const entry = this.providers.get(chainType);
    if (!entry) {
      throw ErrorFactory.configurationError(`No provider registered for chain type: ${chainType}`);
    }

    // Load provider class if needed
    const providerClass = await this.loadProviderClass(chainType, entry);

    try {
      // Create provider instance
      return new providerClass(chainType, transport, initialChainId, logger);
    } catch (error) {
      throw ErrorFactory.configurationError(
        `Failed to create provider for ${chainType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Get provider class for a chain type (loading if necessary)
   *
   * @param chainType - The chain type to get provider for
   * @returns Promise resolving to the provider class
   * @throws If no provider is registered or loading fails
   */
  async getProviderClass(chainType: ChainType): Promise<ProviderClass> {
    const entry = this.providers.get(chainType);
    if (!entry) {
      throw ErrorFactory.configurationError(`No provider registered for chain type: ${chainType}`);
    }

    return await this.loadProviderClass(chainType, entry);
  }

  /**
   * Load a provider class from an entry
   *
   * @param chainType - The chain type being loaded
   * @param entry - The provider entry
   * @returns Promise resolving to the provider class
   * @private
   */
  private async loadProviderClass(chainType: ChainType, entry: ProviderEntry): Promise<ProviderClass> {
    // If already loaded, return it
    if (entry.providerClass) {
      return entry.providerClass;
    }

    // If no loader, throw error
    if (!entry.loader) {
      throw ErrorFactory.configurationError(`Provider entry for ${chainType} has no class or loader`);
    }

    // If already loading, wait for it
    if (entry.loadingPromise) {
      await entry.loadingPromise;
      if (!entry.providerClass) {
        throw ErrorFactory.configurationError(`Failed to load provider for ${chainType}`);
      }
      return entry.providerClass;
    }

    // Start loading
    entry.loadingPromise = this.performLoad(chainType, entry);
    await entry.loadingPromise;

    if (!entry.providerClass) {
      throw ErrorFactory.configurationError(`Failed to load provider for ${chainType}`);
    }

    return entry.providerClass;
  }

  /**
   * Perform the actual loading of a provider
   *
   * @param chainType - The chain type being loaded
   * @param entry - The provider entry
   * @private
   */
  private async performLoad(chainType: ChainType, entry: ProviderEntry): Promise<void> {
    if (!entry.loader) {
      throw ErrorFactory.configurationError(`No loader available for ${chainType}`);
    }

    try {
      const module = await entry.loader();
      if (!module.default) {
        throw ErrorFactory.configurationError('Provider module must have a default export');
      }
      entry.providerClass = module.default;
    } catch (error) {
      // Clear loading promise on error
      // biome-ignore lint/performance/noDelete: Need to remove optional property
      delete entry.loadingPromise;
      throw ErrorFactory.configurationError(
        `Failed to load provider module for ${chainType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Clear all registered providers
   * Useful for testing or resetting the registry
   */
  clear(): void {
    this.providers.clear();
  }

  /**
   * Remove a specific provider registration
   *
   * @param chainType - The chain type to remove
   * @returns Whether a provider was removed
   */
  removeProvider(chainType: ChainType): boolean {
    return this.providers.delete(chainType);
  }

  /**
   * Get information about registered providers
   *
   * @returns Array of provider information
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
}
