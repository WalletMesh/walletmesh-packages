// Context and hooks
export {
  ModalContext,
  useModalContext,
  useModal,
} from './ModalContext.js';

// Components
export {
  ModalProvider,
  type ModalProviderProps,
} from './ModalProvider.js';

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
