# @walletmesh/modal-react

React adapter for WalletMesh modal system. Provides React-specific hooks and components for wallet connection with automatic state synchronization and React 18+ features.

## 📚 Documentation

- [TypeScript Examples](./TYPESCRIPT_EXAMPLES.md) - Comprehensive TypeScript usage examples
- [Error Recovery Patterns](./ERROR_RECOVERY_PATTERNS.md) - Production-ready error handling patterns
- [Provider Pattern Guide](./PROVIDER_PATTERN_GUIDE.md) - Public/private provider pattern documentation
- [Aztec Developer Guide](./AZTEC_DEVELOPER_GUIDE.md) - Complete guide for Aztec dApp development
- [Migration Guide](./MIGRATION_GUIDE.md) - Migrate from direct Aztec SDK to WalletMesh

## Installation

```bash
npm install @walletmesh/modal-react @walletmesh/modal-core
# or
pnpm add @walletmesh/modal-react @walletmesh/modal-core
# or
yarn add @walletmesh/modal-react @walletmesh/modal-core
```

## Quick Start

```tsx
import { WalletmeshProvider, useWalletMesh } from '@walletmesh/modal-react';

function ConnectButton() {
  const { isConnected, isOpen, open, disconnect } = useWalletMesh();

  if (isConnected) {
    return <button onClick={disconnect}>Disconnect</button>;
  }

  return <button onClick={open}>Connect Wallet</button>;
}

function App() {
  return (
    <WalletmeshProvider config={{ appName: 'My DApp' }}>
      <ConnectButton />
    </WalletmeshProvider>
  );
}
```

## Core Features

- **React 18+ Integration**: Built with `useSyncExternalStore` for optimal state sync
- **Auto-Injected Modal**: Modal UI automatically renders via React Portal (opt-out available)
- **Auto-Injected Transaction Overlays**: Transaction status UI automatically renders for all dApps (configurable)
- **Six Convenient Hooks**: Purpose-built hooks for different use cases
- **Full State Synchronization**: Complete state sync from modal-core
- **SSR Support**: Safe server-side rendering with proper hydration
- **TypeScript**: Fully typed with comprehensive intellisense

## API Reference

### Provider

#### WalletmeshProvider

Main provider component that creates the wallet client and provides context.

```tsx
interface WalletMeshReactConfig {
  appName: string;
  appDescription?: string;
  appUrl?: string;
  appIcon?: string;
  projectId?: string;
  theme?: 'light' | 'dark';
  themeColors?: Record<string, string>;
  fontFamily?: string;
  borderRadius?: string;
  autoInjectModal?: boolean; // Default: true
  autoInjectTransactionOverlays?: boolean; // Default: true
  transactionOverlay?: {
    enabled?: boolean;
    disableNavigationGuard?: boolean;
    headline?: string;
    description?: string;
    showBackgroundTransactions?: boolean;
  };
  backgroundTransactionIndicator?: {
    enabled?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    showCompleted?: boolean;
    completedDuration?: number;
  };
  debug?: boolean;
}

function WalletmeshProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode; 
  config: WalletMeshReactConfig; 
}) {}
```

**Props:**
- `config.appName` - **Required** - Your application name
- `config.autoInjectModal` - Auto-inject modal into DOM (default: `true`)
- `config.autoInjectTransactionOverlays` - Auto-inject transaction status overlays (default: `true`)
- `config.transactionOverlay` - Configure full-screen transaction status overlay
- `config.backgroundTransactionIndicator` - Configure floating transaction badge
- All other modal-core configuration options supported

### Hooks

#### useWalletMesh

Primary hook providing complete access to wallet functionality.

```tsx
function useWalletMesh(): {
  // State
  state: ModalState;
  isConnected: boolean;
  isOpen: boolean;
  
  // Client
  client: WalletMeshClient;
  
  // Actions  
  connect: (walletId?: string, options?: ConnectOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  open: () => void;
  close: () => void;
}
```

**Usage:**
```tsx
function WalletInfo() {
  const { state, isConnected, connect, disconnect } = useWalletMesh();
  
  if (isConnected) {
    return (
      <div>
        <p>Connected: {state.connection.address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }
  
  return <button onClick={() => connect()}>Connect</button>;
}
```

#### useConnection

Hook specifically for connection state and actions.

```tsx
function useConnection(): {
  status: 'disconnected' | 'connecting' | 'connected';
  address: string | null;
  chainId: string | null;
  accounts: string[];
  connect: (walletId?: string, options?: ConnectOptions) => Promise<void>;
  disconnect: () => Promise<void>;
}
```

