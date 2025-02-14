import { createContext, useContext } from "react";
import { useWallet } from "../hooks/useWallet.js";
import type { WalletInfo, DappInfo } from "../types.js";

export type WalletContextType = ReturnType<typeof useWallet> & {
  wallets: WalletInfo[];
  dappInfo: DappInfo;
};

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};
