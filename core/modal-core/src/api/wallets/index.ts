/**
 * Wallet adapter API exports
 *
 * Provides the base classes, interfaces, and types for implementing wallet adapters
 * in the WalletMesh ecosystem. Wallet adapters handle the connection layer between
 * dApps and specific wallet implementations.
 *
 * **Session Persistence**: As of January 2025, wallet adapters use the unified Zustand
 * store for session persistence. The previously exported WalletStorage utility has been
 * removed in favor of direct Zustand integration in AbstractWalletAdapter.
 *
 * **Key Exports**:
 * - `AbstractWalletAdapter` - Base class for all wallet adapters with built-in Zustand persistence
 * - Wallet adapter interfaces and types
 * - Connection state types
 * - Wallet metadata types
 *
 * @see {@link AbstractWalletAdapter} for adapter session persistence implementation
 * @see {@link ../../state/store.ts} for the unified Zustand store
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
