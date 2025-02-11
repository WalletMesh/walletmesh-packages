import React from "react"
import { useState, useEffect, useCallback } from "react"
import { useWalletContext } from "../../components/WalletContext.js"
import { WalletInfoModal } from "./WalletInfoModal.js"
import { Loader2 } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
import styles from "./ConnectButton.module.css"
import { ConnectionStatus } from "../../types.js"

export const ConnectButton: React.FC = React.memo(() => {
  const { connectionStatus, connectedWallet, openModal, disconnectWallet, connectWallet } = useWalletContext()
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  useEffect(() => {
    if (connectedWallet && connectionStatus === ConnectionStatus.Idle) {
      connectWallet(connectedWallet.walletInfo)
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
      <div className={styles['connectedContainer']}>
        <button
          onClick={handleConnectedWalletClick}
          className={styles['connectedButton']}
          aria-label={`Connected to ${connectedWallet.walletInfo.name}. Click to view details.`}
        >
          {connectedWallet.walletInfo.icon && (
            <img
              src={connectedWallet.walletInfo.icon}
              alt={`${connectedWallet.walletInfo.name} icon`}
              className={styles['walletIcon']}
            />
          )}
          <div className={styles['walletDetails']}>
            <span className={styles['walletName']}>
              { connectedWallet.walletInfo.name === "Custom Web Wallet" ? `Custom (${connectedWallet.walletInfo.url})` : connectedWallet.walletInfo.name }
            </span>
          </div>
        </button>

        <div className={styles['statusContainer']}>
          <p className={styles['statusHint']}>
            Click the wallet button above for more details
          </p>
          <div className={styles['detailsBox']}>
            <h3 className={styles['detailsTitle']}>DApp Access Example:</h3>
            <p className={styles['detailsItem']}>
              <strong>Wallet:</strong> {connectedWallet.walletInfo.name}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Chain:</strong> {connectedWallet.walletState.chain}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Address:</strong> {connectedWallet.walletState.address}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Session ID:</strong> {connectedWallet.walletState.sessionId || "Not available"}
            </p>
          </div>
        </div>

        <Dialog.Root open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
          <WalletInfoModal onDisconnect={handleDisconnect} />
        </Dialog.Root>
      </div>
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
