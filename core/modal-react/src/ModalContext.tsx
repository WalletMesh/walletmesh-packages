import { createContext, useContext } from 'react';
import type { ModalStore } from '@walletmesh/modal-core';

export const ModalContext = createContext<ModalStore | null>(null);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}

export function useModal() {
  const {
    isSelectModalOpen,
    isConnectedModalOpen,
    openSelectModal,
    closeSelectModal,
    openConnectedModal,
    closeConnectedModal,
  } = useModalContext();

  return {
    isSelectModalOpen,
    isConnectedModalOpen,
    openSelectModal,
    closeSelectModal,
    openConnectedModal,
    closeConnectedModal,
  };
}