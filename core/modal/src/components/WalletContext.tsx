import { createContext, useContext } from "react";
import { useWallet } from "../hooks/useWallet.js";
import type { WalletInfo, DappInfo } from "../types.js";

export type WalletContextType = ReturnType<typeof useWallet> & {
  wallets: WalletInfo[];
  dappInfo: DappInfo;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);
WalletContext.displayName = 'WalletContext';

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};

export { WalletContext };
