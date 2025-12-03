import { useEvmWallet, useSolanaWallet, useWalletEvents } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useId, useState } from 'react';
import styles from './EventHandlingDemo.module.css';

interface EventLog {
  id: string;
  timestamp: number;
  eventName: string;
  chainType: 'evm' | 'solana' | 'general';
  data: unknown;
  icon: string;
  color: string;
}

interface EventFilter {
  chainType: 'all' | 'evm' | 'solana' | 'general';
  eventTypes: string[];
  searchTerm: string;
}

// Event type configurations
const EVENT_TYPES = {
  general: [
    { name: 'connection:established', icon: '🔗', color: '#10b981' },
    { name: 'connection:failed', icon: '❌', color: '#ef4444' },
    { name: 'connection:lost', icon: '🔌', color: '#f59e0b' },
    { name: 'state:updated', icon: '🔄', color: '#3b82f6' },
    { name: 'modal:opened', icon: '🪟', color: '#8b5cf6' },
    { name: 'modal:closed', icon: '🚪', color: '#6b7280' },
  ],
  evm: [
    { name: 'chain:switched', icon: '⛓️', color: '#3b82f6' },
    { name: 'accounts:changed', icon: '👤', color: '#10b981' },
    { name: 'balance:updated', icon: '💰', color: '#f59e0b' },
    { name: 'transaction:sent', icon: '📤', color: '#8b5cf6' },
    { name: 'transaction:confirmed', icon: '✅', color: '#10b981' },
    { name: 'transaction:failed', icon: '⚠️', color: '#ef4444' },
  ],
  solana: [
    { name: 'cluster:switched', icon: '🌐', color: '#3b82f6' },
    { name: 'wallet:connected', icon: '🔐', color: '#10b981' },
    { name: 'wallet:disconnected', icon: '🔓', color: '#6b7280' },
    { name: 'signature:requested', icon: '✍️', color: '#8b5cf6' },
    { name: 'signature:approved', icon: '✔️', color: '#10b981' },
    { name: 'signature:rejected', icon: '✖️', color: '#ef4444' },
  ],
};

