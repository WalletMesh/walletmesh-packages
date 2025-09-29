import { useStore } from '@walletmesh/modal-core';
import { useAccount } from '@walletmesh/modal-react/all';
import { useEffect, useState } from 'react';

interface ConnectionDebugInfo {
  activeWallet: string | null;
  connectionStatus: string;
  address: string | null;
  chainId: string | number | null;
  chainType: string | null;
}

export function SessionDebugger() {
  const { isConnected, address, chain, status, wallet } = useAccount();
  const [connectionDebugInfo, setConnectionDebugInfo] = useState<ConnectionDebugInfo | null>(null);

  // Get connection data from store using hook
  const activeSessionId = useStore((state) => state.active.sessionId);
  const activeWalletId = useStore((state) => state.active.walletId);
  const sessions = useStore((state) => state.entities.sessions);
  const wallets = useStore((state) => state.entities.wallets);

  useEffect(() => {
    const activeWallet = activeWalletId ? wallets[activeWalletId] : null;

    setConnectionDebugInfo({
      activeWallet: activeWallet?.name ?? null,
      connectionStatus: isConnected ? 'connected' : 'disconnected',
      address: address ?? null,
      chainId: chain?.chainId ?? null,
      chainType: chain?.chainType ?? null,
    });
  }, [activeSessionId, activeWalletId, sessions, wallets, isConnected, address, chain]);

  if (!connectionDebugInfo) return null;

  try {
    const { activeWallet, connectionStatus } = connectionDebugInfo;

    return (
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#FEF3C7',
          borderRadius: '8px',
          border: '1px solid #F59E0B',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🐛 Connection Debugger</h2>

        <div style={{ fontSize: '13px', fontFamily: 'monospace' }}>
          <div>
            <strong>Hook State:</strong> {status} ({isConnected ? 'connected' : 'not connected'})
          </div>
          <div>
            <strong>Hook Address:</strong> {address || 'none'}
          </div>
          <div>
            <strong>Hook Chain:</strong> {chain?.chainType} - {chain?.chainId || 'none'}
          </div>
          <div>
            <strong>Hook Wallet:</strong> {wallet?.name || 'none'}
          </div>
          <hr style={{ margin: '8px 0' }} />
          <div>
            <strong>Store Active Wallet:</strong> {activeWallet || 'none'}
          </div>
          <div>
            <strong>Store Connection Status:</strong> {connectionStatus || 'none'}
          </div>
          <div>
            <strong>Store Address:</strong> {connectionDebugInfo.address || 'none'}
          </div>
          <div>
            <strong>Store Connected:</strong> {address ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Store Chain ID:</strong> {connectionDebugInfo.chainId || 'none'}
          </div>
          <div>
            <strong>Store Chain Type:</strong> {connectionDebugInfo.chainType || 'none'}
          </div>

          {connectionDebugInfo.address && (
            <div
              style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: 'white',
                borderRadius: '4px',
              }}
            >
              <div>
                <strong>Connected Address:</strong>
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '4px' }}>
                {connectionDebugInfo.address}
              </div>
            </div>
          )}

          {!connectionDebugInfo.address && (
            <div style={{ marginTop: '12px', color: '#6B7280' }}>No connected address found</div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => {
                // Clear persisted sessions from localStorage
                localStorage.removeItem('walletmesh-sessions');
                localStorage.removeItem('walletmesh-example-sessions');
                window.location.reload();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Clear All Persisted Sessions & Reload
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#FEE2E2',
          borderRadius: '8px',
        }}
      >
        <p>Error accessing session state: {(error as Error).message}</p>
      </div>
    );
  }
}
