/**
 * Chain configuration exports
 *
 * This module provides pre-configured chain definitions and helper functions
 * for creating multi-chain configurations in WalletMesh applications.
 *
 * @module chains
 * @packageDocumentation
 *
 * @example Basic usage with individual chains
 * ```typescript
 * import { ethereumMainnet, solanaMainnet } from '@walletmesh/modal/chains';
 * import { ChainType } from '@walletmesh/modal';
 *
 * const config: SupportedChainsConfig = {
 *   chainsByTech: {
 *     [ChainType.Evm]: [ethereumMainnet],
 *     [ChainType.Solana]: [solanaMainnet]
 *   }
 * };
 * ```
 *
 * @example Using helper functions
 * ```typescript
 * import { createMainnetConfig } from '@walletmesh/modal/chains';
 *
 * // All mainnet chains
 * const mainnetConfig = createMainnetConfig();
 *
 * // Only EVM mainnet chains
 * const evmOnlyConfig = createMainnetConfig({
 *   includeEvm: true,
 *   includeSolana: false,
 *   includeAztec: false
 * });
 * ```
 *
 * @example Custom configuration with required chains
 * ```typescript
 * import { createCustomConfig, markChainsRequired, ethereumMainnet, polygonMainnet } from '@walletmesh/modal/chains';
 *
 * const config = createCustomConfig({
 *   evm: [ethereumMainnet, polygonMainnet]
 * });
 *
 * // Mark Ethereum as required
 * const configWithRequired = markChainsRequired(config, [1]);
 * ```
 */

// Re-export all chains
export * from './ethereum.js';
export * from './solana.js';
export * from './aztec.js';

// Re-export helper functions
export * from './multichain.js';

// Re-export chain type for convenience
export { ChainType } from '../types.js';
