import { ChainType, useConnect, useEvmWallet, useSolanaWallet } from '@walletmesh/modal-react/all';
import { useCallback, useEffect, useId, useState } from 'react';
import styles from './WalletDiscoveryDemo.module.css';

interface CustomWallet {
  id: string;
  name: string;
  chains: ChainType[];
  description?: string;
  installUrl?: string;
  icon?: string;
}

interface WalletStats {
  total: number;
  evm: number;
  solana: number;
  multiChain: number;
  connected: number;
}

// Enhanced custom wallets with more details
const CUSTOM_WALLETS: CustomWallet[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    chains: [ChainType.Evm],
    description: 'Most popular Ethereum wallet browser extension',
    installUrl: 'https://metamask.io/',
    icon: '🦊',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    chains: [ChainType.Solana],
    description: 'Leading Solana wallet for DeFi and NFTs',
    installUrl: 'https://phantom.app/',
    icon: '👻',
  },
  {
    id: 'rabby',
    name: 'Rabby Wallet',
    chains: [ChainType.Evm],
    description: 'Multi-chain EVM wallet with advanced features',
    installUrl: 'https://rabby.io/',
    icon: '🐰',
  },
  {
    id: 'solflare',
    name: 'Solflare',
    chains: [ChainType.Solana],
    description: 'Secure Solana wallet with staking support',
    installUrl: 'https://solflare.com/',
    icon: '☀️',
  },
  {
    id: 'backpack',
    name: 'Backpack',
    chains: [ChainType.Solana],
    description: 'Multi-chain wallet with built-in xNFT support',
    installUrl: 'https://backpack.app/',
    icon: '🎒',
  },
  {
    id: 'trust-wallet',
    name: 'Trust Wallet',
    chains: [ChainType.Evm, ChainType.Solana],
    description: 'Multi-blockchain wallet supporting 100+ chains',
    installUrl: 'https://trustwallet.com/',
    icon: '🔐',
  },
];

