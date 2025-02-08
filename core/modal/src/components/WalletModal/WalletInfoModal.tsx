import type React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useWallet } from "./WalletContext.js"
import { X } from "lucide-react"
import styles from "./WalletInfoModal.module.css"

interface WalletInfoModalProps {
  onDisconnect: () => void
}

export const WalletInfoModal: React.FC<WalletInfoModalProps> = ({ onDisconnect }) => {
  const { connectedWallet } = useWallet()

  if (!connectedWallet) return null

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={styles['overlay']} />
      <Dialog.Content className={styles['content']}>
        <Dialog.Title className={styles['title']}>Wallet Information</Dialog.Title>
        <div className={styles['infoContainer']}>
          <p className={styles['label']}>Connected Wallet:</p>
          <p className={styles['value']}>{connectedWallet.name}</p>
          {connectedWallet.icon && (
            <img
              src={connectedWallet.icon}
              alt={`${connectedWallet.name} icon`}
              className={styles['walletIcon']}
            />
          )}
          {connectedWallet.url && (
            <div>
              <p className={styles['label']}>URL:</p>
              <p className={styles['value']}>{connectedWallet.url}</p>
            </div>
          )}
          <div>
            <p className={styles['label']}>Chain:</p>
            <p className={styles['value']}>{connectedWallet.chain || "Unknown"}</p>
          </div>
          <div>
            <p className={styles['label']}>Address:</p>
            <p className={styles['value']}>{connectedWallet.address || "Not available"}</p>
          </div>
          <div>
            <p className={styles['label']}>Session ID:</p>
            <p className={styles['value']}>{connectedWallet.sessionId || "Not available"}</p>
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

