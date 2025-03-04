import React, { useEffect, useState, useCallback } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Tabs from "@radix-ui/react-tabs"
import { useWalletContext } from "../WalletContext.js"
import { X, Copy, CheckCircle2, ExternalLink, Globe, Terminal, Info, LogOut, Loader2 } from "lucide-react"
import baseStyles from "./WalletModal.module.css"
import styles from "./WalletConnectedDialog.module.css"
import buttonStyles from "./ConnectButton.module.css"
import { ConnectionStatus } from "../../types.js"
import { DefaultIcon } from "../../lib/constants/defaultIcons.js"
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

export const WalletConnectedDialog: React.FC = () => {
  const {
    isConnectedModalOpen,
    closeConnectedModal,
    disconnectWallet,
    connectionStatus,
    connectedWallet,
    dappInfo,
  } = useWalletContext();

  const isResumingSession = connectionStatus === ConnectionStatus.Resuming;
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [connectionDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState("details");

  useEffect(() => {
    console.log('[WalletConnectedDialog] Modal state changed:', { isConnectedModalOpen });
  }, [isConnectedModalOpen]);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await disconnectWallet();
    closeConnectedModal();
  };

  const handleCopyAddress = useCallback(() => {
    if (connectedWallet?.state.address) {
      navigator.clipboard.writeText(connectedWallet.state.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  }, [connectedWallet?.state.address]);

  const formattedConnectionTime = connectionDate.toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  if (!connectedWallet) return null;

  return (
    <Dialog.Root 
      open={isConnectedModalOpen}
      modal={true}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isResumingSession) {
          closeConnectedModal();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={baseStyles['overlay']} />
        <Dialog.Content 
          className={baseStyles['content']}
          onEscapeKeyDown={(e) => {
            if (isResumingSession) {
              e.preventDefault();
            }
          }}
          onPointerDownOutside={(e) => {
            if (isResumingSession) {
              e.preventDefault();
            }
          }}
          aria-modal="true"
          aria-busy={isResumingSession}
          aria-labelledby="connected-modal-title"
          aria-describedby="connected-modal-description"
        >
          <Dialog.Title 
            id="connected-modal-title"
            className={baseStyles['dialogTitle']}
          >
            Connected Wallet Information
          </Dialog.Title>
          <Dialog.Description 
            id="connected-modal-description"
            className={baseStyles['dialogDescription']}
          >
            View and manage your connected wallet settings
          </Dialog.Description>

          {!isResumingSession && (
            <Dialog.Close asChild>
              <button 
                className={baseStyles['closeButton']} 
                aria-label="Close" 
                tabIndex={-1}
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          )}

          <div className={baseStyles['modalInner']}>
            <div className={styles['modalContainer']}>
              <div 
                className={styles['walletCard']}
                role="region"
                aria-label="Wallet Status"
              >
                <img
                  src={connectedWallet.info.iconDataUri ?? DefaultIcon.Wallet}
                  alt={`${connectedWallet.info.name} icon`}
                  className={styles['walletIcon']}
                  onError={(e) => {
                    e.currentTarget.src = DefaultIcon.Wallet;
                  }}
                />
                <div className={styles['walletInfo']}>
                  <h3 className={styles['walletName']}>{getDisplayName(connectedWallet.info)}</h3>
                  <span className={styles['connectedStatus']}>
                    <CheckCircle2 className={styles['statusIcon']} />
                    Connected
                  </span>
                </div>
              </div>

              <Tabs.Root 
                className={styles['tabsRoot']} 
                value={selectedTab}
                onValueChange={setSelectedTab}
              >
                <Tabs.List 
                  className={styles['tabsList']} 
                  aria-label="Wallet Information"
                  loop={true}
                >
                  <Tabs.Trigger 
                    className={styles['tabsTrigger']} 
                    value="details"
                    aria-controls="details-tab"
                    aria-selected={selectedTab === "details"}
                  >
                    Details
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    className={styles['tabsTrigger']} 
                    value="session"
                    aria-controls="session-tab"
                    aria-selected={selectedTab === "session"}
                  >
                    Session
                  </Tabs.Trigger>
                  <Tabs.Trigger 
                    className={styles['tabsTrigger']} 
                    value="dapp"
                    aria-controls="dapp-tab"
                    aria-selected={selectedTab === "dapp"}
                  >
                    DApp
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content 
                  className={styles['tabsContent']} 
                  value="details"
                  id="details-tab"
                  role="tabpanel"
                >
                  <div className={styles['infoGrid']}>
                    <div className={styles['infoItem']}>
                      <span className={styles['label']}>Network</span>
                      <span className={styles['value']}>{connectedWallet.state.networkId || "Unknown"}</span>
                    </div>
                    
                    <div className={styles['infoItem']}>
                      <span className={styles['label']}>Address</span>
                      <div className={styles['valueWithAction']}>
                        <span className={styles['value']}>
                          {connectedWallet.state.address || "Not available"}
                        </span>
          <button 
            onClick={handleCopyAddress}
                          className={styles['actionButton']}
                          aria-label={copiedAddress ? "Address copied" : "Copy address to clipboard"}
                          title={copiedAddress ? "Address copied" : "Copy address to clipboard"}
                          type="button"
                        >
                          {copiedAddress ? <CheckCircle2 size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                        </button>
                        <div 
                          role="status" 
                          aria-live="polite" 
                          className="sr-only"
                        >
                          {copiedAddress && "Address copied to clipboard"}
                        </div>
                      </div>
                    </div>

                    {connectedWallet.info.websiteUrl && (
                      <div className={styles['infoItem']}>
                        <span className={styles['label']}>Wallet URL</span>
                        <div className={styles['valueWithAction']}>
                          <span className={styles['value']}>{connectedWallet.info.websiteUrl}</span>
                          <a
                            href={connectedWallet.info.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles['actionButton']}
                            aria-label="Open wallet URL"
                            title="Open wallet URL"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs.Content>

                <Tabs.Content 
                  className={styles['tabsContent']} 
                  value="session"
                  id="session-tab"
                  role="tabpanel"
                >
                  <div className={styles['infoGrid']}>
                    <div className={styles['infoItem']}>
                      <span className={styles['label']}>Session ID</span>
                      <span className={styles['value']}>
                        {connectedWallet.state.sessionId || "Not available"}
                      </span>
                    </div>

                    <div className={styles['infoItem']}>
                      <span className={styles['label']}>Connected Since</span>
                      <span className={styles['value']}>{formattedConnectionTime}</span>
                    </div>

                    <div className={styles['infoItem']}>
                      <span className={styles['label']}>Status</span>
                      <span className={styles['value']}>Connected</span>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content 
                  className={styles['tabsContent']} 
                  value="dapp"
                  id="dapp-tab"
                  role="tabpanel"
                >
                  <div className={styles['infoGrid']}>
                    <div className={styles['infoItem']}>
                      <span className={styles['label']}>DApp Name</span>
                      <div className={styles['valueWithIcon']}>
                        <Info size={16} className={styles['infoIcon']} />
                        <span className={styles['value']}>{dappInfo.name}</span>
                      </div>
                    </div>

                    {dappInfo.description && (
                      <div className={styles['infoItem']}>
                        <span className={styles['label']}>Description</span>
                        <div className={styles['valueWithIcon']}>
                          <Info size={16} className={styles['infoIcon']} />
                          <span className={styles['value']}>{dappInfo.description}</span>
                        </div>
                      </div>
                    )}

                    <div className={styles['infoItem']}>
                      <span className={styles['label']}>Origin</span>
                      <div className={styles['valueWithAction']}>
                        <div className={styles['valueWithIcon']}>
                          <Globe size={16} className={styles['infoIcon']} />
                          <span className={styles['value']}>{dappInfo.origin}</span>
                        </div>
                        <a
                          href={dappInfo.origin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles['actionButton']}
                          aria-label="Open DApp URL"
                          title="Open DApp URL"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>

                    {dappInfo.rpcUrl && (
                      <div className={styles['infoItem']}>
                        <span className={styles['label']}>RPC URL</span>
                        <div className={styles['valueWithIcon']}>
                          <Terminal size={16} className={styles['infoIcon']} />
                          <span className={styles['value']}>{dappInfo.rpcUrl}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs.Content>
              </Tabs.Root>

              <div className={styles['footer']}>
                <div className={styles['footerActions']}>
                  <button 
                  onClick={handleDisconnect}
                    className={buttonStyles['connectButton']}
                    aria-label="Disconnect wallet"
                    type="button"
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? (
                      <Loader2 size={16} className={buttonStyles['loadingIcon']} aria-hidden="true" />
                    ) : (
                      <LogOut size={16} aria-hidden="true" />
                    )}
                    <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect Wallet'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
