/**
 * Transaction Hook Usage Examples
 *
 * This example demonstrates how to use the useTransaction hook
 * for sending transactions across different blockchain networks.
 */

import {
  type TransactionResult,
  WalletMeshProvider,
  useAccount,
  useBalance,
  useSwitchChain,
  useTransaction,
} from '@walletmesh/modal-react';
import React, { useState } from 'react';

/**
 * Example 1: Simple EVM Transfer
 * Send native tokens on EVM chains
 */
function EVMTransferExample() {
  const { isConnected, address, chainId } = useAccount();
  const { data: balance } = useBalance();
  const { sendTransaction, isLoading, error, currentTransaction } = useTransaction();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = async () => {
    if (!recipient || !amount) return;

    try {
      const result = await sendTransaction({
        to: recipient,
        value: (Number.parseFloat(amount) * 1e18).toString(), // Convert ETH to wei
        metadata: {
          description: 'Transfer ETH',
          action: 'transfer',
        },
      });

      console.log('Transaction sent:', result.hash);

      // Wait for confirmation
      const confirmed = await waitForConfirmation(result.hash, 2);
      console.log('Transaction confirmed:', confirmed);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  if (!isConnected) return <div>Please connect your wallet</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>EVM Transfer</h3>
      <p>
        Balance: {balance?.formatted} {balance?.symbol}
      </p>

      <input
        type="text"
        placeholder="Recipient address (0x...)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <input
        type="number"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <button
        type="button"
        onClick={handleTransfer}
        disabled={isLoading || !recipient || !amount}
        style={{
          padding: '10px 20px',
          background: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Sending...' : 'Send Transaction'}
      </button>

      {error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error.message}</div>}

      {currentTransaction && (
        <div style={{ marginTop: '10px' }}>
          <p>Status: {currentTransaction.status}</p>
          <p>Hash: {currentTransaction.hash}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Contract Interaction
 * Call smart contract functions
 */
function ContractInteractionExample() {
  const { isConnected, chainType } = useAccount();
  const { sendTransaction, estimateGas, isLoading } = useTransaction();
  const [contractAddress, setContractAddress] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');

  const handleApprove = async () => {
    if (chainType !== 'evm') {
      alert('This example only works on EVM chains');
      return;
    }

    try {
      // First estimate gas
      const gasEstimate = await estimateGas({
        to: contractAddress,
        data: `0xa9059cbb000000000000000000000000${recipient.slice(2)}${tokenAmount.padStart(64, '0')}`, // transfer function
      });

      console.log('Estimated gas:', gasEstimate);

      // Send transaction with estimated gas
      const result = await sendTransaction({
        to: contractAddress,
        data: `0xa9059cbb000000000000000000000000${recipient.slice(2)}${tokenAmount.padStart(64, '0')}`, // transfer function
        gas: gasEstimate,
        metadata: {
          description: 'Token transfer',
          action: 'transfer',
          data: { token: contractAddress, amount: tokenAmount },
        },
      });

      console.log('Transaction sent:', result.hash);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  if (!isConnected) return null;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Contract Interaction (EVM)</h3>

      <input
        type="text"
        placeholder="Token contract address"
        value={contractAddress}
        onChange={(e) => setContractAddress(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <input
        type="text"
        placeholder="Amount (in smallest unit)"
        value={tokenAmount}
        onChange={(e) => setTokenAmount(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      />

      <button
        type="button"
        onClick={handleApprove}
        disabled={isLoading || !contractAddress || !tokenAmount}
        style={{
          padding: '10px 20px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Send Token Transfer
      </button>
    </div>
  );
}

/**
 * Example 3: Multi-Chain Transaction
 * Send transactions on different chains with auto-switching
 */
function MultiChainTransactionExample() {
  const { isConnected, chainId } = useAccount();
  const { chains } = useSwitchChain();
  const { sendTransaction, isLoading, waitForConfirmation } = useTransaction();
  const [targetChain, setTargetChain] = useState('');

  const handleMultiChainTx = async () => {
    try {
      // Send transaction on target chain (auto-switch if needed)
      const result = await sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f8b5e3',
        value: '1000000000000000', // 0.001 ETH
        chainId: targetChain,
        autoSwitchChain: true, // Automatically switch chains
        metadata: {
          description: 'Multi-chain transaction',
          action: 'transfer',
          data: { targetChain },
        },
      });

      console.log('Transaction sent on chain', targetChain, ':', result.hash);

      // Wait for 2 confirmations
      const confirmed = await waitForConfirmation(result.hash, 2);
      console.log('Confirmed at block:', confirmed.blockNumber);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  if (!isConnected) return null;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Multi-Chain Transaction</h3>
      <p>Current chain: {chainId}</p>

      <select
        value={targetChain}
        onChange={(e) => setTargetChain(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
      >
        <option value="">Select target chain</option>
        {chains.map((chain) => (
          <option key={chain.chainId} value={chain.chainId}>
            {chain.name}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleMultiChainTx}
        disabled={isLoading || !targetChain}
        style={{
          padding: '10px 20px',
          background: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Send on {targetChain || 'Selected Chain'}
      </button>
    </div>
  );
}

/**
 * Example 4: Transaction History
 * Track and display transaction history
 */
function TransactionHistoryExample() {
  const { transactions, getTransaction } = useTransaction();
  const [selectedTx, setSelectedTx] = useState<TransactionResult | null>(null);

  const handleSelectTx = (hash: string) => {
    const tx = getTransaction(hash);
    setSelectedTx(tx || null);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Transaction History</h3>

      {transactions.length === 0 ? (
        <p>No transactions yet</p>
      ) : (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {transactions.map((tx) => (
              <button
                key={tx.hash}
                type="button"
                onClick={() => handleSelectTx(tx.hash)}
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </span>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      background:
                        tx.status === 'confirmed'
                          ? '#28a745'
                          : tx.status === 'failed'
                            ? '#dc3545'
                            : '#ffc107',
                      color: 'white',
                    }}
                  >
                    {tx.status}
                  </span>
                </div>
              </button>
            ))}
          </ul>

          {selectedTx && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              <h4>Transaction Details</h4>
              <p>Hash: {selectedTx.hash}</p>
              <p>Chain: {selectedTx.chainId}</p>
              <p>Status: {selectedTx.status}</p>
              {selectedTx.blockNumber && <p>Block: {selectedTx.blockNumber}</p>}
              {selectedTx.gasUsed && <p>Gas Used: {selectedTx.gasUsed}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Solana Transaction
 * Send transactions on Solana
 */
function SolanaTransactionExample() {
  const { isConnected, chainType } = useAccount();
  const { sendTransaction, simulateTransaction, isLoading } = useTransaction();
  const [serializedTx, setSerializedTx] = useState('');

  const handleSolanaTx = async () => {
    if (chainType !== 'solana') {
      alert('Please connect a Solana wallet');
      return;
    }

    try {
      // First simulate the transaction
      const simulation = await simulateTransaction({
        transaction: serializedTx,
      });
      console.log('Simulation result:', simulation);

      // If simulation succeeds, send the transaction
      const result = await sendTransaction({
        transaction: serializedTx,
        options: {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        },
      });

      console.log('Solana transaction sent:', result.hash);
    } catch (err) {
      console.error('Solana transaction failed:', err);
    }
  };

  if (!isConnected || chainType !== 'solana') return null;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Solana Transaction</h3>

      <textarea
        placeholder="Paste serialized transaction (base64)"
        value={serializedTx}
        onChange={(e) => setSerializedTx(e.target.value)}
        style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '100px' }}
      />

      <button
        type="button"
        onClick={handleSolanaTx}
        disabled={isLoading || !serializedTx}
        style={{
          padding: '10px 20px',
          background: '#9c27b0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Send Solana Transaction
      </button>
    </div>
  );
}

/**
 * Main App Component
 */
export function TransactionExamplesApp() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'Transaction Examples',
        chains: ['evm', 'solana', 'aztec'],
        debug: true,
      }}
    >
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>WalletMesh Transaction Examples</h1>

        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          <EVMTransferExample />
          <ContractInteractionExample />
          <MultiChainTransactionExample />
          <TransactionHistoryExample />
          <SolanaTransactionExample />
        </div>
      </div>
    </WalletMeshProvider>
  );
}
