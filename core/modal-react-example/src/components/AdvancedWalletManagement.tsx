import {
  type ChainType,
  ethereumMainnet,
  polygonMainnet,
  useAccount,
  useConfig,
  useSwitchChain,
  useWalletEvents,
} from '@walletmesh/modal-react/all';
import { useCallback, useState } from 'react';
import styles from '../styles/AdvancedWalletManagement.module.css';

// Local session type for demo purposes
interface LocalSession {
  sessionId: string;
  metadata: {
    name?: string;
    description?: string;
  };
  wallet: {
    name: string;
    icon?: string;
  } | null;
  isActive: boolean;
  createdAt: number;
}

/**
 * Comprehensive example demonstrating all new advanced wallet management functionality
 */
export function AdvancedWalletManagement() {
  const { isConnected, address, chain } = useAccount();
  const [logs, setLogs] = useState<string[]>([]);

  // Chain validation and switching (using new simplified API)
  const {
    ensureChain,
    isCorrectChain,
    getChainMismatchMessage,
    isSwitching: isChainSwitching,
  } = useSwitchChain();

  // Advanced wallet selection (using new simplified API)
  const { wallet: selectedWallet } = useAccount();
  const { wallets } = useConfig();

  // Helper function to get wallet availability (simplified version)
  const walletAvailability = wallets.map((wallet) => ({
    wallet,
    isAvailable: true, // Simplified - in real app would check window.ethereum etc.
    supportsCurrentChain: wallet.chains?.includes(chain?.chainType as ChainType) ?? true,
  }));

  // Helper function to get recommended wallet (simplified version)
  const getRecommendedWallet = () =>
    walletAvailability.find((w) => w.isAvailable && w.supportsCurrentChain)?.wallet;

  // Refresh wallets function (functionality removed - now shows current state)
  const refreshAvailability = () => {
    addLog('ℹ️ Showing current wallet availability (auto-refresh removed)');
  };

  // Session management (simplified - using local state instead of removed useWalletSessions)
  const [localSessions, setLocalSessions] = useState<LocalSession[]>([]);
  const sessionState = {
    sessions: localSessions,
    stats: {
      totalSessions: localSessions.length,
      activeSessions: localSessions.filter((s) => s.isActive).length,
      mostUsedWallet: selectedWallet?.name || null,
    },
  };

  const createSession = async (metadata: { name?: string; description?: string }) => {
    const newSession = {
      sessionId: `session-${Date.now()}`,
      metadata,
      wallet: selectedWallet,
      isActive: true,
      createdAt: Date.now(),
    };
    setLocalSessions((prev) => [...prev, newSession]);
    return newSession;
  };

  // Define addLog first to avoid circular dependency
  const addLog = useCallback(
    (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const walletInfo = selectedWallet ? ` [${selectedWallet.name}]` : '';
      setLogs((prev) => [`[${timestamp}]${walletInfo} ${message}`, ...prev.slice(0, 19)]);
    },
    [selectedWallet],
  );

  const clearAllSessions = () => {
    setLocalSessions([]);
    addLog('🗑️ Cleared all sessions');
  };

  // Create stable event handlers
  const handleConnectionEstablished = useCallback(
    (event: unknown) => {
      addLog(`✅ Connection established: ${JSON.stringify(event)}`);
    },
    [addLog],
  );

  const handleConnectionFailed = useCallback(
    (event: unknown) => {
      addLog(`❌ Connection failed: ${JSON.stringify(event)}`);
    },
    [addLog],
  );

  const handleStateUpdated = useCallback(
    (event: unknown) => {
      addLog(`📊 State updated: ${JSON.stringify(event)}`);
    },
    [addLog],
  );

  // Advanced event monitoring with unified API
  const { pause, resume, isPaused } = useWalletEvents({
    'connection:established': handleConnectionEstablished,
    'connection:failed': handleConnectionFailed,
    'state:updated': handleStateUpdated,
  });

  const handleDemoChainSwitch = async () => {
    try {
      const targetChain = chain?.chainId === 'eip155:1' ? polygonMainnet : ethereumMainnet; // Switch between Ethereum and Polygon
      const chainName = targetChain.chainId === 'eip155:1' ? 'Ethereum' : 'Polygon';

      addLog(`🔄 Attempting to switch to ${chainName}...`);
      await ensureChain(targetChain, {
        autoSwitch: true,
        throwOnError: true,
      });
      addLog(`✅ Successfully switched to ${chainName}`);
    } catch (error) {
      addLog(`❌ Chain switch failed: ${(error as Error).message}`);
    }
  };

  const handleCreateSession = async () => {
    try {
      const session = await createSession({
        name: `Session ${Date.now()}`,
        description: 'Demo session created from AdvancedWalletManagement',
      });
      addLog(`✅ Created session: ${session.metadata.name}`);
    } catch (error) {
      addLog(`❌ Session creation failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🚀 Advanced Wallet Management Demo</h1>
      <p className={styles.subtitle}>Comprehensive demonstration of all new modal-react functionality</p>

      {/* Connection Status */}
      <div className={isConnected ? styles.connectionBannerConnected : styles.connectionBannerDisconnected}>
        <h3 className={styles.bannerTitle}>🔌 Connection Status</h3>
        {isConnected ? (
          <div className={styles.bannerDetails}>
            <div className={styles.bannerDetail}>
              <strong>Address:</strong> {address}
            </div>
            <div className={styles.bannerDetail}>
              <strong>Chain:</strong> {chain?.chainId} ({chain?.chainType})
            </div>
            <div className={styles.bannerDetail}>
              <strong>Wallet:</strong> {selectedWallet?.name || 'Unknown'}
            </div>
          </div>
        ) : (
          <div className={styles.bannerDetails}>No wallet connected</div>
        )}
      </div>

      <div className={styles.grid}>
        {/* Chain Management */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>⛓️ Chain Management</h3>
          <div className={styles.cardActions}>
            <button
              type="button"
              onClick={handleDemoChainSwitch}
              disabled={!isConnected || isChainSwitching}
              className={styles.buttonPrimary}
            >
              {isChainSwitching ? 'Switching...' : 'Demo Chain Switch'}
            </button>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Current Chain Valid:</span>
              <span>{isCorrectChain(ethereumMainnet) ? '✅' : '❌'}</span>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Chain Message:</span>
              <span>{getChainMismatchMessage(ethereumMainnet)}</span>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📱 Session Management</h3>
          <div className={styles.cardActions}>
            <button
              type="button"
              onClick={handleCreateSession}
              disabled={!isConnected}
              className={styles.buttonSuccess}
            >
              Create Session
            </button>
            <button type="button" onClick={clearAllSessions} className={styles.buttonDanger}>
              Clear All
            </button>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Total Sessions:</span>
              <span>{sessionState.stats.totalSessions}</span>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Active Sessions:</span>
              <span>{sessionState.stats.activeSessions}</span>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Most Used Wallet:</span>
              <span>{sessionState.stats.mostUsedWallet || 'None'}</span>
            </div>
            {sessionState.sessions.length > 0 && (
              <div>
                <div className={styles.cardDetail}>
                  <span className={styles.cardDetailLabel}>Sessions:</span>
                </div>
                {sessionState.sessions.slice(0, 2).map((session, index) => (
                  <div
                    key={`${session.sessionId}-${index}`}
                    className={session.isActive ? styles.sessionItemActive : styles.sessionItemInactive}
                  >
                    {session.metadata.name || session.wallet?.name || 'Unknown'}
                    {session.isActive && ' (Active)'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Wallet Selection */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>💼 Wallet Selection</h3>
          <div className={styles.cardActions}>
            <button type="button" onClick={refreshAvailability} className={styles.buttonPrimary}>
              Refresh Wallets
            </button>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Available Wallets:</span>
              <span>{walletAvailability.length}</span>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Recommended:</span>
              <span>{getRecommendedWallet()?.name || 'None'}</span>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Selected:</span>
              <span>{selectedWallet?.name || 'None'}</span>
            </div>
            <div>
              {walletAvailability.slice(0, 3).map(({ wallet, isAvailable, supportsCurrentChain }) => (
                <div
                  key={wallet.id}
                  className={
                    isAvailable && supportsCurrentChain
                      ? styles.walletItemAvailable
                      : styles.walletItemUnavailable
                  }
                >
                  <span>
                    {wallet.name} {isAvailable ? '✅' : '❌'} {supportsCurrentChain ? '⛓️' : '🚫'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Monitoring */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>📡 Event Monitoring</h3>
          <div className={styles.cardActions}>
            <button
              type="button"
              onClick={isPaused ? resume : pause}
              className={isPaused ? styles.buttonSuccess : styles.buttonWarning}
            >
              {isPaused ? 'Resume Events' : 'Pause Events'}
            </button>
          </div>
          <div className={styles.cardContent}>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Event Status:</span>
              <span>{isPaused ? 'Paused' : 'Active'}</span>
            </div>
            <div className={styles.cardDetail}>
              <span className={styles.cardDetailLabel}>Recent Events:</span>
            </div>
            <div className={styles.eventLog}>
              {logs.slice(0, 5).map((log, i) => (
                <div key={`log-recent-${i}-${log.substring(0, 20)}`} className={styles.eventLogEntry}>
                  {log}
                </div>
              ))}
              {logs.length === 0 && <div className={styles.eventLogEmpty}>No events yet</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Event Log */}
      <div className={styles.eventLogContainer}>
        <h3 className={styles.eventLogTitle}>📝 Event Log</h3>
        <div className={logs.length === 0 ? styles.eventLogEmpty : styles.eventLog}>
          {logs.length === 0 ? (
            <div>Waiting for events...</div>
          ) : (
            logs.map((log, i) => (
              <div key={`log-full-${i}-${log.substring(0, 20)}`} className={styles.eventLogEntry}>
                {log}
              </div>
            ))
          )}
        </div>
        <button type="button" onClick={() => setLogs([])} className={styles.clearLogButton}>
          Clear Log
        </button>
      </div>
    </div>
  );
}
