import React from "react";
import { Toaster } from "react-hot-toast";
import type { WalletInfo, DappInfo } from "../types.js";
import { WalletErrorBoundary } from "./WalletErrorBoundary.js";
import { useWallet } from "../hooks/useWallet.js";
import { useWalletModal } from "../hooks/useWalletModal.js";
import { WalletContext } from "../components/WalletContext.js";
import { WalletModal } from "./WalletModal/WalletModal.js";

interface WalletMeshProviderProps {
  children: React.ReactNode;
  wallets: WalletInfo[];
  dappInfo: DappInfo;
  onError?: (error: Error) => void;
}

export const WalletMeshProvider: React.FC<WalletMeshProviderProps> = ({
  children,
  wallets,
  dappInfo,
  onError,
}) => {
  const { isOpen, openModal, closeModal } = useWalletModal();
  const wallet = useWallet({ onError });

  const contextValue = {
    connectionStatus: wallet.connectionStatus,
    connectedWallet: wallet.connectedWallet,
    connectWallet: wallet.connectWallet,
    disconnectWallet: wallet.disconnectWallet,
    wallets,
    dappInfo,
    isModalOpen: isOpen,
    openModal,
    closeModal,
  };

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

WalletMeshProvider.displayName = "WalletMeshProvider";
