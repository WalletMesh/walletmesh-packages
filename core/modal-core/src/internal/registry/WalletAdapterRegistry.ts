/**
 * Wallet Adapter Registry
 *
 * Registry for mapping wallet adapter names to their implementations.
 * This enables discovered wallets to specify custom adapters instead
 * of using the generic DiscoveryAdapter.
 *
 * @module registry/WalletAdapterRegistry
 * @internal
 */

import type { QualifiedResponder } from '@walletmesh/discovery';
import type { DiscoveryConnectionManager } from '../../client/discovery/types.js';
import { ErrorFactory } from '../core/errors/errorFactory.js';
import type { Logger } from '../core/logger/logger.js';
import { createDebugLogger } from '../core/logger/logger.js';
import type { WalletAdapter } from '../wallets/base/WalletAdapter.js';

/**
 * Constructor signature for wallet adapters
 */
export type WalletAdapterConstructor = new (
  qualifiedResponder: QualifiedResponder,
  connectionManager: DiscoveryConnectionManager,
  config?: Record<string, unknown>,
) => WalletAdapter;

/**
 * Registry entry for a wallet adapter
 */
interface AdapterRegistryEntry {
  /** Constructor function for the adapter */
  constructor: WalletAdapterConstructor;
  /** Optional validation function for adapter config */
  validateConfig?: (config: unknown) => boolean;
  /** Description of the adapter */
  description?: string;
}

/**
 * Registry for wallet adapter implementations.
 *
 * Manages the mapping between adapter names (as specified in discovery)
 * and their actual implementations. This allows wallets to specify
 * custom adapters with enhanced functionality.
 *
 * @example
 * ```typescript
 * // Register a custom adapter
 * import { MetaMaskAdapter } from './adapters/MetaMaskAdapter.js';
 *
 * registry.register('MetaMaskAdapter', MetaMaskAdapter);
 *
 * // Later, when processing discovery response
 * const AdapterClass = registry.get(wallet.transportConfig.walletAdapter);
 * const adapter = new AdapterClass(wallet, connectionManager, config);
 * ```
 */
export class WalletAdapterRegistry {
  private adapters = new Map<string, AdapterRegistryEntry>();
  private logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger || createDebugLogger('WalletAdapterRegistry');
  }

  /**
   * Register a wallet adapter implementation
   *
   * @param name - Name of the adapter (as specified in discovery)
   * @param adapter - Adapter constructor
   * @param options - Optional registration options
   */
  register(
    name: string,
    adapter: WalletAdapterConstructor,
    options?: {
      validateConfig?: (config: unknown) => boolean;
      description?: string;
    },
  ): void {
    if (!name || typeof name !== 'string') {
      throw ErrorFactory.configurationError('Adapter name must be a non-empty string');
    }

    if (!adapter || typeof adapter !== 'function') {
      throw ErrorFactory.configurationError('Adapter must be a constructor function');
    }

    this.logger.debug('Registering wallet adapter', { name, description: options?.description });

    this.adapters.set(name, {
      constructor: adapter,
      ...(options?.validateConfig && { validateConfig: options.validateConfig }),
      ...(options?.description && { description: options.description }),
    });
  }

  /**
   * Unregister a wallet adapter
   *
   * @param name - Name of the adapter to unregister
   * @returns True if adapter was unregistered, false if not found
   */
  unregister(name: string): boolean {
    const existed = this.adapters.has(name);
    if (existed) {
      this.adapters.delete(name);
      this.logger.debug('Unregistered wallet adapter', { name });
    }
    return existed;
  }

  /**
   * Get a wallet adapter constructor by name
   *
   * @param name - Name of the adapter
   * @returns Adapter constructor or undefined if not found
   */
  get(name: string): WalletAdapterConstructor | undefined {
    const entry = this.adapters.get(name);
    return entry?.constructor;
  }

  /**
   * Check if an adapter is registered
   *
   * @param name - Name of the adapter
   * @returns True if adapter is registered
   */
  has(name: string): boolean {
    return this.adapters.has(name);
  }

  /**
   * Get all registered adapter names
   *
   * @returns Array of registered adapter names
   */
  getRegisteredAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Validate adapter configuration
   *
   * @param name - Name of the adapter
   * @param config - Configuration to validate
   * @returns True if config is valid or no validation function exists
   */
  validateConfig(name: string, config: unknown): boolean {
    const entry = this.adapters.get(name);
    if (!entry || !entry.validateConfig) {
      return true; // No validation function means config is considered valid
    }
    return entry.validateConfig(config);
  }

  /**
   * Create an adapter instance
   *
   * @param name - Name of the adapter
   * @param qualifiedResponder - Discovery responder data
   * @param connectionManager - Connection manager instance
   * @param config - Adapter configuration
   * @returns New adapter instance
   * @throws If adapter is not found or config validation fails
   */
  createAdapter(
    name: string,
    qualifiedResponder: QualifiedResponder,
    connectionManager: DiscoveryConnectionManager,
    config?: Record<string, unknown>,
  ): WalletAdapter {
    const adapterClass = this.get(name);
    if (!adapterClass) {
      throw ErrorFactory.configurationError(`Wallet adapter '${name}' not found in registry`);
    }

    // Validate config if validation function exists
    if (!this.validateConfig(name, config)) {
      throw ErrorFactory.configurationError(`Invalid configuration for adapter '${name}'`);
    }

    try {
      return new adapterClass(qualifiedResponder, connectionManager, config);
    } catch (error) {
      throw ErrorFactory.configurationError(`Failed to create adapter '${name}'`, {
        originalError: error,
      });
    }
  }

  /**
   * Clear all registered adapters
   */
  clear(): void {
    this.adapters.clear();
    this.logger.debug('Cleared all registered adapters');
  }

  /**
   * Get registry statistics
   *
   * @returns Registry statistics
   */
  getStats(): {
    registeredCount: number;
    adapterNames: string[];
  } {
    return {
      registeredCount: this.adapters.size,
      adapterNames: this.getRegisteredAdapters(),
    };
  }
}

/**
 * Global adapter registry instance
 */
export const globalAdapterRegistry = new WalletAdapterRegistry();
