/**
 * Factory functions for creating discovery service configurations
 *
 * This module provides convenient factory functions to create discovery
 * configurations for common scenarios, with built-in capability requirements
 * and chain mappings.
 *
 * @module client/discovery/factory
 */

import { ChainType } from '../../types.js';
import type { DiscoveryConfig } from '../DiscoveryService.js';
import {
  chainTypesToDiscoveryChains,
  getFeaturesForChainTypes,
  getInterfacesForChainTypes,
  normalizeChainId,
} from '../types/discoveryMappings.js';

/**
 * Custom discovery configuration with additional options
 */
export interface CustomDiscoveryConfig extends DiscoveryConfig {
  /** Custom chain IDs (overrides default mappings) */
  customChains?: string[];
  /** Custom features (overrides defaults) */
  customFeatures?: string[];
  /** Custom interfaces (overrides defaults) */
  customInterfaces?: string[];
}

/**
 * Create a discovery configuration for EVM-based dApps
 *
 * @param options - Configuration options
 * @returns Complete discovery configuration
 *
 * @example
 * ```typescript
 * const discoveryConfig = createEVMDiscoveryConfig({
 *   customChains: ['evm:1', 'evm:137', 'evm:42161'],
 *   timeout: 5000
 * });
 * ```
 */
export function createEVMDiscoveryConfig(options: Partial<CustomDiscoveryConfig> = {}): DiscoveryConfig {
  const chainTypes: ChainType[] = [ChainType.Evm];

  // Get chains - either custom or defaults for EVM
  const defaultChainList = chainTypesToDiscoveryChains(chainTypes);
  let chains: string[];

  if (options.customChains && options.customChains.length > 0) {
    chains = options.customChains.map(normalizeChainId);
  } else if (options.capabilities?.chains && options.capabilities.chains.length > 0) {
    // Merge with defaults if chains provided via capabilities
    const normalizedChains = options.capabilities.chains.map(normalizeChainId);
    chains = [...new Set([...defaultChainList, ...normalizedChains])];
  } else {
    chains = defaultChainList;
  }

  const result: DiscoveryConfig = {
    enabled: true,
    timeout: options.timeout ?? 5000,
    retryInterval: options.retryInterval ?? 30000,
    supportedChainTypes: chainTypes,
    capabilities: {
      chains,
      features:
        options.customFeatures || options.capabilities?.features || getFeaturesForChainTypes(chainTypes),
      interfaces:
        options.customInterfaces ||
        options.capabilities?.interfaces ||
        getInterfacesForChainTypes(chainTypes),
    },
    dappInfo: options.dappInfo || {
      name: 'EVM DApp',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
    },
    security: {
      enableOriginValidation: true,
      enableRateLimiting: true,
      ...options.security,
    },
  };

  // Merge remaining options but don't override what we've already set
  const excludedKeys = [
    'timeout',
    'retryInterval',
    'capabilities',
    'dappInfo',
    'security',
    'customChains',
    'customFeatures',
    'customInterfaces',
  ];
  for (const key of Object.keys(options)) {
    if (!excludedKeys.includes(key)) {
      (result as Record<string, unknown>)[key] = (options as Record<string, unknown>)[key];
    }
  }

  return result;
}

/**
 * Create a discovery configuration for Solana dApps
 *
 * @param options - Configuration options
 * @returns Complete discovery configuration
 *
 * @example
 * ```typescript
 * const discoveryConfig = createSolanaDiscoveryConfig({
 *   name: 'My Solana App',
 *   url: 'https://mysolanaapp.com',
 *   icon: 'https://mysolanaapp.com/icon.png'
 * });
 * ```
 */
