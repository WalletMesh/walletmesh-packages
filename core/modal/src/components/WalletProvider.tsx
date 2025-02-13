import React from "react";
import { Toaster } from "react-hot-toast";
import type { WalletMeshProviderConfig } from "../lib/config/WalletMeshConfig.js";
import { WalletErrorBoundary } from "./WalletErrorBoundary.js";
import { useWallet } from "../hooks/useWallet.js";
import { useWalletModal } from "../hooks/useWalletModal.js";
import { WalletContext } from "./WalletContext.js";
import { WalletModal } from "./WalletModal/WalletModal.js";

interface WalletProviderProps {
  children: React.ReactNode;
  config: WalletMeshProviderConfig;
  onError?: (error: Error) => void;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  config,
  onError,
}) => {
  const { wallets, dappInfo } = config;
  const { isOpen, openModal, closeModal } = useWalletModal();
  const { connectionStatus, connectedWallet, connectWallet, disconnectWallet, getProvider } = useWallet({ 
    onError 
  });

  const contextValue = React.useMemo(() => ({
    connectionStatus,
    connectedWallet,
    connectWallet,
    disconnectWallet,
    getProvider,
    wallets,
    dappInfo,
    isModalOpen: isOpen,
    openModal,
    closeModal,
  }), [
    connectionStatus,
    connectedWallet,
    connectWallet,
    disconnectWallet,
    getProvider,
    wallets,
    dappInfo,
    isOpen,
    openModal,
    closeModal,
  ]);

  return (
    <WalletErrorBoundary onError={onError}>
      <WalletContext.Provider value={contextValue}>
        {children}
        <WalletModal />
        <Toaster position="bottom-right" />
      </WalletContext.Provider>
    </WalletErrorBoundary>
  );
};

WalletProvider.displayName = "WalletProvider";
