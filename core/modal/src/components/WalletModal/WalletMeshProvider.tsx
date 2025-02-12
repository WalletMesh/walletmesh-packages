import React from "react"
import { WalletProvider, useWallet } from "./WalletContext.js"
import { ConnectButton } from "./ConnectButton.js"
import { WalletModal } from "./WalletModal.js"
import type { WalletInfo, DappInfo } from "../../types.js"
import { Toaster } from "react-hot-toast"

export { useWallet, ConnectButton, WalletModal }

interface WalletMeshProviderProps {
  children: React.ReactNode
  wallets: WalletInfo[]
  dappInfo: DappInfo
}

export const WalletMeshProvider: React.FC<WalletMeshProviderProps> = React.memo(({
  children,
  wallets,
  dappInfo,
}) => {
  return (
    <WalletProvider wallets={wallets} dappInfo={dappInfo}>
      {children}
      <WalletModal />
      <Toaster position="bottom-right" />
    </WalletProvider>
  )
})

WalletMeshProvider.displayName = "WalletMeshProvider"