export function createSolanaDiscoveryConfig(options: Partial<CustomDiscoveryConfig> = {}): DiscoveryConfig {
  const chainTypes: ChainType[] = [ChainType.Solana];

  // Get chains - either custom or defaults for Solana
  const defaultChainList = chainTypesToDiscoveryChains(chainTypes);
  let chains: string[];

  if (options.customChains && options.customChains.length > 0) {
    chains = options.customChains.map(normalizeChainId);
  } else if (options.capabilities?.chains && options.capabilities.chains.length > 0) {
    // Merge with defaults if chains provided via capabilities
    const normalizedChains = options.capabilities.chains.map(normalizeChainId);
    chains = [...new Set([...defaultChainList, ...normalizedChains])];
  } else {
    chains = defaultChainList;
  }

  const result: DiscoveryConfig = {
    enabled: true,
    timeout: options.timeout ?? 5000,
    retryInterval: options.retryInterval ?? 30000,
    supportedChainTypes: chainTypes,
    capabilities: {
      chains,
      features:
        options.customFeatures || options.capabilities?.features || getFeaturesForChainTypes(chainTypes),
      interfaces:
        options.customInterfaces ||
        options.capabilities?.interfaces ||
        getInterfacesForChainTypes(chainTypes),
    },
    dappInfo: options.dappInfo || {
      name: 'Solana DApp',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
    },
    security: {
      enableOriginValidation: true,
      enableRateLimiting: true,
      ...options.security,
    },
  };

  // Merge remaining options but don't override what we've already set
  const excludedKeys = [
    'timeout',
    'retryInterval',
    'capabilities',
    'dappInfo',
    'security',
    'customChains',
    'customFeatures',
    'customInterfaces',
  ];
  for (const key of Object.keys(options)) {
    if (!excludedKeys.includes(key)) {
      (result as Record<string, unknown>)[key] = (options as Record<string, unknown>)[key];
    }
  }

  return result;
}

/**
 * Create a discovery configuration for multi-chain dApps
 *
 * @param chainTypes - Array of chain types to support
 * @param options - Configuration options
 * @returns Complete discovery configuration
 *
 * @example
 * ```typescript
 * const discoveryConfig = createMultiChainDiscoveryConfig({
 *   name: 'Cross-Chain DeFi',
 *   url: 'https://crosschain.com',
 *   icon: 'https://crosschain.com/icon.png'
 * }, ['evm', 'solana'], {
 *   customChains: ['evm:1', 'evm:137', 'solana:mainnet'],
 *   timeout: 7000
 * });
 * ```
 */
export function createMultiChainDiscoveryConfig(
  chainTypes: ChainType[],
  options: Partial<CustomDiscoveryConfig> = {},
): DiscoveryConfig {
  // Get chains - either custom or defaults for specified chain types
  const defaultChainList = chainTypesToDiscoveryChains(chainTypes);
  let chains: string[];

  if (options.customChains && options.customChains.length > 0) {
    chains = options.customChains.map(normalizeChainId);
  } else if (options.capabilities?.chains && options.capabilities.chains.length > 0) {
    // Merge with defaults if chains provided via capabilities
    const normalizedChains = options.capabilities.chains.map(normalizeChainId);
    chains = [...new Set([...defaultChainList, ...normalizedChains])];
  } else {
    chains = defaultChainList;
  }

  const result: DiscoveryConfig = {
    enabled: true,
    timeout: options.timeout ?? 7000, // Longer timeout for multi-chain
    retryInterval: options.retryInterval ?? 30000,
    supportedChainTypes: chainTypes,
    capabilities: {
      chains,
      features:
        options.customFeatures || options.capabilities?.features || getFeaturesForChainTypes(chainTypes),
      interfaces:
        options.customInterfaces ||
        options.capabilities?.interfaces ||
        getInterfacesForChainTypes(chainTypes),
    },
    dappInfo: options.dappInfo || {
      name: 'Multi-Chain DApp',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
    },
    security: {
      enableOriginValidation: true,
      enableRateLimiting: true,
      ...options.security,
    },
  };

  // Merge remaining options but don't override what we've already set
  const excludedKeys = [
    'timeout',
    'retryInterval',
    'capabilities',
    'dappInfo',
    'security',
    'customChains',
    'customFeatures',
    'customInterfaces',
  ];
  for (const key of Object.keys(options)) {
    if (!excludedKeys.includes(key)) {
      (result as Record<string, unknown>)[key] = (options as Record<string, unknown>)[key];
    }
  }

  return result;
}

