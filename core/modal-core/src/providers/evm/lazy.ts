/**
 * Lazy-loaded EVM provider utilities.
 *
 * These utilities are exported separately from the main modal-core package
 * to avoid bundling issues with optional dependencies.
 *
 * @module @walletmesh/modal-core/providers/evm/lazy
 *
 * @example
 * ```typescript
 * // Import only when you need EVM utilities and have the libraries installed
 * import { ethersModule, formatEther, parseEther } from '@walletmesh/modal-core/providers/evm/lazy';
 *
 * // Or for web3.js
 * import { web3Module } from '@walletmesh/modal-core/providers/evm/lazy';
 *
 * // Or for viem
 * import { viemModule } from '@walletmesh/modal-core/providers/evm/lazy';
 * ```
 */

// Re-export all lazy loading utilities for EVM
export {
  ethersModule,
  web3Module,
  viemModule,
  formatEther,
  parseEther,
  getAddress,
  isAddress,
  detectEvmLibrary,
  formatWeiToEther,
} from '../eip1193-lazy.js';

// Re-export the LazyModule type for convenience
export type { LazyModule } from '../../utils/lazy/createLazyModule.js';
