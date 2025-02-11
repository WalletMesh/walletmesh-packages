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
          <p className={styles['value']}>{connectedWallet.info.name}</p>
          {connectedWallet.info.icon && (
            <img
              src={connectedWallet.info.icon}
              alt={`${connectedWallet.info.name} icon`}
              className={styles['walletIcon']}
            />
          )}
          {connectedWallet.info.url && (
            <div>
              <p className={styles['label']}>URL:</p>
              <p className={styles['value']}>{connectedWallet.info.url}</p>
            </div>
          )}
          <div>
            <p className={styles['label']}>Chain:</p>
            <p className={styles['value']}>{connectedWallet.state.chain || "Unknown"}</p>
          </div>
          <div>
            <p className={styles['label']}>Address:</p>
            <p className={styles['value']}>{connectedWallet.state.address || "Not available"}</p>
          </div>
          <div>
            <p className={styles['label']}>Session ID:</p>
            <p className={styles['value']}>{connectedWallet.state.sessionId || "Not available"}</p>
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
