/**
 * Example: Basic Account Information Display
 *
 * This example demonstrates how to access comprehensive account information
 * from the connected wallet using the latest modal-react hooks.
 *
 * Features:
 * - Connection status and progress
 * - Account address and chain information
 * - Wallet details and provider info
 * - Balance checking
 * - Proper error handling
 * - Chain information display
 */

import {
  ConnectButton,
  type WalletMeshReactConfig,
  WalletmeshProvider,
  getChainById,
  useAccount,
  useBalance,
  useConfig,
  useConnect,
  useWalletProvider,
} from '@walletmesh/modal-react';
import React from 'react';

function BasicAccountInfo() {
  const { isConnected, address, chainId, chainType, isConnecting, isReconnecting, selectedWallet } =
    useAccount();

  const { connect, disconnect, error: connectError } = useConnect();
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch: refetchBalance,
  } = useBalance();
  const { provider } = useWalletProvider();
  const { open } = useConfig();

  // Get chain information
  const chainInfo = chainId ? getChainById(chainId.toString()) : null;

  // Derive connection status
  const connectionStatus = isConnected
    ? 'connected'
    : isConnecting
      ? 'connecting'
      : isReconnecting
        ? 'reconnecting'
        : 'disconnected';

  if (!isConnected) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2>Account Information</h2>
        <div
          style={{
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: isConnecting ? '#f59e0b' : '#6b7280',
              }}
            />
            <span style={{ fontWeight: 'bold' }}>
              Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </span>
          </div>

          {isConnecting && <p style={{ color: '#f59e0b', marginBottom: '12px' }}>Connecting to wallet...</p>}

          {connectError && (
            <div style={{ color: '#ef4444', marginBottom: '12px' }}>Error: {connectError.message}</div>
          )}

          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Connect your wallet to view account information
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => open()}
              disabled={isConnecting}
              style={{
                padding: '10px 16px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isConnecting ? 'not-allowed' : 'pointer',
                opacity: isConnecting ? 0.6 : 1,
              }}
            >
              {isConnecting ? 'Connecting...' : 'Open Wallet Modal'}
            </button>

            <ConnectButton variant="outline" size="md" showAddress={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Account Information</h2>

      {/* Connection Status */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
            }}
          />
          <span style={{ fontWeight: 'bold', color: '#065f46' }}>Connected</span>
        </div>
      </div>

      {/* Account Details */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Account Details</h3>

        <div style={{ display: 'grid', gap: '8px' }}>
          <div>
            <strong>Address:</strong>
            <code
              style={{
                backgroundColor: '#f3f4f6',
                padding: '2px 4px',
                borderRadius: '4px',
                marginLeft: '8px',
                fontSize: '14px',
              }}
            >
              {address}
            </code>
          </div>

          <div>
            <strong>Chain Type:</strong>
            <span style={{ marginLeft: '8px', textTransform: 'uppercase' }}>{chainType || 'Unknown'}</span>
          </div>

          <div>
            <strong>Chain ID:</strong>
            <span style={{ marginLeft: '8px' }}>{chainId?.toString() || 'Unknown'}</span>
          </div>

          {chainInfo && (
            <div>
              <strong>Chain Name:</strong>
              <span style={{ marginLeft: '8px' }}>{chainInfo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Details */}
      {selectedWallet && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Wallet Details</h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {selectedWallet.icon && (
              <img
                src={selectedWallet.icon}
                alt={selectedWallet.name}
                style={{ width: '32px', height: '32px' }}
              />
            )}
            <div>
              <div style={{ fontWeight: 'bold' }}>{selectedWallet.name}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{selectedWallet.rdns || 'No RDNS'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <div>
              <strong>Wallet ID:</strong>
              <span style={{ marginLeft: '8px' }}>{selectedWallet.id}</span>
            </div>

            <div>
              <strong>Provider Ready:</strong>
              <span style={{ marginLeft: '8px', color: provider ? '#10b981' : '#ef4444' }}>
                {provider ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Balance Information */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Balance Information</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <button
            type="button"
            onClick={() => refetchBalance()}
            disabled={balanceLoading}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: balanceLoading ? 'not-allowed' : 'pointer',
              opacity: balanceLoading ? 0.6 : 1,
              fontSize: '14px',
            }}
          >
            {balanceLoading ? 'Checking...' : 'Check Balance'}
          </button>
        </div>

        {balance && (
          <div>
            <strong>Balance:</strong>
            <span style={{ marginLeft: '8px' }}>
              {balance.formatted} {balance.symbol}
            </span>
          </div>
        )}

        {balanceError && (
          <div style={{ color: '#ef4444' }}>Error loading balance: {balanceError.message}</div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => open()}
          style={{
            padding: '10px 16px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Open Modal
        </button>

        <button
          type="button"
          onClick={() => disconnect()}
          style={{
            padding: '10px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export function App() {
  const config: WalletMeshReactConfig = {
    appName: 'Basic Account Info Example',
    chains: ['evm', 'solana'],
    // Add some additional configuration for better demo
    theme: {
      mode: 'light',
    },
  };

  return (
    <WalletmeshProvider config={config}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <BasicAccountInfo />
      </div>
    </WalletmeshProvider>
  );
}
