/**
 * Client module exports
 * @internal
 */

export type {
  InternalWalletMeshClient as WalletMeshClientInterface,
  WalletMeshConfig,
  ChainConfig,
  WalletConfig,
  AvailableWallet,
  WalletMeshClient,
  CreateWalletMeshOptions,
  Connection,
} from './WalletMeshClient.js';
export { WalletMeshClient as WalletMeshClientImpl } from './WalletMeshClientImpl.js';
export * from './SafeTransactionManager.js';
export type { BaseProvider, WalletClientState } from './types.js';