**Usage:**
```tsx
function ConnectionStatus() {
  const { status, address, connect } = useConnection();
  
  return (
    <div>
      <p>Status: {status}</p>
      {address && <p>Address: {address}</p>}
      {status === 'disconnected' && (
        <button onClick={() => connect()}>Connect</button>
      )}
    </div>
  );
}
```

#### useModal

Hook for modal UI control.

```tsx
function useModal(): {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}
```

**Usage:**
```tsx
function ModalControls() {
  const { isOpen, open, close, toggle } = useModal();
  
  return (
    <div>
      <p>Modal is {isOpen ? 'open' : 'closed'}</p>
      <button onClick={toggle}>Toggle Modal</button>
      <button onClick={open}>Open Modal</button>
      <button onClick={close}>Close Modal</button>
    </div>
  );
}
```

#### useAccount

Hook for account information.

```tsx
function useAccount(): {
  address: string | null;
  chainId: string | null;
  accounts: string[];
  isConnected: boolean;
}
```

**Usage:**
```tsx
function AccountInfo() {
  const { address, chainId, isConnected, accounts } = useAccount();
  
  if (!isConnected) {
    return <p>No wallet connected</p>;
  }
  
  return (
    <div>
      <p>Primary Address: {address}</p>
      <p>Chain ID: {chainId}</p>
      <p>Total Accounts: {accounts.length}</p>
    </div>
  );
}
```

#### useWalletEvent

Hook for subscribing to wallet events.

```tsx
function useWalletEvent<T extends keyof ModalEventMap>(
  event: T,
  handler: (payload: ModalEventMap[T]) => void
): void
```

**Available Events:**
- `'connection:established'` - When wallet connects
- `'connection:failed'` - When connection fails  
- `'connection:lost'` - When connection is lost
- `'view:changed'` - When modal view changes
- `'state:updated'` - When any state changes

**Usage:**
```tsx
function EventLogger() {
  const [events, setEvents] = useState<string[]>([]);
  
  useWalletEvent('connection:established', (payload) => {
    setEvents(prev => [...prev, `Connected: ${payload.address}`]);
  });
  
  useWalletEvent('connection:failed', (payload) => {
    setEvents(prev => [...prev, `Failed: ${payload.error}`]);
  });
  
  return (
    <div>
      <h3>Event Log:</h3>
      {events.map((event, i) => <p key={i}>{event}</p>)}
    </div>
  );
}
```

#### useWalletMeshSelector

Hook for custom state selection with optimized re-renders.

```tsx
function useWalletMeshSelector<T>(
  selector: (state: ModalState) => T
): T
```

**Usage:**
```tsx
// Select only specific state slices
function OptimizedComponent() {
  // Only re-renders when connection status changes
  const connectionStatus = useWalletMeshSelector(
    state => state.connection.status
  );
  
  // Only re-renders when current view changes
  const currentView = useWalletMeshSelector(
    state => state.ui.currentView
  );
  
  // Complex computed selector
  const isConnectedAndModalOpen = useWalletMeshSelector(state => 
    state.connection.status === 'connected' && state.ui.isOpen
  );
  
  return (
    <div>
      <p>Status: {connectionStatus}</p>
      <p>View: {currentView}</p>
      <p>Connected & Open: {isConnectedAndModalOpen ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Provider Hooks (New)

#### usePublicProvider

Hook for accessing dApp RPC providers for read-only operations. Uses your own RPC infrastructure for better control and cost management.

```tsx
function usePublicProvider(chainId?: string): {
  provider: PublicProvider | null;
  isAvailable: boolean;
  chainId: ChainId | null;
}
```

**Usage:**
```tsx
function BlockchainReader() {
  const { provider, isAvailable } = usePublicProvider();
  
  const getBalance = async (address: string) => {
    if (!provider) return '0';
    
    const balance = await provider.request({
      method: 'eth_getBalance',
      params: [address, 'latest']
    });
    
    return balance;
  };
  
  if (!isAvailable) return <p>No provider available</p>;
  
  return <button onClick={() => getBalance('0x...')}>Check Balance</button>;
}
```

#### useWalletProvider

Hook for accessing wallet providers for write operations. Uses the wallet's RPC for secure transaction signing.

```tsx
function useWalletProvider<T = WalletProvider>(chainId?: string): {
  provider: T | null;
  isAvailable: boolean;
  isConnecting: boolean;
  chainId: ChainId | null;
  chainType: ChainType | null;
  walletId: string | null;
  error: Error | null;
}
```

**Usage:**
```tsx
function TransactionSender() {
  const { provider: walletProvider, isAvailable } = useWalletProvider();
  const { provider: publicProvider } = usePublicProvider();
  
  const sendTransaction = async () => {
    if (!walletProvider || !publicProvider) return;
    
    // Use public provider for gas estimation
    const gasPrice = await publicProvider.request({
      method: 'eth_gasPrice'
    });
    
    // Use wallet provider for transaction
    const txHash = await walletProvider.request({
      method: 'eth_sendTransaction',
      params: [{
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f6E3D2',
        value: '0x' + (1e16).toString(16), // 0.01 ETH
        gasPrice
      }]
    });
    
    console.log('Transaction sent:', txHash);
  };
  
  return (
    <button onClick={sendTransaction} disabled={!isAvailable}>
      Send Transaction
    </button>
  );
}
```

See the [Provider Pattern Guide](./PROVIDER_PATTERN_GUIDE.md) for more details on the public/private provider pattern.

## Configuration Examples

### Basic Configuration

```tsx
<WalletmeshProvider 
  config={{
    appName: 'My DApp',
    appDescription: 'A revolutionary DeFi application',
    appUrl: 'https://mydapp.com',
    theme: 'dark'
  }}
