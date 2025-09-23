/**
 * Interface-aware provider loader that selects providers based on negotiated interfaces
 *
 * This module extends the standard ProviderLoader to support interface-based
 * provider selection, allowing the system to instantiate the correct provider
 * based on the wallet's supported interfaces.
 *
 * @module providers/InterfaceAwareProviderLoader
 * @packageDocumentation
 */

import type { JSONRPCTransport } from '@walletmesh/jsonrpc';
import type { ProviderClass, WalletProvider } from '../api/types/providers.js';
import { ErrorFactory } from '../internal/core/errors/errorFactory.js';
import type { Logger } from '../internal/core/logger/logger.js';
import type { ChainType } from '../types.js';
import { ProviderLoader, type ProviderLoaderConfig } from './ProviderLoader.js';
import { resolveInterface } from './interfaceResolution.js';

/**
 * Extended provider factory that includes interface information
 */
export type InterfaceAwareProviderFactory = (
  chainType: ChainType,
  transport: JSONRPCTransport,
  initialChainId: string | undefined,
  logger: Logger,
  negotiatedInterfaces?: string[],
) => Promise<WalletProvider>;

/**
 * Provider variant configuration for interface-based selection
 */
export interface ProviderVariant {
  /** Interfaces this variant supports */
  supportedInterfaces: string[];
  /** Priority for this variant (higher is preferred) */
  priority: number;
  /** Provider class for this variant */
  providerClass: ProviderClass;
  /** Optional variant name for debugging */
  name?: string;
}

/**
 * Extended provider loader configuration
 */
export interface InterfaceAwareProviderLoaderConfig extends ProviderLoaderConfig {
  /** Provider variants keyed by chain type and interface */
  providerVariants?: Record<ChainType, ProviderVariant[]>;
}

/**
 * Interface-aware provider loader that selects providers based on negotiated interfaces
 *
 * @public
 * @example
 * ```typescript
 * const loader = new InterfaceAwareProviderLoader({
 *   providerVariants: {
 *     evm: [
 *       {
 *         supportedInterfaces: ['eip-6963'],
 *         priority: 100,
 *         providerClass: EIP6963Provider,
 *         name: 'EIP-6963 Provider'
 *       },
 *       {
 *         supportedInterfaces: ['eip-1193'],
 *         priority: 90,
 *         providerClass: StandardEvmProvider,
 *         name: 'Standard EVM Provider'
 *       }
 *     ]
 *   }
 * });
 *
 * // Create provider with negotiated interfaces
 * const provider = await loader.createProviderWithInterfaces(
 *   ChainType.Evm,
 *   transport,
 *   '0x1',
 *   logger,
 *   ['eip-6963', 'eip-1193'] // Negotiated from discovery
 * );
 * ```
 */
export class InterfaceAwareProviderLoader extends ProviderLoader {
  private readonly providerVariants: Map<ChainType, ProviderVariant[]> = new Map();

  constructor(config: InterfaceAwareProviderLoaderConfig = {}) {
    super(config);

    // Register provider variants
    if (config.providerVariants) {
      for (const [chainType, variants] of Object.entries(config.providerVariants)) {
        this.providerVariants.set(chainType as ChainType, variants);
      }
    }
  }

