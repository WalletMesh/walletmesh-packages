/**
 * Chain constants and utilities (convenient re-export)
 *
 * This module provides a convenient import path for chain constants,
 * similar to wagmi's `/chains` export.
 *
 * @module chains
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * // wagmi-style imports
 * import { ethereumMainnet, polygonMainnet, solanaMainnet } from '@walletmesh/modal-react/chains';
 *
 * // Custom chain creation
 * import { SupportedChain, createCustomConfig } from '@walletmesh/modal-react/chains';
 *
 * const myChain: SupportedChain = {
 *   chainId: 'eip155:999999',
 *   required: false,
 *   label: 'My Layer 2',
 *   interfaces: ['eip1193'],
 *   group: 'custom'
 * };
 *
 * const config = createCustomConfig({
 *   evm: [ethereumMainnet, myChain],
 *   solana: [solanaMainnet]
 * });
 * ```
 */

// Re-export everything from modal-core chains
export {
  // Individual chain constants (wagmi-style)
  ethereumMainnet,
  ethereumSepolia,
  ethereumHolesky,
  polygonMainnet,
  polygonAmoy,
  arbitrumOne,
  arbitrumSepolia,
  optimismMainnet,
  optimismSepolia,
  baseMainnet,
  baseSepolia,
  solanaMainnet,
  solanaDevnet,
  solanaTestnet,
  aztecSandbox,
  aztecTestnet,
  aztecMainnet,
  // Chain arrays for convenience
  evmMainnets,
  evmTestnets,
  evmChains,
  solanaMainnets,
  solanaTestChains,
  solanaChains,
  aztecMainnets,
  aztecTestChains,
  aztecChains,
  // Helper functions
  createMainnetConfig,
  createTestnetConfig,
  createAllChainsConfig,
  createCustomConfig,
  markChainsRequired,
  filterChainsByGroup,
  isChainSupported,
  getRequiredChains,
  // Core types
  type SupportedChain,
  type SupportedChainsConfig,
  // Re-export ChainType for convenience (for individual chain types)
  ChainType,
} from '@walletmesh/modal-core';