>
  <App />
</WalletmeshProvider>
```

### Advanced Configuration

```tsx
<WalletmeshProvider 
  config={{
    appName: 'Advanced DApp',
    projectId: 'your-project-id',
    theme: 'light',
    themeColors: {
      primary: '#007bff',
      secondary: '#6c757d'
    },
    fontFamily: 'Inter, sans-serif',
    borderRadius: '12px',
    autoInjectModal: true, // Default
    debug: process.env.NODE_ENV === 'development'
  }}
>
  <App />
</WalletmeshProvider>
```

### Disable Auto-Injection

```tsx
// Disable auto-injection and render modal manually
<WalletmeshProvider
  config={{
    appName: 'Custom Modal Placement',
    autoInjectModal: false
  }}
>
  <div>
    <Header />
    <main>
      <App />
    </main>
    {/* Manually place modal */}
    <WalletmeshModal />
  </div>
</WalletmeshProvider>
```

### Transaction Overlay Configuration

```tsx
// Customize transaction overlays
<WalletmeshProvider
  config={{
    appName: 'My DApp',
    // Control auto-injection (default: true)
    autoInjectTransactionOverlays: true,
    // Configure full-screen overlay for sync transactions
    transactionOverlay: {
      enabled: true,
      disableNavigationGuard: false,
      headline: 'Processing Transaction',
      description: 'Please wait while your transaction is processed',
      showBackgroundTransactions: false, // Show async txs in overlay
    },
    // Configure floating badge for async transactions
    backgroundTransactionIndicator: {
      enabled: true,
      position: 'bottom-right',
      showCompleted: true,
      completedDuration: 3000, // ms to show completed state
    }
  }}
>
  <App />
</WalletmeshProvider>
```

```tsx
// Disable transaction overlays entirely
<WalletmeshProvider
  config={{
    appName: 'Custom Transaction UI',
    autoInjectTransactionOverlays: false
  }}
>
  <App />
</WalletmeshProvider>
```

## Components

### WalletmeshModal

Manual modal component (only needed when `autoInjectModal: false`).

```tsx
function WalletmeshModal(): JSX.Element | null
```

**Usage:**
```tsx
// Only use when autoInjectModal is false
function CustomLayout() {
  return (
    <div className="custom-layout">
      <nav>Navigation</nav>
      <main>Content</main>
      <footer>Footer</footer>

      {/* Custom modal placement */}
      <WalletmeshModal />
    </div>
  );
}
```

### Auto-Injected Transaction Overlays

Transaction status overlays are **automatically injected** by the provider. No manual rendering required!

#### AztecTransactionStatusOverlay

Full-screen blocking overlay for synchronous transactions (e.g., `executeSync`).

**Features:**
- Shows complete transaction lifecycle: idle → simulating → proving → sending → pending → confirming → confirmed/failed
- Auto-dismisses 2.5 seconds after showing success/failure state
- Includes navigation guard to prevent accidental tab closure during transactions
- Displays transaction hash and duration
- Special emphasis on proof generation (takes 1-2 minutes for Aztec transactions)

**Configuration:**
```tsx
<WalletmeshProvider
  config={{
    transactionOverlay: {
      enabled: true,                    // Default: true
      disableNavigationGuard: false,    // Default: false
      headline: 'Custom Headline',      // Optional override
      description: 'Custom Description', // Optional override
      showBackgroundTransactions: false, // Show async txs too (default: false)
    }
  }}
