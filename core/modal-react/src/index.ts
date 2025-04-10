// Context and hooks
export {
  ModalContext,
  useModalContext,
  useModal,
} from './ModalContext.js';

// Walletmesh context and hooks
export {
  WalletmeshContext,
  useWalletmesh,
  type WalletmeshContextType,
  type WalletmeshConfig,
  type WalletInfo,
  type ConnectionStatus,
} from './WalletmeshContext.js';

// Components
export {
  ModalProvider,
  type ModalProviderProps,
} from './ModalProvider.js';

// Walletmesh Provider
export {
  WalletmeshProvider,
  type WalletmeshProviderProps,
} from './WalletmeshProvider.js';

export {
  SelectModal,
  type SelectModalProps,
} from './SelectModal.js';

export {
  ConnectedModal,
  type ConnectedModalProps,
} from './ConnectedModal.js';

// New unified Modal component
export {
  WalletmeshModal,
  type WalletmeshModalProps,
} from './components/WalletmeshModal.js';

// Re-export types from core
export type {
  ModalConfig,
  ModalState,
  ModalAction,
} from '@walletmesh/modal-core';
