import { useCallback, useEffect, useState } from 'react';

interface DevModeConfig {
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  enableStateCapture?: boolean;
  enableEventLogging?: boolean;
  maxHistorySize?: number;
}

interface DevModeGlobal {
  config: DevModeConfig;
  setConfig: (config: Partial<DevModeConfig>) => void;
  getStateHistory: () => Array<{ timestamp: number; state: unknown }>;
  getEventLog: () => Array<{ timestamp: number; event: string; data: unknown }>;
  clearHistory: () => void;
  clearEventLog: () => void;
  captureState: (state: unknown) => void;
  logEvent: (event: string, data?: unknown) => void;
}

declare global {
  interface Window {
    __WALLETMESH_DEV_MODE__?: boolean;
    __WALLETMESH_DEV__?: DevModeGlobal;
  }
}

export function DevModePanel() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [config, setConfig] = useState<DevModeConfig | null>(null);
  const [stateHistory, setStateHistory] = useState<Array<{ timestamp: number; state: unknown }>>([]);
  const [eventLog, setEventLog] = useState<Array<{ timestamp: number; event: string; data: unknown }>>([]);
  const [showStateHistory, setShowStateHistory] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);

  const updateHistories = useCallback(() => {
    if (window.__WALLETMESH_DEV__) {
      setStateHistory(window.__WALLETMESH_DEV__.getStateHistory());
      setEventLog(window.__WALLETMESH_DEV__.getEventLog());
    }
  }, []);

  // Check if dev mode is available
  useEffect(() => {
    const checkDevMode = () => {
      if (window?.__WALLETMESH_DEV_MODE__ && window.__WALLETMESH_DEV__) {
        setIsEnabled(true);
        setConfig(window.__WALLETMESH_DEV__.config);
        updateHistories();
      } else {
        setIsEnabled(false);
      }
    };

    checkDevMode();
    // Poll for changes
    const interval = setInterval(checkDevMode, 1000);
    return () => clearInterval(interval);
  }, [updateHistories]);

  const handleConfigChange = (key: keyof DevModeConfig, value: boolean) => {
    if (window.__WALLETMESH_DEV__) {
      window.__WALLETMESH_DEV__.setConfig({ [key]: value });
      setConfig(window.__WALLETMESH_DEV__.config);
    }
  };

  const handleClearHistory = () => {
    if (window.__WALLETMESH_DEV__) {
      window.__WALLETMESH_DEV__.clearHistory();
      updateHistories();
    }
  };

  if (!isEnabled) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>🔧 DevMode Panel</h3>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          DevMode is currently disabled. Enable it by setting{' '}
          <code style={{ backgroundColor: '#e5e7eb', padding: '2px 4px', borderRadius: '4px' }}>
            window.__WALLETMESH_DEV_MODE__ = true
          </code>{' '}
          before loading WalletMesh.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #10b981',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
          🚀 DevMode Panel <span style={{ color: '#10b981', fontSize: '14px' }}>● Active</span>
        </h3>
        <button
          type="button"
          onClick={updateHistories}
          style={{
            padding: '6px 12px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Configuration Controls */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Configuration</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {config &&
            Object.entries(config).map(([key, value]) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handleConfigChange(key as keyof DevModeConfig, e.target.checked)}
                  style={{ marginRight: '6px' }}
                />
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            ))}
        </div>
      </div>

      {/* State History */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
            State History ({stateHistory.length} entries)
          </h4>
          <button
            type="button"
            onClick={() => setShowStateHistory(!showStateHistory)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {showStateHistory ? 'Hide' : 'Show'}
          </button>
        </div>
        {showStateHistory && (
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              backgroundColor: '#f3f4f6',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}
          >
            {stateHistory.length === 0 ? (
              <p style={{ margin: 0, color: '#6b7280' }}>No state history yet</p>
            ) : (
              stateHistory
                .slice()
                .reverse()
                .map((entry) => (
                  <div
                    key={entry.timestamp}
                    style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}
                  >
                    <div style={{ color: '#6b7280' }}>{new Date(entry.timestamp).toLocaleTimeString()}</div>
                    <pre style={{ margin: '4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(entry.state, null, 2)}
                    </pre>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Event Log */}
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
            Event Log ({eventLog.length} entries)
          </h4>
          <button
            type="button"
            onClick={() => setShowEventLog(!showEventLog)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#e5e7eb',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {showEventLog ? 'Hide' : 'Show'}
          </button>
        </div>
        {showEventLog && (
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              backgroundColor: '#f3f4f6',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}
          >
            {eventLog.length === 0 ? (
              <p style={{ margin: 0, color: '#6b7280' }}>No events logged yet</p>
            ) : (
              eventLog
                .slice()
                .reverse()
                .map((entry) => (
                  <div key={`${entry.timestamp}-${entry.event}`} style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#6b7280' }}>{new Date(entry.timestamp).toLocaleTimeString()}</span>{' '}
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>{entry.event}</span>
                    {entry.data ? (
                      <span style={{ color: '#374151' }}> {JSON.stringify(entry.data)}</span>
                    ) : null}
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={handleClearHistory}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Clear History
        </button>
        <button
          type="button"
          onClick={() => {
            console.log('DevMode State:', {
              config,
              stateHistory,
              eventLog,
            });
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Log to Console
        </button>
      </div>
    </div>
  );
}
