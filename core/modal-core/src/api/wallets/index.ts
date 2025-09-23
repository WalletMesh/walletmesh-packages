/**
 * Wallet adapter API exports
 *
 * @module api/wallets
 * @packageDocumentation
 */

// Base wallet adapter exports
export { AbstractWalletAdapter } from '../../internal/wallets/base/AbstractWalletAdapter.js';
// Note: WalletAdapter.ts only exports types, not a class

// Aztec wallet adapter exports
// Note: AztecAdapter has been deprecated and removed. Use AztecRouterProvider from @walletmesh/aztec-rpc-wallet instead.
export { AztecExampleWalletAdapter } from '../../internal/wallets/aztec-example/AztecExampleWalletAdapter.js';

// Re-export wallet adapter types
export type {
  WalletAdapter as WalletAdapterInterface,
  ConnectOptions,
  WalletCapabilities,
  WalletAdapterMetadata,
  AdapterContext,
  WalletFeature,
  ChainDefinition,
  DetectionResult,
} from '../../internal/wallets/base/WalletAdapter.js';

// Re-export connection state types
export type {
  WalletAdapterConnectionState,
  WalletConnection,
} from '../types/connection.js';

// Re-export client types
export type {
  WalletConfig,
  AvailableWallet,
} from '../../internal/client/WalletMeshClient.js';

// Re-export core types
export type {
  WalletInfo,
  WalletMetadata,
} from '../../types.js';

// Re-export storage types used by AbstractWalletAdapter
export { WalletStorage } from '../../internal/utils/dom/storage.js';
export type { AdapterSessionData } from '../../internal/utils/dom/storage.js';
