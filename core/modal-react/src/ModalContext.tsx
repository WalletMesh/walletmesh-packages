import { createContext, useContext } from 'react';
import type { ModalController } from '@walletmesh/modal-core';

export const ModalContext = createContext<ModalController | null>(null);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
}

export function useModal() {
  const modalController = useModalContext();

  const modalState = modalController.getState();

  return {
    isSelectModalOpen: modalState.isOpen,
    isConnectedModalOpen: modalState.currentView === 'connected',
    openSelectModal: () => modalController.open(),
    closeSelectModal: () => modalController.close(),
    openConnectedModal: () => modalController.open(),
    closeConnectedModal: () => modalController.close(),
  };
}