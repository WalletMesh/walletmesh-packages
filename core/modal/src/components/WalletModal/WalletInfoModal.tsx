import type React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Tabs from "@radix-ui/react-tabs"
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useWallet } from "./WalletContext.js"
import { useState, useCallback } from "react"
import { X, Copy, CheckCircle2, ExternalLink, RefreshCw, Globe, Terminal, Info } from "lucide-react"
import styles from "./WalletInfoModal.module.css"
import { DefaultIcon } from "../../lib/constants/defaultIcons.js"

interface WalletInfoModalProps {
  onDisconnect: () => void
}

export const WalletInfoModal: React.FC<WalletInfoModalProps> = ({ onDisconnect }) => {
  const { connectedWallet, dappInfo } = useWallet()
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [copiedSession, setCopiedSession] = useState(false)
  const [connectionDate] = useState(new Date())

  const handleCopyAddress = useCallback(() => {
    if (connectedWallet?.state.address) {
      navigator.clipboard.writeText(connectedWallet.state.address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }, [connectedWallet?.state.address])

  const handleCopySession = useCallback(() => {
    if (connectedWallet?.state.sessionId) {
      navigator.clipboard.writeText(connectedWallet.state.sessionId)
      setCopiedSession(true)
      setTimeout(() => setCopiedSession(false), 2000)
    }
  }, [connectedWallet?.state.sessionId])

  if (!connectedWallet) return null

  const formattedConnectionTime = connectionDate.toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'medium'
  })

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={styles['overlay']} />
      <Dialog.Content 
        className={styles['content']}
        onOpenAutoFocus={(e) => {
          // Keep focus on first tab by default
          e.preventDefault()
          const firstTab = document.querySelector(`[role="tab"]`) as HTMLElement
          firstTab?.focus()
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-info-title"
      >
        <VisuallyHidden.Root>
          <Dialog.Title id="wallet-info-title">
            Connected Wallet Modal
          </Dialog.Title>
        </VisuallyHidden.Root>
        <h2 className={styles['title']} aria-hidden="true">
          Connected Wallet
        </h2>
        
        <div className={styles['walletCard']}>
          <img
            src={connectedWallet.info.icon ?? DefaultIcon.Wallet}
            alt={`${connectedWallet.info.name} icon`}
            className={styles['walletIcon']}
            onError={(e) => {
              e.currentTarget.src = DefaultIcon.Wallet;
            }}
          />
          <div className={styles['walletInfo']}>
            <h3 className={styles['walletName']}>{connectedWallet.info.name}</h3>
            <span className={styles['connectedStatus']}>
              <CheckCircle2 className={styles['statusIcon']} />
              Connected
            </span>
          </div>
        </div>

        <Tabs.Root className={styles['tabsRoot']} defaultValue="details">
          <Tabs.List className={styles['tabsList']} aria-label="Wallet Information">
            <Tabs.Trigger 
              className={styles['tabsTrigger']} 
              value="details"
              aria-controls="details-tab"
            >
              Details
            </Tabs.Trigger>
            <Tabs.Trigger 
              className={styles['tabsTrigger']} 
              value="session"
              aria-controls="session-tab"
            >
              Session
            </Tabs.Trigger>
            <Tabs.Trigger 
              className={styles['tabsTrigger']} 
              value="dapp"
              aria-controls="dapp-tab"
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
                <span className={styles['label']}>Chain</span>
                <span className={styles['value']}>{connectedWallet.state.chain || "Unknown"}</span>
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
                    aria-label="Copy address"
                    title="Copy address"
                  >
                    {copiedAddress ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {connectedWallet.info.url && (
                <div className={styles['infoItem']}>
                  <span className={styles['label']}>Wallet URL</span>
                  <div className={styles['valueWithAction']}>
                    <span className={styles['value']}>{connectedWallet.info.url}</span>
                    <a
                      href={connectedWallet.info.url}
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
                <div className={styles['valueWithAction']}>
                  <span className={styles['value']}>
                    {connectedWallet.state.sessionId || "Not available"}
                  </span>
                  {connectedWallet.state.sessionId && (
                    <button 
                      onClick={handleCopySession}
                      className={styles['actionButton']}
                      aria-label="Copy session ID"
                      title="Copy session ID"
                    >
                      {copiedSession ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
              </div>

              <div className={styles['infoItem']}>
                <span className={styles['label']}>Connected Since</span>
                <span className={styles['value']}>{formattedConnectionTime}</span>
              </div>

              <div className={styles['infoItem']}>
                <span className={styles['label']}>Status</span>
                <div className={styles['valueWithAction']}>
                  <span className={styles['value']}>Connected</span>
                  <button
                    onClick={onDisconnect}
                    className={styles['actionButton']}
                    aria-label="Refresh connection"
                    title="Refresh connection"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
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
          <button 
            onClick={onDisconnect} 
            className={styles['disconnectButton']}
            aria-label="Disconnect wallet"
          >
            Disconnect Wallet
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
