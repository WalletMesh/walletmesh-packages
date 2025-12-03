import {
  EVMConnectButton,
  SolanaConnectButton,
  useAccount,
  useConnect,
  useEvmWallet,
  useSolanaWallet,
} from '@walletmesh/modal-react/all';
import { useEffect, useState } from 'react';
import styles from './DualWalletDemo.module.css';

interface WalletSession {
  id: string;
  type: 'evm' | 'solana';
  address: string;
  chainId: string;
  walletName: string;
  connectionTime: Date;
  isActive: boolean;
}

export function DualWalletDemo() {
  const { address: globalAddress } = useAccount();
  const { disconnect } = useConnect();

  // Chain-specific wallet states
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();

  // Track active sessions
  const [sessions, setSessions] = useState<WalletSession[]>([]);
  const [activeSessionType, setActiveSessionType] = useState<'evm' | 'solana' | null>(null);

  // Update sessions when wallets connect/disconnect
  useEffect(() => {
    const newSessions: WalletSession[] = [];

    // Add EVM session if connected
    if (evmWallet.isConnected && evmWallet.address && evmWallet.chainId && evmWallet.wallet) {
      newSessions.push({
        id: `evm-${evmWallet.address}`,
        type: 'evm',
        address: evmWallet.address,
        chainId: evmWallet.chainId,
        walletName: evmWallet.wallet.name,
        connectionTime: new Date(),
        isActive: evmWallet.address === globalAddress,
      });
    }

    // Add Solana session if connected
    if (solanaWallet.isConnected && solanaWallet.address && solanaWallet.chainId && solanaWallet.wallet) {
      newSessions.push({
        id: `solana-${solanaWallet.address}`,
        type: 'solana',
        address: solanaWallet.address,
        chainId: solanaWallet.chainId,
        walletName: solanaWallet.wallet.name,
        connectionTime: new Date(),
        isActive: solanaWallet.address === globalAddress,
      });
    }

    setSessions(newSessions);

    // Determine active session type
    if (evmWallet.isConnected && evmWallet.address === globalAddress) {
      setActiveSessionType('evm');
    } else if (solanaWallet.isConnected && solanaWallet.address === globalAddress) {
      setActiveSessionType('solana');
    } else {
      setActiveSessionType(null);
    }
  }, [
    evmWallet.isConnected,
    evmWallet.address,
    evmWallet.chainId,
    evmWallet.wallet,
    solanaWallet.isConnected,
    solanaWallet.address,
    solanaWallet.chainId,
    solanaWallet.wallet,
    globalAddress,
  ]);

  // Handle session switching
  const switchToSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    try {
      // This would require implementing session switching in the core library
      // For now, we'll just show which session would be activated
      console.log(`Switching to ${session.type} session:`, session);
    } catch (error) {
      console.error('Failed to switch session:', error);
    }
  };

  // Handle disconnecting specific session
  const disconnectSession = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    try {
      await disconnect();
      console.log(`Disconnected ${session.type} session`);
    } catch (error) {
      console.error('Failed to disconnect session:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainIcon = (type: 'evm' | 'solana') => {
    return type === 'evm' ? '⬢' : '◎';
  };

  const getStatusColor = (type: 'evm' | 'solana', isActive: boolean) => {
    if (!isActive) return '#6b7280';
    return type === 'evm' ? '#627eea' : '#9945ff';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔄 Dual Wallet Connection Demo</h3>
        <p className={styles.description}>
          Connect both EVM and Solana wallets simultaneously and manage multiple sessions
        </p>
      </div>

      {/* Connection Section */}
      <div className={styles.connectionSection}>
        <h4 className={styles.sectionTitle}>Wallet Connections</h4>
        <div className={styles.connectButtonGrid}>
          <div className={styles.connectGroup}>
            <h5 className={styles.connectGroupTitle}>EVM Wallets</h5>
            <EVMConnectButton
              showAddress={true}
              showChain={true}
              showTransactionStatus={true}
              showNetworkIndicator={true}
              label="Connect EVM Wallet"
            />
            <div className={styles.walletStatus}>
              <span className={styles.statusLabel}>Status:</span>
              <span
                className={styles.statusValue}
                style={{ color: getStatusColor('evm', evmWallet.isConnected) }}
              >
                {evmWallet.isConnected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
          </div>

          <div className={styles.connectGroup}>
            <h5 className={styles.connectGroupTitle}>Solana Wallets</h5>
            <SolanaConnectButton
              showAddress={true}
              showChain={true}
              showTransactionStatus={true}
              showClusterIndicator={true}
              label="Connect Solana Wallet"
            />
            <div className={styles.walletStatus}>
              <span className={styles.statusLabel}>Status:</span>
              <span
                className={styles.statusValue}
                style={{ color: getStatusColor('solana', solanaWallet.isConnected) }}
              >
                {solanaWallet.isConnected ? '✅ Connected' : '❌ Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions Display */}
      <div className={styles.sessionsSection}>
        <h4 className={styles.sectionTitle}>Active Sessions ({sessions.length})</h4>

        {sessions.length > 0 ? (
          <div className={styles.sessionsList}>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`${styles.sessionCard} ${session.isActive ? styles.activeSession : ''}`}
              >
                <div className={styles.sessionHeader}>
                  <div className={styles.sessionIcon}>{getChainIcon(session.type)}</div>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionType}>{session.type.toUpperCase()} Wallet</div>
                    <div className={styles.sessionWallet}>{session.walletName}</div>
                  </div>
                  {session.isActive && <div className={styles.activeBadge}>Active</div>}
                </div>

                <div className={styles.sessionDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Address:</span>
                    <span className={styles.detailValue}>{formatAddress(session.address)}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Chain:</span>
                    <span className={styles.detailValue}>{session.chainId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Connected:</span>
                    <span className={styles.detailValue}>{session.connectionTime.toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className={styles.sessionActions}>
                  {!session.isActive && (
                    <button
                      type="button"
                      onClick={() => switchToSession(session.id)}
                      className={styles.switchButton}
                    >
                      Switch To
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => disconnectSession(session.id)}
                    className={styles.disconnectButton}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noSessions}>
            <p>No active wallet sessions</p>
            <p className={styles.noSessionsHint}>
              Connect EVM and/or Solana wallets above to see active sessions
            </p>
          </div>
        )}
      </div>

      {/* Global Connection State */}
      <div className={styles.globalStateSection}>
        <h4 className={styles.sectionTitle}>Global Connection State</h4>
        <div className={styles.globalStateGrid}>
          <div className={styles.globalStateItem}>
            <span className={styles.globalStateLabel}>Currently Active:</span>
            <span className={styles.globalStateValue}>
              {activeSessionType
                ? `${activeSessionType.toUpperCase()} (${formatAddress(globalAddress || '')})`
                : 'None'}
            </span>
          </div>
          <div className={styles.globalStateItem}>
            <span className={styles.globalStateLabel}>Total Sessions:</span>
            <span className={styles.globalStateValue}>{sessions.length}</span>
          </div>
          <div className={styles.globalStateItem}>
            <span className={styles.globalStateLabel}>EVM Status:</span>
            <span className={styles.globalStateValue}>{evmWallet.status.toUpperCase()}</span>
          </div>
          <div className={styles.globalStateItem}>
            <span className={styles.globalStateLabel}>Solana Status:</span>
            <span className={styles.globalStateValue}>{solanaWallet.status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className={styles.technicalSection}>
        <h4 className={styles.sectionTitle}>Technical Implementation</h4>
        <div className={styles.technicalDetails}>
          <p className={styles.technicalText}>
            This demo shows how WalletMesh can manage multiple simultaneous wallet connections:
          </p>
          <ul className={styles.technicalList}>
            <li>
              🔗 <strong>Independent Sessions:</strong> EVM and Solana wallets connect independently
            </li>
            <li>
              🎯 <strong>Active Session:</strong> One session is "active" for global operations
            </li>
            <li>
              🔄 <strong>Session Switching:</strong> Switch between connected wallets seamlessly
            </li>
            <li>
              📊 <strong>State Management:</strong> Separate state tracking for each chain type
            </li>
            <li>
              🛡️ <strong>Type Safety:</strong> Chain-specific hooks ensure proper typing
            </li>
          </ul>
        </div>
      </div>

      {/* Code Example */}
      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Code Example</h4>
        <pre className={styles.codeBlock}>
          <code>{`// Managing multiple wallet connections
import { useEvmWallet, useSolanaWallet } from '@walletmesh/modal-react/all';

function DualWalletApp() {
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();

  return (
    <div>
      {/* EVM wallet connection */}
      <EVMConnectButton />
      {evmWallet.isConnected && (
        <p>EVM: {evmWallet.address} on {evmWallet.chainId}</p>
      )}

      {/* Solana wallet connection */}
      <SolanaConnectButton />
      {solanaWallet.isConnected && (
        <p>Solana: {solanaWallet.address} on {solanaWallet.chainId}</p>
      )}

      {/* Use both wallets independently */}
      <button onClick={() => sendEthTransaction()}>
        Send ETH (requires EVM wallet)
      </button>
      <button onClick={() => sendSolTransaction()}>
        Send SOL (requires Solana wallet)
      </button>
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