  /**
   * Create a provider instance with interface awareness
   *
   * @param chainType - Chain type to create provider for
   * @param transport - JSON-RPC transport for communication
   * @param initialChainId - Initial chain ID (optional)
   * @param logger - Logger instance for debugging
   * @param negotiatedInterfaces - Interfaces negotiated during discovery
   * @returns Promise resolving to provider instance
   * @public
   */
  async createProviderWithInterfaces(
    chainType: ChainType,
    transport: JSONRPCTransport,
    initialChainId: string | undefined,
    logger: Logger,
    negotiatedInterfaces?: string[],
  ): Promise<WalletProvider> {
    // If no interfaces provided, fall back to standard provider creation
    if (!negotiatedInterfaces || negotiatedInterfaces.length === 0) {
      logger?.debug('No negotiated interfaces provided, using default provider');
      return super.createProvider(chainType, transport, initialChainId, logger);
    }

    // Check if we have variants for this chain type
    const variants = this.providerVariants.get(chainType);
    if (!variants || variants.length === 0) {
      logger?.debug('No provider variants configured, using default provider');
      return super.createProvider(chainType, transport, initialChainId, logger);
    }

    // Resolve which interface to use
    const resolution = this.resolveProviderVariant(chainType, negotiatedInterfaces, variants);
    if (!resolution) {
      logger?.warn('No matching provider variant found, using default provider');
      return super.createProvider(chainType, transport, initialChainId, logger);
    }

    logger?.info(`Creating provider with interface: ${resolution.selectedInterface}`, {
      chainType,
      selectedInterface: resolution.selectedInterface,
      variantName: resolution.variant.name,
    });

    try {
      const provider = new resolution.variant.providerClass(chainType, transport, initialChainId, logger);
      return provider;
    } catch (error) {
      throw ErrorFactory.configurationError(
        `Failed to create provider variant for ${chainType}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { selectedInterface: resolution.selectedInterface, variantName: resolution.variant.name },
      );
    }
  }

  /**
   * Resolve which provider variant to use based on negotiated interfaces
   *
   * @param chainType - Chain type
   * @param negotiatedInterfaces - Interfaces negotiated during discovery
   * @param variants - Available provider variants
   * @returns Selected variant and interface, or null if no match
   * @private
   */
  private resolveProviderVariant(
    chainType: ChainType,
    negotiatedInterfaces: string[],
    variants: ProviderVariant[],
  ): { variant: ProviderVariant; selectedInterface: string } | null {
    // Try to use the interface resolution logic
    try {
      const technology = chainType.toLowerCase() as 'evm' | 'solana' | 'aztec';
      const resolution = resolveInterface(technology, negotiatedInterfaces);

      // Find variant that supports the selected interface
      const matchingVariant = variants.find((v) =>
        v.supportedInterfaces.includes(resolution.selectedInterface),
      );

      if (matchingVariant) {
        return {
          variant: matchingVariant,
          selectedInterface: resolution.selectedInterface,
        };
      }
    } catch {
      // Fall through to manual matching
    }

    // Manual matching: find best variant based on priority
    let bestMatch: { variant: ProviderVariant; interface: string } | null = null;
    let highestPriority = -1;

    for (const variant of variants) {
      for (const iface of variant.supportedInterfaces) {
        if (negotiatedInterfaces.includes(iface) && variant.priority > highestPriority) {
          bestMatch = { variant, interface: iface };
          highestPriority = variant.priority;
        }
      }
    }

    return bestMatch ? { variant: bestMatch.variant, selectedInterface: bestMatch.interface } : null;
  }

  /**
   * Create an interface-aware provider factory function
   *
   * @returns Interface-aware provider factory function
   * @public
   */
  createInterfaceAwareProviderFactory(): InterfaceAwareProviderFactory {
    return (chainType, transport, initialChainId, logger, negotiatedInterfaces) => {
      return this.createProviderWithInterfaces(
        chainType,
        transport,
        initialChainId,
        logger,
        negotiatedInterfaces,
      );
    };
  }

  /**
   * Register a provider variant
   *
   * @param chainType - Chain type this variant is for
   * @param variant - Provider variant configuration
   * @public
   */
  registerProviderVariant(chainType: ChainType, variant: ProviderVariant): void {
    const variants = this.providerVariants.get(chainType) || [];
    variants.push(variant);
    this.providerVariants.set(chainType, variants);
  }

  /**
   * Get registered variants for a chain type
   *
   * @param chainType - Chain type to get variants for
   * @returns Array of provider variants
   * @public
   */
  getProviderVariants(chainType: ChainType): ProviderVariant[] {
    return this.providerVariants.get(chainType) || [];
  }
}