export function WalletDiscoveryDemo() {
  const { wallets, connect } = useConnect();
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  const id = useId();

  const [filter, setFilter] = useState<ChainType | 'all' | 'multi-chain'>('all');
  const [showCustom, setShowCustom] = useState(true);
  const [showConnected, setShowConnected] = useState(false);
  const [discoveryTime, setDiscoveryTime] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'chains' | 'connection'>('name');

  // Simulate discovery time
  useEffect(() => {
    const start = Date.now();
    const timer = setTimeout(() => {
      setDiscoveryTime(Date.now() - start);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Calculate wallet statistics
  const calculateStats = useCallback(
    (walletList: typeof wallets): WalletStats => {
      const stats = {
        total: walletList.length,
        evm: 0,
        solana: 0,
        multiChain: 0,
        connected: 0,
      };

      walletList.forEach((wallet) => {
        if (wallet.chains.includes(ChainType.Evm)) stats.evm++;
        if (wallet.chains.includes(ChainType.Solana)) stats.solana++;
        if (wallet.chains.length > 1) stats.multiChain++;

        // Check if wallet is connected
        if (
          (evmWallet.isConnected && wallet.chains.includes(ChainType.Evm)) ||
          (solanaWallet.isConnected && wallet.chains.includes(ChainType.Solana))
        ) {
          stats.connected++;
        }
      });

      return stats;
    },
    [evmWallet.isConnected, solanaWallet.isConnected],
  );

  // Enhanced filtering
  const getFilteredWallets = useCallback(
    (walletList: typeof wallets) => {
      let filtered = [...walletList];

      // Chain type filter
      if (filter !== 'all') {
        if (filter === 'multi-chain') {
          filtered = filtered.filter((wallet) => wallet.chains.length > 1);
        } else {
          filtered = filtered.filter((wallet) => wallet.chains.includes(filter));
        }
      }

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (wallet) =>
            wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wallet.id.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      // Connection filter
      if (showConnected) {
        filtered = filtered.filter(
          (wallet) =>
            (evmWallet.isConnected && wallet.chains.includes(ChainType.Evm)) ||
            (solanaWallet.isConnected && wallet.chains.includes(ChainType.Solana)),
        );
      }

      // Sort
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'chains':
            return b.chains.length - a.chains.length;
          case 'connection': {
            const aConnected =
              (evmWallet.isConnected && a.chains.includes(ChainType.Evm)) ||
              (solanaWallet.isConnected && a.chains.includes(ChainType.Solana));
            const bConnected =
              (evmWallet.isConnected && b.chains.includes(ChainType.Evm)) ||
              (solanaWallet.isConnected && b.chains.includes(ChainType.Solana));
            return bConnected ? 1 : aConnected ? -1 : 0;
          }
          default:
            return 0;
        }
      });

      return filtered;
    },
    [filter, searchTerm, showConnected, sortBy, evmWallet.isConnected, solanaWallet.isConnected],
  );

  // Filter wallets by chain type
  const filteredWallets = getFilteredWallets(wallets);

  // Filter custom wallets with enhanced functionality
  const filteredCustomWallets = getFilteredWallets(CUSTOM_WALLETS as typeof wallets);

  // Calculate statistics
  const detectedStats = calculateStats(filteredWallets);
  const customStats = calculateStats(filteredCustomWallets);

  // Handle wallet connection
  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Get chain icon
  const getChainIcon = (chain: ChainType) => {
    switch (chain) {
      case ChainType.Evm:
        return '⬢';
      case ChainType.Solana:
        return '◎';
      default:
        return '🔗';
    }
  };

  // Check if wallet is connected
  const isWalletConnected = (wallet: CustomWallet | (typeof wallets)[0]) => {
    return (
      (evmWallet.isConnected && wallet.chains.includes(ChainType.Evm)) ||
      (solanaWallet.isConnected && wallet.chains.includes(ChainType.Solana))
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>🔍 Enhanced Wallet Discovery</h3>
        <p className={styles.description}>
          Discover and filter wallets across EVM and Solana chains with advanced search and connection
          tracking
        </p>
      </div>

      {/* Enhanced Controls */}
      <div className={styles.controlsSection}>
        <div className={styles.controlRow}>
          <div className={styles.filterGroup}>
            <label htmlFor={`${id}-chain-filter`} className={styles.controlLabel}>
              Chain Filter:
            </label>
            <select
              id={`${id}-chain-filter`}
              value={filter}
              onChange={(e) => setFilter(e.target.value as ChainType | 'all' | 'multi-chain')}
              className={styles.filterSelect}
            >
              <option value="all">All Chains</option>
              <option value={ChainType.Evm}>⬢ EVM Only</option>
              <option value={ChainType.Solana}>◎ Solana Only</option>
              <option value="multi-chain">🔗 Multi-Chain</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor={`${id}-sort-by`} className={styles.controlLabel}>
              Sort By:
            </label>
            <select
              id={`${id}-sort-by`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'chains' | 'connection')}
              className={styles.filterSelect}
            >
              <option value="name">Name</option>
              <option value="chains">Chain Count</option>
              <option value="connection">Connection Status</option>
            </select>
          </div>

          <div className={styles.searchGroup}>
            <label htmlFor={`${id}-search`} className={styles.controlLabel}>
              Search:
            </label>
            <input
              id={`${id}-search`}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search wallets..."
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.controlRow}>
          <label className={styles.toggleLabel}>
            <input type="checkbox" checked={showCustom} onChange={(e) => setShowCustom(e.target.checked)} />
            Show Custom Wallet Examples
          </label>

          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={showConnected}
              onChange={(e) => setShowConnected(e.target.checked)}
            />
            Show Only Connected Wallets
          </label>
        </div>
      </div>

      {/* Enhanced Discovery Stats */}
      <div className={styles.statsSection}>
        <h4 className={styles.sectionTitle}>Discovery Statistics</h4>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h5>Detected Wallets</h5>
            <div className={styles.statRow}>
              <span className={styles.statValue}>{detectedStats.total}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statBreakdown}>
              <span>⬢ EVM: {detectedStats.evm}</span>
              <span>◎ Solana: {detectedStats.solana}</span>
              <span>🔗 Multi: {detectedStats.multiChain}</span>
              <span>✅ Connected: {detectedStats.connected}</span>
            </div>
          </div>

          {showCustom && (
            <div className={styles.statCard}>
              <h5>Custom Examples</h5>
              <div className={styles.statRow}>
                <span className={styles.statValue}>{customStats.total}</span>
                <span className={styles.statLabel}>Total</span>
              </div>
              <div className={styles.statBreakdown}>
                <span>⬢ EVM: {customStats.evm}</span>
                <span>◎ Solana: {customStats.solana}</span>
                <span>🔗 Multi: {customStats.multiChain}</span>
              </div>
            </div>
          )}

          {discoveryTime && (
            <div className={styles.statCard}>
              <h5>Performance</h5>
              <div className={styles.statRow}>
                <span className={styles.statValue}>{discoveryTime}ms</span>
                <span className={styles.statLabel}>Discovery Time</span>
              </div>
              <div className={styles.statBreakdown}>
                <span>⚡ Fast discovery</span>
                <span>🔄 Real-time updates</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detected Wallets */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Detected Wallets ({filteredWallets.length})</h4>
        <div className={styles.walletGrid}>
          {filteredWallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`${styles.walletCard} ${isWalletConnected(wallet) ? styles.connectedWallet : ''}`}
            >
              <div className={styles.walletHeader}>
                <div className={styles.walletName}>{wallet.name}</div>
                {isWalletConnected(wallet) && <span className={styles.connectedBadge}>Connected</span>}
              </div>
              <div className={styles.walletId}>ID: {wallet.id}</div>
              <div className={styles.walletChains}>
                {wallet.chains.map((chain) => (
                  <span key={chain} className={styles.chainBadge}>
                    {getChainIcon(chain)} {chain}
                  </span>
                ))}
              </div>
              <div className={styles.walletActions}>
                <button
                  type="button"
                  onClick={() => handleConnect(wallet.id)}
                  disabled={isWalletConnected(wallet)}
                  className={styles.connectButton}
                >
                  {isWalletConnected(wallet) ? 'Connected' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
          {filteredWallets.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p className={styles.emptyMessage}>No wallets found matching your current filters</p>
              <p className={styles.emptySubtext}>Try adjusting your search terms or chain filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Wallets */}
      {showCustom && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Popular Wallet Examples ({filteredCustomWallets.length})</h4>
          <div className={styles.walletGrid}>
            {filteredCustomWallets.map((wallet) => (
              <div key={wallet.id} className={`${styles.walletCard} ${styles.customWallet}`}>
                <div className={styles.walletHeader}>
                  <div className={styles.walletName}>
                    {wallet.icon} {wallet.name}
                  </div>
                  <span className={styles.exampleBadge}>Example</span>
                </div>
                <div className={styles.walletId}>ID: {wallet.id}</div>
                {wallet.description && <div className={styles.walletDescription}>{wallet.description}</div>}
                <div className={styles.walletChains}>
                  {wallet.chains.map((chain) => (
                    <span key={chain} className={styles.chainBadge}>
                      {getChainIcon(chain)} {chain}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Example */}
      <div className={styles.codeSection}>
        <h4 className={styles.sectionTitle}>Implementation Examples</h4>
        <pre className={styles.codeBlock}>
          <code>{`// Enhanced wallet discovery with filtering
import { useConnect, useEvmWallet, useSolanaWallet, ChainType } from '@walletmesh/modal-react/all';

function WalletDiscovery() {
  const { wallets, connect } = useConnect();
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();
  
  // Filter wallets by chain type
  const evmWallets = wallets.filter(w => w.chains.includes(ChainType.Evm));
  const solanaWallets = wallets.filter(w => w.chains.includes(ChainType.Solana));
  const multiChainWallets = wallets.filter(w => w.chains.length > 1);
  
  // Check connection status
  const isWalletConnected = (wallet) => {
    return (evmWallet.isConnected && wallet.chains.includes(ChainType.Evm)) ||
           (solanaWallet.isConnected && wallet.chains.includes(ChainType.Solana));
  };
  
  // Connect to specific wallet
  const handleConnect = async (walletId) => {
    try {
      await connect(walletId);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  return (
    <div>
      <h3>EVM Wallets ({evmWallets.length})</h3>
      {evmWallets.map(wallet => (
        <div key={wallet.id}>
          <span>{wallet.name}</span>
          <button 
            onClick={() => handleConnect(wallet.id)}
            disabled={isWalletConnected(wallet)}
          >
            {isWalletConnected(wallet) ? 'Connected' : 'Connect'}
          </button>
        </div>
      ))}
      
      <h3>Solana Wallets ({solanaWallets.length})</h3>
      {solanaWallets.map(wallet => (
        <div key={wallet.id}>
          <span>{wallet.name}</span>
          <button 
            onClick={() => handleConnect(wallet.id)}
            disabled={isWalletConnected(wallet)}
          >
            {isWalletConnected(wallet) ? 'Connected' : 'Connect'}
          </button>
        </div>
      ))}
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
