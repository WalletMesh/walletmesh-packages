/**
 * Wallet adapter implementations
 *
 * @module internal/wallets
 * @packageDocumentation
 */

// Base wallet adapter exports
export { AbstractWalletAdapter } from './base/AbstractWalletAdapter.js';
// Note: WalletAdapter.ts only exports types, not a class

// Built-in wallet adapters
export { EvmAdapter } from './evm/EvmAdapter.js';
export { SolanaAdapter } from './solana/SolanaAdapter.js';
export { AztecAdapter } from './aztec/AztecAdapter.js';
export { DebugWallet } from './debug/DebugWallet.js';
export { MockTransport } from './debug/MockTransport.js';

// Aztec wallet adapters
export { AztecExampleWalletAdapter } from './aztec-example/AztecExampleWalletAdapter.js';

// Wallet registry exports
export { WalletRegistry } from '../registries/wallets/WalletRegistry.js';

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
} from './base/WalletAdapter.js';

// Re-export connection state types
export type { WalletAdapterConnectionState } from '../../api/types/connection.js';

export type {
  WalletConfig,
  AvailableWallet,
} from '../client/WalletMeshClient.js';

// Re-export core types
export type {
  WalletInfo,
  WalletMetadata,
} from '../../types.js';
