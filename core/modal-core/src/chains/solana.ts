/**
 * Solana chain configurations
 *
 * @module chains/solana
 * @packageDocumentation
 */

import type { SupportedChain } from '../core/types.js';
import { ChainType } from '../core/types.js';

/**
 * Solana mainnet configuration
 *
 * @example
 * ```typescript
 * import { solanaMainnet } from '@walletmesh/modal/chains';
 *
 * const config: SupportedChainsConfig = {
 *   chainsByTech: {
 *     [ChainType.Solana]: [solanaMainnet]
 *   }
 * };
 * ```
 */
export const solanaMainnet: SupportedChain = {
  chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  chainType: ChainType.Solana,
  name: 'Solana Mainnet',
  required: true,
  label: 'Solana',
  interfaces: ['solana-standard'],
  group: 'solana',
};

/**
 * Solana devnet configuration
 */
export const solanaDevnet: SupportedChain = {
  chainId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  chainType: ChainType.Solana,
  name: 'Solana Devnet',
  required: false,
  label: 'Solana Devnet',
  interfaces: ['solana-standard'],
  group: 'solana',
};

/**
 * Solana testnet configuration
 */
export const solanaTestnet: SupportedChain = {
  chainId: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',
  chainType: ChainType.Solana,
  name: 'Solana Testnet',
  required: false,
  label: 'Solana Testnet',
  interfaces: ['solana-standard'],
  group: 'solana',
};

/**
 * All Solana chains
 */
export const solanaChains: SupportedChain[] = [solanaMainnet, solanaDevnet, solanaTestnet];

/**
 * Solana mainnet chains only
 */
export const solanaMainnets: SupportedChain[] = [solanaMainnet];

/**
 * Solana test chains (devnet and testnet)
 */
export const solanaTestChains: SupportedChain[] = [solanaDevnet, solanaTestnet];
