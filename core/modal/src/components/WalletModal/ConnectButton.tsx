import React from "react"
import { useState, useEffect, useCallback } from "react"
import { useWallet } from "./WalletContext.js"
import { WalletInfoModal } from "./WalletInfoModal.js"
import { Loader2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import styles from "./ConnectButton.module.css"
import { ConnectionStatus } from "../../types.js"
import { TransportType } from "../../lib/transports/types.js"

export const ConnectButton: React.FC = React.memo(() => {
  const { connectionStatus, connectedWallet, openModal, disconnectWallet, connectWallet } = useWallet()
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  useEffect(() => {
    if (connectedWallet && connectionStatus === ConnectionStatus.Idle) {
      connectWallet(connectedWallet)
    }
  }, [connectedWallet, connectionStatus, connectWallet])

  const handleConnectedWalletClick = useCallback(() => {
    setIsInfoModalOpen(true)
  }, [])

  const handleDisconnect = useCallback(() => {
    disconnectWallet()
    setIsInfoModalOpen(false)
  }, [disconnectWallet])

  if (connectionStatus === ConnectionStatus.Connected && connectedWallet) {
    return (
      <>
        <button
          onClick={handleConnectedWalletClick}
          className={styles['connectedButton']}
          aria-label={`Connected to ${connectedWallet.name}. Click to view details.`}
        >
          {connectedWallet.icon && (
            <img
              src={connectedWallet.icon}
              alt={`${connectedWallet.name} icon`}
              className={styles['walletIcon']}
            />
          )}
          {connectedWallet.transport.type === TransportType.PostMessage && connectedWallet.url
            ? `Custom (${new URL(connectedWallet.url).hostname})`
            : connectedWallet.name}
        </button>
        <Dialog.Root open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
          <WalletInfoModal onDisconnect={handleDisconnect} />
        </Dialog.Root>
      </>
    )
  }

  return (
    <button
      onClick={openModal}
      className={styles['connectButton']}
      disabled={connectionStatus !== ConnectionStatus.Idle}
      aria-label="Connect Wallet"
    >
      {connectionStatus === ConnectionStatus.Connecting || connectionStatus === ConnectionStatus.Resuming ? (
        <>
          <Loader2 className={`${styles['loadingIcon']} ${styles['icon']}`} />
          {connectionStatus === ConnectionStatus.Connecting ? "Connecting..." : "Resuming..."}
        </>
      ) : (
        "Connect Wallet"
      )}
    </button>
  )
})

ConnectButton.displayName = "ConnectButton"
