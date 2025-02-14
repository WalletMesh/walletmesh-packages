import type React from "react"
import { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Label from "@radix-ui/react-label"
import * as Separator from "@radix-ui/react-separator"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useWalletContext } from "../WalletContext.js"
import { WalletInfoModal } from "./WalletInfoModal.js"
import type { WalletInfo } from "../../types.js"
import { ConnectionStatus } from "../../types.js"
import { TransportType } from "../../lib/transports/types.js"
import { AdapterType } from "../../lib/adapters/types.js"
import { Loader2, ExternalLink, ArrowRight, X } from "lucide-react"
import styles from "./WalletModal.module.css"
import { toast } from "react-hot-toast"
import { validateUrl } from "../../lib/utils/validation.js"
import { DefaultIcon } from "../../lib/constants/defaultIcons.js"

const CUSTOM_WALLET_URL_KEY = "walletmesh_custom_wallet_url"

export const WalletModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    connectWallet,
    disconnectWallet,
    connectionStatus,
    wallets,
    connectedWallet,
  } = useWalletContext()
  const [customWalletUrl, setCustomWalletUrl] = useState<string>("")
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)

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
      closeModal()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Failed to connect wallet")
    } finally {
      setSelectedWallet(null)
    }
  }

  const handleConnectCustomWallet = async () => {
    if (!customWalletUrl || isConnecting || isResumingSession) {
      return;
    }
    
    const url = validateUrl(customWalletUrl);
    localStorage.setItem(CUSTOM_WALLET_URL_KEY, url);
    const customWallet: WalletInfo = {
      id: "custom-web-wallet",
      name: "Custom Web Wallet",
      url: url,
      transport: {
        type: TransportType.PostMessage
      },
      adapter: {
        type: AdapterType.WalletMeshAztec,
        options: {
          chainId: "aztec:devnet"
        }
      }
    };

    setSelectedWallet(customWallet);
    try {
      await connectWallet(customWallet);
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to connect custom wallet");
    } finally {
      setSelectedWallet(null);
    }
  };

  const handleCustomWalletUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomWalletUrl(e.target.value.trim())
  }

  const handleCustomWalletUrlEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleConnectCustomWallet()
    }
  }

  const handleWalletListNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!wallets.length) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => {
          const next = prev + 1
          return next >= wallets.length ? 0 : next
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => {
          const next = prev - 1
          return next < 0 ? wallets.length - 1 : next
        })
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        const wallet = focusedIndex >= 0 && focusedIndex < wallets.length ? wallets[focusedIndex] : null
        if (wallet) {
          handleConnectWallet(wallet)
        }
        break
    }
  }

  // Reset focus index when modal opens/closes
  useEffect(() => {
    if (!isModalOpen) {
      setFocusedIndex(-1)
    }
  }, [isModalOpen])

  // Update focus when index changes
  useEffect(() => {
    if (focusedIndex >= 0) {
      const buttons = document.querySelectorAll(`.${styles['walletButton']}`)
      const button = buttons[focusedIndex] as HTMLButtonElement
      if (button) {
        button.focus()
      }
    }
  }, [focusedIndex])

  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } finally {
      closeModal();
    }
  };

  // Content for wallet selection view
  const ConnectWalletContent = () => (
    <div className={styles['modalContent']}>
      <div
        className={styles['walletList']}
        role="listbox"
        aria-label="Available wallets"
        onKeyDown={handleWalletListNavigation}
        tabIndex={wallets.length ? 0 : -1}
      >
        {wallets.map((wallet) => (
          <button
            key={wallet.name}
            className={styles['walletButton']}
            onClick={() => handleConnectWallet(wallet)}
            disabled={connectionStatus !== ConnectionStatus.Idle}
            role="option"
            aria-selected={selectedWallet === wallet}
            aria-label={`Connect to ${wallet.name}`}
          >
            <div className={styles['walletInfo']}>
              <img
                src={wallet.icon ?? DefaultIcon.Wallet}
                alt={`${wallet.name} icon`}
                className={styles['walletIcon']}
                onError={(e) => {
                  e.currentTarget.src = DefaultIcon.Wallet;
                }}
              />
              <div>
                <div className={styles['walletName']}>{wallet.name}</div>
              </div>
            </div>
            {connectionStatus === ConnectionStatus.Connecting && selectedWallet === wallet ? (
              <>
                <Loader2 className={`${styles['loadingIcon']} ${styles['icon']}`} />
                <VisuallyHidden.Root>Connecting to {wallet.name}...</VisuallyHidden.Root>
              </>
            ) : (
              <>
                <ArrowRight className={styles['arrowIcon']} />
                <VisuallyHidden.Root>Select {wallet.name}</VisuallyHidden.Root>
              </>
            )}
          </button>
        ))}
      </div>

      <Separator.Root className={styles['separator']} />

      <div className={styles['customWallet']}>
        <Label.Root htmlFor="custom-wallet-url" className={styles['customWalletTitle']}>
          Connect using a custom web wallet
        </Label.Root>
        <VisuallyHidden.Root id="custom-wallet-url-desc">
          Enter the URL of your custom web wallet. The URL must start with https://
        </VisuallyHidden.Root>
        <div className={styles['customWalletInput']}>
          <input
            id="custom-wallet-url"
            type="url"
            placeholder="https://"
            value={customWalletUrl}
            onChange={handleCustomWalletUrlChange}
            onKeyUp={handleCustomWalletUrlEnter}
            className={styles['input']}
            aria-label="Custom Wallet URL"
            aria-invalid={customWalletUrl !== "" && !customWalletUrl.startsWith("https://")}
            aria-describedby="custom-wallet-url-desc"
          />
          <button
            onClick={handleConnectCustomWallet}
            disabled={connectionStatus !== ConnectionStatus.Idle || !customWalletUrl}
            className={styles['connectButton']}
            aria-label="Connect Custom Wallet"
            aria-busy={connectionStatus === ConnectionStatus.Connecting && selectedWallet?.name === "Custom Web Wallet"}
          >
            {connectionStatus === ConnectionStatus.Connecting && selectedWallet?.name === "Custom Web Wallet" ? (
              <>
                <Loader2 className={`${styles['loadingIcon']} ${styles['icon']}`} />
                <VisuallyHidden.Root>Connecting to custom wallet...</VisuallyHidden.Root>
              </>
            ) : (
              <>
                <ExternalLink className={styles['externalLinkIcon']} />
                <VisuallyHidden.Root>Connect to custom wallet at {customWalletUrl}</VisuallyHidden.Root>
              </>
            )}
            <span aria-hidden="true">Connect</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog.Root open={isModalOpen} onOpenChange={closeModal}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles['overlay']} />
        <Dialog.Content 
          className={styles['content']}
          role="dialog"
          aria-modal="true"
          aria-busy={isConnecting || isResumingSession}
          onEscapeKeyDown={closeModal}
          onInteractOutside={(e) => {
            if (isConnecting || isResumingSession) {
              e.preventDefault();
              return;
            }
            closeModal();
          }}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Dialog.Title className={styles['dialogTitle']}>
            {connectedWallet ? 'Connected Wallet Information' : 'Connect a Wallet'}
          </Dialog.Title>
          <Dialog.Description className={styles['dialogDescription']}>
            {connectedWallet ? 
              'View and manage your connected wallet settings' : 
              'Choose a wallet to connect with your application'
            }
          </Dialog.Description>
          
          <div className={styles['modalInner']}>
            {connectedWallet ? (
              <WalletInfoModal onDisconnect={handleDisconnect} />
            ) : (
              <ConnectWalletContent />
            )}

            <Dialog.Close asChild>
              <button className={styles['closeButton']} aria-label="Close">
                <X />
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
