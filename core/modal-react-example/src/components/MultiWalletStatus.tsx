import { useAccount, useConnect } from '@walletmesh/modal-react/all';

export function MultiWalletStatus() {
  const { isConnected, address, chain } = useAccount();
  const { disconnect } = useConnect();

  if (!isConnected) {
    return null;
  }

  // Mock wallet data for demo
  const connectedWallets = [
    {
      wallet: { id: 'mock-wallet', name: 'Mock Wallet' },
      address,
      chainId: chain?.chainId,
      isActive: true,
    },
  ];

  if (connectedWallets.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Connected Wallets ({connectedWallets.length})
      </h2>

      <div style={{ display: 'grid', gap: '12px' }}>
        {connectedWallets.map((wallet) => (
          <div
            key={wallet.wallet.id}
            style={{
              padding: '12px',
              backgroundColor: wallet.isActive ? '#DBEAFE' : 'white',
              border: wallet.isActive ? '2px solid #3B82F6' : '1px solid #E5E7EB',
              borderRadius: '6px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '12px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px' }}>{wallet.wallet.name}</strong>
                {wallet.isActive && (
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      backgroundColor: '#3B82F6',
                      color: 'white',
                      borderRadius: '3px',
                      fontWeight: '500',
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
              {wallet.address && (
                <div style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>
                  {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </div>
              )}
              {wallet.chainId && (
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                  Chain: {wallet.chainId}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {!wallet.isActive && (
                <button
                  type="button"
                  onClick={() => console.log('Set active:', wallet.wallet.id)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Set Active
                </button>
              )}
              <button
                type="button"
                onClick={() => disconnect()}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '12px', fontSize: '12px', color: '#6B7280' }}>
        The active wallet is used for new transactions. Click "Set Active" to switch between connected
        wallets.
      </div>
    </div>
  );
}
