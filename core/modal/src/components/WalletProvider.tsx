import React from "react";
import { Toaster } from "react-hot-toast";
import type { WalletInfo, DappInfo } from "../types.js";
import { WalletErrorBoundary } from "./WalletErrorBoundary.js";
import { useWallet } from "../hooks/useWallet.js";
import { useWalletModal } from "../hooks/useWalletModal.js";
import { WalletContext } from "./WalletContext.js";
import { WalletModal } from "./WalletModal/WalletModal.js";
interface WalletProviderProps {
  children: React.ReactNode;
  wallets: WalletInfo[];
  dappInfo: DappInfo;
  onError?: (error: Error) => void;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  wallets,
  dappInfo,
  onError,
}) => {
  const { isOpen, openModal, closeModal } = useWalletModal();
  const { connectionStatus, connectedWallet, connectWallet, disconnectWallet } = useWallet({ 
    onError 
  });

  const contextValue = React.useMemo(() => ({
    connectionStatus,
    connectedWallet,
    connectWallet,
    disconnectWallet,
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
