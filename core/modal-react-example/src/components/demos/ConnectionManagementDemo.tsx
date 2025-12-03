import { formatError } from '@walletmesh/modal-core';
import { useAccount, useConnect } from '@walletmesh/modal-react/all';
import styles from './ConnectionManagementDemo.module.css';

export function ConnectionManagementDemo() {
  const { connect, disconnect, wallets, error, isConnecting, progressInfo } = useConnect();
  const { isConnected, address, chain, wallet, status } = useAccount();

  // Debug: Log all available wallets
  console.log(
    '[ConnectionManagementDemo] Available wallets:',
    wallets.map((w) => ({ id: w.id, name: w.name, chains: w.chains })),
  );

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔗 Connection Management</h3>
        <p className={styles.description}>
          Demonstrates the consolidated useConnect and useAccount hooks for wallet connection
        </p>
      </div>

      <div className={styles.statusSection}>
        <h4 className={styles.sectionTitle}>Connection Status</h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Status:</span>
            <span className={`${styles.value} ${styles[status as keyof typeof styles] || ''}`}>{status}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Connected:</span>
            <span className={styles.value}>{isConnected ? '✅ Yes' : '❌ No'}</span>
          </div>
          {isConnected && (
            <>
              <div className={styles.statusItem}>
                <span className={styles.label}>Wallet:</span>
                <span className={styles.value}>{wallet?.name || 'Unknown'}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>Address:</span>
                <span className={styles.value}>
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>Chain:</span>
                <span className={styles.value}>{chain?.name || 'N/A'}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>Chain ID:</span>
                <span className={styles.value}>{chain?.chainId || 'N/A'}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className={styles.walletsSection}>
          <h4 className={styles.sectionTitle}>Available Wallets</h4>
          <div className={styles.walletGrid}>
            {wallets.map((w) => (
              <button
                type="button"
                key={w.id}
                onClick={() => handleConnect(w.id)}
                disabled={isConnecting}
                className={styles.walletButton}
              >
                <div className={styles.walletName}>{w.name}</div>
                <div className={styles.walletChains}>{w.chains.join(', ')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isConnected && (
        <div className={styles.actionsSection}>
          <button type="button" onClick={handleDisconnect} className={styles.disconnectButton}>
            Disconnect
          </button>
        </div>
      )}

      {isConnecting && progressInfo && (
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressInfo.progress || 0}%` }} />
          </div>
          <p className={styles.progressText}>
            {String(progressInfo.step)}: {progressInfo.progress}%
          </p>
        </div>
      )}

      {error ? (
        <div className={styles.errorSection}>
          <h4 className={styles.errorTitle}>Connection Error</h4>
          <p className={styles.errorMessage}>{formatError(error).message}</p>
        </div>
      ) : null}

      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Code Example</h4>
        <pre className={styles.codeBlock}>
          <code>{`// Using the consolidated useConnect and useAccount hooks
import { useConnect, useAccount } from '@walletmesh/modal-react/all';

function MyComponent() {
  const { connect, disconnect, wallets, isConnecting } = useConnect();
  const { isConnected, address, wallet, chain } = useAccount();

  if (isConnected) {
    return (
      <div>
        <p>Connected to {wallet?.name}</p>
        <p>Address: {address}</p>
        <p>Chain: {chain?.name} ({chain?.chainId})</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {wallets.map(w => (
        <button key={w.id} onClick={() => connect(w.id)}>
          Connect {w.name}
        </button>
      ))}
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