/>
```

#### BackgroundTransactionIndicator

Floating badge for asynchronous background transactions (e.g., `execute`).

**Features:**
- Non-blocking UI that allows users to continue working
- Expandable drawer showing transaction details
- Automatically tracks and displays multiple active transactions
- Configurable position (top-left, top-right, bottom-left, bottom-right)
- Optional completed state display with configurable duration

**Configuration:**
```tsx
<WalletmeshProvider
  config={{
    backgroundTransactionIndicator: {
      enabled: true,              // Default: true
      position: 'bottom-right',   // Default: 'bottom-right'
      showCompleted: true,        // Show completed state (default: false)
      completedDuration: 3000,    // ms to show completed (default: 2000)
    }
  }}
/>
```

**Disabling Overlays:**
```tsx
// Disable all transaction overlays
<WalletmeshProvider
  config={{
    autoInjectTransactionOverlays: false
  }}
/>

// Disable specific overlays
<WalletmeshProvider
  config={{
    transactionOverlay: { enabled: false },
    backgroundTransactionIndicator: { enabled: false }
  }}
/>
```

**Note:** These overlays automatically subscribe to the transaction state from the Zustand store and require no additional setup. They work out of the box for all Aztec transactions.

## SSR Support

The package includes built-in SSR support with safe hydration:

```tsx
// Works seamlessly with Next.js, Remix, etc.
import { WalletmeshProvider } from '@walletmesh/modal-react';

export default function App() {
  return (
    <WalletmeshProvider config={{ appName: 'SSR App' }}>
      {/* SSR-safe - no hydration mismatches */}
      <YourApp />
    </WalletmeshProvider>
  );
}
```

## Advanced Patterns

### Hook Composition

Combine multiple hooks for specific use cases:

```tsx
function AdvancedWalletButton() {
  const { isConnected } = useAccount();
  const { open } = useModal();
  const { disconnect } = useConnection();
  
  // Listen for connection events
  useWalletEvent('connection:established', (payload) => {
    console.log('Wallet connected:', payload.address);
  });
  
  if (isConnected) {
    return <button onClick={disconnect}>Disconnect</button>;
  }
  
  return <button onClick={open}>Connect</button>;
}
```

### Performance Optimization

Use selectors to minimize re-renders:

```tsx
function OptimizedDisplay() {
  // Only re-renders when address changes
  const address = useWalletMeshSelector(state => state.connection.address);
  
  // Only re-renders when modal state changes  
  const isModalOpen = useWalletMeshSelector(state => state.ui.isOpen);
  
  return (
    <div>
      <div>Address: {address || 'Not connected'}</div>
      <div>Modal: {isModalOpen ? 'Open' : 'Closed'}</div>
    </div>
  );
}
```

### Event-Driven Architecture

Build reactive UIs with events:

```tsx
function EventDrivenApp() {
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // React to all connection events
  useWalletEvent('connection:established', () => {
    setNotifications(prev => [...prev, 'Wallet connected successfully!']);
  });
  
  useWalletEvent('connection:failed', (payload) => {
    setNotifications(prev => [...prev, `Connection failed: ${payload.error}`]);
  });
  
  useWalletEvent('connection:lost', () => {
    setNotifications(prev => [...prev, 'Connection lost. Please reconnect.']);
  });
  
  return (
    <div>
      <ConnectButton />
      <NotificationList notifications={notifications} />
    </div>
  );
}
```

## TypeScript Support

This package is fully typed. Import types as needed:

```tsx
import type { 
  WalletMeshReactConfig,
  ModalState,
  ConnectionResult,
  ModalEventMap
} from '@walletmesh/modal-react';
```

## Error Handling

WalletMesh Modal React provides a robust error formatting utility to handle various error types and display user-friendly messages.

### Error Formatter

The `formatError` utility automatically detects and formats different error types:

```tsx
import { formatError, getRecoveryMessage } from '@walletmesh/modal-react';

function ConnectionError({ error }) {
  const formatted = formatError(error);
  const recoveryMessage = getRecoveryMessage(formatted.recoveryHint);

  return (
    <div>
      <p>{formatted.message}</p>
      {recoveryMessage && <p>💡 {recoveryMessage}</p>}
    </div>
  );
}
```

### Error Types

The formatter handles:
- **ModalError**: Errors from ErrorFactory with recovery hints
- **JavaScriptError**: Standard Error instances
- **StringError**: Plain string errors
- **UnknownObject**: Objects with error information
- **Unknown**: Null, undefined, or unrecognized types

### Recovery Hints

Errors can include recovery hints that provide actionable guidance:
- `user_action`: User needs to change browser settings
- `retry`: Temporary issue, can retry
- `install_wallet`: Wallet needs to be installed
- `unlock_wallet`: Wallet needs to be unlocked
- `switch_chain`: Wrong chain selected

## License

Apache-2.0