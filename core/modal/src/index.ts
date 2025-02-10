// Components
export { WalletMeshProvider } from './components/WalletMeshProvider.js';
export { WalletErrorBoundary } from './components/WalletErrorBoundary.js';
export { WalletModal } from './components/WalletModal/WalletModal.js';

// Hooks
export { useWallet } from './hooks/useWallet.js';
export { useWalletModal } from './hooks/useWalletModal.js';
export { useWalletContext } from './components/WalletContext.js';

// Types
export type {
  WalletInfo,
  DappInfo,
  ConnectedWallet,
  ConnectionStatus,
} from './types.js';

export type { WalletError } from './lib/client/types.js';

// Utils
export { ConnectionManager } from './lib/connection/ConnectionManager.js';
