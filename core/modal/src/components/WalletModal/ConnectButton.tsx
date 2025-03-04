import React, { useCallback } from "react"
import { useWalletContext } from "../WalletContext.js"
import { Loader2 } from "lucide-react"
import { DefaultIcon } from "../../lib/constants/defaultIcons.js"
import styles from "./ConnectButton.module.css"
import { ConnectionStatus } from "../../types.js"
import type { WalletInfo } from "../../types.js"

const getDisplayName = (walletInfo: WalletInfo): string => {
  if (walletInfo.name === "Custom Web Wallet" && walletInfo.websiteUrl) {
    try {
      const url = new URL(walletInfo.websiteUrl);
      return `Custom Wallet (${url.hostname})`;
    } catch (e) {
      return walletInfo.name;
    }
  }
  return walletInfo.name;
}

export const ConnectButton: React.FC = React.memo(() => {
  const { 
    connectionStatus, 
    connectedWallet, 
    openSelectModal, 
    openConnectedModal 
  } = useWalletContext()

  const handleConnectedWalletClick = useCallback(() => {
    openConnectedModal();
  }, [openConnectedModal]);

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
            src={connectedWallet.info.iconDataUri ?? DefaultIcon.Wallet}
            alt={`${connectedWallet.info.name} icon`}
            className={styles['walletIcon']}
          />
          <div className={styles['walletDetails']}>
            <span className={styles['walletName']}>
              {getDisplayName(connectedWallet.info)}
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
              <strong>Wallet:</strong> {getDisplayName(connectedWallet.info)}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Chain:</strong> {connectedWallet.state.networkId}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Address:</strong> {connectedWallet.state.address}
            </p>
            <p className={styles['detailsItem']}>
              <strong>Session ID:</strong> {connectedWallet.state.sessionId || "Not available"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        console.log('[ConnectButton] Opening select modal');
        openSelectModal();
      }}
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
