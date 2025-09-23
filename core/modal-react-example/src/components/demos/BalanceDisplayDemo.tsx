import { formatError } from '@walletmesh/modal-core';
import { useAccount, useBalance, useEvmWallet, useSolanaWallet } from '@walletmesh/modal-react/all';
import { useEffect, useId, useState } from 'react';
import styles from './BalanceDisplayDemo.module.css';

// Example token configurations for different chains
const EVM_TOKENS = [
  { address: '0xA0b86a33E6441D8E50Ca7d8A3e0CEB02E4E50222', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
  },
  { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', name: 'Uniswap', decimals: 18 },
  { address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', symbol: 'MATIC', name: 'Polygon', decimals: 18 },
];

const SOLANA_TOKENS = [
  { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
  },
  {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'wSOL',
    name: 'Wrapped SOL',
    decimals: 9,
  },
  {
    address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
    symbol: 'mSOL',
    name: 'Marinade SOL',
    decimals: 9,
  },
  {
    address: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    symbol: 'ETH',
    name: 'Ethereum (Portal)',
    decimals: 8,
  },
];

export function BalanceDisplayDemo() {
  const { isConnected, chainType } = useAccount();
  const { data: balance, isLoading, error, refetch } = useBalance();
  const id = useId();

  // Chain-specific wallet states
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [selectedEvmToken, setSelectedEvmToken] = useState<string>('');
  const [selectedSolanaToken, setSelectedSolanaToken] = useState<string>('');
  const [activeChain, setActiveChain] = useState<'evm' | 'solana'>('evm');
  const [balanceHistory, setBalanceHistory] = useState<
    Array<{
      timestamp: number;
      balance: string;
      type: 'native' | 'token';
      symbol: string;
      chainType: 'evm' | 'solana';
    }>
  >([]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !isConnected) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isConnected, refetch]);

  // Add balance to history when it changes
  useEffect(() => {
    if (balance && chainType) {
      const historyEntry = {
        timestamp: Date.now(),
        balance: balance.formatted || '0',
        type: 'native' as const,
        symbol: balance.symbol || (chainType === 'evm' ? 'ETH' : 'SOL'),
        chainType: chainType === 'evm' ? ('evm' as const) : ('solana' as const),
      };

      setBalanceHistory((prev) => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
    }
  }, [balance, chainType]);

  // Manual refresh
  const handleRefresh = async () => {
    await refetch();
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Format balance with appropriate precision
  const formatBalance = (value: string | number) => {
    const num = typeof value === 'string' ? Number.parseFloat(value) : value;
    if (Number.isNaN(num)) return '0';

    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
    return `${(num / 1000000).toFixed(2)}M`;
  };

  // Get chain-specific data
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

  // Get available tokens for active chain
  const availableTokens = activeChain === 'evm' ? EVM_TOKENS : SOLANA_TOKENS;
  const selectedToken = activeChain === 'evm' ? selectedEvmToken : selectedSolanaToken;
  const setSelectedToken = activeChain === 'evm' ? setSelectedEvmToken : setSelectedSolanaToken;

  // Get chain icon for history
  const getChainIcon = (chainType: 'evm' | 'solana') => {
    return chainType === 'evm' ? '⬢' : '◎';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>💰 Multi-Chain Balance Display</h3>
        <p className={styles.description}>
          View native and token balances across EVM and Solana chains with real-time updates
        </p>
      </div>

      {/* Chain Selection */}
      <div className={styles.chainSelector}>
        <h4 className={styles.sectionTitle}>Select Chain</h4>
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

      {/* Connection Status */}
      <div className={styles.statusSection}>
        <h4 className={styles.sectionTitle}>
          {currentWallet.icon} {activeChain === 'evm' ? 'EVM' : 'Solana'} Wallet Status
        </h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Connected:</span>
            <span className={styles.value}>{currentWallet.isConnected ? '✅ Yes' : '❌ No'}</span>
          </div>
          {currentWallet.address && (
            <div className={styles.statusItem}>
              <span className={styles.label}>Address:</span>
              <span className={styles.value}>
                {currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-4)}
              </span>
            </div>
          )}
          <div className={styles.statusItem}>
            <span className={styles.label}>Chain:</span>
            <span className={styles.value}>{currentWallet.chain?.name || 'N/A'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Chain ID:</span>
            <span className={styles.value}>{currentWallet.chain?.chainId || 'N/A'}</span>
          </div>
        </div>
      </div>

      {currentWallet.isConnected ? (
        <>
          {/* Native Balance */}
          <div className={styles.balanceSection}>
            <div className={styles.balanceHeader}>
              <h4 className={styles.sectionTitle}>
                {currentWallet.icon} Native {currentWallet.symbol} Balance
              </h4>
              <div className={styles.balanceControls}>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className={styles.refreshButton}
                >
                  {isLoading ? '🔄' : '↻'} Refresh
                </button>
              </div>
            </div>

            <div className={styles.balanceCard}>
              {isLoading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <span>Loading {currentWallet.symbol} balance...</span>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <div className={styles.errorIcon}>⚠️</div>
                  <div className={styles.errorText}>
                    Failed to load {currentWallet.symbol} balance
                    <br />
                    <small>{formatError(error).message}</small>
                  </div>
                </div>
              ) : balance ? (
                <div className={styles.balanceDisplay}>
                  <div className={styles.balanceAmount}>{formatBalance(balance.formatted || '0')}</div>
                  <div className={styles.balanceSymbol}>{balance.symbol || currentWallet.symbol}</div>
                  <div className={styles.lastUpdated}>Last updated: {formatTime(Date.now())}</div>
                  <div className={styles.chainInfo}>Chain: {currentWallet.chain?.name || 'Unknown'}</div>
                </div>
              ) : (
                <div className={styles.noBalance}>No {currentWallet.symbol} balance data</div>
              )}
            </div>
          </div>

          {/* Auto-refresh Settings */}
          <div className={styles.settingsSection}>
            <h4 className={styles.sectionTitle}>Auto-refresh Settings</h4>
            <div className={styles.settingsGrid}>
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                Enable auto-refresh
              </label>

              <div className={styles.intervalControl}>
                <label htmlFor="refresh-interval" className={styles.intervalLabel}>
                  Refresh every:
                </label>
                <select
                  id={`${id}-refresh-interval`}
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  disabled={!autoRefresh}
                  className={styles.intervalSelect}
                >
                  <option value={10}>10 seconds</option>
                  <option value={30}>30 seconds</option>
                  <option value={60}>1 minute</option>
                  <option value={300}>5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Token Balances */}
          {availableTokens.length > 0 && (
            <div className={styles.tokenSection}>
              <h4 className={styles.sectionTitle}>
                {currentWallet.icon} {activeChain === 'evm' ? 'ERC-20' : 'SPL'} Token Balances
              </h4>
              <div className={styles.tokenSelector}>
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className={styles.tokenSelect}
                >
                  <option value="">Select a token...</option>
                  {availableTokens.map((token) => (
                    <option key={token.address} value={token.address}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedToken && (
                <div className={styles.tokenCard}>
                  <div className={styles.tokenInfo}>
                    <div className={styles.tokenName}>
                      {availableTokens.find((t) => t.address === selectedToken)?.name}
                    </div>
                    <div className={styles.tokenSymbol}>
                      {availableTokens.find((t) => t.address === selectedToken)?.symbol}
                    </div>
                    <div className={styles.tokenAddress}>
                      {selectedToken.slice(0, 10)}...{selectedToken.slice(-8)}
                    </div>
                    <div className={styles.tokenDecimals}>
                      Decimals: {availableTokens.find((t) => t.address === selectedToken)?.decimals}
                    </div>
                  </div>
                  <div className={styles.tokenBalance}>
                    <div className={styles.placeholder}>
                      {activeChain === 'evm' ? 'ERC-20' : 'SPL'} token balance loading...
                      <br />
                      <small>
                        (This would integrate with useBalance for {activeChain === 'evm' ? 'ERC-20' : 'SPL'}{' '}
                        token support)
                      </small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Balance History */}
          <div className={styles.historySection}>
            <h4 className={styles.sectionTitle}>Balance History ({balanceHistory.length})</h4>
            <div className={styles.historyList}>
              {balanceHistory.length > 0 ? (
                balanceHistory.map((entry) => (
                  <div key={`${entry.timestamp}-${entry.symbol}`} className={styles.historyItem}>
                    <div className={styles.historyTime}>{formatTime(entry.timestamp)}</div>
                    <div className={styles.historyBalance}>
                      {getChainIcon(entry.chainType)} {formatBalance(entry.balance)} {entry.symbol}
                    </div>
                    <div className={styles.historyType}>
                      {entry.type} - {entry.chainType.toUpperCase()}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>No balance history yet</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.notConnected}>
          <p>
            Please connect an {activeChain === 'evm' ? 'EVM' : 'Solana'} wallet to view{' '}
            {activeChain === 'evm' ? 'ETH and ERC-20' : 'SOL and SPL'} balances
          </p>
          <div className={styles.notConnectedHelp}>
            <p>
              Use the chain selector above to switch between EVM and Solana, then connect the appropriate
              wallet type.
            </p>
          </div>
        </div>
      )}

      {/* Code Example */}
      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Code Example</h4>
        <pre className={styles.codeBlock}>
          <code>{`// Multi-chain balance display
import { 
  useBalance, 
  useEvmWallet, 
  useSolanaWallet 
} from '@walletmesh/modal-react/all';

function MultiChainBalanceDisplay() {
  const { data: balance, isLoading, error, refetch } = useBalance();
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  const [activeChain, setActiveChain] = useState('evm');

  const currentWallet = activeChain === 'evm' ? evmWallet : solanaWallet;

  const handleRefresh = async () => {
    await refetch();
  };

  return (
    <div>
      {/* Chain Selection */}
      <div>
        <button onClick={() => setActiveChain('evm')}>
          ⬢ EVM ({evmWallet.isConnected ? 'Connected' : 'Disconnected'})
        </button>
        <button onClick={() => setActiveChain('solana')}>
          ◎ Solana ({solanaWallet.isConnected ? 'Connected' : 'Disconnected'})
        </button>
      </div>

      {/* Balance Display */}
      {currentWallet.isConnected ? (
        <div>
          <h3>{activeChain === 'evm' ? '⬢ ETH' : '◎ SOL'} Balance</h3>
          <p>Address: {currentWallet.address}</p>
          
          {isLoading ? (
            <p>Loading balance...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : balance ? (
            <div>
              <p>Balance: {balance.formatted} {balance.symbol}</p>
              <button onClick={handleRefresh}>Refresh</button>
            </div>
          ) : (
            <p>No balance data</p>
          )}
        </div>
      ) : (
        <p>Connect {activeChain === 'evm' ? 'EVM' : 'Solana'} wallet first</p>
      )}
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
