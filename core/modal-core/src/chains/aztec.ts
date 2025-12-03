/**
 * Aztec chain configurations
 *
 * @module chains/aztec
 * @packageDocumentation
 */

import type { SupportedChain } from '../core/types.js';
import { ChainType } from '../core/types.js';

/**
 * Aztec mainnet configuration
 *
 * @example
 * ```typescript
 * import { aztecMainnet } from '@walletmesh/modal/chains';
 *
 * const config: SupportedChainsConfig = {
 *   chainsByTech: {
 *     [ChainType.Aztec]: [aztecMainnet]
 *   }
 * };
 * ```
 */
export const aztecMainnet: SupportedChain = {
  chainId: 'aztec:mainnet',
  chainType: ChainType.Aztec,
  name: 'Aztec Mainnet',
  required: true,
  label: 'Aztec',
  interfaces: ['aztec-rpc'],
  group: 'aztec',
};

/**
 * Aztec testnet configuration
 */
export const aztecTestnet: SupportedChain = {
  chainId: 'aztec:testnet',
  chainType: ChainType.Aztec,
  name: 'Aztec Testnet',
  required: false,
  label: 'Aztec Testnet',
  interfaces: ['aztec-rpc'],
  group: 'aztec',
};

/**
 * Aztec sandbox configuration for local development
 */
export const aztecSandbox: SupportedChain = {
  chainId: 'aztec:31337',
  chainType: ChainType.Aztec,
  name: 'Aztec Sandbox',
  required: false,
  label: 'Aztec Sandbox',
  interfaces: ['aztec-rpc'],
  group: 'aztec',
};

/**
 * All Aztec chains
 */
export const aztecChains: SupportedChain[] = [aztecMainnet, aztecTestnet, aztecSandbox];

/**
 * Aztec mainnet chains only
 */
export const aztecMainnets: SupportedChain[] = [aztecMainnet];

/**
 * Aztec test chains (testnet and sandbox)
 */
export const aztecTestChains: SupportedChain[] = [aztecTestnet, aztecSandbox];
