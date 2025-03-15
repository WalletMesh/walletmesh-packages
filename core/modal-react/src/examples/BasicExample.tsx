import React from 'react';
import { ModalProvider, SelectModal, ConnectedModal, useModal } from '../index.js';
import './BasicExample.css';

function WalletControls() {
  const { 
    openSelectModal, 
    openConnectedModal,
    isSelectModalOpen,
    isConnectedModalOpen
  } = useModal();

  return (
    <div className="wallet-controls">
      <button 
        onClick={() => openSelectModal()}
        disabled={isSelectModalOpen || isConnectedModalOpen}
      >
        Connect Wallet
      </button>
      <button 
        onClick={() => openConnectedModal()}
        disabled={isSelectModalOpen || isConnectedModalOpen}
      >
        Show Connected Wallet
      </button>
    </div>
  );
}

function WalletUI() {
  const { closeSelectModal, closeConnectedModal } = useModal();

  return (
    <>
      <WalletControls />
      
      <SelectModal>
        <div className="select-modal-content">
          <h2>Select a Wallet</h2>
          <div className="wallet-list">
            <button 
              onClick={() => {
                console.log('MetaMask selected');
                closeSelectModal();
              }}
            >
              MetaMask
            </button>
            <button 
              onClick={() => {
                console.log('WalletConnect selected');
                closeSelectModal();
              }}
            >
              WalletConnect
            </button>
          </div>
        </div>
      </SelectModal>

      <ConnectedModal>
        <div className="connected-modal-content">
          <h2>Connected Wallet</h2>
          <div className="wallet-info">
            <p>Address: 0x1234...5678</p>
            <p>Balance: 1.234 ETH</p>
          </div>
          <button 
            onClick={() => closeConnectedModal()}
            style={{ marginTop: '1rem' }}
          >
            Close
          </button>
        </div>
      </ConnectedModal>
    </>
  );
}

export function BasicExample() {
  return (
    <ModalProvider
      config={{
        onBeforeOpen: async () => {
          console.log('Modal is about to open');
          return true;
        },
        onAfterOpen: () => {
          console.log('Modal opened');
        },
        onBeforeClose: async () => {
          console.log('Modal is about to close');
          return true;
        },
        onAfterClose: () => {
          console.log('Modal closed');
        },
      }}
    >
      <WalletUI />
    </ModalProvider>
  );
}

// Export for documentation
export const BasicExampleCode = `
import { ModalProvider, SelectModal, ConnectedModal, useModal } from '@walletmesh/modal-react';

function WalletUI() {
  const { openSelectModal, openConnectedModal } = useModal();

  return (
    <>
      <button onClick={openSelectModal}>Connect Wallet</button>
      <button onClick={openConnectedModal}>Show Connected Wallet</button>

      <SelectModal>
        <h2>Select a Wallet</h2>
        {/* Wallet selection UI */}
      </SelectModal>

      <ConnectedModal>
        <h2>Connected Wallet</h2>
        {/* Connected wallet info */}
      </ConnectedModal>
    </>
  );
}

export function App() {
  return (
    <ModalProvider>
      <WalletUI />
    </ModalProvider>
  );
}
`;