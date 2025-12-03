import type { SupportedChain } from '@walletmesh/modal-core';
import {
  arbitrumOne,
  aztecMainnet,
  aztecSandbox,
  aztecTestnet,
  baseMainnet,
  ethereumMainnet,
  optimismMainnet,
  polygonMainnet,
  solanaDevnet,
  solanaMainnet,
  solanaTestnet,
  useAccount,
  useSwitchChain,
} from '@walletmesh/modal-react/all';
import { useState } from 'react';

const DEMO_CHAINS = [
  ethereumMainnet,
  polygonMainnet,
  optimismMainnet,
  arbitrumOne,
  baseMainnet,
  solanaMainnet,
  solanaDevnet,
  solanaTestnet,
  aztecSandbox,
  aztecMainnet,
  aztecTestnet,
];

export function SessionChainSwitcher() {
  const { isConnected, chain, status, wallet } = useAccount();
  const { switchChain, isPending: isSwitching, error: switchError } = useSwitchChain();

  // Debug logging
  console.log('[SessionChainSwitcher] Debug info:', {
    isConnected,
    chainId: chain?.chainId,
    chainType: chain?.chainType,
    status,
    walletName: wallet?.name,
  });

  const currentChainId = chain?.chainId;
  const availableChains = DEMO_CHAINS;
  const [switchLog, setSwitchLog] = useState<string[]>([]);
  const [visitedChains, setVisitedChains] = useState<Set<string>>(new Set());

  const handleChainSwitch = async (targetChain: SupportedChain) => {
    const timestamp = new Date().toLocaleTimeString();
    const chainName = targetChain.name || targetChain.label;
    const chainType = targetChain.chainType;

    try {
      setSwitchLog((prev) => [...prev, `[${timestamp}] Switching to ${chainName} (${chainType})...`]);

      const isReturning = visitedChains.has(targetChain.chainId);

      if (!isReturning) {
        setSwitchLog((prev) => [...prev, `[${timestamp}] First time connecting to ${chainName}...`]);
      } else {
        setSwitchLog((prev) => [...prev, `[${timestamp}] Returning to ${chainName}...`]);
      }

      // Add debug logging
      console.log(`[SessionChainSwitcher] Attempting to switch to ${chainName} (${chainType})`);
      console.log('[SessionChainSwitcher] Current connected:', isConnected);
      console.log('[SessionChainSwitcher] Current chain:', chain?.chainId);

      await switchChain(targetChain);

      setVisitedChains((prev) => new Set([...prev, targetChain.chainId]));

      setSwitchLog((prev) => [
        ...prev,
        `[${timestamp}] ✓ Successfully switched to ${chainName}`,
        `  Chain ID: ${targetChain.chainId}`,
        `  Chain Type: ${chainType}`,
        `  Chain State: ${isReturning ? 'REUSED' : 'NEW'}`,
      ]);
    } catch (error) {
      console.error('[SessionChainSwitcher] Switch chain failed:', error);
      setSwitchLog((prev) => [
        ...prev,
        `[${timestamp}] ✗ Failed to switch to ${chainName}`,
        `  Chain Type: ${chainType}`,
        `  Error: ${(error as Error).message}`,
        `  Stack: ${(error as Error).stack?.split('\n')[0] || 'No stack'}`,
      ]);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Chain Switching Demo</h2>
        <p style={{ color: '#6B7280' }}>Connect a wallet to test chain switching</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Chain Switching Demo</h2>

      {/* Connection Info */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Current Connection</h3>
        <div style={{ fontSize: '13px', color: '#6B7280' }}>
          <div>
            Wallet: <strong>{wallet?.name || 'Unknown'}</strong>
          </div>
          <div>
            Active Chain: <strong>{currentChainId || 'None'}</strong>
          </div>
          <div>
            Connected: <strong>{isConnected ? 'Yes' : 'No'}</strong>
          </div>
          <div>
            Chains Visited: <strong>{visitedChains.size}</strong>
          </div>
        </div>
      </div>

      {/* Available Chains */}
      {availableChains.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Available Chains</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableChains.map((chain) => {
              const isActive = currentChainId === chain.chainId;
              return (
                <div
                  key={chain.chainId}
                  style={{
                    padding: '8px',
                    backgroundColor: isActive ? '#3B82F6' : '#E5E7EB',
                    color: isActive ? 'white' : '#374151',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: isActive ? '600' : '400',
                  }}
                >
                  <div>{chain.name || chain.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>
                    {chain.chainId} {isActive && '• Active'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chain Switching Grid */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Switch to Chain</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '8px',
          }}
        >
          {DEMO_CHAINS.map((chain) => {
            const isActive = currentChainId === chain.chainId;
            const hasVisited = visitedChains.has(chain.chainId);

            return (
              <button
                type="button"
                key={chain.chainId}
                onClick={() => handleChainSwitch(chain)}
                disabled={isActive || isSwitching}
                style={{
                  padding: '8px 12px',
                  backgroundColor: isActive ? '#10B981' : hasVisited ? '#3B82F6' : '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isActive || isSwitching ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  opacity: isActive || isSwitching ? 0.7 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div>{chain.name || chain.label}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>
                  {chain.chainType} • {chain.chainId}
                </div>
                {isActive && <div style={{ fontSize: '10px' }}>✓ Active</div>}
                {!isActive && hasVisited && <div style={{ fontSize: '10px' }}>Visited</div>}
                {!isActive && !hasVisited && <div style={{ fontSize: '10px' }}>New Chain</div>}
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#6B7280' }}>
          <strong>Legend:</strong> Green = Active, Blue = Visited, Gray = New
        </div>
      </div>

      {/* Error Display */}
      {switchError && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#FEE2E2',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#7F1D1D',
          }}
        >
          <strong>Error:</strong> {switchError.message}
        </div>
      )}

      {/* Switch Log */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Chain Switch Log</h3>
        <div
          style={{
            backgroundColor: '#1F2937',
            color: '#F9FAFB',
            padding: '8px',
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '11px',
          }}
        >
          {switchLog.length === 0 ? (
            <div style={{ color: '#6B7280' }}>No chain switches yet. Try switching to different chains!</div>
          ) : (
            switchLog.map((log, i) => <div key={`log-${i}-${log.substring(0, 10)}`}>{log}</div>)
          )}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#6B7280' }}>
        <strong>Chain Switching Features:</strong>
        <ul style={{ marginTop: '4px', marginBottom: 0, paddingLeft: '20px' }}>
          <li>Switch between different blockchain networks</li>
          <li>Track which chains you've visited</li>
          <li>Loading state during chain switching</li>
          <li>Error handling for failed switches</li>
        </ul>
      </div>
    </div>
  );
}
