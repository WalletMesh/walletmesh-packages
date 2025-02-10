// Export public types
export type {
  Adapter,
  Transport,
  WalletInfo,
  ConnectedWallet,
  TransportOptions,
  AdapterOptions,
  DappInfo
} from './lib/types.js';

// Export enums
export {
  TransportType,
  AdapterType,
  ConnectionStatus
} from './lib/types.js';

// Export client
export { WalletMeshClient } from './lib/client/index.js';

// Export transports
export {
  BaseTransport,
  PostMessageTransport
} from './lib/transports/index.js';
