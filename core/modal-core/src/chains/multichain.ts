/**
 * Multi-chain configuration helpers
 *
 * @module chains/multichain
 * @packageDocumentation
 */

import { ChainType, type SupportedChain } from '../core/types.js';
import type { SupportedChainsConfig } from '../types.js';

import { aztecChains, aztecMainnets, aztecTestChains } from './aztec.js';
import { evmChains, evmMainnets, evmTestnets } from './ethereum.js';
import { solanaChains, solanaMainnets, solanaTestChains } from './solana.js';

/**
 * Create a multi-chain configuration with mainnet chains only
 *
 * @example
 * ```typescript
 * import { createMainnetConfig } from '@walletmesh/modal/chains';
 *
 * // All mainnets
 * const config = createMainnetConfig();
 *
 * // Only EVM and Solana mainnets
 * const evmSolanaConfig = createMainnetConfig({
 *   includeEvm: true,
 *   includeSolana: true,
 *   includeAztec: false
 * });
 * ```
 */
export function createMainnetConfig(options?: {
  includeEvm?: boolean;
  includeSolana?: boolean;
  includeAztec?: boolean;
  allowMultipleWalletsPerChain?: boolean;
  allowFallbackChains?: boolean;
}): SupportedChainsConfig {
  const {
    includeEvm = true,
    includeSolana = true,
    includeAztec = true,
    allowMultipleWalletsPerChain = false,
    allowFallbackChains = false,
  } = options || {};

  const chainsByTech: Record<string, SupportedChain[]> = {};

  if (includeEvm) {
    chainsByTech[ChainType.Evm] = evmMainnets;
  }

  if (includeSolana) {
    chainsByTech[ChainType.Solana] = solanaMainnets;
  }

  if (includeAztec) {
    chainsByTech[ChainType.Aztec] = aztecMainnets;
  }

  return {
    chainsByTech,
    allowMultipleWalletsPerChain,
    allowFallbackChains,
  };
}

/**
 * Create a multi-chain configuration with testnet chains only
 *
 * @example
 * ```typescript
 * import { createTestnetConfig } from '@walletmesh/modal/chains';
 *
 * // All testnets
 * const config = createTestnetConfig();
 *
 * // Only EVM testnets
 * const evmTestConfig = createTestnetConfig({
 *   includeEvm: true,
 *   includeSolana: false,
 *   includeAztec: false
 * });
 * ```
 */
export function createTestnetConfig(options?: {
  includeEvm?: boolean;
  includeSolana?: boolean;
  includeAztec?: boolean;
  allowMultipleWalletsPerChain?: boolean;
  allowFallbackChains?: boolean;
}): SupportedChainsConfig {
  const {
    includeEvm = true,
    includeSolana = true,
    includeAztec = true,
    allowMultipleWalletsPerChain = false,
    allowFallbackChains = false,
  } = options || {};

  const chainsByTech: Record<string, SupportedChain[]> = {};

  if (includeEvm) {
    chainsByTech[ChainType.Evm] = evmTestnets;
  }

  if (includeSolana) {
    chainsByTech[ChainType.Solana] = solanaTestChains;
  }

  if (includeAztec) {
    chainsByTech[ChainType.Aztec] = aztecTestChains;
  }

  return {
    chainsByTech,
    allowMultipleWalletsPerChain,
    allowFallbackChains,
  };
}

/**
 * Create a multi-chain configuration with all available chains
 *
 * @example
 * ```typescript
 * import { createAllChainsConfig } from '@walletmesh/modal/chains';
 *
 * // All chains (mainnet and testnet)
 * const config = createAllChainsConfig();
 *
 * // With custom options
 * const customConfig = createAllChainsConfig({
 *   allowMultipleWalletsPerChain: true,
 *   allowFallbackChains: true
 * });
 * ```
 */
