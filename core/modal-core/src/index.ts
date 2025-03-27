/**
 * @packageDocumentation
 * WalletMesh Core entry point.
 */

// Client exports
export { WalletMeshClient } from './client/index.js';

// Common types
export {
  type DappInfo,
  type WalletInfo,
  type Provider,
  type Connector,
  type WalletSession,
  ConnectionState,
  type WalletState,
  type ConnectedWallet,
  type WalletConnectorConfig,
} from './types.js';

// Store exports
export {
  createSessionStore,
  type SessionStore,
} from './store/index.js';
