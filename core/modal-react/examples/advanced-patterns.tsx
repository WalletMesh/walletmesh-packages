/**
 * Advanced Patterns Example for WalletMesh React
 *
 * This example demonstrates advanced usage patterns including SSR,
 * multi-wallet support, error handling, and custom UI integration.
 */

import {
  type WalletInfo,
  WalletMeshErrorBoundary,
  WalletMeshProvider,
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsureChain,
  useSSR,
  useSelectedWallet,
  useWalletEvents,
} from '@walletmesh/modal-react';
import type React from 'react';
import { useEffect, useState } from 'react';

/**
 * Example 1: SSR-Safe Components
 * Handle server-side rendering correctly
 */
function SSRSafeComponent() {
  const { isServer, isMounted, isHydrated, useClientValue } = useSSR();
  const windowWidth = useClientValue(() => window.innerWidth, 1024);

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>SSR Information</h3>
      <p>Is Server: {isServer ? 'Yes' : 'No'}</p>
      <p>Is Mounted: {isMounted ? 'Yes' : 'No'}</p>
      <p>Is Hydrated: {isHydrated ? 'Yes' : 'No'}</p>
      <p>Window Width: {windowWidth}px</p>
    </div>
  );
}

/**
 * Example 2: Chain Validation
 * Ensure users are on the correct chain
 */
