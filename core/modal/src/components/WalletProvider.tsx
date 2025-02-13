import React from "react";
import { Toaster } from "react-hot-toast";
import type { WalletMeshProviderConfig } from "../lib/config/WalletMeshConfig.js";
import { WalletErrorBoundary } from "./WalletErrorBoundary.js";
import { WalletContext } from "./WalletContext.js";
import { WalletModal } from "./WalletModal/WalletModal.js";
import { useWalletLogic } from "../hooks/useWalletLogic.js";

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
  const walletLogic = useWalletLogic();

  const contextValue = React.useMemo(() => ({
    ...walletLogic,
    wallets,
    dappInfo,
  }), [walletLogic, wallets, dappInfo]);

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
