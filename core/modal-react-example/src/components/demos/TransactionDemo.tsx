import { formatError } from '@walletmesh/modal-core';
import { useEvmWallet, useSolanaWallet, useTransaction } from '@walletmesh/modal-react/all';
import { useId, useState } from 'react';
import styles from './TransactionDemo.module.css';

interface TransactionHistory {
  id: string;
  type: 'evm-send' | 'evm-contract' | 'solana-send' | 'solana-program';
  chainType: 'evm' | 'solana';
  to: string;
  value?: string;
  data?: string;
  hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  error?: string;
  programId?: string; // For Solana program interactions
  instruction?: string; // For Solana instruction data
}

export function TransactionDemo() {
  const { sendTransaction, error: txError, currentTransaction } = useTransaction();
  const status = currentTransaction?.status || null;
  const error = txError;
  const id = useId();

  // Chain-specific wallet states
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();

  // EVM transaction states
  const [evmRecipient, setEvmRecipient] = useState('');
  const [evmAmount, setEvmAmount] = useState('');
  const [evmContractAddress, setEvmContractAddress] = useState('');
  const [evmContractData, setEvmContractData] = useState('');
  const [evmTransactionType, setEvmTransactionType] = useState<'send' | 'contract'>('send');

  // Solana transaction states
  const [solanaRecipient, setSolanaRecipient] = useState('');
  const [solanaAmount, setSolanaAmount] = useState('');
  const [solanaProgramId, setSolanaProgramId] = useState('');
  const [solanaInstruction, setSolanaInstruction] = useState('');
  const [solanaTransactionType, setSolanaTransactionType] = useState<'send' | 'program'>('send');

  // Active chain selection
  const [activeChain, setActiveChain] = useState<'evm' | 'solana'>('evm');
  const [history, setHistory] = useState<TransactionHistory[]>([]);

  // Add transaction to history
  const addToHistory = (tx: Omit<TransactionHistory, 'id' | 'timestamp'>) => {
    const newTx: TransactionHistory = {
      ...tx,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newTx, ...prev.slice(0, 9)]); // Keep last 10 transactions
    return newTx.id;
  };

  // Update transaction in history
  const updateInHistory = (id: string, updates: Partial<TransactionHistory>) => {
    setHistory((prev) => prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx)));
  };

  // Handle EVM send transaction
  const handleEvmSendTransaction = async () => {
    if (!evmRecipient || !evmAmount) {
      alert('Please fill in recipient and amount');
      return;
    }

    const txId = addToHistory({
      type: 'evm-send',
      chainType: 'evm',
      to: evmRecipient,
      value: evmAmount,
      status: 'pending',
    });

    try {
      const result = await sendTransaction({
        to: evmRecipient,
        value: (Number.parseFloat(evmAmount) * 1e18).toString(), // Convert to wei for EVM
      });

      updateInHistory(txId, {
        hash: result.hash,
        status: 'confirmed',
      });

      // Clear form
      setEvmRecipient('');
      setEvmAmount('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      updateInHistory(txId, {
        status: 'failed',
        error: errorMsg,
      });
    }
  };

  // Handle Solana send transaction
  const handleSolanaSendTransaction = async () => {
    if (!solanaRecipient || !solanaAmount) {
      alert('Please fill in recipient and amount');
      return;
    }

    const txId = addToHistory({
      type: 'solana-send',
      chainType: 'solana',
      to: solanaRecipient,
      value: solanaAmount,
      status: 'pending',
    });

    try {
      const result = await sendTransaction({
        to: solanaRecipient,
        value: (Number.parseFloat(solanaAmount) * 1e9).toString(), // Convert to lamports for Solana
      });

      updateInHistory(txId, {
        hash: result.hash,
        status: 'confirmed',
      });

      // Clear form
      setSolanaRecipient('');
      setSolanaAmount('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      updateInHistory(txId, {
        status: 'failed',
        error: errorMsg,
      });
    }
  };

  // Handle EVM contract interaction
  const handleEvmContractTransaction = async () => {
    if (!evmContractAddress || !evmContractData) {
      alert('Please fill in contract address and data');
      return;
    }

    const txId = addToHistory({
      type: 'evm-contract',
      chainType: 'evm',
      to: evmContractAddress,
      data: evmContractData,
      status: 'pending',
    });

    try {
      const result = await sendTransaction({
        to: evmContractAddress,
        data: evmContractData,
      });

      updateInHistory(txId, {
        hash: result.hash,
        status: 'confirmed',
      });

      // Clear form
      setEvmContractAddress('');
      setEvmContractData('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      updateInHistory(txId, {
        status: 'failed',
        error: errorMsg,
      });
    }
  };

  // Handle Solana program interaction
  const handleSolanaProgramTransaction = async () => {
    if (!solanaProgramId || !solanaInstruction) {
      alert('Please fill in program ID and instruction data');
      return;
    }

    const txId = addToHistory({
      type: 'solana-program',
      chainType: 'solana',
      to: solanaProgramId,
      programId: solanaProgramId,
      instruction: solanaInstruction,
      status: 'pending',
    });

    try {
      // For Solana program interactions, we'll use the instruction data as the transaction data
      const result = await sendTransaction({
        to: solanaProgramId,
        data: solanaInstruction,
      });

      updateInHistory(txId, {
        hash: result.hash,
        status: 'confirmed',
      });

      // Clear form
      setSolanaProgramId('');
      setSolanaInstruction('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      updateInHistory(txId, {
        status: 'failed',
        error: errorMsg,
      });
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Get status color
  const getStatusColor = (status: TransactionHistory['status']) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  // Get transaction type icon
  const getTransactionIcon = (type: TransactionHistory['type']) => {
    switch (type) {
      case 'evm-send':
        return '⬢💸';
      case 'evm-contract':
        return '⬢📝';
      case 'solana-send':
        return '◎💸';
      case 'solana-program':
        return '◎📝';
      default:
        return '💸';
    }
  };

  // Get current active wallet info
  const getCurrentWalletInfo = () => {
    if (activeChain === 'evm') {
      return {
        isConnected: evmWallet.isConnected,
        address: evmWallet.address,
        chain: evmWallet.chain,
        chainType: 'evm' as const,
      };
    } else {
      return {
        isConnected: solanaWallet.isConnected,
        address: solanaWallet.address,
        chain: solanaWallet.chain,
        chainType: 'solana' as const,
      };
    }
  };

  const currentWallet = getCurrentWalletInfo();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>💸 Multi-Chain Transaction Demo</h3>
        <p className={styles.description}>
          Send transactions on EVM and Solana chains using chain-specific forms
        </p>
      </div>

      {/* Chain Selection */}
      <div className={styles.chainSelector}>
        <h4 className={styles.sectionTitle}>Select Active Chain</h4>
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
        <h4 className={styles.sectionTitle}>{activeChain === 'evm' ? '⬢ EVM' : '◎ Solana'} Wallet Status</h4>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Connected:</span>
            <span className={styles.value}>{currentWallet.isConnected ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Address:</span>
            <span className={styles.value}>
              {currentWallet.address
                ? `${currentWallet.address.slice(0, 6)}...${currentWallet.address.slice(-4)}`
                : 'N/A'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Chain Type:</span>
            <span className={styles.value}>{currentWallet.chainType || 'N/A'}</span>
          </div>
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
          {/* EVM Transaction Forms */}
          {activeChain === 'evm' && (
            <>
              {/* EVM Transaction Type Toggle */}
              <div className={styles.typeSection}>
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    onClick={() => setEvmTransactionType('send')}
                    className={`${styles.typeButton} ${evmTransactionType === 'send' ? styles.active : ''}`}
                  >
                    Send ETH
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvmTransactionType('contract')}
                    className={`${styles.typeButton} ${evmTransactionType === 'contract' ? styles.active : ''}`}
                  >
                    Contract Interaction
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Solana Transaction Forms */}
          {activeChain === 'solana' && (
            <>
              {/* Solana Transaction Type Toggle */}
              <div className={styles.typeSection}>
                <div className={styles.typeToggle}>
                  <button
                    type="button"
                    onClick={() => setSolanaTransactionType('send')}
                    className={`${styles.typeButton} ${solanaTransactionType === 'send' ? styles.active : ''}`}
                  >
                    Send SOL
                  </button>
                  <button
                    type="button"
                    onClick={() => setSolanaTransactionType('program')}
                    className={`${styles.typeButton} ${solanaTransactionType === 'program' ? styles.active : ''}`}
                  >
                    Program Interaction
                  </button>
                </div>
              </div>
            </>
          )}

          {/* EVM Send Transaction Form */}
          {activeChain === 'evm' && evmTransactionType === 'send' && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>⬢ Send ETH Transaction</h4>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="evm-recipient-address" className={styles.inputLabel}>
                    Recipient Address
                  </label>
                  <input
                    id={`${id}-evm-recipient-address`}
                    type="text"
                    value={evmRecipient}
                    onChange={(e) => setEvmRecipient(e.target.value)}
                    placeholder="0x..."
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor={`${id}-evm-amount`} className={styles.inputLabel}>
                    Amount (ETH)
                  </label>
                  <input
                    id={`${id}-evm-amount`}
                    type="number"
                    value={evmAmount}
                    onChange={(e) => setEvmAmount(e.target.value)}
                    placeholder="0.001"
                    step="0.001"
                    min="0"
                    className={styles.input}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleEvmSendTransaction}
                disabled={
                  status === 'preparing' ||
                  status === 'signing' ||
                  status === 'broadcasting' ||
                  status === 'confirming' ||
                  !evmRecipient ||
                  !evmAmount
                }
                className={styles.submitButton}
              >
                {status === 'preparing' ||
                status === 'signing' ||
                status === 'broadcasting' ||
                status === 'confirming'
                  ? 'Sending...'
                  : 'Send ETH Transaction'}
              </button>
            </div>
          )}

          {/* Solana Send Transaction Form */}
          {activeChain === 'solana' && solanaTransactionType === 'send' && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>◎ Send SOL Transaction</h4>
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="solana-recipient-address" className={styles.inputLabel}>
                    Recipient Address
                  </label>
                  <input
                    id={`${id}-solana-recipient-address`}
                    type="text"
                    value={solanaRecipient}
                    onChange={(e) => setSolanaRecipient(e.target.value)}
                    placeholder="Base58 address..."
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor={`${id}-solana-amount`} className={styles.inputLabel}>
                    Amount (SOL)
                  </label>
                  <input
                    id={`${id}-solana-amount`}
                    type="number"
                    value={solanaAmount}
                    onChange={(e) => setSolanaAmount(e.target.value)}
                    placeholder="0.001"
                    step="0.001"
                    min="0"
                    className={styles.input}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSolanaSendTransaction}
                disabled={
                  status === 'preparing' ||
                  status === 'signing' ||
                  status === 'broadcasting' ||
                  status === 'confirming' ||
                  !solanaRecipient ||
                  !solanaAmount
                }
                className={styles.submitButton}
              >
                {status === 'preparing' ||
                status === 'signing' ||
                status === 'broadcasting' ||
                status === 'confirming'
                  ? 'Sending...'
                  : 'Send SOL Transaction'}
              </button>
            </div>
          )}

          {/* EVM Contract Interaction Form */}
          {activeChain === 'evm' && evmTransactionType === 'contract' && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>⬢ EVM Contract Interaction</h4>
              <div className={styles.inputGroup}>
                <label htmlFor="evm-contract-address" className={styles.inputLabel}>
                  Contract Address
                </label>
                <input
                  id={`${id}-evm-contract-address`}
                  type="text"
                  value={evmContractAddress}
                  onChange={(e) => setEvmContractAddress(e.target.value)}
                  placeholder="0x..."
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="evm-transaction-data" className={styles.inputLabel}>
                  Transaction Data (Hex)
                </label>
                <textarea
                  id={`${id}-evm-transaction-data`}
                  value={evmContractData}
                  onChange={(e) => setEvmContractData(e.target.value)}
                  placeholder="0xa9059cbb... (function call data)"
                  className={styles.textarea}
                  rows={3}
                />
              </div>
              <button
                type="button"
                onClick={handleEvmContractTransaction}
                disabled={
                  status === 'preparing' ||
                  status === 'signing' ||
                  status === 'broadcasting' ||
                  status === 'confirming' ||
                  !evmContractAddress ||
                  !evmContractData
                }
                className={styles.submitButton}
              >
                {status === 'preparing' ||
                status === 'signing' ||
                status === 'broadcasting' ||
                status === 'confirming'
                  ? 'Sending...'
                  : 'Send Contract Transaction'}
              </button>
            </div>
          )}

          {/* Solana Program Interaction Form */}
          {activeChain === 'solana' && solanaTransactionType === 'program' && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>◎ Solana Program Interaction</h4>
              <div className={styles.inputGroup}>
                <label htmlFor="solana-program-id" className={styles.inputLabel}>
                  Program ID
                </label>
                <input
                  id={`${id}-solana-program-id`}
                  type="text"
                  value={solanaProgramId}
                  onChange={(e) => setSolanaProgramId(e.target.value)}
                  placeholder="Base58 program address..."
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="solana-instruction-data" className={styles.inputLabel}>
                  Instruction Data (Base64)
                </label>
                <textarea
                  id={`${id}-solana-instruction-data`}
                  value={solanaInstruction}
                  onChange={(e) => setSolanaInstruction(e.target.value)}
                  placeholder="Base64 encoded instruction data..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
              <button
                type="button"
                onClick={handleSolanaProgramTransaction}
                disabled={
                  status === 'preparing' ||
                  status === 'signing' ||
                  status === 'broadcasting' ||
                  status === 'confirming' ||
                  !solanaProgramId ||
                  !solanaInstruction
                }
                className={styles.submitButton}
              >
                {status === 'preparing' ||
                status === 'signing' ||
                status === 'broadcasting' ||
                status === 'confirming'
                  ? 'Sending...'
                  : 'Send Program Transaction'}
              </button>
            </div>
          )}

          {/* Transaction Status */}
          {status && (
            <div className={styles.statusDisplay}>
              <span className={styles.statusLabel}>Transaction Status:</span>
              <span className={`${styles.statusValue} ${styles[status]}`}>{status.toUpperCase()}</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className={styles.errorSection}>
              <h4 className={styles.errorTitle}>Transaction Error</h4>
              <p className={styles.errorMessage}>{formatError(error).message}</p>
            </div>
          )}

          {/* Transaction History */}
          <div className={styles.historySection}>
            <h4 className={styles.sectionTitle}>Transaction History ({history.length})</h4>
            <div className={styles.historyList}>
              {history.length > 0 ? (
                history.map((tx) => (
                  <div key={tx.id} className={styles.historyItem}>
                    <div className={styles.historyHeader}>
                      <div className={styles.historyType}>
                        {getTransactionIcon(tx.type)} {tx.type.toUpperCase().replace('-', ' ')}
                      </div>
                      <div className={styles.historyTime}>{formatTime(tx.timestamp)}</div>
                    </div>
                    <div className={styles.historyDetails}>
                      <div>
                        <strong>Chain:</strong> {tx.chainType.toUpperCase()}
                      </div>
                      <div>
                        <strong>To:</strong> {tx.to.slice(0, 10)}...{tx.to.slice(-8)}
                      </div>
                      {tx.value && (
                        <div>
                          <strong>Value:</strong> {tx.value} {tx.chainType === 'evm' ? 'ETH' : 'SOL'}
                        </div>
                      )}
                      {tx.programId && (
                        <div>
                          <strong>Program:</strong> {tx.programId.slice(0, 10)}...{tx.programId.slice(-8)}
                        </div>
                      )}
                      {tx.hash && (
                        <div>
                          <strong>Hash:</strong> {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                        </div>
                      )}
                      <div className={styles.historyStatus}>
                        <strong>Status:</strong>
                        <span style={{ color: getStatusColor(tx.status) }}>{tx.status.toUpperCase()}</span>
                      </div>
                      {tx.error && (
                        <div className={styles.historyError}>
                          <strong>Error:</strong> {tx.error}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyMessage}>No transactions yet</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className={styles.notConnected}>
          <p>
            Please connect an {activeChain === 'evm' ? 'EVM' : 'Solana'} wallet to send transactions on{' '}
            {activeChain === 'evm' ? 'EVM chains' : 'Solana'}
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
          <code>{`// Multi-chain transaction handling
import { 
  useTransaction, 
  useEvmWallet, 
  useSolanaWallet 
} from '@walletmesh/modal-react/all';

function MultiChainTransactions() {
  const { sendTransaction, status, error } = useTransaction();
  const evmWallet = useEvmWallet();
  const solanaWallet = useSolanaWallet();

  const sendEthTransaction = async () => {
    if (!evmWallet.isReady) return;
    
    try {
      const result = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f7F1eD',
        value: '1000000000000000000', // 1 ETH in wei
      });
      console.log('EVM transaction sent:', result.hash);
    } catch (error) {
      console.error('EVM transaction failed:', error);
    }
  };

  const sendSolTransaction = async () => {
    if (!solanaWallet.isReady) return;
    
    try {
      const result = await sendTransaction({
        to: 'SomeBase58Address...',
        value: '1000000000', // 1 SOL in lamports
      });
      console.log('Solana transaction sent:', result.hash);
    } catch (error) {
      console.error('Solana transaction failed:', error);
    }
  };

  return (
    <div>
      {/* EVM Section */}
      {evmWallet.isReady && (
        <div>
          <h3>EVM Wallet: {evmWallet.address}</h3>
          <button onClick={sendEthTransaction}>Send ETH</button>
        </div>
      )}
      
      {/* Solana Section */}
      {solanaWallet.isReady && (
        <div>
          <h3>Solana Wallet: {solanaWallet.address}</h3>
          <button onClick={sendSolTransaction}>Send SOL</button>
        </div>
      )}
      
      {/* Status */}
      {status && <p>Status: {status}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