function RequirePolygon({ children }: { children: React.ReactNode }) {
  const { isCorrectChain, switchToRequiredChain, isValidating, error } = useEnsureChain({
    chainId: '137', // Polygon
    autoSwitch: true,
    onSuccess: () => console.log('Switched to Polygon!'),
    onError: (err) => console.error('Failed to switch:', err),
  });

  if (isValidating) {
    return <div>Validating chain...</div>;
  }

  if (!isCorrectChain) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#fff3cd', borderRadius: '4px' }}>
        <h3>Wrong Network</h3>
        <p>This feature requires Polygon network.</p>
        <button type="button" onClick={switchToRequiredChain}>
          Switch to Polygon
        </button>
        {error && <p style={{ color: 'red' }}>{error.message}</p>}
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Example 3: Selected Wallet Management
 * Track and manage wallet selection state
 */
function WalletSelector() {
  const { connect, wallets } = useConnect();
  const { selectedWallet, selectWallet, clearSelection } = useSelectedWallet();
  const { isConnected } = useAccount();

  const handleWalletSelect = (wallet: WalletInfo) => {
    selectWallet(wallet);
    connect(wallet.id);
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Wallet Selection</h3>
      {selectedWallet && (
        <div style={{ marginBottom: '10px' }}>
          <p>Selected: {selectedWallet.name}</p>
          <button type="button" onClick={clearSelection}>
            Clear Selection
          </button>
        </div>
      )}

      {!isConnected && (
        <div style={{ display: 'grid', gap: '8px' }}>
          {wallets.map((wallet) => (
            <button
              type="button"
              key={wallet.id}
              onClick={() => handleWalletSelect(wallet)}
              style={{
                padding: '8px',
                background: selectedWallet?.id === wallet.id ? '#e0e0e0' : 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              {wallet.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Token Balance with Auto-Refresh
 * Show token balances with automatic updates
 */
function TokenBalances() {
  const { isConnected } = useAccount();
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  // Native balance
  const nativeBalance = useBalance();

  // Token balance (USDC example)
  const tokenBalance = useBalance(
    selectedToken
      ? {
          token: {
            address: selectedToken,
            decimals: 6,
            symbol: 'USDC',
          },
          watch: true, // Auto-refresh
          pollingInterval: 10000, // Every 10 seconds
        }
      : undefined,
  );

  if (!isConnected) return null;

  const tokens = [
    { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
    { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
  ];

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Balances</h3>

      <div style={{ marginBottom: '10px' }}>
        <strong>Native:</strong> {nativeBalance.data?.formatted} {nativeBalance.data?.symbol}
      </div>

      <div>
        <select value={selectedToken || ''} onChange={(e) => setSelectedToken(e.target.value || null)}>
          <option value="">Select a token</option>
          {tokens.map((token) => (
            <option key={token.address} value={token.address}>
              {token.symbol}
            </option>
          ))}
        </select>

        {selectedToken && (
          <div style={{ marginTop: '10px' }}>
            <strong>Token:</strong> {tokenBalance.data?.formatted} {tokenBalance.data?.symbol}
            {tokenBalance.isLoading && ' (Updating...)'}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example 5: Error Recovery
 * Handle and recover from errors gracefully
 */
function ErrorRecoveryExample() {
  const { connect, error: connectError, reset: resetConnect } = useConnect();
  const { disconnect, error: disconnectError, reset: resetDisconnect } = useDisconnect();
  const [lastError, setLastError] = useState<Error | null>(null);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      setLastError(err as Error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      setLastError(err as Error);
    }
  };

  const resetAll = () => {
    resetConnect();
    resetDisconnect();
    setLastError(null);
  };

  const error = connectError || disconnectError || lastError;

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Error Handling</h3>

      {error && (
        <div style={{ padding: '10px', background: '#fee', borderRadius: '4px', marginBottom: '10px' }}>
          <p style={{ color: 'red', margin: 0 }}>Error: {error.message}</p>
          <button type="button" onClick={resetAll} style={{ marginTop: '8px' }}>
            Clear Error
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={handleConnect}>
          Connect (May Error)
        </button>
        <button type="button" onClick={handleDisconnect}>
          Disconnect (May Error)
        </button>
      </div>
    </div>
  );
}

/**
 * Example 6: Connection Progress Tracking
 * Show detailed connection progress
 */
function ConnectionProgress() {
  const { connect, progress, isPending } = useConnect();
  const { subscribe } = useWalletEvents();
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribes = [
      subscribe('connection:initiated', () => {
        setSteps((prev) => [...prev, 'Connection initiated']);
      }),
      subscribe('provider:ready', () => {
        setSteps((prev) => [...prev, 'Provider ready']);
      }),
      subscribe('chain:switched', (data) => {
        setSteps((prev) => [...prev, `Switched to chain ${data.chainId}`]);
      }),
      subscribe('connection:established', () => {
        setSteps((prev) => [...prev, 'Connection established']);
      }),
    ];

    return () => {
      for (const u of unsubscribes) {
        u.unsubscribe();
      }
    };
  }, [subscribe]);

  const handleConnect = async () => {
    setSteps([]);
    await connect();
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Connection Progress</h3>

      <button type="button" onClick={handleConnect} disabled={isPending}>
        {isPending ? `Connecting... ${progress}%` : 'Connect with Progress'}
      </button>

      {steps.length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <strong>Steps:</strong>
          <ol>
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Multi-Account Display
 * Show all connected accounts (for wallets that support multiple)
 */
function MultiAccountDisplay() {
  const { addresses, address } = useAccount();

  if (!addresses || addresses.length === 0) {
    return null;
  }

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Connected Accounts</h3>
      {addresses.map((addr) => (
        <div
          key={addr}
          style={{
            padding: '4px',
            background: addr === address ? '#e0e0e0' : 'transparent',
          }}
        >
          {addr} {addr === address && '(Active)'}
        </div>
      ))}
    </div>
  );
}

/**
 * Main App with Error Boundary
 */
export function AdvancedPatternsApp() {
  return (
    <WalletMeshErrorBoundary
      fallback={(error, retry) => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button type="button" onClick={retry}>
            Try Again
          </button>
        </div>
      )}
    >
      <WalletMeshProvider
        config={{
          appName: 'Advanced Patterns Example',
          chains: ['evm'],
          debug: true,
        }}
      >
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <h1>WalletMesh Advanced Patterns</h1>

          <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
            <SSRSafeComponent />
            <RequirePolygon>
              <div style={{ padding: '10px', background: '#e8f5e9', borderRadius: '4px' }}>
                <p>✅ You are on Polygon!</p>
              </div>
            </RequirePolygon>
            <WalletSelector />
            <TokenBalances />
            <ErrorRecoveryExample />
            <ConnectionProgress />
            <MultiAccountDisplay />
          </div>
        </div>
      </WalletMeshProvider>
    </WalletMeshErrorBoundary>
  );
}
