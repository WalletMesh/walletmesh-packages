/**
 * Core client exports
 */
export { WalletClient } from './client/client.js';
export { createWalletStore, type WalletStore } from './client/store.js';

/**
 * Type exports
 */
export type {
  WalletClientConfig,
  WalletClientState,
  WalletClientFactory,
  ConnectionResult,
  ConnectOptions,
} from './types/client.js';

/**
 * Chain exports
 */
export { ChainType } from './types/chains.js';
export type { ChainConfig, ChainRegistry } from './types/chains.js';

/**
 * Event exports
 */
export { ClientEventType } from './types/events.js';
export type {
  WalletClientEvent,
  EventListener,
  ConnectingEvent,
  ConnectedEvent,
  DisconnectedEvent,
  ChainChangedEvent,
  AccountsChangedEvent,
  ErrorEvent,
} from './types/events.js';

/**
 * Provider exports
 */
export { ProviderInterface } from './types/providers.js';
export type {
  BaseProvider,
  ProviderCapability,
  EIP1193Provider,
  EIP6963Provider,
  EIP6963ProviderInfo,
  EthersProvider,
  NativeProvider,
} from './types/providers.js';

/**
 * Error exports
 */
export {
  ProviderNotSupportedError,
  ProviderMethodNotSupportedError,
} from './types/providers.js';
export { ChainNotSupportedError } from './types/chains.js';

/**
 * Storage utilities
 */
export { WalletStorage, type StorageConfig } from './utils/storage.js';
