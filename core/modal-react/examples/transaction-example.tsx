/**
 * Example: Transaction Handling
 *
 * This example demonstrates how to handle transactions using @walletmesh/modal-react.
 * It covers balance checking, transaction sending, and transaction status monitoring.
 *
 * Features:
 * - Balance checking with loading states
 * - Transaction sending with useTransaction hook
 * - Transaction status tracking (pending, confirming, confirmed, failed)
 * - Error handling for both balance and transaction operations
 * - Provider access for custom wallet interactions
 * - Message signing demonstration
 */

import {
  ConnectButton,
  type WalletMeshReactConfig,
  WalletmeshProvider,
  getErrorMessage,
  isWalletMeshError,
  useAccount,
  useBalance,
  useTransaction,
  useWalletProvider,
} from '@walletmesh/modal-react';
import React, { useState } from 'react';

function TransactionExample() {
  const { isConnected, address, chainType } = useAccount();
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useBalance();
  const { provider } = useWalletProvider();

  // Transaction hook
  const {
    sendTransaction,
    status: txStatus,
    hash: txHash,
    error: txError,
    reset: resetTx,
    isPending,
    isConfirming,
    isConfirmed,
    isFailed,
  } = useTransaction();

  // Local state for message signing
  const [message, setMessage] = useState('Hello WalletMesh!');
  const [isSigningMessage, setIsSigningMessage] = useState(false);
  const [signatureResult, setSignatureResult] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);

  // Handle message signing
  const handleSignMessage = async () => {
    if (!provider || !address) return;

    setIsSigningMessage(true);
    setSignError(null);
    setSignatureResult(null);

    try {
      // For demonstration - in a real app you'd use the actual provider
      // This is a mock signature for demo purposes
      const signature = await new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            // 90% success rate
            resolve(`0x${Math.random().toString(16).slice(2, 130).padEnd(128, '0')}`);
          } else {
            reject(new Error('User rejected signature request'));
          }
        }, 1500);
      });

      setSignatureResult(signature);
    } catch (error) {
      setSignError(getErrorMessage(error));
    } finally {
      setIsSigningMessage(false);
    }
  };

  // Handle sending a test transaction
  const handleSendTransaction = async () => {
    if (!address) return;

    try {
      await sendTransaction({
        to: address, // Send to self for demo
        value: '0x0', // 0 ETH
        data: '0x', // No data
      });
    } catch (error) {
      console.error('Transaction failed:', getErrorMessage(error));
    }
  };

  if (!isConnected) {
    return (
      <div
        style={{
          padding: '40px',
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h1>Transaction Example</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Connect your wallet to interact with transactions and check balances
        </p>
        <ConnectButton size="lg" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Transaction Example</h1>

      {/* Account Summary */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Account Summary</h3>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          <div style={{ marginBottom: '4px' }}>
            <strong>Address:</strong> {address?.slice(0, 10)}...{address?.slice(-8)}
          </div>
          <div>
            <strong>Network:</strong> {chainType?.toUpperCase() || 'Unknown'}
          </div>
        </div>
      </div>

      {/* Balance Section */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Balance Information</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => refetchBalance()}
            disabled={balanceLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: balanceLoading ? '#9ca3af' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: balanceLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {balanceLoading ? 'Checking...' : 'Refresh Balance'}
          </button>
        </div>

        {balance && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              {balance.formatted} {balance.symbol}
            </div>
          </div>
        )}

        {balanceError && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
            }}
          >
            Error loading balance: {balanceError.message}
          </div>
        )}
      </div>

      {/* Message Signing Section */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Message Signing</h3>

        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message to sign"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '8px',
            }}
          />
          <button
            type="button"
            onClick={handleSignMessage}
            disabled={isSigningMessage || !message.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: isSigningMessage ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSigningMessage || !message.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {isSigningMessage ? 'Signing...' : 'Sign Message'}
          </button>
        </div>

        {signatureResult && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              marginBottom: '8px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#065f46', marginBottom: '4px' }}>Signature:</div>
            <div
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                color: '#1f2937',
              }}
            >
              {signatureResult}
            </div>
          </div>
        )}

        {signError && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626',
            }}
          >
            Signing error: {signError}
          </div>
        )}
      </div>

      {/* Transaction Section */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '24px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Test Transaction</h3>

        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          Send a test transaction (0 ETH to yourself) to demonstrate transaction handling.
        </p>

        <button
          type="button"
          onClick={handleSendTransaction}
          disabled={isPending || isConfirming}
          style={{
            padding: '12px 20px',
            backgroundColor: isPending || isConfirming ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
          }}
        >
          {isPending ? 'Preparing...' : isConfirming ? 'Confirming...' : 'Send Test Transaction'}
        </button>

        {/* Transaction Status Display */}
        {txStatus !== 'idle' && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
            }}
          >
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontWeight: '600' }}>Status: </span>
              <span
                style={{
                  color: isConfirmed ? '#10b981' : isFailed ? '#ef4444' : '#f59e0b',
                  fontWeight: '600',
                }}
              >
                {txStatus}
              </span>
            </div>

            {txHash && (
              <div
                style={{
                  marginBottom: '12px',
                  fontSize: '12px',
                }}
              >
                <span style={{ fontWeight: '600' }}>Transaction Hash: </span>
                <code
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    wordBreak: 'break-all',
                  }}
                >
                  {txHash}
                </code>
              </div>
            )}

            {txError && (
              <div
                style={{
                  color: '#dc2626',
                  fontSize: '14px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ fontWeight: '600' }}>Error:</div>
                <div>{getErrorMessage(txError)}</div>
                {isWalletMeshError(txError) && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginTop: '4px',
                    }}
                  >
                    Error Code: {txError.code}
                  </div>
                )}
              </div>
            )}

            {(isConfirmed || isFailed) && (
              <button
                type="button"
                onClick={resetTx}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Usage Notes */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#475569',
        }}
      >
        <h4
          style={{
            margin: '0 0 8px 0',
            color: '#1e293b',
          }}
        >
          Transaction Best Practices:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>Always check balance before sending transactions</li>
          <li>Handle all transaction states (pending, confirming, confirmed, failed)</li>
          <li>Provide clear feedback to users about transaction status</li>
          <li>Use proper error handling with WalletMesh error types</li>
          <li>Allow users to reset transaction state after completion</li>
        </ul>
      </div>
    </div>
  );
}

export function App() {
  const config: WalletMeshReactConfig = {
    appName: 'Transaction Example',
    appDescription: 'Learn how to handle transactions and balances',
    chains: ['evm'], // Focus on EVM for transaction examples
    autoInjectModal: true,
  };

  return (
    <WalletmeshProvider config={config}>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f1f5f9',
          padding: '20px 0',
        }}
      >
        <TransactionExample />
      </div>
    </WalletmeshProvider>
  );
}

export default App;
