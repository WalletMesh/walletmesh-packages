import React from "react"
import { useState, useCallback } from "react"
import { useWallet } from "./WalletContext.js"
import { WalletInfoModal } from "./WalletInfoModal.js"
import { Loader2 } from "lucide-react"
import { DefaultIcon } from "../../lib/constants/defaultIcons.js"
import * as Dialog from "@radix-ui/react-dialog"
import styles from "./ConnectButton.module.css"
import { ConnectionStatus } from "../../types.js"

export const ConnectButton: React.FC = React.memo(() => {
  const { connectionStatus, connectedWallet, openModal, disconnectWallet } = useWallet()
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  const handleConnectedWalletClick = useCallback(() => {
    if (connectionStatus === ConnectionStatus.Connected) {
      setIsInfoModalOpen(true)
    }
  }, [connectionStatus])

  const handleDisconnect = useCallback(() => {
    disconnectWallet()
    setIsInfoModalOpen(false)
  }, [disconnectWallet])

  const isConnected = connectionStatus === ConnectionStatus.Connected && connectedWallet;
  const isConnecting = connectionStatus === ConnectionStatus.Connecting;
  const isResuming = connectionStatus === ConnectionStatus.Resuming;
  const buttonDisabled = isConnecting || isResuming;

  if (isConnected) {
    return (
      <div className={styles['connectedContainer']}>
        <button
          onClick={handleConnectedWalletClick}
          className={styles['connectedButton']}
          aria-label={`Connected to ${connectedWallet.info.name}. Click to view details.`}
        >
          <img
            src={connectedWallet.info.icon ?? DefaultIcon.Wallet}
            alt={`${connectedWallet.info.name} icon`}
            className={styles['walletIcon']}
          />
          <div className={styles['walletDetails']}>
            <span className={styles['walletName']}>
              { connectedWallet.info.name === "Custom Web Wallet" ? `Custom (${connectedWallet.info.url})` : connectedWallet.info.name }
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
              <strong>Wallet:</strong> {connectedWallet.info.name}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Chain:</strong> {connectedWallet.state.chain}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Address:</strong> {connectedWallet.state.address}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Session ID:</strong> {connectedWallet.state.sessionId || "Not available"}
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
      disabled={buttonDisabled}
      aria-label="Connect Wallet"
    >
      {(isConnecting || isResuming) ? (
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
