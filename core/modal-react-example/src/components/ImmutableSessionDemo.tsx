import type { SupportedChain } from '@walletmesh/modal-core';
import {
  arbitrumOne,
  ethereumMainnet,
  optimismMainnet,
  polygonMainnet,
  useAccount,
  useSwitchChain,
} from '@walletmesh/modal-react/all';

const CHAINS = [
  { chain: ethereumMainnet, name: 'Ethereum', color: '#627EEA' },
  { chain: polygonMainnet, name: 'Polygon', color: '#8247E5' },
  { chain: optimismMainnet, name: 'Optimism', color: '#FF0420' },
  { chain: arbitrumOne, name: 'Arbitrum', color: '#12AAFF' },
];

export function ImmutableSessionDemo() {
  const { isConnected, address, chain } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const currentChainId = chain?.chainId;

  const handleChainSwitch = async (targetChain: SupportedChain) => {
    try {
      await switchChain(targetChain);
    } catch (error) {
      console.error('Chain switch failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Chain Management Demo</h2>
        <p style={{ color: '#6B7280' }}>Connect a wallet to see chain management in action</p>
      </div>
    );
  }

  const getChainInfo = (chainId: string) =>
    CHAINS.find((c) => c.chain.chainId === chainId) || { name: chainId, color: '#6B7280' };

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Chain Management Demo</h2>

      {/* Current Connection */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Current Connection</h3>
        <div style={{ fontSize: '13px' }}>
          <div
            style={{
              padding: '8px',
              backgroundColor: '#EBF8FF',
              borderRadius: '4px',
              marginBottom: '8px',
            }}
          >
            <div>
              <strong>Wallet:</strong> Mock Wallet
            </div>
            <div>
              <strong>Chain:</strong> {getChainInfo(String(currentChainId) || '').name} ({currentChainId})
            </div>
            <div>
              <strong>Address:</strong>{' '}
              <code>
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Chain Switch */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Switch Chain</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CHAINS.map((chainData) => {
            const isActive = currentChainId === chainData.chain.chainId;

            return (
              <button
                type="button"
                key={chainData.chain.chainId}
                onClick={() => handleChainSwitch(chainData.chain)}
                disabled={isActive || isSwitching}
                style={{
                  padding: '8px 16px',
                  backgroundColor: isActive ? chainData.color : '#F3F4F6',
                  color: isActive ? 'white' : '#374151',
                  border: `2px solid ${isActive ? chainData.color : '#E5E7EB'}`,
                  borderRadius: '6px',
                  cursor: isActive || isSwitching ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  opacity: isActive || isSwitching ? 0.8 : 1,
                  position: 'relative',
                }}
              >
                {chainData.name}
                {isActive && <span style={{ marginLeft: '4px' }}>✓</span>}
              </button>
            );
          })}
        </div>
        {isSwitching && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#6B7280' }}>Switching chain...</div>
        )}
      </div>

      {/* Connection State Info */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Connection State</h3>
        <div style={{ fontSize: '12px', color: '#6B7280' }}>
          <div>
            <strong>Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}
          </div>
          <div>
            <strong>Chain ID:</strong> {chain?.chainId || 'None'}
          </div>
          <div>
            <strong>Address:</strong> {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'None'}
          </div>
          <div>
            <strong>Is Switching:</strong> {isSwitching ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#6B7280' }}>
        <strong>Features:</strong>
        <ul style={{ marginTop: '4px', marginLeft: '20px' }}>
          <li>Switch between different blockchain networks</li>
          <li>Current chain is highlighted</li>
          <li>Loading state during chain switching</li>
          <li>Connection state tracking</li>
        </ul>
      </div>
    </div>
  );
}
