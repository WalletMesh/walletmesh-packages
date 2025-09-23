/**
 * Using Hooks Example for WalletMesh React
 *
 * This example demonstrates how to use the various hooks provided by
 * WalletMesh to build custom wallet connection experiences.
 */

import {
  WalletMeshProvider,
  useAccount,
  useBalance,
  useConfig,
  useConnect,
  useSwitchChain,
  useWalletEvents,
  useWalletProvider,
} from '@walletmesh/modal-react';
import React, { useEffect, useState } from 'react';

/**
 * Example 1: Basic Account Information
 * Display account status and address
 */
function AccountInfo() {
  const { isConnected, address, chainId, chainType, wallet } = useAccount();

  if (!isConnected) {
    return <div>Not connected</div>;
  }

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Account Information</h3>
      <p>Wallet: {wallet?.name}</p>
      <p>Address: {address}</p>
      <p>
        Chain: {chainId} ({chainType})
      </p>
    </div>
  );
}

/**
 * Example 2: Custom Connect Flow
 * Build your own connection UI
 */
function CustomConnectFlow() {
  const { connect, disconnect, wallets, isConnecting, error, progress } = useConnect();
  const { isConnected } = useAccount();

  if (isConnected) {
    return (
      <button type="button" onClick={() => disconnect()}>
        Disconnect
      </button>
    );
  }

  return (
    <div>
      <h3>Select a Wallet</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error.message}</div>}

      {isConnecting && <div style={{ marginBottom: '10px' }}>Connecting... {progress}%</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {wallets.map((wallet) => (
          <button
            type="button"
            key={wallet.id}
            onClick={() => connect(wallet.id)}
            disabled={isConnecting}
            style={{
              padding: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <img src={wallet.icon} alt="" width="24" height="24" />
            {wallet.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 3: Balance Display
 * Show account balance with refresh capability
 */
function BalanceDisplay() {
  const { isConnected } = useAccount();
  const { data: balance, isLoading, error, refetch } = useBalance();

  if (!isConnected) return null;

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Balance</h3>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error loading balance</p>}
      {balance && (
        <p>
          {balance.formatted} {balance.symbol}
        </p>
      )}
      <button type="button" onClick={() => refetch()} disabled={isLoading}>
        Refresh Balance
      </button>
    </div>
  );
}

/**
 * Example 4: Chain Switching
 * Allow users to switch between different chains
 */
function ChainSwitcher() {
  const { isConnected, chainId } = useAccount();
  const { chains, switchChain, isLoading, error } = useSwitchChain();

  if (!isConnected) return null;

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Switch Chain</h3>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      <select
        value={chainId || ''}
        onChange={(e) => switchChain({ chainId: e.target.value })}
        disabled={isLoading}
      >
        {chains.map((chain) => (
          <option key={chain.chainId} value={chain.chainId}>
            {chain.name}
          </option>
        ))}
      </select>
      {isLoading && <span> Switching...</span>}
    </div>
  );
}

/**
 * Example 5: Event Listener
 * Listen to wallet events
 */
function EventListener() {
  const { subscribe } = useWalletEvents();
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribe('connection:established', (data) => {
      setEvents((prev) => [...prev, `Connected to ${data.address}`]);
    });

    const unsubscribe2 = subscribe('chain:switched', (data) => {
      setEvents((prev) => [...prev, `Switched to chain ${data.chainId}`]);
    });

    return () => {
      unsubscribe.unsubscribe();
      unsubscribe2.unsubscribe();
    };
  }, [subscribe]);

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Events</h3>
      {events.length === 0 ? (
        <p>No events yet</p>
      ) : (
        <ul>
          {events.map((event) => (
            <li key={event}>{event}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 6: Direct Provider Access
 * Access the underlying provider for advanced operations
 */
function ProviderAccess() {
  const { provider, isAvailable } = useWalletProvider();
  const { isConnected, chainType } = useAccount();

  const handleSignMessage = async () => {
    if (!provider || chainType !== 'evm') return;

    try {
      const message = 'Hello from WalletMesh!';
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, await provider.request({ method: 'eth_accounts' })],
      });
      alert(`Signature: ${signature}`);
    } catch (error) {
      console.error('Failed to sign message:', error);
    }
  };

  if (!isConnected) return null;

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Provider Access</h3>
      <p>Provider Ready: {isAvailable ? 'Yes' : 'No'}</p>
      <p>Chain Type: {chainType}</p>
      {chainType === 'evm' && (
        <button type="button" onClick={handleSignMessage} disabled={!isAvailable}>
          Sign Message
        </button>
      )}
    </div>
  );
}

/**
 * Example 7: Modal Control
 * Programmatically control the modal
 */
function ModalControl() {
  const { isOpen, open, close } = useConfig();

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
      <h3>Modal Control</h3>
      <p>Modal is {isOpen ? 'open' : 'closed'}</p>
      <button type="button" onClick={open} disabled={isOpen}>
        Open Modal
      </button>
      <button type="button" onClick={close} disabled={!isOpen}>
        Close Modal
      </button>
    </div>
  );
}

/**
 * Main App Component
 * Combines all examples
 */
export function HooksExampleApp() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'WalletMesh Hooks Example',
        chains: ['evm', 'solana'],
        debug: true,
      }}
    >
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>WalletMesh React Hooks Examples</h1>

        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          <AccountInfo />
          <CustomConnectFlow />
          <BalanceDisplay />
          <ChainSwitcher />
          <EventListener />
          <ProviderAccess />
          <ModalControl />
        </div>
      </div>
    </WalletMeshProvider>
  );
}
