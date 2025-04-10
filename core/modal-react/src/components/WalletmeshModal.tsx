import React, { useState, useEffect } from 'react';
import { useModalContext } from '../ModalContext.js';
import './WalletmeshModal.css';
import type { ModalState } from '@walletmesh/modal-core';

export interface WalletmeshModalProps {
  /** Custom class name for the modal container */
  className?: string;
  /** Custom styles for the modal container */
  style?: React.CSSProperties;
  /** Function to render a custom close button */
  renderCloseButton?: () => React.ReactNode;
  /** Custom wallet list to display in the modal */
  wallets?: Array<{
    id: string;
    name: string;
    iconUrl?: string;
  }>;
  /** Theme for the modal - light or dark */
  theme?: 'light' | 'dark' | 'system';
}

/**
 * Modal component for wallet selection and connection
 * Handles both wallet selection and connected wallet views
 */
export function WalletmeshModal({
  className = '',
  style,
  renderCloseButton,
  wallets = [],
  theme = 'system',
}: WalletmeshModalProps) {
  const modalController = useModalContext();
  const [modalState, setModalState] = useState<ModalState>(modalController.getState());
  
  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = modalController.subscribe((state) => {
      setModalState(state);
    });
    
    return () => unsubscribe();
  }, [modalController]);

  // If modal is not open, don't render anything
  if (!modalState.isOpen) return null;

  // Determine the actual theme based on system preference if needed
  const actualTheme = theme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;

  return (
    <div className={`wm-modal-overlay ${actualTheme}`}>
      <div 
        className={`wm-modal-container ${className}`}
        style={style}
      >
        {renderCloseButton ? (
          renderCloseButton()
        ) : (
          <button 
            className="wm-modal-close"
            onClick={() => modalController.close()}
            aria-label="Close modal"
          >
            ×
          </button>
        )}
        
        {modalState.currentView === 'walletSelection' && (
          <WalletSelectionView 
            wallets={wallets} 
            modalController={modalController}
            isLoading={modalState.isLoading}
          />
        )}
        
        {modalState.currentView === 'connecting' && (
          <ConnectingView 
            selectedWallet={modalState.selectedWallet}
            isLoading={modalState.isLoading}
          />
        )}
        
        {modalState.currentView === 'connected' && (
          <ConnectedView 
            selectedWallet={modalState.selectedWallet}
            modalController={modalController}
          />
        )}
        
        {modalState.currentView === 'error' && (
          <ErrorView 
            error={modalState.error}
            modalController={modalController}
          />
        )}
      </div>
    </div>
  );
}

interface WalletSelectionViewProps {
  wallets: Array<{
    id: string;
    name: string;
    iconUrl?: string;
  }>;
  modalController: any;
  isLoading: boolean;
}

function WalletSelectionView({ wallets, modalController, isLoading }: WalletSelectionViewProps) {
  return (
    <div className="wm-wallet-selection">
      <h2 className="wm-modal-title">Connect a Wallet</h2>
      <p className="wm-modal-description">Choose a wallet to connect with your application</p>
      
      <div className="wm-wallet-list">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            className="wm-wallet-button"
            onClick={() => modalController.selectWallet(wallet.id)}
            disabled={isLoading}
          >
            {wallet.iconUrl && (
              <img 
                src={wallet.iconUrl} 
                alt={`${wallet.name} icon`} 
                className="wm-wallet-icon"
                onError={(e) => {
                  // If image fails to load, hide it
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="wm-wallet-name">{wallet.name}</span>
          </button>
        ))}
        
        {wallets.length === 0 && (
          <div className="wm-no-wallets">
            <p>No wallets configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ConnectingViewProps {
  selectedWallet: string | null;
  isLoading: boolean;
}

function ConnectingView({ selectedWallet }: ConnectingViewProps) {
  return (
    <div className="wm-connecting-view">
      <h2 className="wm-modal-title">Connecting to Wallet</h2>
      <p className="wm-modal-description">
        {selectedWallet ? `Connecting to ${selectedWallet}...` : 'Connecting to wallet...'}
      </p>
      
      <div className="wm-loading-indicator">
        <div className="wm-spinner"></div>
        <p>Please approve the connection in your wallet</p>
      </div>
    </div>
  );
}

interface ConnectedViewProps {
  selectedWallet: string | null;
  modalController: any;
}

function ConnectedView({ selectedWallet, modalController }: ConnectedViewProps) {
  return (
    <div className="wm-connected-view">
      <h2 className="wm-modal-title">Wallet Connected</h2>
      <p className="wm-modal-description">
        {selectedWallet ? `Connected to ${selectedWallet}` : 'Wallet connected successfully'}
      </p>
      
      <div className="wm-connection-info">
        <div className="wm-connection-status">
          <div className="wm-status-indicator connected"></div>
          <span>Connected</span>
        </div>
      </div>
      
      <button 
        className="wm-disconnect-button"
        onClick={() => {
          modalController.reset();
          modalController.close();
        }}
      >
        Disconnect
      </button>
    </div>
  );
}

interface ErrorViewProps {
  error: Error | null;
  modalController: any;
}

function ErrorView({ error, modalController }: ErrorViewProps) {
  return (
    <div className="wm-error-view">
      <h2 className="wm-modal-title">Connection Error</h2>
      <p className="wm-modal-description">
        {error ? error.message : 'An error occurred while connecting to the wallet'}
      </p>
      
      <div className="wm-error-details">
        <div className="wm-error-icon">⚠️</div>
        <p>Please try again or select a different wallet</p>
      </div>
      
      <button 
        className="wm-try-again-button"
        onClick={() => modalController.reset()}
      >
        Try Again
      </button>
    </div>
  );
}


