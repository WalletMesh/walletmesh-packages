import { formatError } from '@walletmesh/modal-core';
import { ChainType, useAccount, useConfig, useWalletEvents } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useState } from 'react';
import styles from './ModalControlDemo.module.css';

export function ModalControlDemo() {
  const { isOpen, open, close, appName, chains, wallets } = useConfig();
  const { isConnected, address, wallet } = useAccount();
  const [modalEvents, setModalEvents] = useState<
    Array<{ id: string; type: string; timestamp: number; data?: unknown }>
  >([]);
  const [customChainType, setCustomChainType] = useState<ChainType | undefined>(undefined);
  const [autoCloseTimer, setAutoCloseTimer] = useState<number | null>(null);

  // Track modal events
  const addModalEvent = useCallback((type: string, data?: unknown) => {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      data,
    };
    setModalEvents((prev) => [event, ...prev.slice(0, 19)]); // Keep last 20 events
  }, []); // Empty dependency array since we use the functional update pattern

  // Listen for modal state changes
  useEffect(() => {
    if (isOpen) {
      addModalEvent('modal_opened');
    } else {
      addModalEvent('modal_closed');
    }
  }, [isOpen, addModalEvent]);

  // Listen for wallet events to track modal usage
  const handleConnectionEstablished = useCallback(
    (data: unknown) => {
      addModalEvent('wallet_connected', { walletId: data });
    },
    [addModalEvent],
  );

  const handleConnectionFailed = useCallback(
    (error: unknown) => {
      addModalEvent('connection_failed', { error: formatError(error).message });
    },
    [addModalEvent],
  );

  useWalletEvents('connection:established', handleConnectionEstablished);
  useWalletEvents('connection:failed', handleConnectionFailed);

  // Auto-close functionality
  const openWithAutoClose = (seconds: number) => {
    open(customChainType ? { targetChainType: customChainType } : undefined);

    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
    }

    const timer = window.setTimeout(() => {
      close();
      addModalEvent('auto_close_triggered', { delay: seconds });
    }, seconds * 1000);

    setAutoCloseTimer(timer);
  };

  // Cancel auto-close
  const cancelAutoClose = () => {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      setAutoCloseTimer(null);
      addModalEvent('auto_close_cancelled');
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Clear events
  const clearEvents = () => {
    setModalEvents([]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🎛️ Modal Control Center</h3>
        <p className={styles.description}>
          Programmatically control the WalletMesh modal and track its state
        </p>
      </div>

      {/* Modal Status */}
      <div className={styles.statusSection}>
        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <span className={styles.statusLabel}>Modal Status</span>
            <div className={`${styles.statusDot} ${isOpen ? styles.open : styles.closed}`} />
          </div>
          <div className={styles.statusValue}>{isOpen ? 'Open' : 'Closed'}</div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <span className={styles.statusLabel}>Connection Status</span>
            <div className={`${styles.statusDot} ${isConnected ? styles.connected : styles.disconnected}`} />
          </div>
          <div className={styles.statusValue}>{isConnected ? 'Connected' : 'Disconnected'}</div>
          {isConnected && (
            <div className={styles.statusDetail}>
              {wallet?.name} - {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          )}
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusHeader}>
            <span className={styles.statusLabel}>Auto-Close Timer</span>
          </div>
          <div className={styles.statusValue}>{autoCloseTimer ? 'Active' : 'Inactive'}</div>
          {autoCloseTimer && (
            <button type="button" onClick={cancelAutoClose} className={styles.cancelButton}>
              Cancel Timer
            </button>
          )}
        </div>
      </div>

      {/* Control Panels */}
      <div className={styles.controlPanels}>
        {/* Basic Controls */}
        <div className={styles.controlPanel}>
          <h4 className={styles.panelTitle}>Basic Controls</h4>
          <div className={styles.controlGroup}>
            <button
              type="button"
              onClick={() => open()}
              disabled={isOpen}
              className={`${styles.controlButton} ${styles.openButton}`}
            >
              Open Modal
            </button>

            <button
              type="button"
              onClick={() => close()}
              disabled={!isOpen}
              className={`${styles.controlButton} ${styles.closeButton}`}
            >
              Close Modal
            </button>

            <button
              type="button"
              onClick={() => (isOpen ? close() : open())}
              className={`${styles.controlButton} ${styles.toggleButton}`}
            >
              Toggle Modal
            </button>
          </div>
        </div>

        {/* Chain-Specific Controls */}
        <div className={styles.controlPanel}>
          <h4 className={styles.panelTitle}>Chain-Specific Opening</h4>
          <div className={styles.controlGroup}>
            <select
              value={customChainType || ''}
              onChange={(e) => setCustomChainType((e.target.value as ChainType) || undefined)}
              className={styles.chainSelect}
            >
              <option value="">All Chains</option>
              <option value={ChainType.Evm}>EVM Only</option>
              <option value={ChainType.Solana}>Solana Only</option>
              <option value={ChainType.Aztec}>Aztec Only</option>
            </select>

            <button
              type="button"
              onClick={() => open(customChainType ? { targetChainType: customChainType } : undefined)}
              disabled={isOpen}
              className={`${styles.controlButton} ${styles.chainButton}`}
            >
              Open with Filter
            </button>
          </div>
        </div>

        {/* Auto-Close Controls */}
        <div className={styles.controlPanel}>
          <h4 className={styles.panelTitle}>Auto-Close Controls</h4>
          <div className={styles.controlGroup}>
            <button
              type="button"
              onClick={() => openWithAutoClose(3)}
              disabled={isOpen}
              className={`${styles.controlButton} ${styles.autoButton}`}
            >
              Open (3s auto-close)
            </button>

            <button
              type="button"
              onClick={() => openWithAutoClose(5)}
              disabled={isOpen}
              className={`${styles.controlButton} ${styles.autoButton}`}
            >
              Open (5s auto-close)
            </button>

            <button
              type="button"
              onClick={() => openWithAutoClose(10)}
              disabled={isOpen}
              className={`${styles.controlButton} ${styles.autoButton}`}
            >
              Open (10s auto-close)
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Display */}
      <div className={styles.configSection}>
        <h4 className={styles.sectionTitle}>Current Configuration</h4>
        <div className={styles.configGrid}>
          <div className={styles.configItem}>
            <span className={styles.configLabel}>App Name:</span>
            <span className={styles.configValue}>{appName || 'Not set'}</span>
          </div>
          <div className={styles.configItem}>
            <span className={styles.configLabel}>Auto Inject:</span>
            <span className={styles.configValue}>Enabled</span>
          </div>
          <div className={styles.configItem}>
            <span className={styles.configLabel}>Supported Chains:</span>
            <span className={styles.configValue}>{chains.length > 0 ? chains.join(', ') : 'All'}</span>
          </div>
          <div className={styles.configItem}>
            <span className={styles.configLabel}>Wallet Order:</span>
            <span className={styles.configValue}>
              {wallets.length > 0 ? wallets.map((w) => w.name).join(', ') : 'Default'}
            </span>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className={styles.eventSection}>
        <div className={styles.eventHeader}>
          <h4 className={styles.sectionTitle}>Modal Event Log ({modalEvents.length})</h4>
          <button type="button" onClick={clearEvents} className={styles.clearButton}>
            Clear Events
          </button>
        </div>

        <div className={styles.eventLog}>
          {modalEvents.length > 0 ? (
            modalEvents.map((event) => (
              <div key={event.id} className={styles.eventItem}>
                <div className={styles.eventHeader}>
                  <span className={`${styles.eventType} ${styles[event.type]}`}>
                    {event.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                  <span className={styles.eventTime}>{formatTime(event.timestamp)}</span>
                </div>

                {event.data ? (
                  <div className={styles.eventData}>
                    <pre>{JSON.stringify(event.data, null, 2)}</pre>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📋</div>
              <div className={styles.emptyText}>
                No modal events yet. Interact with the modal controls to see events here.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Code Example */}
      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Implementation Example</h4>
        <pre className={styles.codeBlock}>
          {`// Modal Control with WalletMesh
import { useConfig, useWalletEvents } from '@walletmesh/modal-react/all';

function ModalController() {
  const { isOpen, open, close } = useConfig();
  
  // Listen for modal events
  useWalletEvents('connection:established', (data) => {
    console.log('Wallet connected via modal:', data);
  });
  
  const openEvmOnly = () => {
    open({ targetChainType: ChainType.Evm });
  };
  
  const openWithAutoClose = () => {
    open();
    setTimeout(() => close(), 5000); // Auto-close after 5s
  };
  
  return (
    <div>
      <p>Modal is {isOpen ? 'open' : 'closed'}</p>
      <button onClick={open}>Open Modal</button>
      <button onClick={close}>Close Modal</button>
      <button onClick={() => isOpen ? close() : open()}>Toggle Modal</button>
      <button onClick={openEvmOnly}>Open EVM Only</button>
      <button onClick={openWithAutoClose}>Open with Auto-Close</button>
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
}
