/**
 * Provider API exports
 *
 * @module api/providers
 * @packageDocumentation
 */

// Base provider exports
export { BaseWalletProvider } from '../../internal/providers/base/BaseWalletProvider.js';
export type { WalletProviderContext } from '../../internal/providers/base/BaseWalletProvider.js';

// Re-export provider types for convenience
export type {
  WalletProvider,
  WalletMethodMap,
  WalletEventMap,
  ProviderClass,
} from '../types/providers.js';

// Nemi SDK Account provider
export {
  createWalletMeshAccount,
  WalletMeshAccount,
} from './nemi-account.js';
export type { NemiAccount } from './nemi-account.js';
