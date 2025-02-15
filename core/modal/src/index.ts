export type { DappInfo, WalletInfo, ConnectedWallet, WalletState } from './types.js';
export { ConnectionStatus } from './types.js';
export { TransportType, type Transport, type TransportConfig } from './lib/transports/types.js';
export {
  ConnectorType,
  type Connector,
  type WalletConnectorConfig,
  type AztecConnectorConfig,
  type AztecConnectorOptions,
} from './lib/connectors/types.js';
export { WalletMeshClient } from './lib/client/client.js';
export type { WalletClient, WalletError } from './lib/client/types.js';
export type { WalletContextType } from './components/WalletContext.js';
export type {
  Props as WalletErrorBoundaryProps,
  State as WalletErrorBoundaryState,
} from './components/WalletErrorBoundary.js';
export type { WalletProviderProps } from './components/WalletProvider.js';

export { WalletMeshConfig } from './lib/config/ModalConfig.js';
export type { WalletMeshProviderConfig } from './lib/config/ModalConfig.js';
export { WalletProvider } from './components/WalletProvider.js';
export { ConnectButton } from './components/WalletModal/ConnectButton.js';
export { WalletErrorBoundary } from './components/WalletErrorBoundary.js';
export { useWalletContext as useWallet } from './components/WalletContext.js';
export type { TimeoutConfig } from './lib/utils/timeout.js';
