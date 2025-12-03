/**
 * Ethereum chain configurations
 *
 * @module chains/ethereum
 * @packageDocumentation
 */

import type { SupportedChain } from '../core/types.js';
import { ChainType } from '../core/types.js';

/**
 * Ethereum mainnet configuration
 *
 * @example
 * ```typescript
 * import { ethereumMainnet } from '@walletmesh/modal/chains';
 *
 * const config: SupportedChainsConfig = {
 *   chainsByTech: {
 *     [ChainType.Evm]: [ethereumMainnet]
 *   }
 * };
 * ```
 */
export const ethereumMainnet: SupportedChain = {
  chainId: 'eip155:1',
  chainType: ChainType.Evm,
  name: 'Ethereum Mainnet',
  required: true,
  label: 'Ethereum',
  interfaces: ['eip1193'],
  group: 'ethereum',
};

/**
 * Ethereum Sepolia testnet configuration
 */
export const ethereumSepolia: SupportedChain = {
  chainId: 'eip155:11155111',
  chainType: ChainType.Evm,
  name: 'Ethereum Sepolia',
  required: false,
  label: 'Sepolia',
  interfaces: ['eip1193'],
  group: 'ethereum',
};

/**
 * Ethereum Holesky testnet configuration
 */
export const ethereumHolesky: SupportedChain = {
  chainId: 'eip155:17000',
  chainType: ChainType.Evm,
  name: 'Ethereum Holesky',
  required: false,
  label: 'Holesky',
  interfaces: ['eip1193'],
  group: 'ethereum',
};

/**
 * Polygon mainnet configuration
 */
export const polygonMainnet: SupportedChain = {
  chainId: 'eip155:137',
  chainType: ChainType.Evm,
  name: 'Polygon Mainnet',
  required: false,
  label: 'Polygon',
  interfaces: ['eip1193'],
  group: 'polygon',
};

/**
 * Polygon Amoy testnet configuration
 */
export const polygonAmoy: SupportedChain = {
  chainId: 'eip155:80002',
  chainType: ChainType.Evm,
  name: 'Polygon Amoy Testnet',
  required: false,
  label: 'Polygon Amoy',
  interfaces: ['eip1193'],
  group: 'polygon',
};

/**
 * Arbitrum One mainnet configuration
 */
export const arbitrumOne: SupportedChain = {
  chainId: 'eip155:42161',
  chainType: ChainType.Evm,
  name: 'Arbitrum One',
  required: false,
  label: 'Arbitrum One',
  interfaces: ['eip1193'],
  group: 'arbitrum',
};

/**
 * Arbitrum Sepolia testnet configuration
 */
export const arbitrumSepolia: SupportedChain = {
  chainId: 'eip155:421614',
  chainType: ChainType.Evm,
  name: 'Arbitrum Sepolia Testnet',
  required: false,
  label: 'Arbitrum Sepolia',
  interfaces: ['eip1193'],
  group: 'arbitrum',
};

/**
 * Optimism mainnet configuration
 */
export const optimismMainnet: SupportedChain = {
  chainId: 'eip155:10',
  chainType: ChainType.Evm,
  name: 'Optimism Mainnet',
  required: false,
  label: 'Optimism',
  interfaces: ['eip1193'],
  group: 'optimism',
};

/**
 * Optimism Sepolia testnet configuration
 */
export const optimismSepolia: SupportedChain = {
  chainId: 'eip155:11155420',
  chainType: ChainType.Evm,
  name: 'Optimism Sepolia Testnet',
  required: false,
  label: 'Optimism Sepolia',
  interfaces: ['eip1193'],
  group: 'optimism',
};

/**
 * Base mainnet configuration
 */
export const baseMainnet: SupportedChain = {
  chainId: 'eip155:8453',
  chainType: ChainType.Evm,
  name: 'Base Mainnet',
  required: false,
  label: 'Base',
  interfaces: ['eip1193'],
  group: 'base',
};

/**
 * Base Sepolia testnet configuration
 */
export const baseSepolia: SupportedChain = {
  chainId: 'eip155:84532',
  chainType: ChainType.Evm,
  name: 'Base Sepolia Testnet',
  required: false,
  label: 'Base Sepolia',
  interfaces: ['eip1193'],
  group: 'base',
};

/**
 * All EVM mainnet chains
 */
export const evmMainnets: SupportedChain[] = [
  ethereumMainnet,
  polygonMainnet,
  arbitrumOne,
  optimismMainnet,
  baseMainnet,
];

/**
 * All EVM testnet chains
 */
export const evmTestnets: SupportedChain[] = [
  ethereumSepolia,
  ethereumHolesky,
  polygonAmoy,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
];

/**
 * All EVM chains (mainnet and testnet)
 */
export const evmChains: SupportedChain[] = [...evmMainnets, ...evmTestnets];
