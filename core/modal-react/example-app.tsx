import ReactDOM from 'react-dom/client';
import { WalletMeshProvider } from './src/WalletmeshProvider.js';
import { ConnectButton } from './src/components/ConnectButton.js';
import { useAccount } from './src/hooks/useAccount.js';
import { useConfig } from './src/hooks/useConfig.js';
import { useConnect } from './src/hooks/useConnect.js';

// Account information component
function AccountInfo() {
  const { address, isConnected, chainId, wallet } = useAccount();

  if (!isConnected) {
    return <div style={{ marginTop: '20px' }}>Not connected</div>;
  }

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>Connected Account</h3>
      <p>
        <strong>Wallet:</strong> {wallet?.name || 'Unknown'}
      </p>
      <p>
        <strong>Address:</strong> {address}
      </p>
      <p>
        <strong>Chain ID:</strong> {chainId || 'Unknown'}
      </p>
    </div>
  );
}

// Wallet list component
function WalletList() {
  const { wallets } = useConnect();

  if (wallets.length === 0) {
    return <div style={{ marginTop: '20px' }}>No wallets discovered yet...</div>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Available Wallets ({wallets.length})</h3>
      <ul>
        {wallets.map((wallet) => (
          <li key={wallet.id}>
            {wallet.icon && (
              <img src={wallet.icon} alt="" width="16" height="16" style={{ marginRight: '8px' }} />
            )}
            {wallet.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Modal controls component
function ModalControls() {
  const { isOpen, open, close } = useConfig();
  const { isConnecting } = useConnect();

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Modal Controls</h3>
      <p>
        Modal is: <strong>{isOpen ? 'Open' : 'Closed'}</strong>
      </p>
      <p>
        Connection state: <strong>{isConnecting ? 'Connecting...' : 'Idle'}</strong>
      </p>
      <button type="button" onClick={open} disabled={isOpen}>
        Open Modal
      </button>{' '}
      <button type="button" onClick={close} disabled={!isOpen}>
        Close Modal
      </button>
    </div>
  );
}

// Main app component
function App() {
  return (
    <WalletMeshProvider
      config={{
        appName: 'WalletMesh Example',
        appDescription: 'Demo of WalletMesh React Integration',
        appUrl: 'https://example.com',
        appIcon:
          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNCAxNkM0IDkuMzczIDkuMzczIDQgMTYgNEMyMi42MjcgNCAyOCA5LjM3MyAyOCAxNkMyOCAyMi42MjcgMjIuNjI3IDI4IDE2IDI4QzkuMzczIDI4IDQgMjIuNjI3IDQgMTZaIiBmaWxsPSIjNUI0MkY0Ii8+CiAgPHBhdGggZD0iTTE2IDdDMTQuODk1NCA3IDE0IDcuODk1NDMgMTQgOVYxNkMxNCAxNy4xMDQ2IDE0Ljg5NTQgMTggMTYgMThIMjNDMjQuMTA0NiAxOCAyNSAxNy4xMDQ2IDI1IDE2QzI1IDExLjAyOTQgMjAuOTcwNiA3IDE2IDdaIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+CiAgPHBhdGggZD0iTTkgMTZDOSAxMi4xMzQgMTIuMTM0IDkgMTYgOUMxOS44NjYgOSAyMyAxMi4xMzQgMjMgMTZDMjMgMTkuODY2IDE5Ljg2NiAyMyAxNiAyM0MxMi4xMzQgMjMgOSAxOS44NjYgOSAxNloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPgogIDxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjMiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
        chains: ['evm', 'solana', 'aztec'],
        wallets: {
          order: ['evm-wallet', 'solana-wallet', 'walletconnect'],
        },
        debug: true,
      }}
    >
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>WalletMesh React Example</h1>
        <p>This example demonstrates the WalletMesh React integration with the new hooks.</p>

        <h2>Connection</h2>
        <ConnectButton />
        <ConnectButton
          label="Custom Connect"
          size="lg"
          variant="outline"
          showAddress={true}
          showChain={true}
        />

        <AccountInfo />
        <WalletList />
        <ModalControls />
      </div>
    </WalletMeshProvider>
  );
}

// Mount the app
if (typeof window !== 'undefined') {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}

export default App;
