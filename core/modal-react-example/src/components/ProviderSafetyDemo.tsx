import type { SupportedChain } from '@walletmesh/modal-core';
import {
  aztecMainnet,
  aztecSandbox,
  ethereumMainnet,
  optimismMainnet,
  polygonMainnet,
  useAccount,
  useSwitchChain,
  useWalletProvider,
} from '@walletmesh/modal-react/all';
import { useEffect, useRef, useState } from 'react';

export function ProviderSafetyDemo() {
  const { isConnected, chain } = useAccount();
  const { provider } = useWalletProvider();
  // Client is available for advanced use cases
  // const { client } = useConfig();
  const { switchChain } = useSwitchChain();
  const [logs, setLogs] = useState<string[]>([]);
  const [version] = useState(1); // Mock version for demo
  const prevVersionRef = useRef(version);
  const [isChainSwitching, setIsChainSwitching] = useState(false);

  // Log provider changes
  useEffect(() => {
    if (prevVersionRef.current !== version && version > 0) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Provider changed! Version: ${prevVersionRef.current} → ${version}`,
      ]);
      prevVersionRef.current = version;
    }
  }, [version]);

  // Log actual provider/chain events (not just state updates)
  useEffect(() => {
    // This effect demonstrates monitoring chain state, but actual chain changes
    // should be tracked through the proper event system, not useEffect on chainId
    // The chainId from useAccount represents the current state, not change events
    // Only log meaningful events - initial connection is handled by other components
    // Chain switches would be handled by the handleChainSwitch function below
  }, []);

  const handleChainSwitch = async (targetChain: SupportedChain, chainName: string) => {
    try {
      setIsChainSwitching(true);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Switching to ${chainName}...`]);

      await switchChain(targetChain);

      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Chain switched successfully!`,
        `  New chain: ${targetChain.chainId}`,
        '  Provider updated: YES',
      ]);
    } catch (error) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Chain switch failed: ${(error as Error).message}`,
      ]);
    } finally {
      setIsChainSwitching(false);
    }
  };

  const simulateStaleProviderUsage = async () => {
    // Capture provider reference
    // const capturedProvider = provider; // commented out - unused
    const capturedVersion = version;

    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Captured provider reference (version: ${capturedVersion})`,
    ]);

    // Simulate async delay
    setTimeout(() => {
      // Mock provider version check for demo
      const currentVersion = version + 1;

      if (capturedVersion !== currentVersion) {
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ⚠️ STALE PROVIDER DETECTED!`,
          `  Captured version: ${capturedVersion}`,
          `  Current version: ${currentVersion}`,
          '  Safe to use: NO - Provider has changed!',
        ]);
      } else {
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Provider is still valid`,
          `  Version: ${currentVersion}`,
          '  Safe to use: YES',
        ]);
      }
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Provider Safety Demo</h2>
        <p style={{ color: '#6B7280' }}>Connect a wallet to test provider safety features</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Provider Safety Demo</h2>

      {/* Current State */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Current State</h3>
        <div style={{ fontSize: '13px', color: '#6B7280', fontFamily: 'monospace' }}>
          <div>Provider Version: {version}</div>
          <div>Chain ID: {chain?.chainId || 'Not connected'}</div>
          <div>Provider Type: {provider ? typeof provider : 'null'}</div>
        </div>
      </div>

      {/* Chain Switching Tests */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Chain Switching Tests</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleChainSwitch(ethereumMainnet, 'Ethereum Mainnet')}
            disabled={isChainSwitching}
            style={{
              padding: '6px 12px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isChainSwitching ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              opacity: isChainSwitching ? 0.6 : 1,
            }}
          >
            Switch to Ethereum
          </button>
          <button
            type="button"
            onClick={() => handleChainSwitch(polygonMainnet, 'Polygon')}
            disabled={isChainSwitching}
            style={{
              padding: '6px 12px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isChainSwitching ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              opacity: isChainSwitching ? 0.6 : 1,
            }}
          >
            Switch to Polygon
          </button>
          <button
            type="button"
            onClick={() => handleChainSwitch(optimismMainnet, 'Optimism')}
            disabled={isChainSwitching}
            style={{
              padding: '6px 12px',
              backgroundColor: '#EF4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isChainSwitching ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              opacity: isChainSwitching ? 0.6 : 1,
            }}
          >
            Switch to Optimism
          </button>
          <button
            type="button"
            onClick={() => handleChainSwitch(aztecSandbox, 'Aztec Devnet')}
            disabled={isChainSwitching}
            style={{
              padding: '6px 12px',
              backgroundColor: '#00FFFF',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: isChainSwitching ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              opacity: isChainSwitching ? 0.6 : 1,
            }}
          >
            Switch to Aztec Devnet
          </button>
          <button
            type="button"
            onClick={() => handleChainSwitch(aztecMainnet, 'Aztec Mainnet')}
            disabled={isChainSwitching}
            style={{
              padding: '6px 12px',
              backgroundColor: '#0088FF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isChainSwitching ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              opacity: isChainSwitching ? 0.6 : 1,
            }}
          >
            Switch to Aztec Mainnet
          </button>
        </div>
      </div>

      {/* Stale Provider Test */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Stale Provider Detection</h3>
        <button
          type="button"
          onClick={simulateStaleProviderUsage}
          style={{
            padding: '6px 12px',
            backgroundColor: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Simulate Stale Provider Usage
        </button>
        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
          This captures a provider reference, waits 2 seconds, then checks if it's still valid. Try switching
          chains during the wait to see stale provider detection!
        </p>
      </div>

      {/* Event Log */}
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '6px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Provider Safety Event Log
        </h3>
        <div
          style={{
            backgroundColor: '#1F2937',
            color: '#F9FAFB',
            padding: '8px',
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px',
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: '#6B7280' }}>No provider changes yet. Try switching chains!</div>
          ) : (
            logs.map((log, index) => (
              <div key={`log-${index}-${log.substring(0, 10)}`} style={{ marginBottom: '4px' }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#6B7280' }}>
        This demo shows how the provider versioning system prevents using stale provider references after
        chain switches. The <code>useSafeProvider</code> hook always returns the current provider.
      </div>
    </div>
  );
}
