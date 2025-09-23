/**
 * Core client functionality exports
 * @module api/core
 */

export * from './createWalletClient.js';
export * from './createWalletClient.singleton.js';
export * from './modal.js';
export * from './headless.js';

// Export client interfaces for dApp interaction
export type {
  InternalWalletMeshClient,
  WalletMeshConfig,
  ChainConfig,
  WalletConfig,
  AvailableWallet,
} from '../../internal/client/WalletMeshClient.js';
