/**
 * Wallet-focused type exports
 *
 * Import path: @walletmesh/modal-core/types/wallet
 *
 * This focused export provides only wallet-related types
 * for better tree-shaking and cleaner imports.
 */

export type { Wallet } from './baseTypes.js';

export type {
  ChainType,
  WalletInfo,
} from '../types.js';

export type { ChainWithMetadata } from './baseTypes.js';

export { isWallet } from './coreTypes.js';
