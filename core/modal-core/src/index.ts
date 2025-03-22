/**
 * @packageDocumentation
 * Core exports for WalletMesh
 */

export {
  type DappInfo,
  type WalletInfo,
  type ConnectedWallet,
  type WalletSession,
  type SessionStore,
  type Provider,
  type WalletState,
  type ChainConnection,
  type WalletConnectorConfig,
  ConnectionStatus,
} from './types.js';

export {
  type SessionStore as ISessionStore,
  defaultSessionStore,
  createSessionStore,
} from './store/sessionStore.js';

export {
  defaultSessionStoreAdapter,
  type SessionStoreAdapter,
} from './store/sessionStoreAdapter.js';

export {
  WalletError,
  ErrorCode,
} from './errors.js';
