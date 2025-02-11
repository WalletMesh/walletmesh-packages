import type React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useWalletContext } from "../../index.js"
import { X } from "lucide-react"
import styles from "./WalletInfoModal.module.css"

interface WalletInfoModalProps {
  onDisconnect: () => void
}

export const WalletInfoModal: React.FC<WalletInfoModalProps> = ({ onDisconnect }) => {
  const { connectedWallet } = useWalletContext()

  if (!connectedWallet) return null

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={styles['overlay']} />
      <Dialog.Content className={styles['content']}>
        <Dialog.Title className={styles['title']}>Wallet Information</Dialog.Title>
        <div className={styles['infoContainer']}>
          <p className={styles['label']}>Connected Wallet:</p>
          <p className={styles['value']}>{connectedWallet.walletInfo.name}</p>
          {connectedWallet.walletInfo.icon && (
            <img
              src={connectedWallet.walletInfo.icon}
              alt={`${connectedWallet.walletInfo.name} icon`}
              className={styles['walletIcon']}
            />
          )}
          {connectedWallet.walletInfo.url && (
            <div>
              <p className={styles['label']}>URL:</p>
              <p className={styles['value']}>{connectedWallet.walletInfo.url}</p>
            </div>
          )}
          <div>
            <p className={styles['label']}>Chain:</p>
            <p className={styles['value']}>{connectedWallet.walletState.chain || "Unknown"}</p>
          </div>
          <div>
            <p className={styles['label']}>Address:</p>
            <p className={styles['value']}>{connectedWallet.walletState.address || "Not available"}</p>
          </div>
          <div>
            <p className={styles['label']}>Session ID:</p>
            <p className={styles['value']}>{connectedWallet.walletState.sessionId || "Not available"}</p>
          </div>
        </div>
        <div className={styles['buttonContainer']}>
          <button onClick={onDisconnect} className={styles['disconnectButton']} aria-label="Disconnect Wallet">
            Disconnect
          </button>
        </div>
        <Dialog.Close asChild>
          <button className={styles['closeButton']} aria-label="Close">
            <X />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
