/**
 * Example usage of the new WalletMesh React hooks
 *
 * This demonstrates how to use the new hooks following wagmi patterns
 * with the WalletMeshStore integration.
 */

import {
  WalletMeshProvider,
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
  useModal,
  useWallets,
} from '@walletmesh/modal-react';
import React from 'react';

/**
 * Main app component demonstrating the provider setup
 */
function App() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'My DApp',
        appDescription: 'A decentralized application',
        appUrl: 'https://mydapp.com',
        appIcon:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0IiBmaWxsPSIjMTA2NkY5Ii8+CiAgPHBhdGggZD0iTTE2IDhDMTEuNTggOCA4IDExLjU4IDggMTZDOCAyMC40MiAxMS41OCAyNCAxNiAyNEMyMC40MiAyNCAyNCAyMC40MiAyNCAxNkMyNCAxMS41OCAyMC40MiA4IDE2IDhaTTE0LjUgMTkuNUwxMSAxNkwxMi40MSAxNC41OUwxNC41IDE2LjY3TDE5LjU5IDExLjU4TDIxIDEzTDE0LjUgMTkuNVoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        chains: ['evm', 'solana'],
        debug: true,
      }}
    >
      <DemoApp />
    </WalletMeshProvider>
  );
}

/**
 * Demo component showing various hook usage patterns
 */
function DemoApp() {
  return (
    <div>
      <h1>WalletMesh React Hooks Demo</h1>

      <ConnectionStatus />
      <hr />

      <ConnectButton />
      <hr />

      <AccountInfo />
      <hr />

      <WalletList />
      <hr />

      <ConfigInfo />
    </div>
  );
}

/**
 * Display connection status using multiple hooks
 */
function ConnectionStatus() {
  const { isConnected, isConnecting } = useAccount();

  if (isConnecting) {
    return <div>Connecting...</div>;
  }

  return <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>;
}

/**
 * Connect/disconnect button with modal control
 */
function ConnectButton() {
  const { isConnected } = useAccount();
  const { open } = useModal();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <button type="button" onClick={() => disconnect()}>
        Disconnect
      </button>
    );
  }

  return (
    <button type="button" onClick={open}>
      Connect Wallet
    </button>
  );
}

/**
 * Display account information when connected
 */
function AccountInfo() {
  const { address, chainId, chainType, wallet, isConnected } = useAccount();

  if (!isConnected) {
    return <div>Not connected</div>;
  }

  return (
    <div>
      <h3>Account Info</h3>
      <p>Address: {address}</p>
      <p>Chain ID: {chainId}</p>
      <p>Chain Type: {chainType}</p>
      <p>Wallet: {wallet?.name}</p>
    </div>
  );
}

/**
 * List available wallets with direct connection
 */
function WalletList() {
  const { wallets, isDiscovering, refresh } = useWallets();
  const { connect, isConnecting, error } = useConnect();

  return (
    <div>
      <h3>Available Wallets</h3>

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {isDiscovering ? (
        <div>Discovering wallets...</div>
      ) : (
        <>
          {wallets.map((wallet) => (
            <button type="button" key={wallet.id} onClick={() => connect(wallet.id)} disabled={isConnecting}>
              Connect {wallet.name}
            </button>
          ))}
          <button type="button" onClick={refresh}>
            Refresh Wallets
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Display configuration information
 */
function ConfigInfo() {
  const { appName, appDescription, chains, debug } = useConfig();

  return (
    <div>
      <h3>Configuration</h3>
      <p>App Name: {appName}</p>
      <p>Description: {appDescription || 'None'}</p>
      <p>Chains: {chains.join(', ')}</p>
      <p>Debug: {debug ? 'Enabled' : 'Disabled'}</p>
    </div>
  );
}

/**
 * Advanced example: Manual wallet connection without modal
 */
function DirectConnect() {
  const { connect, progress, variables } = useConnect();

  const connectEvmWallet = async () => {
    await connect('evm-wallet', { showModal: false });
  };

  return (
    <div>
      <button type="button" onClick={connectEvmWallet}>
        Direct Connect EVM Wallet
      </button>

      {progress > 0 && (
        <progress value={progress} max={100}>
          {progress}%
        </progress>
      )}

      {variables && <div>Connecting to: {variables.walletId}</div>}
    </div>
  );
}

/**
 * Advanced example: Multi-wallet disconnection
 */
function DisconnectAll() {
  const { disconnectAll, isDisconnecting } = useDisconnect();

  return (
    <button type="button" onClick={disconnectAll} disabled={isDisconnecting}>
      {isDisconnecting ? 'Disconnecting...' : 'Disconnect All'}
    </button>
  );
}

export default App;
