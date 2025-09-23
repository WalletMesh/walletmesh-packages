import { formatError } from '@walletmesh/modal-core';
import {
  arbitrumOne,
  aztecMainnet,
  aztecSandbox,
  aztecTestnet,
  ethereumMainnet,
  ethereumSepolia,
  optimismMainnet,
  polygonMainnet,
  type SupportedChain,
  solanaDevnet,
  solanaMainnet,
  useAccount,
  useSwitchChain,
} from '@walletmesh/modal-react/all';
import { useState } from 'react';
import styles from './ChainSwitchingDemo.module.css';

// Example chain configurations using SupportedChain objects
const EXAMPLE_CHAINS = {
  evm: [ethereumMainnet, polygonMainnet, arbitrumOne, optimismMainnet, ethereumSepolia],
  solana: [solanaMainnet, solanaDevnet],
  aztec: [aztecSandbox, aztecTestnet, aztecMainnet],
};

export function ChainSwitchingDemo() {
  const { isConnected, chain, chainType, wallet } = useAccount();
  const { switchChain, ensureChain, isChainSupported, isSwitching, chains, error } = useSwitchChain();

  const [selectedChain, setSelectedChain] = useState<SupportedChain | null>(null);
  const [showEnsureDemo, setShowEnsureDemo] = useState(false);

  const handleSwitchChain = async () => {
    if (!selectedChain) return;

    try {
      await switchChain(selectedChain);
    } catch (err) {
      console.error('Chain switch failed:', err);
    }
  };

  const handleEnsureChain = async () => {
    try {
      // This will switch to the chain if not already on it
      await ensureChain(polygonMainnet, { autoSwitch: true }); // Polygon as example
    } catch (err) {
      console.error('Chain ensure failed:', err);
    }
  };

  // Get available chains for current wallet type
  const availableChains = chainType ? EXAMPLE_CHAINS[chainType] || [] : [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>⛓️ Chain Switching</h3>
        <p className={styles.description}>
          Switch between different chains using the consolidated useSwitchChain hook
        </p>
      </div>

      {/* Current Chain Status */}
      <div className={styles.statusSection}>
        <h4 className={styles.sectionTitle}>Current Chain</h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Connected:</span>
            <span className={styles.value}>{isConnected ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Chain:</span>
            <span className={styles.value}>{chain?.name || 'Not connected'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Chain ID:</span>
            <span className={styles.value}>{chain?.chainId || 'Not connected'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Chain Type:</span>
            <span className={styles.value}>{chainType || 'N/A'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Wallet:</span>
            <span className={styles.value}>{wallet?.name || 'N/A'}</span>
          </div>
        </div>
      </div>

      {isConnected && (
        <>
          {/* Chain Switching */}
          <div className={styles.switchSection}>
            <h4 className={styles.sectionTitle}>Switch Chain</h4>
            <div className={styles.switchControls}>
              <select
                value={selectedChain?.chainId || ''}
                onChange={(e) => {
                  const chainId = e.target.value;
                  const chain = availableChains.find((c) => c.chainId === chainId) || null;
                  setSelectedChain(chain);
                }}
                className={styles.chainSelect}
                disabled={isSwitching}
              >
                <option value="">Select a chain...</option>
                {availableChains.map((chain) => (
                  <option key={chain.chainId} value={chain.chainId}>
                    {chain.name} ({chain.chainId})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSwitchChain}
                disabled={!selectedChain || isSwitching}
                className={styles.switchButton}
              >
                {isSwitching ? 'Switching...' : 'Switch Chain'}
              </button>
            </div>

            {/* Compatibility Check */}
            {selectedChain && (
              <div className={styles.compatibilityInfo}>
                Compatible: {isChainSupported(selectedChain) ? '✅ Yes' : '❌ No'}
              </div>
            )}
          </div>

          {/* Ensure Chain Demo */}
          <div className={styles.ensureSection}>
            <h4 className={styles.sectionTitle}>Ensure Chain</h4>
            <p className={styles.ensureDescription}>
              The ensureChain function automatically switches to a specific chain if not already on it.
            </p>
            <button
              type="button"
              onClick={() => setShowEnsureDemo(!showEnsureDemo)}
              className={styles.toggleButton}
            >
              {showEnsureDemo ? 'Hide' : 'Show'} Ensure Chain Demo
            </button>

            {showEnsureDemo && (
              <div className={styles.ensureDemo}>
                <p>Click to ensure you're on Polygon (Chain ID: {polygonMainnet.chainId})</p>
                <button
                  type="button"
                  onClick={handleEnsureChain}
                  disabled={isSwitching || chain?.chainId === polygonMainnet.chainId}
                  className={styles.ensureButton}
                >
                  {chain?.chainId === polygonMainnet.chainId ? 'Already on Polygon' : 'Ensure Polygon Chain'}
                </button>
              </div>
            )}
          </div>

          {/* Supported Chains */}
          <div className={styles.supportedSection}>
            <h4 className={styles.sectionTitle}>Supported Chains</h4>
            <div className={styles.chainList}>
              {chains.length > 0 ? (
                chains.map((chainInfo) => (
                  <div key={chainInfo.chain.chainId} className={styles.chainItem}>
                    <span className={styles.chainName}>{chainInfo.chain.name || chainInfo.chain.label}</span>
                    <span className={styles.chainId}>{chainInfo.chain.chainId}</span>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>No supported chains information available</p>
              )}
            </div>
          </div>
        </>
      )}

      {!isConnected && (
        <div className={styles.notConnected}>
          <p>Please connect a wallet to use chain switching features</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className={styles.errorSection}>
          <h4 className={styles.errorTitle}>Chain Switch Error</h4>
          <p className={styles.errorMessage}>{formatError(error).message}</p>
        </div>
      )}

      {/* Code Example */}
      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Code Example</h4>
        <pre className={styles.codeBlock}>
          <code>{`// Using the consolidated useSwitchChain hook
import { useSwitchChain, useAccount, polygonMainnet, ethereumMainnet } from '@walletmesh/modal-react/all';

function ChainSwitcher() {
  const { chain } = useAccount();
  const { 
    switchChain, 
    ensureChain,     // NEW: merged from useEnsureChain
    isChainSupported, 
    chains 
  } = useSwitchChain();

  // Switch to a specific chain
  const handleSwitch = async () => {
    await switchChain(polygonMainnet); // Polygon
  };

  // Ensure a specific chain (switches if needed)
  const handleEnsure = async () => {
    await ensureChain(ethereumMainnet, { autoSwitch: true }); // Ethereum
  };

  // Check if a chain is compatible
  const canSwitchToPolygon = isChainSupported(polygonMainnet);

  return (
    <div>
      <p>Current chain: {chain?.name} ({chain?.chainId})</p>
      <button onClick={handleSwitch}>Switch to Polygon</button>
      <button onClick={handleEnsure}>Ensure Ethereum</button>
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
