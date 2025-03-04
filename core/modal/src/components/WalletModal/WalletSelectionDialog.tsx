import React, { useEffect, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { useWalletContext } from "../WalletContext.js"
import { X, Loader2 } from "lucide-react"
import baseStyles from "./WalletModal.module.css"
import styles from "./WalletSelectionDialog.module.css"
import { ConnectionStatus } from "../../types.js"
import type { WalletInfo } from "../../types.js"
import { DefaultIcon } from "../../lib/constants/defaultIcons.js"
import { ConnectorType } from "../../lib/connectors/types.js"

export const WalletSelectionDialog: React.FC = () => {
  const {
    isSelectModalOpen,
    closeSelectModal,
    connectionStatus,
    connectWallet,
    wallets,
  } = useWalletContext();

  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);
  const [customWalletUrl, setCustomWalletUrl] = useState("");
  const isConnecting = connectionStatus === ConnectionStatus.Connecting;
  const isValidUrl = customWalletUrl.startsWith("https://");

  const handleCustomWalletUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomWalletUrl(e.target.value);
  };

  const handleCustomWalletUrlEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValidUrl) {
      handleConnectCustomWallet();
    }
  };

  useEffect(() => {
    console.log('[WalletSelectionDialog] Modal state changed:', { isSelectModalOpen });
  }, [isSelectModalOpen]);

  const handleConnectCustomWallet = async () => {
    if (!customWalletUrl || !isValidUrl) return;

    try {
      const url = new URL(customWalletUrl);
      const customWallet: WalletInfo = {
        id: "custom-web-wallet",
        name: "Custom Web Wallet",
        websiteUrl: url.toString(),
        connector: {
          type: ConnectorType.FakeAztec,
          options: {
            chainId: "aztec:testnet"
          }
        }
      };
      await handleConnect(customWallet);
      setCustomWalletUrl("");
    } catch (error) {
      console.error('[WalletSelectionDialog] Invalid URL:', error);
    }
  };

  const handleConnect = async (wallet: WalletInfo) => {
    setSelectedWallet(wallet);
    try {
      await connectWallet(wallet);
      closeSelectModal();
    } catch (error) {
      console.error('[WalletSelectionDialog] Connection error:', error);
      setSelectedWallet(null);
    }
  };

  return (
    <Dialog.Root 
      open={isSelectModalOpen}
      modal={true}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isConnecting) {
          closeSelectModal();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={baseStyles['overlay']} />
        <Dialog.Content 
          className={baseStyles['content']}
          onEscapeKeyDown={(e) => {
            if (isConnecting) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (isConnecting) {
              e.preventDefault();
            }
          }}
          aria-modal="true"
          aria-busy={isConnecting}
          aria-labelledby="select-wallet-title"
          aria-describedby="select-wallet-description"
        >
          <Dialog.Title id="select-wallet-title" className={baseStyles['dialogTitle']}>
            Connect a Wallet
          </Dialog.Title>
          <Dialog.Description id="select-wallet-description" className={baseStyles['dialogDescription']}>
            Choose a wallet to connect with your application
          </Dialog.Description>

          {!isConnecting && (
            <Dialog.Close asChild>
              <button 
                className={baseStyles['closeButton']} 
                aria-label="Close"
                onClick={closeSelectModal}
                tabIndex={-1}
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          )}

          <div className={baseStyles['modalInner']}>
            <div className={styles['walletList']}>
              {wallets.map((wallet: WalletInfo) => (
                <button
                  key={wallet.id}
                  className={styles['walletButton']}
                  onClick={() => handleConnect(wallet)}
                  disabled={isConnecting}
                  aria-selected={selectedWallet?.id === wallet.id}
                >
                  <img
                    src={wallet.iconDataUri ?? DefaultIcon.Wallet}
                    alt={`${wallet.name} icon`}
                    className={styles['walletIcon']}
                    onError={(e) => {
                      e.currentTarget.src = DefaultIcon.Wallet;
                    }}
                  />
                  <div className={styles['walletInfo']}>
                    <span className={styles['walletName']}>{wallet.name}</span>
                    {wallet.websiteUrl && (
                      <span className={styles['walletDescription']}>
                        {new URL(wallet.websiteUrl).hostname}
                      </span>
                    )}
                  </div>
                  {selectedWallet?.id === wallet.id && isConnecting && (
                    <Loader2 className={styles['loadingIcon']} />
                  )}
                </button>
              ))}
            </div>
            <div className={styles['customWalletSection']}>
              <div className={styles['customWalletInput']}>
                <input
                  id="custom-wallet-url"
                  type="url"
                  placeholder="https://"
                  value={customWalletUrl}
                  onChange={handleCustomWalletUrlChange}
                  onKeyUp={handleCustomWalletUrlEnter}
                  className={styles['urlInput']}
                  aria-label="Custom Wallet URL"
                  aria-invalid={customWalletUrl !== "" && !isValidUrl}
                  aria-describedby="custom-wallet-url-desc"
                  disabled={isConnecting}
                />
                <button
                  onClick={handleConnectCustomWallet}
                  disabled={connectionStatus !== ConnectionStatus.Idle || !isValidUrl}
                  className={styles['addButton']}
                  aria-label="Connect Custom Wallet"
                  aria-busy={connectionStatus === ConnectionStatus.Connecting && selectedWallet?.name === "Custom Web Wallet"}
                >
                  Add Wallet
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
