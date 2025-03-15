/**
 * @packageDocumentation
 * Main entry point for WalletMesh Core package.
 */

// Core types and interfaces
export {
  ConnectionStatus,
  type WalletInfo,
  type WalletState,
  type ConnectedWallet,
  type WalletConnectorConfig,
  type ConnectorImplementationConfig,
  type Connector,
  type DappInfo,
  type ChainConnection,
  type SessionToken,
  type WalletClient,
  type WalletSession,
} from './types.js';

// Transport layer
export {
  type Transport,
  type Protocol,
  type Message,
  type MessageHandler,
  type ProtocolPayload,
  type TransportOptions,
  MessageType,
  TransportError,
  TransportErrorCode,
} from './transport/index.js';

// JSON-RPC implementation
export {
  JsonRpcProtocol,
  type JsonRpcMethodCall,
  type JsonRpcError,
  type JsonRpcPayload,
} from './transport/json-rpc.js';

// Window transport
export {
  WindowTransport,
  type WindowTransportOptions,
} from './transport/window.js';

// Connector system
export {
  BaseConnector,
  type ConnectorMessages,
} from './connector/base.js';

export {
  MockConnector,
  type MockProvider,
  type MockMessages,
  type MockConnectorConfig,
} from './connector/mock.js';

export {
  connectorRegistry,
  ConnectorRegistry,
} from './connector/registry.js';

// Store implementations
export {
  createModalStore,
  defaultModalStore,
  type ModalConfig,
  type ModalStore,
  type UseModalStore,
} from './store/modalStore.js';

export {
  createSessionStore,
  defaultSessionStore,
  type SessionStore,
  type UseSessionStore,
} from './store/sessionStore.js';
