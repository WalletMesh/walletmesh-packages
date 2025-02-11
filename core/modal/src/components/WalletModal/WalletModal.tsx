import type React from "react"
import { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Label from "@radix-ui/react-label"
import * as Separator from "@radix-ui/react-separator"
import { useWalletContext, WalletInfo, ConnectionStatus, TransportType, AdapterType } from "../../index.js"
import { Loader2, ExternalLink, CheckCircle2, ArrowRight, X } from "lucide-react"
import styles from "./WalletModal.module.css"
import { toast } from "react-hot-toast"
import { validateUrl } from "../../lib/utils/validation.js"

const CUSTOM_WALLET_URL_KEY = "walletmesh_custom_wallet_url"

export const WalletModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    connectWallet,
    connectionStatus,
    wallets,
    connectedWallet,
  } = useWalletContext()
  const [customWalletUrl, setCustomWalletUrl] = useState<string>("")
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null)

  const isConnecting = connectionStatus === ConnectionStatus.Connecting
  const isResumingSession = connectionStatus === ConnectionStatus.Resuming

  useEffect(() => {
    const savedUrl = localStorage.getItem(CUSTOM_WALLET_URL_KEY)
    if (savedUrl) {
      setCustomWalletUrl(savedUrl)
    }
  }, [])

  const handleConnectWallet = async (wallet: WalletInfo) => {
    setSelectedWallet(wallet)
    try {
      await connectWallet(wallet)
      // Add a small delay to show the success state before closing
      setTimeout(() => {
        closeModal()
      }, 500)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet")
    } finally {
      setSelectedWallet(null)
    }
  }

  const handleConnectCustomWallet = async () => {
    if (customWalletUrl && !isConnecting && !isResumingSession) {
      const url = validateUrl(customWalletUrl)
      localStorage.setItem(CUSTOM_WALLET_URL_KEY, url)
      const customWallet: WalletInfo = {
        id: "custom-web-wallet",
        name: "Custom Web Wallet",
        icon: undefined,
        url: url,
        transport: {
          type: TransportType.PostMessage
        },
        adapter: {
          type: AdapterType.WalletMeshAztec
        }
      }
      setSelectedWallet(customWallet)
      try {
        await connectWallet(customWallet)
        closeModal()
      } catch (error) {
        console.error(error)
        toast.error(error instanceof Error ? error.message : "Failed to connect custom wallet")
      } finally {
        setSelectedWallet(null)
      }
    }
  }

  const handleCustomWalletUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomWalletUrl(e.target.value.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConnectCustomWallet()
    }
  }

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={closeModal}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles['overlay']} />
        <Dialog.Content className={styles['content']}>
          <Dialog.Title className={styles['title']}>Connect Wallet</Dialog.Title>
          <Dialog.Description className={styles['description']}>
            Choose a wallet to connect with
          </Dialog.Description>

          <div className={styles['walletList']}>
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                className={styles['walletButton']}
                onClick={() => handleConnectWallet(wallet)}
                disabled={connectionStatus !== ConnectionStatus.Idle}
                aria-label={`Connect to ${wallet.name}`}
              >
                <div className={styles['walletInfo']}>
                  <img
                    src={wallet.icon}
                    alt={`${wallet.name} icon`}
                    className={styles['walletIcon']}
                  />
                  <div>
                    <div className={styles['walletName']}>{wallet.name}</div>
                  </div>
                </div>
                {connectionStatus === ConnectionStatus.Connecting && selectedWallet === wallet ? (
                  <Loader2 className={`${styles['loadingIcon']} ${styles['icon']}`} />
                ) : connectedWallet?.walletInfo.name === wallet.name ? (
                  <CheckCircle2 className={styles['checkIcon']} />
                ) : (
                  <ArrowRight className={styles['arrowIcon']} />
                )}
              </button>
            ))}
          </div>

          <Separator.Root className={styles['separator']} />

          <div className={styles['customWallet']}>
            <Label.Root htmlFor="custom-wallet-url" className={styles['customWalletTitle']}>
              Connect using a custom web wallet
            </Label.Root>
            <div className={styles['customWalletInput']}>
              <input
                id="custom-wallet-url"
                type="url"
                placeholder="https://"
                value={customWalletUrl}
                onChange={handleCustomWalletUrlChange}
                onKeyUp={handleKeyPress}
                className={styles['input']}
                aria-label="Custom Wallet URL"
              />
              <button
                onClick={handleConnectCustomWallet}
                disabled={connectionStatus !== ConnectionStatus.Idle || !customWalletUrl}
                className={styles['connectButton']}
                aria-label="Connect Custom Wallet"
              >
                {connectionStatus === ConnectionStatus.Connecting && selectedWallet?.name === "Custom Web Wallet" ? (
                  <Loader2 className={`${styles['loadingIcon']} ${styles['icon']}`} />
                ) : (
                  <ExternalLink className={styles['externalLinkIcon']} />
                )}
                Connect
              </button>
            </div>
          </div>

          <Dialog.Close asChild>
            <button className={styles['closeButton']} aria-label="Close">
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
