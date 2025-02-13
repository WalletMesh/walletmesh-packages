import { createContext, useContext } from "react";
import { useWalletLogic } from "../hooks/useWalletLogic.js";
import type { WalletInfo, DappInfo } from "../types.js";

type WalletContextType = ReturnType<typeof useWalletLogic> & {
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
