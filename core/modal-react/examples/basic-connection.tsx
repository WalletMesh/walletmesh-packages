/**
 * Example: Basic Wallet Connection
 *
 * This example demonstrates the fundamental wallet connection flow using
 * @walletmesh/modal-react. It shows the essential pattern that most dApps
 * will need: connecting to a wallet and displaying connection status.
 *
 * Features:
 * - Simple connect/disconnect flow
 * - Connection status indicators
 * - Error handling
 * - Using both useConnect/useDisconnect hooks and ConnectButton component
 * - Basic account information display
 */

import {
  ConnectButton,
  type WalletMeshReactConfig,
  WalletmeshProvider,
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
} from '@walletmesh/modal-react';
import React from 'react';

function BasicConnection() {
  const { isConnected, address, chainType, isConnecting, isReconnecting } = useAccount();
  const { connect, error: connectError } = useConnect();
  const { disconnect, error: disconnectError } = useDisconnect();
  const { open } = useConfig();

  // Derive display status
  const status = isConnected
    ? 'connected'
    : isConnecting
      ? 'connecting'
      : isReconnecting
        ? 'reconnecting'
        : 'disconnected';

  const statusColor = isConnected
    ? '#10b981'
    : isConnecting
      ? '#f59e0b'
      : isReconnecting
        ? '#f59e0b'
        : '#6b7280';

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '500px',
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Basic Wallet Connection</h1>

      {/* Status Indicator */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: statusColor,
              boxShadow: `0 0 0 4px ${statusColor}20`,
            }}
          />
          <span
            style={{
              fontSize: '18px',
              fontWeight: '600',
              textTransform: 'capitalize',
            }}
          >
            {status}
          </span>
        </div>

        {isConnected && address && (
          <div
            style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '8px',
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              <strong>Address:</strong> {address.slice(0, 6)}...{address.slice(-4)}
            </div>
            <div>
              <strong>Network:</strong> {chainType?.toUpperCase() || 'Unknown'}
            </div>
          </div>
        )}

        {(isConnecting || isReconnecting) && (
          <div
            style={{
              fontSize: '14px',
              color: '#f59e0b',
              fontStyle: 'italic',
            }}
          >
            Establishing connection...
          </div>
        )}
      </div>

      {/* Error Display */}
      {(connectError || disconnectError) && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              color: '#dc2626',
              fontWeight: '600',
              marginBottom: '4px',
            }}
          >
            Connection Error
          </div>
          <div
            style={{
              color: '#7f1d1d',
              fontSize: '14px',
            }}
          >
            {(connectError || disconnectError)?.message}
          </div>
        </div>
      )}

      {/* Connection Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!isConnected ? (
          <>
            {/* Method 1: Using ConnectButton component (recommended) */}
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  marginBottom: '8px',
                  color: '#374151',
                }}
              >
                Method 1: ConnectButton Component
              </h3>
              <ConnectButton size="lg" showAddress={true} showChain={true} style={{ width: '100%' }} />
            </div>

            {/* Method 2: Using hooks directly */}
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  marginBottom: '8px',
                  color: '#374151',
                }}
              >
                Method 2: Custom Connection Button
              </h3>
              <button
                type="button"
                onClick={() => open()}
                disabled={isConnecting || isReconnecting}
                style={{
                  width: '100%',
                  padding: '12px 20px',
                  backgroundColor: isConnecting ? '#9ca3af' : '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isConnecting || isReconnecting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {isConnecting ? 'Connecting...' : isReconnecting ? 'Reconnecting...' : 'Open Wallet Modal'}
              </button>
            </div>
          </>
        ) : (
          /* Disconnect Actions */
          <div>
            <h3
              style={{
                fontSize: '16px',
                marginBottom: '8px',
                color: '#374151',
              }}
            >
              Connected Actions
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => open()}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Open Modal
              </button>

              <button
                type="button"
                onClick={() => disconnect()}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Usage Notes */}
      <div
        style={{
          marginTop: '32px',
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
          Usage Notes:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>ConnectButton provides a complete, styled solution</li>
          <li>Custom buttons give you full control over styling</li>
          <li>Always handle loading and error states</li>
          <li>Connection state is automatically managed across components</li>
        </ul>
      </div>
    </div>
  );
}

export function App() {
  const config: WalletMeshReactConfig = {
    appName: 'Basic Connection Example',
    appDescription: 'Learn the fundamentals of wallet connection',
    chains: ['evm', 'solana'],
    // Auto-inject modal for seamless user experience
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
        <BasicConnection />
      </div>
    </WalletmeshProvider>
  );
}

export default App;
