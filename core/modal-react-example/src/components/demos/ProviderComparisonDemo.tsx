import {
  useEvmWallet,
  usePublicProvider,
  useSolanaWallet,
  useWalletProvider,
} from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useState } from 'react';
import styles from './ProviderComparisonDemo.module.css';

export function ProviderComparisonDemo() {
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();

  // Provider hooks
  const { provider: publicProvider, isAvailable: isPublicProviderReady } = usePublicProvider();
  const { provider: walletProvider, isAvailable: isWalletProviderReady } = useWalletProvider();

  // Demo state
  const [activeChain, setActiveChain] = useState<'evm' | 'solana'>('evm');
  const [comparisonResults, setComparisonResults] = useState<{
    public: { result: string; error?: string; timestamp: number } | null;
    wallet: { result: string; error?: string; timestamp: number } | null;
  } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  }, []);

  // Monitor provider readiness
  useEffect(() => {
    if (isPublicProviderReady && isWalletProviderReady) {
      addLog('Both providers are ready for comparison');
    } else if (isPublicProviderReady) {
      addLog('Public provider ready, waiting for wallet provider...');
    } else if (isWalletProviderReady) {
      addLog('Wallet provider ready, waiting for public provider...');
    } else {
      addLog('Waiting for providers to initialize...');
    }
  }, [isPublicProviderReady, isWalletProviderReady, addLog]);

  // Get current wallet info
  const getCurrentWalletInfo = () => {
    if (activeChain === 'evm') {
      return {
        isConnected: evmWallet.isConnected,
        address: evmWallet.address,
        chain: evmWallet.chain,
        chainType: 'evm' as const,
        symbol: 'ETH',
        icon: '⬢',
      };
    } else {
      return {
        isConnected: solanaWallet.isConnected,
        address: solanaWallet.address,
        chain: solanaWallet.chain,
        chainType: 'solana' as const,
        symbol: 'SOL',
        icon: '◎',
      };
    }
  };

  const currentWallet = getCurrentWalletInfo();

  // Comparison tests for EVM
  const testEvmProviders = async () => {
    if (!currentWallet.isConnected || activeChain !== 'evm') {
      addLog('EVM wallet not connected - cannot test providers');
      return;
    }

    addLog('Testing EVM providers - fetching current block number...');

    const results: {
      public: { result: string; error?: string; timestamp: number } | null;
      wallet: { result: string; error?: string; timestamp: number } | null;
    } = { public: null, wallet: null };

    // Test public provider (dApp's RPC endpoint)
    try {
      if (publicProvider && typeof publicProvider === 'object' && 'request' in publicProvider) {
        const publicTypedProvider = publicProvider as {
          request: (args: { method: string; params?: unknown[] }) => Promise<string>;
        };
        const blockNumber = await publicTypedProvider.request({
          method: 'eth_blockNumber',
          params: [],
        });
        results.public = {
          result: `Block: ${parseInt(blockNumber, 16)}`,
          timestamp: Date.now(),
        };
        addLog(`Public provider result: Block ${parseInt(blockNumber, 16)}`);
      } else {
        throw new Error('Public provider not available or not EIP1193 compatible');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.public = {
        result: 'Error',
        error: errorMsg,
        timestamp: Date.now(),
      };
      addLog(`Public provider error: ${errorMsg}`);
    }

    // Test wallet provider (wallet's RPC endpoint)
    try {
      if (walletProvider && typeof walletProvider === 'object' && 'request' in walletProvider) {
        const walletTypedProvider = walletProvider as {
          request: (args: { method: string; params?: unknown[] }) => Promise<string>;
        };
        const blockNumber = await walletTypedProvider.request({
          method: 'eth_blockNumber',
          params: [],
        });
        results.wallet = {
          result: `Block: ${parseInt(blockNumber, 16)}`,
          timestamp: Date.now(),
        };
        addLog(`Wallet provider result: Block ${parseInt(blockNumber, 16)}`);
      } else {
        throw new Error('Wallet provider not available or not EIP1193 compatible');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.wallet = {
        result: 'Error',
        error: errorMsg,
        timestamp: Date.now(),
      };
      addLog(`Wallet provider error: ${errorMsg}`);
    }

    setComparisonResults(results);
  };

  // Comparison tests for Solana
  const testSolanaProviders = async () => {
    if (!currentWallet.isConnected || activeChain !== 'solana') {
      addLog('Solana wallet not connected - cannot test providers');
      return;
    }

    addLog('Testing Solana providers - fetching latest slot...');

    const results: {
      public: { result: string; error?: string; timestamp: number } | null;
      wallet: { result: string; error?: string; timestamp: number } | null;
    } = { public: null, wallet: null };

    // Test public provider (dApp's RPC endpoint)
    try {
      if (publicProvider && typeof publicProvider === 'object' && 'getSlot' in publicProvider) {
        const publicTypedProvider = publicProvider as {
          getSlot: () => Promise<number>;
        };
        const slot = await publicTypedProvider.getSlot();
        results.public = {
          result: `Slot: ${slot}`,
          timestamp: Date.now(),
        };
        addLog(`Public provider result: Slot ${slot}`);
      } else {
        throw new Error('Public provider not available or does not support getSlot');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.public = {
        result: 'Error',
        error: errorMsg,
        timestamp: Date.now(),
      };
      addLog(`Public provider error: ${errorMsg}`);
    }

    // Test wallet provider (wallet's connection)
    try {
      if (walletProvider && typeof walletProvider === 'object' && 'publicKey' in walletProvider) {
        const walletTypedProvider = walletProvider as {
          publicKey: { toString: () => string } | null;
        };
        const publicKey = walletTypedProvider.publicKey;
        results.wallet = {
          result: `PublicKey: ${publicKey?.toString().slice(0, 8)}...`,
          timestamp: Date.now(),
        };
        addLog(`Wallet provider result: PublicKey ${publicKey?.toString().slice(0, 8)}...`);
      } else {
        throw new Error('Wallet provider not available or does not have publicKey');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      results.wallet = {
        result: 'Error',
        error: errorMsg,
        timestamp: Date.now(),
      };
      addLog(`Wallet provider error: ${errorMsg}`);
    }

    setComparisonResults(results);
  };

  // Run comparison test
  const runComparison = async () => {
    if (activeChain === 'evm') {
      await testEvmProviders();
    } else {
      await testSolanaProviders();
    }
  };

  // Clear results
  const clearResults = () => {
    setComparisonResults(null);
    setLogs([]);
    addLog('Results cleared');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔌 Provider Comparison Demo</h3>
        <p className={styles.description}>
          Compare usePublicProvider vs useWalletProvider to understand the difference between dApp RPC and
          wallet RPC
        </p>
      </div>

      {/* Chain Selection */}
      <div className={styles.chainSelector}>
        <h4 className={styles.sectionTitle}>Select Chain to Test</h4>
        <div className={styles.chainButtons}>
          <button
            type="button"
            onClick={() => setActiveChain('evm')}
            className={`${styles.chainButton} ${activeChain === 'evm' ? styles.active : ''} ${!evmWallet.isConnected ? styles.disabled : ''}`}
          >
            ⬢ EVM ({evmWallet.isConnected ? 'Connected' : 'Disconnected'})
          </button>
          <button
            type="button"
            onClick={() => setActiveChain('solana')}
            className={`${styles.chainButton} ${activeChain === 'solana' ? styles.active : ''} ${!solanaWallet.isConnected ? styles.disabled : ''}`}
          >
            ◎ Solana ({solanaWallet.isConnected ? 'Connected' : 'Disconnected'})
          </button>
        </div>
      </div>

      {/* Provider Information */}
      <div className={styles.infoSection}>
        <h4 className={styles.sectionTitle}>Provider Types Explained</h4>
        <div className={styles.providerGrid}>
          <div className={styles.providerCard}>
            <div className={styles.providerHeader}>
              <h5 className={styles.providerTitle}>🏢 usePublicProvider</h5>
              <span className={isPublicProviderReady ? styles.statusReady : styles.statusNotReady}>
                {isPublicProviderReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>
            <p className={styles.providerDescription}>
              <strong>Purpose:</strong> Provides access to your dApp's RPC infrastructure for read operations
              like querying balances, block data, and contract state.
            </p>
            <ul className={styles.providerFeatures}>
              <li>✓ Uses your dApp's RPC endpoints</li>
              <li>✓ No user interaction required</li>
              <li>✓ Best for read-only operations</li>
              <li>✓ Higher rate limits (your infra)</li>
            </ul>
          </div>

          <div className={styles.providerCard}>
            <div className={styles.providerHeader}>
              <h5 className={styles.providerTitle}>🔐 useWalletProvider</h5>
              <span className={isWalletProviderReady ? styles.statusReady : styles.statusNotReady}>
                {isWalletProviderReady ? 'Ready' : 'Not Ready'}
              </span>
            </div>
            <p className={styles.providerDescription}>
              <strong>Purpose:</strong> Provides access to the connected wallet's provider for signing
              transactions and interacting with user accounts.
            </p>
            <ul className={styles.providerFeatures}>
              <li>✓ Uses wallet's RPC connection</li>
              <li>✓ Required for transactions</li>
              <li>✓ Can access user accounts</li>
              <li>✓ Handles user authorization</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparison Test */}
      {currentWallet.isConnected ? (
        <>
          {/* Current Wallet Status */}
          <div className={styles.statusSection}>
            <h4 className={styles.sectionTitle}>
              {currentWallet.icon} Current {activeChain === 'evm' ? 'EVM' : 'Solana'} Wallet
            </h4>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.label}>Address:</span>
                <span className={styles.value}>
                  {currentWallet.address
                    ? `${currentWallet.address.slice(0, 8)}...${currentWallet.address.slice(-6)}`
                    : 'N/A'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>Chain:</span>
                <span className={styles.value}>{currentWallet.chain?.name || 'Unknown'}</span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.label}>Chain ID:</span>
                <span className={styles.value}>{currentWallet.chain?.chainId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className={styles.actionSection}>
            <h4 className={styles.sectionTitle}>Test Provider Capabilities</h4>
            <div className={styles.actionButtons}>
              <button
                type="button"
                onClick={runComparison}
                disabled={!isPublicProviderReady || !isWalletProviderReady}
                className={styles.testButton}
              >
                🚀 Run {activeChain === 'evm' ? 'EVM' : 'Solana'} Provider Comparison
              </button>
              <button type="button" onClick={clearResults} className={styles.clearButton}>
                🗑️ Clear Results
              </button>
            </div>
            {(!isPublicProviderReady || !isWalletProviderReady) && (
              <p className={styles.disabledNote}>Both providers must be ready to run comparison tests</p>
            )}
          </div>

          {/* Comparison Results */}
          {comparisonResults && (
            <div className={styles.resultsSection}>
              <h4 className={styles.sectionTitle}>Comparison Results</h4>
              <div className={styles.resultsGrid}>
                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <h5>🏢 Public Provider</h5>
                    <span
                      className={comparisonResults.public?.error ? styles.statusError : styles.statusSuccess}
                    >
                      {comparisonResults.public?.error ? 'Error' : 'Success'}
                    </span>
                  </div>
                  <div className={styles.resultContent}>
                    <p className={styles.resultValue}>{comparisonResults.public?.result || 'No result'}</p>
                    {comparisonResults.public?.error && (
                      <p className={styles.resultError}>Error: {comparisonResults.public.error}</p>
                    )}
                    <p className={styles.resultTime}>
                      {new Date(comparisonResults.public?.timestamp || 0).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className={styles.resultCard}>
                  <div className={styles.resultHeader}>
                    <h5>🔐 Wallet Provider</h5>
                    <span
                      className={comparisonResults.wallet?.error ? styles.statusError : styles.statusSuccess}
                    >
                      {comparisonResults.wallet?.error ? 'Error' : 'Success'}
                    </span>
                  </div>
                  <div className={styles.resultContent}>
                    <p className={styles.resultValue}>{comparisonResults.wallet?.result || 'No result'}</p>
                    {comparisonResults.wallet?.error && (
                      <p className={styles.resultError}>Error: {comparisonResults.wallet.error}</p>
                    )}
                    <p className={styles.resultTime}>
                      {new Date(comparisonResults.wallet?.timestamp || 0).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.notConnected}>
          <p>
            Please connect an {activeChain === 'evm' ? 'EVM' : 'Solana'} wallet to test provider comparison
          </p>
          <div className={styles.notConnectedHelp}>
            <p>
              Use the chain selector above to switch between EVM and Solana, then connect the appropriate
              wallet type.
            </p>
          </div>
        </div>
      )}

      {/* Activity Logs */}
      <div className={styles.logsSection}>
        <h4 className={styles.sectionTitle}>Provider Activity Logs</h4>
        <div className={styles.logs}>
          {logs.length === 0 ? (
            <div className={styles.logEmpty}>No provider activity yet...</div>
          ) : (
            logs.map((log, i) => (
              <div key={`provider-log-${Date.now()}-${i}`} className={styles.logEntry}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Code Example */}
      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Code Example</h4>
        <pre className={styles.codeBlock}>
          <code>{`// Provider comparison pattern
import { 
  usePublicProvider, 
  useWalletProvider,
  useAccount 
} from '@walletmesh/modal-react/all';

function ProviderComparison() {
  const { isConnected, chainType } = useAccount();
  const { provider: publicProvider, isAvailable: publicReady } = usePublicProvider();
  const { provider: walletProvider, isAvailable: walletReady } = useWalletProvider();

  const testProviders = async () => {
    if (!isConnected) return;

    if (chainType === 'evm') {
      // Test public provider (dApp RPC)
      const publicBlock = await publicProvider.request({
        method: 'eth_blockNumber'
      });
      
      // Test wallet provider (wallet RPC)
      const walletBlock = await walletProvider.request({
        method: 'eth_blockNumber'
      });
      
      console.log('Public provider block:', parseInt(publicBlock, 16));
      console.log('Wallet provider block:', parseInt(walletBlock, 16));
    } else if (chainType === 'solana') {
      // Test public provider (dApp RPC)
      const publicSlot = await publicProvider.getSlot();
      
      // Test wallet provider (wallet connection)
      const walletKey = walletProvider.publicKey;
      
      console.log('Public provider slot:', publicSlot);
      console.log('Wallet public key:', walletKey?.toString());
    }
  };

  return (
    <div>
      <h3>Provider Status</h3>
      <p>Public Provider: {publicReady ? 'Ready' : 'Not Ready'}</p>
      <p>Wallet Provider: {walletReady ? 'Ready' : 'Not Ready'}</p>
      
      {isConnected && (
        <button onClick={testProviders}>
          Test Both Providers
        </button>
      )}
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
