import { createContext, useContext } from "react";
import type { WalletInfo, DappInfo, ConnectedWallet, ConnectionStatus } from "../types.js";

interface WalletContextType {
  connectionStatus: ConnectionStatus;
  connectedWallet: ConnectedWallet | null;
  connectWallet: (wallet: WalletInfo) => Promise<ConnectedWallet>;
  disconnectWallet: () => Promise<void>;
  wallets: WalletInfo[];
  dappInfo: DappInfo;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within a WalletProvider");
  }
  return context;
};