/**
 * Create a discovery configuration with custom capability requirements
 *
 * @param capabilities - Custom capability requirements
 * @param options - Configuration options
 * @returns Complete discovery configuration
 *
 * @example
 * ```typescript
 * const discoveryConfig = createCustomDiscoveryConfig({
 *   name: 'Advanced DApp',
 *   url: 'https://advanced.com'
 * }, {
 *   chains: ['evm:1', 'evm:137', 'aztec:mainnet'],
 *   features: ['account-management', 'private-transactions', 'batch-signing'],
 *   interfaces: ['eip-1193', 'aztec-wallet']
 * });
 * ```
 */
export function createCustomDiscoveryConfig(
  capabilities: {
    chains?: string[];
    features?: string[];
    interfaces?: string[];
  },
  options: Partial<DiscoveryConfig> = {},
): DiscoveryConfig {
  // Normalize and dedupe chain IDs
  const chainSet = new Set<string>();
  if (capabilities.chains) {
    for (const chain of capabilities.chains) {
      chainSet.add(normalizeChainId(chain));
    }
  }
  const normalizedChains = Array.from(chainSet);

  // Infer chain types from provided chains
  const chainTypes = new Set<ChainType>();
  for (const chain of normalizedChains) {
    if (chain.startsWith('eip155:')) chainTypes.add(ChainType.Evm);
    else if (chain.startsWith('solana:')) chainTypes.add(ChainType.Solana);
    else if (chain.startsWith('aztec:')) chainTypes.add(ChainType.Aztec);
  }

  return {
    enabled: true,
    timeout: options.timeout || 5000,
    retryInterval: options.retryInterval || 30000,
    supportedChainTypes: Array.from(chainTypes),
    capabilities: {
      ...(normalizedChains.length > 0 && { chains: normalizedChains }),
      features: capabilities.features || [],
      interfaces: capabilities.interfaces || [],
    },
    dappInfo: options.dappInfo || {
      name: 'Custom DApp',
      url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
    },
    ...options,
  };
}

/**
 * Create a minimal discovery configuration for testing
 *
 * @param overrides - Configuration overrides
 * @returns Minimal discovery configuration
 *
 * @example
 * ```typescript
 * const discoveryConfig = createTestDiscoveryConfig({
 *   timeout: 1000,
 *   supportedChainTypes: ['evm']
 * });
 * ```
 */
export function createTestDiscoveryConfig(overrides: Partial<DiscoveryConfig> = {}): DiscoveryConfig {
  const chainTypes = overrides.supportedChainTypes || [ChainType.Evm];

  return {
    enabled: true,
    timeout: 1000,
    retryInterval: 5000,
    maxAttempts: 3,
    supportedChainTypes: chainTypes,
    capabilities: {
      features: ['account-management'],
      interfaces: ['eip-1193'],
    },
    dappInfo: {
      name: 'Test Initiator',
      url: 'http://localhost:3000',
      description: 'Test environment',
    },
    ...overrides,
  };
}

/**
 * Notes for future enhancements:
 *
 * 1. Chain Detection:
 *    - Add automatic chain detection based on user's installed wallets
 *    - Implement dynamic chain support updates
 *
 * 2. Feature Negotiation:
 *    - Add capability negotiation helpers
 *    - Implement fallback strategies for missing features
 *
 * 3. Performance Optimization:
 *    - Add discovery caching for repeat sessions
 *    - Implement parallel discovery for multiple protocols
 *
 * 4. Security Enhancements:
 *    - Add origin verification helpers
 *    - Implement secure communication channel setup
 *
 * 5. Developer Experience:
 *    - Add discovery simulation for development
 *    - Implement discovery result preview tools
 */
