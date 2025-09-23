import {
  aztecChains,
  evmChains,
  solanaChains,
  useAccount,
  useConfig,
  useConnect,
  WalletMeshConnectButton,
  WalletMeshSandboxedWalletIcon,
} from '@walletmesh/modal-react/all';
import { useState } from 'react';

export function MultiWalletDemo() {
  const { open } = useConfig();
  const { isConnected, address, wallet } = useAccount();
  const { disconnect } = useConnect();
  const [isConnectingAnother, setIsConnectingAnother] = useState(false);

  // All available chains
  const allChains = [...evmChains, ...solanaChains, ...aztecChains];

  // Since multi-wallet is not yet supported, simulate with single wallet
  const wallets =
    isConnected && wallet && address
      ? [
          {
            wallet,
            address,
            chainId: '0x1', // Default to mainnet
            isActive: true,
          },
        ]
      : [];
  const activeWallet = wallets[0];
  const count = wallets.length;
  const isMaxWalletsReached = count >= 1; // Currently limited to 1
  const maxWallets = 1;

  // Get chain info for display
  const getChainName = (chainId: string) => {
    const chainInfo = allChains.find(
      (chain) => chain.chainId === chainId || chain.chainId.endsWith(`:${chainId}`),
    );
    return chainInfo?.label || `Chain ${chainId}`;
  };

  // Enhanced connect another wallet function
  const handleConnectAnother = async () => {
    setIsConnectingAnother(true);
    try {
      // Open modal for wallet selection
      open();
    } finally {
      setIsConnectingAnother(false);
    }
  };

  // Show connect button if no wallets connected
  if (count === 0) {
    return (
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Multi-Wallet Management</h2>
        <p style={{ color: '#6B7280', marginBottom: '16px' }}>
          Connect multiple wallets to manage them simultaneously
        </p>
        <WalletMeshConnectButton size="md" />
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
        Multi-Wallet Management ({count} connected)
      </h2>

      {/* Display current limitation */}
      <div
        style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#FEF3C7',
          borderRadius: '4px',
          fontSize: '14px',
          color: '#92400E',
        }}
      >
        <strong>Note:</strong> Currently, WalletMesh supports one wallet at a time. Multi-wallet support is
        coming soon!
      </div>

      {wallets.map(({ wallet, address, chainId, isActive }) => (
        <div
          key={wallet.id}
          style={{
            padding: '12px',
            marginBottom: '8px',
            backgroundColor: isActive ? '#EEF2FF' : 'white',
            border: isActive ? '2px solid #6366F1' : '1px solid #E5E7EB',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <WalletMeshSandboxedWalletIcon wallet={{ ...wallet, icon: wallet.icon || '' }} size={32} />
            <div>
              <div style={{ fontWeight: '600' }}>{wallet.name}</div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                {address.slice(0, 6)}...{address.slice(-4)} • {getChainName(chainId)}
              </div>
            </div>
            {isActive && (
              <span
                style={{
                  padding: '2px 8px',
                  backgroundColor: '#6366F1',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                ACTIVE
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {!isActive && (
              <button
                type="button"
                onClick={() => {
                  // Currently only one wallet supported
                  console.log('Multi-wallet not yet supported');
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6366F1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Set Active
              </button>
            )}
            <button
              type="button"
              onClick={() => disconnect()}
              style={{
                padding: '6px 12px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Disconnect
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleConnectAnother}
          disabled={isConnectingAnother || isMaxWalletsReached}
          style={{
            padding: '8px 16px',
            backgroundColor: isMaxWalletsReached ? '#9CA3AF' : '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isMaxWalletsReached ? 'not-allowed' : 'pointer',
            opacity: isConnectingAnother ? 0.6 : 1,
          }}
        >
          {isConnectingAnother ? 'Opening Modal...' : 'Connect Another Wallet'}
        </button>

        {isMaxWalletsReached && (
          <span
            style={{
              padding: '8px 16px',
              color: '#6B7280',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Maximum {maxWallets} wallets
          </span>
        )}

        {count > 1 && (
          <button
            type="button"
            onClick={() => disconnect()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Disconnect All ({count})
          </button>
        )}
      </div>

      {/* Show active wallet capabilities */}
      {activeWallet && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#E0E7FF',
            borderRadius: '4px',
          }}
        >
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Active Wallet: {activeWallet.wallet.name}
          </h4>
          <p style={{ fontSize: '13px', color: '#4B5563' }}>
            All transactions and signatures will use this wallet. Switch active wallet to use a different one.
          </p>
        </div>
      )}
    </div>
  );
}
