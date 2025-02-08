import type React from "react"
import { createContext, useContext } from "react"
import { useWalletLogic } from "./useWalletLogic.js"
import type { WalletInfo, DappInfo } from "../../types.js"

type WalletContextType = ReturnType<typeof useWalletLogic> & {
  wallets: WalletInfo[]
  dappInfo: DappInfo
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: React.ReactNode
  wallets: WalletInfo[]
  dappInfo: DappInfo
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children, wallets, dappInfo }) => {
  const walletLogic = useWalletLogic()

  return (
    <WalletContext.Provider
      value={{
        ...walletLogic,
        wallets,
        dappInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

