// Components
export { WalletProvider } from './components/WalletProvider.js';
export { WalletErrorBoundary } from './components/WalletErrorBoundary.js';
export { ConnectButton } from './components/WalletModal/ConnectButton.js';

// Context and Hooks
export { useWalletContext } from './components/WalletContext.js';
export { useWalletModal } from './hooks/useWalletModal.js';

// Types
export type {
  WalletInfo,
  DappInfo,
  ConnectedWallet,
} from './types.js';
export { ConnectionStatus } from './types.js';
export { TransportType } from './lib/transports/types.js';
export { AdapterType } from './lib/adapters/types.js';

export type { WalletError } from './lib/client/types.js';
