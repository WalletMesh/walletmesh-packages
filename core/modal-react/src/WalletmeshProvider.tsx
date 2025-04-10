import React, { useState, useEffect, useMemo } from 'react';
import { ModalProvider } from './ModalProvider.js';
import { useModal, useModalContext } from './ModalContext.js';
import { WalletmeshContext, WalletmeshConfig, WalletInfo, ConnectionStatus } from './WalletmeshContext.js';
import { WalletmeshModal } from './components/WalletmeshModal.js';

export interface WalletmeshProviderProps {
  /** Children components */
  children: React.ReactNode;
  /** Configuration options for the Walletmesh modal */
  config?: WalletmeshConfig;
  /** List of available wallets */
  wallets?: WalletInfo[];
  /** Auto inject the modal component */
  autoInjectModal?: boolean;
}

/**
 * Provider component for Walletmesh functionality
 * Wraps the application and provides wallet connectivity features
 */
export function WalletmeshProvider({
  children,
  config = {},
  wallets = [],
  autoInjectModal = true,
}: WalletmeshProviderProps) {
  // Connection status state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  // Selected wallet state
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  // Error state
  const [error, setError] = useState<Error | null>(null); // Used in connect/disconnect methods

  // Default configuration
  const defaultConfig: WalletmeshConfig = {
    theme: 'system',
    dappInfo: {
      name: document.title || 'DApp',
      url: window.location.origin,
    },
  };

  // Merge default config with provided config
  const mergedConfig = useMemo(() => ({
    ...defaultConfig,
    ...config,
  }), [config]);

  // Create context value
  const contextValue = useMemo(() => ({
    config: mergedConfig,
    wallets,
    connectionStatus,
    error,
    openModal: () => {
      if (modalMethods) {
        modalMethods.openSelectModal();
      }
    },
    closeModal: () => {
      if (modalMethods) {
        modalMethods.closeSelectModal();
      }
    },
    connect: async (walletId: string) => {
      try {
        setConnectionStatus('connecting');
        // Simulate connection delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) {
          throw new Error(`Wallet with ID ${walletId} not found`);
        }
        
        setSelectedWallet(walletId);
        setConnectionStatus('connected');
        
        // Here you would implement actual wallet connection logic
        // This is just a placeholder
      } catch (err) {
        setConnectionStatus('error');
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      }
    },
    disconnect: async () => {
      try {
        // Here you would implement actual wallet disconnection logic
        // This is just a placeholder
        setSelectedWallet(null);
        setConnectionStatus('disconnected');
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        throw err;
      }
    },
  }), [mergedConfig, wallets, connectionStatus, selectedWallet]);

  // Reference to modal methods
  let modalMethods: ReturnType<typeof useModal> | null = null;

  // Inner component to access modal context
  const InnerProvider = ({ children }: { children: React.ReactNode }) => {
    // Get modal methods
    modalMethods = useModal();
    const modalController = useModalContext();
    
    // Subscribe to modal state changes
    useEffect(() => {
      const unsubscribe = modalController.subscribe((state) => {
        if (state.selectedWallet && state.currentView === 'connected') {
          setConnectionStatus('connected');
          setSelectedWallet(state.selectedWallet);
        } else if (state.isLoading) {
          setConnectionStatus('connecting');
        } else if (state.error) {
          setConnectionStatus('error');
          setError(state.error);
        } else if (!state.isOpen) {
          // Only reset to disconnected if we're not in the middle of connecting
          if (connectionStatus !== 'connected') {
            setConnectionStatus('disconnected');
          }
        }
      });
      
      return () => unsubscribe();
    }, [modalController, connectionStatus]);
    
    return (
      <WalletmeshContext.Provider value={contextValue}>
        {children}
        {autoInjectModal && (
          <WalletmeshModal
            wallets={wallets}
            theme={mergedConfig.theme || 'system'}
          />
        )}
      </WalletmeshContext.Provider>
    );
  };

  return (
    <ModalProvider config={mergedConfig}>
      <InnerProvider>
        {children}
      </InnerProvider>
    </ModalProvider>
  );
}