export function createAllChainsConfig(options?: {
  allowMultipleWalletsPerChain?: boolean;
  allowFallbackChains?: boolean;
}): SupportedChainsConfig {
  const { allowMultipleWalletsPerChain = false, allowFallbackChains = false } = options || {};

  return {
    chainsByTech: {
      [ChainType.Evm]: evmChains,
      [ChainType.Solana]: solanaChains,
      [ChainType.Aztec]: aztecChains,
    },
    allowMultipleWalletsPerChain,
    allowFallbackChains,
  };
}

/**
 * Create a custom chain configuration
 *
 * @example
 * ```typescript
 * import { createCustomConfig, ethereumMainnet, solanaMainnet } from '@walletmesh/modal/chains';
 *
 * // Custom selection of chains
 * const config = createCustomConfig({
 *   evm: [ethereumMainnet],
 *   solana: [solanaMainnet],
 *   aztec: []
 * });
 * ```
 */
export function createCustomConfig(
  chains: Partial<Record<ChainType, SupportedChain[]>>,
  options?: {
    allowMultipleWalletsPerChain?: boolean;
    allowFallbackChains?: boolean;
  },
): SupportedChainsConfig {
  const { allowMultipleWalletsPerChain = false, allowFallbackChains = false } = options || {};

  const chainsByTech: Record<string, SupportedChain[]> = {};

  // Only add chain types that have at least one chain
  for (const [chainType, chainList] of Object.entries(chains)) {
    if (chainList && chainList.length > 0) {
      chainsByTech[chainType] = chainList;
    }
  }

  return {
    chainsByTech,
    allowMultipleWalletsPerChain,
    allowFallbackChains,
  };
}

/**
 * Mark specific chains as required in a configuration
 *
 * @example
 * ```typescript
 * import { createMainnetConfig, markChainsRequired } from '@walletmesh/modal/chains';
 *
 * const config = createMainnetConfig();
 * const requiredConfig = markChainsRequired(config, ['eip155:1', 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp']); // Ethereum and Solana required
 * ```
 */
export function markChainsRequired(
  config: SupportedChainsConfig,
  requiredChainIds: Array<string>,
): SupportedChainsConfig {
  const newChainsByTech: Record<string, SupportedChain[]> = {};

  for (const [chainType, chains] of Object.entries(config.chainsByTech)) {
    newChainsByTech[chainType] = chains.map((chain) => ({
      ...chain,
      required: requiredChainIds.includes(chain.chainId),
    }));
  }

  return {
    ...config,
    chainsByTech: newChainsByTech,
  };
}

/**
 * Filter chains by group
 *
 * @example
 * ```typescript
 * import { evmChains, filterChainsByGroup } from '@walletmesh/modal/chains';
 *
 * // Get only Ethereum chains
 * const ethereumChains = filterChainsByGroup(evmChains, 'ethereum');
 *
 * // Get Polygon chains
 * const polygonChains = filterChainsByGroup(evmChains, 'polygon');
 * ```
 */
export function filterChainsByGroup(chains: SupportedChain[], group: string): SupportedChain[] {
  return chains.filter((chain) => chain.group === group);
}

/**
 * Check if a chain ID is supported in a configuration
 *
 * @example
 * ```typescript
 * import { createMainnetConfig, isChainSupported } from '@walletmesh/modal/chains';
 *
 * const config = createMainnetConfig();
 * const isEthereumSupported = isChainSupported(config, 'eip155:1'); // true
 * const isTestnetSupported = isChainSupported(config, 'eip155:11155111'); // false
 * ```
 */
export function isChainSupported(config: SupportedChainsConfig, chainId: string): boolean {
  return Object.values(config.chainsByTech)
    .flat()
    .some((chain) => chain.chainId === chainId);
}

/**
 * Get all required chains from a configuration
 *
 * @example
 * ```typescript
 * import { createMainnetConfig, getRequiredChains } from '@walletmesh/modal/chains';
 *
 * const config = createMainnetConfig();
 * const requiredChains = getRequiredChains(config);
 * ```
 */
export function getRequiredChains(config: SupportedChainsConfig): SupportedChain[] {
  return Object.values(config.chainsByTech)
    .flat()
    .filter((chain) => chain.required);
}
