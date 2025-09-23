# WalletMesh dApp Developer Guide

This guide covers everything you need to know as a dApp developer using WalletMesh, including adding wallets, managing connections, and working with providers.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Adding Wallets to Your dApp](#adding-wallets-to-your-dapp)
4. [WalletMesh Client API](#walletmesh-client-api)
5. [Modal Controller API](#modal-controller-api)
6. [Working with Providers](#working-with-providers)
7. [Multi-Wallet Management](#multi-wallet-management)
8. [React Integration](#react-integration)
9. [Common Patterns](#common-patterns)
10. [Error Handling](#error-handling)

## Quick Start

### Installation

```bash
npm install @walletmesh/modal-core @walletmesh/modal-react
```

### Basic Setup

```typescript
import { createWalletMeshClient } from '@walletmesh/modal-core';

// Create client instance using the factory function
const client = createWalletMeshClient({
  appName: 'My dApp',
  appDescription: 'My awesome dApp',
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png'
});

// Connect to a wallet
const session = await client.connect();
console.log('Connected to:', session.address);

// Get the provider
const provider = session.provider;
const balance = await provider.getBalance(session.address);
```

## Architecture Overview

```
Your dApp
    │
    ├─── createWalletMeshClient() → WalletMeshClient (Main API)
    │         │
    │         ├─── Wallet Adapter Registry (Manages wallet adapters)
    │         ├─── Connection Manager (Manages active connections)
    │         └─── Modal Controller (UI for wallet selection - singleton behavior)
    │
    └─── Providers (Blockchain interaction)
              │
              ├─── EVM Provider (Ethereum, Polygon, etc.)
              ├─── Solana Provider
              └─── Other Chain Providers
```

### Key Design Principles

1. **Client-First API**: The `createWalletMeshClient()` function returns a client instance that handles all wallet operations. The client manages state through a simplified 3-slice architecture.

2. **Session-Based Architecture**: The client uses sessions as the primary abstraction, containing wallet, chain, and account information in a unified object.

3. **Singleton Modal Behavior**: While clients are not singletons, the modal UI implements singleton-like behavior to prevent multiple modals from opening simultaneously.

## Adding Wallets to Your dApp

### Method 1: Use Default Wallets

```typescript
// WalletMesh comes with popular wallets pre-configured
const client = createWalletMeshClient({
  appName: 'My dApp'
  // EVM wallets, Solana wallets, Coinbase, etc. are included by default
});
```

### Method 2: Add Custom Wallet Adapters

```typescript
import { createWalletMeshClient } from '@walletmesh/modal-core';
import { MyCustomWalletAdapter } from '@mycustomwallet/adapter';

const client = createWalletMeshClient({
  appName: 'My dApp'
});

// Custom wallet registration is handled through the client configuration
// See client configuration options for wallet management
```

### Method 3: Configure Wallet List

```typescript
const client = createWalletMeshClient({
  appName: 'My dApp',
  // Wallet configuration is handled through client configuration
  // Specific wallet filtering and ordering options available through config
});
```

### Method 4: Dynamic Wallet Loading

```typescript
// Load wallet adapters on demand
async function loadWalletAdapter(client: WalletMeshClient, walletName: string) {
  try {
    const module = await import(`@walletmesh/adapter-${walletName}`);
    const adapter = new module.default();
    // Wallet registration is handled through client configuration
  } catch (error) {
    console.error(`Failed to load ${walletName} adapter:`, error);
  }
}

// Load wallets based on user preference
const client = createWalletMeshClient({ appName: 'My dApp' });
// Dynamic wallet loading is handled through the client's discovery system
```

## WalletMesh Client API

The `WalletMeshClient` is your main interface for wallet operations. You create instances using the `createWalletMeshClient()` factory function.

### Creating a Client

```typescript
import { createWalletMeshClient, WalletMeshClientConfig } from '@walletmesh/modal-core';

// Basic instantiation
const client = createWalletMeshClient({
  appName: 'My dApp'
});

// Advanced configuration
const client = createWalletMeshClient({
  appName: 'My dApp',
  appDescription: 'My awesome dApp',
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png'
});

// Multiple independent clients
const mainClient = createWalletMeshClient({ appName: 'Main App' });
const adminClient = createWalletMeshClient({ appName: 'Admin Panel' });
```

### Core Methods

```typescript
interface WalletMeshClient {
  // Connection management
  connect(walletId?: string): Promise<SessionInfo>;
  disconnect(): Promise<void>;
  
  // State access
  getState(): SimplifiedWalletMeshState;
  subscribe(callback: (state: SimplifiedWalletMeshState) => void): () => void;
  
  // Session management
  getActiveSession(): Promise<SessionInfo>;
  getAvailableWallets(): Promise<WalletInfo[]>;
  
  // Lifecycle
  destroy(): void;
}
```

### Connection Options

```typescript
// Example: Connect to a wallet
const session = await client.connect('metamask');
console.log('Connected to:', session.address);

// Get available wallets
const wallets = await client.getAvailableWallets();
console.log('Available wallets:', wallets.map(w => w.name));
```

### Connection Object

```typescript
interface SessionInfo {
  // Session identification
  id: string;
  
  // Wallet information
  walletId: string;
  wallet: WalletInfo;
  
  // Account information
  address: string;
  
  // Chain information
  chain: {
    id: string;
    type: ChainType;
    name: string;
  };
  
  // Provider access
  provider: any;
  
  // Session metadata
  createdAt: number;
  lastActiveAt: number;
}
```

## State Management

The WalletMeshClient uses a simplified 3-slice state architecture for managing UI, connections, and transactions.

```typescript
interface SimplifiedWalletMeshState {
  // UI State (includes discovery functionality)
  ui: {
    isOpen: boolean;
    currentView: 'wallet-selection' | 'connecting' | 'connected' | 'error';
    isLoading: boolean;
    error?: ModalError;
    isScanning: boolean;
    lastScanTime: number | null;
    discoveryErrors: string[];
  };
  
  // Connection State (consolidates sessions and wallets)
  connections: {
    activeSessions: SessionInfo[];
    availableWallets: WalletInfo[];
    discoveredWallets: WalletInfo[];
    activeSessionId: string | null;
    connectionStatus: ConnectionStatus;
    selectedWallet?: WalletInfo;
  };
  
  // Transaction State
  transactions: {
    pending: TransactionInfo[];
    confirmed: TransactionInfo[];
    failed: TransactionInfo[];
    activeTransaction?: TransactionInfo;
  };
}

// Subscribe to state changes
const unsubscribe = client.subscribe((state) => {
  console.log('Connection status:', state.connections.connectionStatus);
  if (state.connections.activeSessions.length > 0) {
    console.log('Active session:', state.connections.activeSessions[0]);
  }
});

// Get current state
const currentState = client.getState();
console.log('Current UI view:', currentState.ui.currentView);
```

### Session Management

The client manages wallet connections through sessions that contain all relevant wallet, account, and chain information:

```typescript
// Connect to a wallet
const session = await client.connect('metamask');
console.log('Connected to:', session.wallet.name);
console.log('Address:', session.address);
console.log('Chain:', session.chain.name);

// Get active session
const activeSession = await client.getActiveSession();
if (activeSession) {
  console.log('Current session:', activeSession.id);
}

// Subscribe to connection status changes
client.subscribe((state) => {
  const { connectionStatus, activeSessions } = state.connections;
  
  if (connectionStatus === 'connected' && activeSessions.length > 0) {
    const session = activeSessions[0];
    console.log(`Connected to ${session.wallet.name} at ${session.address}`);
  } else if (connectionStatus === 'disconnected') {
    console.log('No active connections');
  }
});
```

### State Subscription Patterns

Subscribe to specific parts of the state for efficient updates:

```typescript
// Subscribe to UI state changes
client.subscribe((state) => {
  if (state.ui.isOpen) {
    console.log('Modal is open, current view:', state.ui.currentView);
  }
  
  if (state.ui.error) {
    console.error('UI error:', state.ui.error.message);
  }
});

// Subscribe to wallet discovery
client.subscribe((state) => {
  const { isScanning, discoveredWallets } = state.connections;
  
  if (isScanning) {
    console.log('Scanning for wallets...');
  } else {
    console.log('Found wallets:', discoveredWallets.map(w => w.name));
  }
});

// Subscribe to transactions
client.subscribe((state) => {
  const { pending, confirmed, failed } = state.transactions;
  
  console.log(`Transactions - Pending: ${pending.length}, Confirmed: ${confirmed.length}, Failed: ${failed.length}`);
});

## Working with Providers

Providers are chain-specific interfaces for blockchain interaction.

### EVM Provider (Ethereum, Polygon, BSC, etc.)

```typescript
// Get an EVM provider
const session = await client.connect('metamask');
const provider = session.provider as EvmProvider;

// Standard EIP-1193 methods
const accounts = await provider.request({
  method: 'eth_accounts'
});

const balance = await provider.request({
  method: 'eth_getBalance',
  params: [session.address, 'latest']
});

// Convenience methods
const chainId = await provider.getChainId();
const blockNumber = await provider.request({
  method: 'eth_blockNumber'
});

// Send transaction
const txHash = await provider.sendTransaction({
  to: '0x...',
  value: '0x...',
  data: '0x...'
});

// Sign message
const signature = await provider.signMessage('Hello World');

// Sign typed data (EIP-712)
const typedSignature = await provider.signTypedData({
  domain: { name: 'MyDapp', version: '1' },
  types: { /* ... */ },
  message: { /* ... */ }
});

// Listen to events
provider.on('accountsChanged', (accounts: string[]) => {
  console.log('Accounts changed:', accounts);
});

provider.on('chainChanged', (chainId: string) => {
  console.log('Chain changed:', chainId);
});
```

### Solana Provider

```typescript
// Get a Solana provider
const session = await client.connect('phantom');
const provider = session.provider as SolanaProvider;

// Get public key
const publicKey = provider.publicKey;

// Sign transaction
const transaction = new Transaction().add(/* ... */);
const signedTx = await provider.signTransaction(transaction);

// Sign message
const message = new TextEncoder().encode('Hello Solana');
const signature = await provider.signMessage(message);

// Sign In with Solana (SIWS)
const signInResult = await provider.signIn({
  domain: 'mydapp.com',
  statement: 'Sign in to MyDapp'
});
```

### Multi-Chain Provider

For wallets that support multiple chains:

```typescript
// Multi-chain provider support through sessions
const session = await client.getActiveSession();
const provider = session.provider;

// Check available chains
const chains = multiProvider.getAvailableChains();
console.log('Supported chains:', chains); // ['evm', 'solana']

// Get specific provider
const evmProvider = multiProvider.getProvider('evm');
const solanaProvider = multiProvider.getProvider('solana');

// Switch active chain
await multiProvider.switchToChain('solana');

// Listen to chain changes
multiProvider.on('chainChanged', ({ chainType, chainId }) => {
  console.log(`Switched to ${chainType} chain ${chainId}`);
});
```

## Multi-Wallet Management

WalletMesh supports connecting to multiple wallets simultaneously.

### Connect Multiple Wallets

```typescript
// Connect to wallet (one active session at a time in current implementation)
const session = await client.connect('metamask');

// Use the connected wallet
async function performTransaction() {
  const provider = session.provider as EvmProvider;
  await provider.sendTransaction(tx);
}
```

### Manage Connections

```typescript
// Get current state
const state = client.getState();
const { activeSessions, connectionStatus } = state.connections;

activeSessions.forEach(session => {
  console.log(`${session.wallet.name}: ${session.address}`);
});

// Check connection status
if (connectionStatus === 'connected') {
  const activeSession = await client.getActiveSession();
  console.log('Active session:', activeSession);
}

// Disconnect
await client.disconnect();
```

### Connection Events

```typescript
// Listen for state changes
client.subscribe((state) => {
  const { connectionStatus, activeSessions } = state.connections;
  
  // Handle connection changes
  if (connectionStatus === 'connected' && activeSessions.length > 0) {
    const session = activeSessions[0];
    console.log('Wallet connected:', session.wallet.name);
    updateUIWithSession(session);
  } else if (connectionStatus === 'disconnected') {
    console.log('Wallet disconnected');
    removeWalletFromUI();
  }
  
  // Handle wallet discovery
  const { discoveredWallets, isScanning } = state.connections;
  if (!isScanning && discoveredWallets.length > 0) {
    console.log('Available wallets:', discoveredWallets.map(w => w.name));
  }
});
```

## React Integration

### Setup Provider

```typescript
import { WalletMeshProvider } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletMeshProvider
      appName="My dApp"
      appDescription="Description"
      appUrl="https://mydapp.com"
      appIcon="https://mydapp.com/icon.png"
    >
      <YourApp />
    </WalletMeshProvider>
  );
}
```

### Use Hooks

```typescript
import { 
  useConnect,
  useAccount,
  useWalletEvents
} from '@walletmesh/modal-react';

function WalletButton() {
  const { connect, disconnect, isConnecting } = useConnect();
  const { address, wallet, isConnected } = useAccount();
  
  // Listen to wallet events
  useWalletEvents({
    onConnect: (session) => {
      console.log('Connected to:', session.wallet.name);
    },
    onDisconnect: () => {
      console.log('Disconnected');
    }
  });
  
  if (isConnected) {
    return (
      <div>
        <p>Connected to {wallet?.name}: {address}</p>
        <button onClick={disconnect}>
          Disconnect
        </button>
      </div>
    );
  }
  
  return (
    <button onClick={() => connect()} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

### Multi-Wallet Hook

```typescript
function WalletComponent() {
  const { connect, disconnect, isConnecting } = useConnect();
  const { address, wallet, isConnected } = useAccount();
  
  return (
    <div>
      <h3>Wallet Connection</h3>
      {isConnected ? (
        <div>
          <p>Connected to {wallet?.name}</p>
          <p>Address: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect()} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
}
```

## Common Patterns

### 1. Auto-Connect to Previous Wallet

```typescript
// Create client once
const client = useMemo(() => createWalletMeshClient({
  appName: 'My dApp'
}), []);

// On app load
useEffect(() => {
  const lastWallet = localStorage.getItem('lastConnectedWallet');
  if (lastWallet) {
    client.connect(lastWallet)
      .catch(() => {
        // Wallet not available, clear storage
        localStorage.removeItem('lastConnectedWallet');
      });
  }
}, [client]);

// Save on connection
client.subscribe((state) => {
  if (state.connections.connectionStatus === 'connected' && state.connections.activeSessions.length > 0) {
    const session = state.connections.activeSessions[0];
    localStorage.setItem('lastConnectedWallet', session.walletId);
  }
});
```

### 2. Chain Switching

```typescript
async function switchToPolygon(provider: EvmProvider) {
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }] // Polygon chainId
    });
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added, add it
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x89',
          chainName: 'Polygon',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18
          },
          rpcUrls: ['https://polygon-rpc.com'],
          blockExplorerUrls: ['https://polygonscan.com']
        }]
      });
    }
  }
}
```

### 3. Transaction Confirmation

```typescript
async function sendTransactionWithConfirmation(
  provider: EvmProvider,
  tx: TransactionRequest
) {
  // Send transaction
  const txHash = await provider.sendTransaction(tx);
  
  // Wait for confirmation
  const receipt = await waitForTransaction(provider, txHash);
  
  if (receipt.status === 1) {
    console.log('Transaction successful!');
  } else {
    console.error('Transaction failed!');
  }
  
  return receipt;
}

async function waitForTransaction(
  provider: EvmProvider, 
  txHash: string
) {
  let receipt = null;
  
  while (!receipt) {
    receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash]
    });
    
    if (!receipt) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return receipt;
}
```

### 4. Sign In With Ethereum (SIWE)

```typescript
import { SiweMessage } from 'siwe';

async function signIn(provider: EvmProvider, address: string) {
  const message = new SiweMessage({
    domain: window.location.host,
    address,
    statement: 'Sign in to MyDapp',
    uri: window.location.origin,
    version: '1',
    chainId: await provider.getChainId(),
    nonce: await generateNonce()
  });
  
  const signature = await provider.signMessage(
    message.prepareMessage()
  );
  
  // Send to backend for verification
  const response = await fetch('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ message, signature })
  });
  
  return response.json();
}
```

## Error Handling

### Connection Errors

```typescript
try {
  const session = await client.connect('metamask');
} catch (error) {
  if (error.code === 'WALLET_NOT_FOUND') {
    console.error('MetaMask is not installed');
    // Show installation guide
  } else if (error.code === 'USER_REJECTED') {
    console.error('User rejected connection');
    // Show friendly message
  } else if (error.code === 'TIMEOUT') {
    console.error('Connection timeout');
    // Suggest retry
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Provider Errors

```typescript
try {
  await provider.sendTransaction(tx);
} catch (error) {
  if (error.code === 4001) {
    // User rejected transaction
    console.error('Transaction cancelled by user');
  } else if (error.code === -32602) {
    // Invalid params
    console.error('Invalid transaction parameters');
  } else if (error.code === -32603) {
    // Internal error
    console.error('Wallet error:', error.message);
  }
}
```

### Global Error Handler

```typescript
// Monitor errors through state
client.subscribe((state) => {
  if (state.ui.error) {
    console.error('WalletMesh error:', state.ui.error);
    
    // Show user-friendly error message
    showErrorNotification(state.ui.error.message);
    
    // Log to error tracking service
    trackError(state.ui.error);
  }
});
```

## Best Practices

1. **Use Client-First Approach**: Always interact with `client.connect()` for wallet connections
2. **Create Client Once**: Create the WalletMeshClient once per app context and reuse it
3. **Always Handle Disconnections**: Users can disconnect from their wallet at any time
4. **Check Chain IDs**: Verify you're on the correct chain before transactions
5. **Show Connection State**: Always indicate which wallet is connected
6. **Request Minimum Permissions**: Only request the features you need
7. **Handle Multiple Wallets Gracefully**: Design UI for multi-wallet scenarios
8. **Cache Provider References**: Store provider references to avoid repeated lookups
9. **Use Type Guards**: TypeScript type guards for provider types
10. **Implement Retry Logic**: Network requests can fail temporarily
11. **Validate User Input**: Always validate addresses and amounts
12. **Test Multiple Wallets**: Test with different wallets as they may behave differently
13. **Clean Up Resources**: Call `client.destroy()` when done to prevent memory leaks

## TypeScript Tips

### Type Guards

```typescript
import { isEvmProvider, isSolanaProvider } from '@walletmesh/modal-core';

function useProvider(session: SessionInfo) {
  const provider = session.provider;
  
  if (isEvmProvider(provider)) {
    // TypeScript knows this is EvmProvider
    return provider.signTypedData(data);
  } else if (isSolanaProvider(provider)) {
    // TypeScript knows this is SolanaProvider
    return provider.signTransaction(tx);
  }
}
```

### Generic Provider Access

```typescript
function getTypedProvider<T extends ChainType>(
  session: SessionInfo,
  chainType: T
): ProviderForChain<T> {
  if (session.chain.type !== chainType) {
    throw new Error(`Expected ${chainType} provider`);
  }
  return session.provider as ProviderForChain<T>;
}

// Usage
const evmProvider = getTypedProvider(session, 'evm');
const solanaProvider = getTypedProvider(session, 'solana');
```

## Support

- [Documentation](https://docs.walletmesh.com)
- [GitHub](https://github.com/walletmesh/walletmesh)
- [Discord](https://discord.gg/walletmesh)
- [Examples](https://github.com/walletmesh/examples)