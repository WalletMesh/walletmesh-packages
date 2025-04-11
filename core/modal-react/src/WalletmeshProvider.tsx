import React, { useState, useEffect, useMemo } from 'react';
import { ModalControllerImpl, ModalState, ModalAction } from '@walletmesh/modal-core';
import { WalletmeshContext, WalletmeshConfig, WalletInfo, ConnectionStatus } from './WalletmeshContext.js';
import { WalletmeshModal } from './components/WalletmeshModal.js';

// useModal hook has been removed in favor of using useWalletmesh directly

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
  const [error, setError] = useState<Error | null>(null);

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

  // Create modal controller
  const controller = useMemo(() => new ModalControllerImpl({ config: mergedConfig }), [mergedConfig]);
  
  // Get current modal state
  const [currentModalState, setCurrentModalState] = useState(() => controller.getState());
  
  // Create wallet state object
  const walletState = useMemo(() => ({
    selectedWallet,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting'
  }), [selectedWallet, connectionStatus]);
  
  // Subscribe to state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe((state: ModalState) => {
      // Update modal state
      setCurrentModalState(state);
      
      // Update connection status based on modal state
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
  }, [controller, connectionStatus]);

  // Create context value, including the controller
  const contextValue = useMemo(() => ({
    config: mergedConfig,
    wallets,
    connectionStatus,
    error,
    modalState: currentModalState,
    walletState,
    getState: () => controller.getState(),
    subscribe: controller.subscribe.bind(controller),
    openModal: () => controller.open(),
    closeModal: () => controller.close(),
    openConnectedModal: () => controller.open(), // We'll use the standard open and handle view in the component
    closeConnectedModal: () => controller.close(),
    dispatch: (action: ModalAction) => {
      // Map action types to controller methods
      switch (action.type) {
        case 'SELECT_WALLET':
          controller.selectWallet(action.wallet);
          break;
        case 'START_CONNECTING':
          controller.connect();
          break;
        case 'RESET':
          controller.reset();
          break;
        case 'BACK':
          controller.back();
          break;
        case 'OPEN':
          controller.open();
          break;
        case 'CLOSE':
          controller.close();
          break;
        case 'SELECT_PROVIDER':
          controller.selectProvider(action.provider);
          break;
        case 'SELECT_CHAIN':
          controller.selectChain(action.chain);
          break;
        case 'CONNECTION_ERROR':
          // Already handled by state subscription
          break;
        case 'CONNECTION_SUCCESS':
          // Already handled by state subscription
          break;
        default:
          console.warn('Unsupported action:', action);
      }
    },
    connect: async (walletId: string) => {
      try {
        setConnectionStatus('connecting');
        
        const wallet = wallets.find(w => w.id === walletId);
        if (!wallet) {
          throw new Error(`Wallet with ID ${walletId} not found`);
        }
        
        // Select the wallet in the modal controller
        controller.selectWallet(walletId);
        
        // Initiate connection
        await controller.connect();
        
        // State will be updated via the subscription to controller state
        setSelectedWallet(walletId);
        setConnectionStatus('connected');
      } catch (err) {
        setConnectionStatus('error');
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // No need to dispatch as the state subscription will handle errors
        
        throw err;
      }
    },
    disconnect: async () => {
      try {
        // Reset the controller state which will disconnect the wallet
        controller.reset();
        
        // Update local state
        setSelectedWallet(null);
        setConnectionStatus('disconnected');
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        
        // No need to dispatch as the state subscription will handle errors
        
        throw err;
      }
    },
    controller // Add controller directly here
  }), [mergedConfig, wallets, connectionStatus, selectedWallet, currentModalState, walletState, controller]);

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
}