export function EventHandlingDemo() {
  const { on } = useWalletEvents();
  const id = useId();
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();

  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [maxLogs, setMaxLogs] = useState(50);
  const [filter, setFilter] = useState<EventFilter>({
    chainType: 'all',
    eventTypes: [],
    searchTerm: '',
  });
  const [subscribedEvents] = useState<Set<string>>(new Set());
  const [eventStats, setEventStats] = useState<Record<string, number>>({});

  // Add event to log
  const addEventLog = useCallback(
    (eventName: string, data: unknown, chainType: 'evm' | 'solana' | 'general') => {
      if (isPaused) return;

      const eventConfig = [...EVENT_TYPES.general, ...EVENT_TYPES.evm, ...EVENT_TYPES.solana].find(
        (e) => e.name === eventName,
      ) || { icon: '📍', color: '#6b7280' };

      const newLog: EventLog = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        eventName,
        chainType,
        data,
        icon: eventConfig.icon,
        color: eventConfig.color,
      };

      setEventLogs((prev) => [newLog, ...prev.slice(0, maxLogs - 1)]);

      // Update stats
      setEventStats((prev) => ({
        ...prev,
        [eventName]: (prev[eventName] || 0) + 1,
      }));
    },
    [isPaused, maxLogs],
  );

  // Subscribe to general events
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // General connection events
    if (subscribedEvents.has('connection:established') || subscribedEvents.size === 0) {
      unsubscribers.push(
        on('connection:established', (data: unknown) => {
          addEventLog('connection:established', data, 'general');
        }),
      );
    }

    if (subscribedEvents.has('connection:failed') || subscribedEvents.size === 0) {
      unsubscribers.push(
        on('connection:failed', (error: unknown) => {
          addEventLog('connection:failed', error, 'general');
        }),
      );
    }

    if (subscribedEvents.has('state:updated') || subscribedEvents.size === 0) {
      unsubscribers.push(
        on('state:updated', (state: unknown) => {
          addEventLog('state:updated', state, 'general');
        }),
      );
    }

    return () => {
      unsubscribers.forEach((unsub) => {
        unsub();
      });
    };
  }, [on, addEventLog, subscribedEvents]);

  // Subscribe to EVM-specific events
  useEffect(() => {
    if (!evmWallet.isConnected) return;

    const unsubscribers: (() => void)[] = [];

    if (subscribedEvents.has('chain:switched') || subscribedEvents.size === 0) {
      unsubscribers.push(
        on('chain:switched', (chainId: unknown) => {
          addEventLog('chain:switched', { chainId, chainName: evmWallet.chain?.name }, 'evm');
        }),
      );
    }

    if (subscribedEvents.has('accounts:changed') || subscribedEvents.size === 0) {
      // accounts:changed is not in ModalEventMap, commenting out for now
      // unsubscribers.push(
      //   on('accounts:changed', (accounts: unknown) => {
      //     addEventLog('accounts:changed', { accounts, current: (accounts as any[])?.[0] }, 'evm');
      //   })
      // );
    }

    return () => {
      unsubscribers.forEach((unsub) => {
        unsub();
      });
    };
  }, [on, addEventLog, subscribedEvents, evmWallet.isConnected, evmWallet.chain]);

  // Subscribe to Solana-specific events
  useEffect(() => {
    if (!solanaWallet.isConnected) return;

    const unsubscribers: (() => void)[] = [];

    // Simulate Solana-specific events for demo
    if (subscribedEvents.has('wallet:connected') || subscribedEvents.size === 0) {
      // This would normally come from the Solana provider
      addEventLog(
        'wallet:connected',
        {
          publicKey: solanaWallet.address,
          cluster: solanaWallet.chain?.name,
        },
        'solana',
      );
    }

    return () => {
      unsubscribers.forEach((unsub) => {
        unsub();
      });
    };
  }, [addEventLog, solanaWallet.isConnected, solanaWallet.address, solanaWallet.chain, subscribedEvents]);

  // Trigger test events
  const triggerTestEvent = (eventName: string, chainType: 'evm' | 'solana' | 'general') => {
    const testData = {
      test: true,
      timestamp: Date.now(),
      message: `Test ${eventName} event`,
    };

    addEventLog(eventName, testData, chainType);
  };

  // Clear logs
  const clearLogs = () => {
    setEventLogs([]);
    setEventStats({});
  };

  // Export logs
  const exportLogs = () => {
    const data = JSON.stringify(eventLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `walletmesh-events-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter logs
  const filteredLogs = eventLogs.filter((log) => {
    // Chain type filter
    if (filter.chainType !== 'all' && log.chainType !== filter.chainType) {
      return false;
    }

    // Event type filter
    if (filter.eventTypes.length > 0 && !filter.eventTypes.includes(log.eventName)) {
      return false;
    }

    // Search filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      return (
        log.eventName.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.data).toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      // fractionalSecondDigits: 3, // Not supported in all browsers
    });
  };

  // Get current wallet info
  const getCurrentWalletInfo = () => {
    if (evmWallet.isConnected) {
      return {
        type: 'EVM',
        icon: '⬢',
        address: evmWallet.address,
        chain: evmWallet.chain?.name,
      };
    } else if (solanaWallet.isConnected) {
      return {
        type: 'Solana',
        icon: '◎',
        address: solanaWallet.address,
        chain: solanaWallet.chain?.name,
      };
    }
    return null;
  };

  const walletInfo = getCurrentWalletInfo();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>📡 Advanced Event Handling</h3>
        <p className={styles.description}>
          Monitor and handle wallet events across EVM and Solana chains in real-time
        </p>
      </div>

      {/* Connection Status */}
      <div className={styles.statusSection}>
        <h4 className={styles.sectionTitle}>Connection Status</h4>
        {walletInfo ? (
          <div className={styles.walletInfo}>
            <div className={styles.walletStatus}>
              <span className={styles.walletIcon}>{walletInfo.icon}</span>
              <span className={styles.walletType}>{walletInfo.type} Wallet Connected</span>
            </div>
            <div className={styles.walletDetails}>
              <span>
                Address: {walletInfo.address?.slice(0, 8)}...{walletInfo.address?.slice(-6)}
              </span>
              <span>Chain: {walletInfo.chain}</span>
            </div>
          </div>
        ) : (
          <div className={styles.notConnected}>
            <p>No wallet connected. Connect an EVM or Solana wallet to see live events.</p>
          </div>
        )}
      </div>

      {/* Event Controls */}
      <div className={styles.controlsSection}>
        <h4 className={styles.sectionTitle}>Event Controls</h4>

        <div className={styles.controlRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="chain-filter" className={styles.controlLabel}>
              Chain Filter:
            </label>
            <select
              id={`${id}-chain-filter`}
              value={filter.chainType}
              onChange={(e) =>
                setFilter({ ...filter, chainType: e.target.value as 'all' | 'evm' | 'solana' | 'general' })
              }
              className={styles.filterSelect}
            >
              <option value="all">All Events</option>
              <option value="general">General Events</option>
              <option value="evm">⬢ EVM Events</option>
              <option value="solana">◎ Solana Events</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="max-logs" className={styles.controlLabel}>
              Max Logs:
            </label>
            <select
              id={`${id}-max-logs`}
              value={maxLogs}
              onChange={(e) => setMaxLogs(Number(e.target.value))}
              className={styles.filterSelect}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          <div className={styles.searchGroup}>
            <label htmlFor="search" className={styles.controlLabel}>
              Search:
            </label>
            <input
              id={`${id}-search`}
              type="text"
              value={filter.searchTerm}
              onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
              placeholder="Search events..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.controlRow}>
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={!isPaused} onChange={(e) => setIsPaused(!e.target.checked)} />
            Live Updates
          </label>

          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} />
            Auto-scroll
          </label>

          <button type="button" onClick={clearLogs} className={styles.actionButton}>
            🗑️ Clear Logs
          </button>

          <button
            type="button"
            onClick={exportLogs}
            disabled={eventLogs.length === 0}
            className={styles.actionButton}
          >
            📥 Export Logs
          </button>
        </div>
      </div>

      {/* Event Statistics */}
      <div className={styles.statsSection}>
        <h4 className={styles.sectionTitle}>Event Statistics</h4>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h5>Total Events</h5>
            <div className={styles.statValue}>{eventLogs.length}</div>
          </div>
          <div className={styles.statCard}>
            <h5>Unique Events</h5>
            <div className={styles.statValue}>{Object.keys(eventStats).length}</div>
          </div>
          <div className={styles.statCard}>
            <h5>Most Frequent</h5>
            <div className={styles.statValue}>
              {Object.entries(eventStats).length > 0
                ? Object.entries(eventStats).sort((a, b) => b[1] - a[1])[0][0]
                : 'None'}
            </div>
          </div>
          <div className={styles.statCard}>
            <h5>Status</h5>
            <div className={styles.statValue}>{isPaused ? '⏸️ Paused' : '▶️ Live'}</div>
          </div>
        </div>
      </div>

      {/* Test Event Triggers */}
      <div className={styles.triggerSection}>
        <h4 className={styles.sectionTitle}>Test Event Triggers</h4>
        <div className={styles.triggerGrid}>
          <div className={styles.triggerGroup}>
            <h5>General Events</h5>
            <div className={styles.triggerButtons}>
              {EVENT_TYPES.general.map((event) => (
                <button
                  key={event.name}
                  type="button"
                  onClick={() => triggerTestEvent(event.name, 'general')}
                  className={styles.triggerButton}
                  title={event.name}
                >
                  {event.icon} {event.name.split(':')[1]}
                </button>
              ))}
            </div>
          </div>

          {evmWallet.isConnected && (
            <div className={styles.triggerGroup}>
              <h5>⬢ EVM Events</h5>
              <div className={styles.triggerButtons}>
                {EVENT_TYPES.evm.map((event) => (
                  <button
                    key={event.name}
                    type="button"
                    onClick={() => triggerTestEvent(event.name, 'evm')}
                    className={styles.triggerButton}
                    title={event.name}
                  >
                    {event.icon} {event.name.split(':')[1]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {solanaWallet.isConnected && (
            <div className={styles.triggerGroup}>
              <h5>◎ Solana Events</h5>
              <div className={styles.triggerButtons}>
                {EVENT_TYPES.solana.map((event) => (
                  <button
                    key={event.name}
                    type="button"
                    onClick={() => triggerTestEvent(event.name, 'solana')}
                    className={styles.triggerButton}
                    title={event.name}
                  >
                    {event.icon} {event.name.split(':')[1]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Event Logs */}
      <div className={styles.logsSection}>
        <h4 className={styles.sectionTitle}>
          Event Logs ({filteredLogs.length} / {eventLogs.length})
        </h4>
        <div className={styles.logContainer}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className={styles.logEntry} style={{ borderLeftColor: log.color }}>
                <div className={styles.logHeader}>
                  <div className={styles.logMeta}>
                    <span className={styles.logIcon}>{log.icon}</span>
                    <span className={styles.logTime}>{formatTime(log.timestamp)}</span>
                    <span className={styles.logChain}>
                      {log.chainType === 'evm' ? '⬢' : log.chainType === 'solana' ? '◎' : '🌐'}{' '}
                      {log.chainType}
                    </span>
                  </div>
                  <span className={styles.logEvent}>{log.eventName}</span>
                </div>
                <div className={styles.logData}>
                  <pre>{JSON.stringify(log.data, null, 2)}</pre>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyLogs}>
              <div className={styles.emptyIcon}>📭</div>
              <p>No events logged yet</p>
              <p className={styles.emptySubtext}>
                {isPaused ? 'Resume live updates to see events' : 'Connect a wallet or trigger test events'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Code Example */}
      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Implementation Example</h4>
        <pre className={styles.codeBlock}>
          <code>{`// Advanced event handling across chains
import { useWalletEvents, useEvmWallet, useSolanaWallet } from '@walletmesh/modal-react/all';

function EventHandler() {
  const { subscribe, unsubscribe } = useWalletEvents();
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribers = [];

    // General events
    unsubscribers.push(
      subscribe('connection:established', (wallet) => {
        console.log('Wallet connected:', wallet);
        setEvents(prev => [...prev, { type: 'connect', wallet }]);
      }),
      
      subscribe('connection:failed', (error) => {
        console.error('Connection failed:', error);
        setEvents(prev => [...prev, { type: 'error', error }]);
      })
    );

    // EVM-specific events
    if (evmWallet.isConnected) {
      unsubscribers.push(
        subscribe('chain:switched', (chainId) => {
          console.log('EVM chain switched to:', chainId);
          setEvents(prev => [...prev, { type: 'chain', chainId }]);
        }),
        
        subscribe('accounts:changed', (accounts) => {
          console.log('EVM accounts changed:', accounts);
          setEvents(prev => [...prev, { type: 'accounts', accounts }]);
        })
      );
    }

    // Solana-specific events
    if (solanaWallet.isConnected) {
      // Listen to Solana provider events
      const provider = solanaWallet.provider;
      if (provider) {
        provider.on('disconnect', () => {
          console.log('Solana wallet disconnected');
          setEvents(prev => [...prev, { type: 'disconnect' }]);
        });
      }
    }

    // Cleanup
    return () => {
      unsubscribers.forEach(unsub => { unsub(); });
    };
  }, [subscribe, evmWallet.isConnected, solanaWallet.isConnected]);

  return (
    <div>
      <h3>Event Log</h3>
      {events.map((event, i) => (
        <div key={i}>
          {event.type}: {JSON.stringify(event)}
        </div>
      ))}
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
