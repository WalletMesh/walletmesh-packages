/**
 * Wallet Configuration Example
 *
 * This example demonstrates how to configure custom wallets with proper
 * SVG data URI icons as required by the WalletMesh validation system.
 *
 * Key Points:
 * - All wallet icons MUST be SVG data URIs
 * - URLs are not accepted for security and performance reasons
 * - Icons are embedded directly in the configuration
 */

import type { WalletInfo } from '@walletmesh/modal-core';
import {
  ConnectButton,
  type WalletMeshReactConfig,
  WalletmeshProvider,
  useAccount,
  useConnect,
} from '@walletmesh/modal-react';
import React from 'react';

/**
 * Example wallet configurations with proper SVG data URIs
 *
 * These configurations demonstrate how to properly define wallets
 * with embedded SVG icons. Never use HTTP URLs for icons.
 */
const customWallets: WalletInfo[] = [
  {
    id: 'evm-wallet',
    name: 'EVM Wallet',
    // Icon MUST be an SVG data URI - this is enforced by validation
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzYyN0VFQSIvPgogIDxwYXRoIGQ9Ik0xNiA2TDkgMTZMMTYgMjBWMjZMMjMgMTZMMTYgMTJWNloiIGZpbGw9IndoaXRlIi8+CiAgPHBhdGggZD0iTTE2IDEyTDEyIDE2TDE2IDE4VjEyWiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNiIvPgo8L3N2Zz4=',
    chains: ['evm'],
    description: 'Connect with EVM-compatible wallet',
  },
  {
    id: 'solana-wallet',
    name: 'Solana Wallet',
    // Another example of a properly formatted SVG data URI
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0ic29sYW5hR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMEZGQzM7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwRDg5NTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgcng9IjgiIGZpbGw9InVybCgjc29sYW5hR3JhZCkiLz4KICA8cGF0aCBkPSJNOCAxOUwyNCAxOUwyNCAxNEw4IDE0TDggMTlaIiBmaWxsPSJ3aGl0ZSIvPgogIDxwYXRoIGQ9Ik04IDI0TDI0IDI0TDI0IDE5TDggMTlMOCAyNFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciLz4KICA8cGF0aCBkPSJNOCAxNEwyNCAxNEwyNCA5TDggOUw4IDE0WiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuNyIvPgo8L3N2Zz4=',
    chains: ['solana', 'evm'], // Multi-chain support
    description: 'Connect with Solana-compatible wallet',
  },
  {
    id: 'custom-wallet',
    name: 'Custom Wallet',
    // Custom wallet with a unique icon
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iY3VzdG9tR3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MkE1RjU7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzFGNzREMTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgcng9IjgiIGZpbGw9InVybCgjY3VzdG9tR3JhZCkiLz4KICA8cGF0aCBkPSJNMTYgOEwxMiAxMkg4TDE2IDIwTDI0IDEySDIwTDE2IDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
    chains: ['evm'],
    description: 'A custom wallet implementation',
  },
];

/**
 * Component that displays wallet information including icons
 */
function WalletDisplay() {
  const { wallets } = useConnect();
  const { wallet, isConnected } = useAccount();

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ marginBottom: '16px' }}>Configured Wallets</h3>

      <div style={{ display: 'grid', gap: '12px' }}>
        {wallets.map((w) => (
          <div
            key={w.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: wallet?.id === w.id ? '#f3f4f6' : 'white',
            }}
          >
            {/* Wallet icon - rendered as an image */}
            <img src={w.icon} alt={`${w.name} icon`} width={32} height={32} style={{ marginRight: '12px' }} />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600' }}>{w.name}</div>
              {w.description && <div style={{ fontSize: '14px', color: '#6b7280' }}>{w.description}</div>}
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                Chains: {w.chains.join(', ')}
              </div>
            </div>

            {wallet?.id === w.id && isConnected && (
              <div
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                Connected
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper function to convert SVG files to data URIs
 * This would typically run during your build process
 */
function convertSvgToDataUri(svgContent: string): string {
  // Remove any whitespace and newlines for smaller size
  const minified = svgContent.replace(/\s+/g, ' ').replace(/> </g, '><').trim();

  // Convert to base64
  const base64 = btoa(minified);

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Main app demonstrating wallet configuration
 */
function WalletConfigExample() {
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Wallet Configuration Example</h1>

      <div
        style={{
          padding: '20px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          marginBottom: '32px',
        }}
      >
        <h3 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Important: Icon Validation</h3>
        <p style={{ margin: 0, color: '#78350f' }}>
          All wallet icons MUST be SVG data URIs. HTTP/HTTPS URLs and file paths are not accepted for security
          and performance reasons. Icons are validated when the configuration is loaded.
        </p>
      </div>

      <ConnectButton size="lg" showAddress />

      <WalletDisplay />

      <div style={{ marginTop: '40px' }}>
        <h3>Icon Format Examples</h3>

        <pre
          style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px',
          }}
        >
          {`// ✅ Valid - SVG data URI
icon: 'data:image/svg+xml;base64,PHN2Zy...'

// ✅ Valid - URL encoded SVG
icon: 'data:image/svg+xml,<svg>...</svg>'

// ❌ Invalid - HTTP URL
icon: 'https://example.com/icon.svg'

// ❌ Invalid - File path
icon: './assets/wallet-icon.svg'

// ❌ Invalid - PNG data URI
icon: 'data:image/png;base64,iVBORw0...'`}
        </pre>
      </div>
    </div>
  );
}

/**
 * App with provider configuration
 */
export function App() {
  const config: WalletMeshReactConfig = {
    appName: 'Wallet Config Demo',
    appDescription: 'Demonstrating proper wallet configuration',
    // App icon also uses SVG data URI
    appIcon:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI4IiBmaWxsPSIjODE4Q0Y4Ii8+CiAgPHBhdGggZD0iTTE2IDZDMTYgNiAxMCAxMCAxMCAxNkMxMCAyMiAxNiAyNiAxNiAyNkMxNiAyNiAyMiAyMiAyMiAxNkMyMiAxMCAxNiA2IDE2IDZaIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC45Ii8+CiAgPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNCIgZmlsbD0iIzgxOENGOCIvPgo8L3N2Zz4=',
    wallets: customWallets,
    chains: ['evm', 'solana'],
  };

  return (
    <WalletmeshProvider config={config}>
      <WalletConfigExample />
    </WalletmeshProvider>
  );
}

export default App;
