# Common Integration Patterns

This guide documents common patterns and best practices for integrating WalletMesh into your dApp.

## Table of Contents

- [Basic Setup](#basic-setup)
- [State Management Patterns](#state-management-patterns)
- [Event Handling Patterns](#event-handling-patterns)
- [Error Handling Patterns](#error-handling-patterns)
- [Framework Integration](#framework-integration)
- [Advanced Patterns](#advanced-patterns)

## Basic Setup

### Minimal Configuration

The simplest way to integrate WalletMesh:

```typescript
import { createWalletMeshClient } from '@walletmesh/modal-core';

// Minimal setup - just app name required
const client = createWalletMeshClient({
  appName: 'My dApp'
});

// Connect to any available wallet
const session = await client.connect();
console.log('Connected:', session.address);
```

### Production Configuration

For production applications, provide complete metadata:

```typescript
const client = createWalletMeshClient({
  appName: 'DeFi Trading Platform',
  appDescription: 'Decentralized trading with advanced analytics',
  appUrl: 'https://mydefi.app',
  appIcon: 'https://mydefi.app/logo.png'
});
```

## State Management Patterns

### State Access Through Client

Access state through the WalletMeshClient:

```typescript
// Get current state
const state = client.getState();
console.log('Connection status:', state.connections.connectionStatus);
console.log('Is modal open:', state.ui.isOpen);
console.log('Current view:', state.ui.currentView);

// Get active session
if (state.connections.activeSessions.length > 0) {
  const session = state.connections.activeSessions[0];
  console.log('Connected to:', session.wallet.name);
  console.log('Address:', session.address);
}
```

### State Subscription Patterns

Subscribe to state changes through the client:

```typescript
// Subscribe to all state changes
const unsubscribe = client.subscribe((state) => {
  // Handle connection changes
  const { connectionStatus, activeSessions } = state.connections;
  
  if (connectionStatus === 'connected' && activeSessions.length > 0) {
    const session = activeSessions[0];
    console.log('Connected to:', session.wallet.name);
    updateUI(session.address);
  } else if (connectionStatus === 'disconnected') {
    console.log('Disconnected');
    clearUI();
  }
  
  // Handle modal visibility
  if (state.ui.isOpen) {
    pauseGameplay();
  } else {
    resumeGameplay();
  }
  
  // Handle loading states
  if (state.ui.isLoading) {
    showLoadingSpinner();
  } else {
    hideLoadingSpinner();
  }
});

// Clean up when done
unsubscribe();
```

### State Selector Patterns

Create custom selectors for computed values:

```typescript
// Create custom selectors
const getConnectionInfo = () => {
  const state = client.getState();
  const { connectionStatus, activeSessions } = state.connections;
  
  if (connectionStatus === 'connected' && activeSessions.length > 0) {
    const session = activeSessions[0];
    return {
      isConnected: true,
      walletId: session.walletId,
      walletName: session.wallet.name,
      address: session.address,
      chainId: session.chain.id,
      chainName: session.chain.name
    };
  }
  
  return {
    isConnected: false,
    walletId: null,
    walletName: null,
    address: null,
    chainId: null,
    chainName: null
  };
};

// Use selectors
const connectionInfo = getConnectionInfo();
console.log('Is connected:', connectionInfo.isConnected);
if (connectionInfo.isConnected) {
  console.log('Wallet:', connectionInfo.walletName);
  console.log('Address:', connectionInfo.address);
}
```

## Event Handling Patterns

### State-Based Event Handling

Handle state changes instead of events:

```typescript
// Subscribe to state changes for connection events
let previousConnectionStatus = null;
let previousActiveSession = null;

client.subscribe((state) => {
  const { connectionStatus, activeSessions } = state.connections;
  
  // Handle connection established
  if (connectionStatus === 'connected' && previousConnectionStatus !== 'connected') {
    const session = activeSessions[0];
    console.log(`Connected to ${session.wallet.name}`);
    console.log(`Address: ${session.address}`);
    console.log(`Chain: ${session.chain.name}`);
  }
  
  // Handle disconnection
  if (connectionStatus === 'disconnected' && previousConnectionStatus === 'connected') {
    console.log('Wallet disconnected');
  }
  
  // Handle chain changes
  if (activeSessions.length > 0) {
    const currentSession = activeSessions[0];
    if (previousActiveSession && currentSession.chain.id !== previousActiveSession.chain.id) {
      console.log(`Chain switched from ${previousActiveSession.chain.name} to ${currentSession.chain.name}`);
      refreshContractInstances(currentSession.chain.id);
    }
    previousActiveSession = currentSession;
  }
  
  // Handle errors
  if (state.ui.error) {
    console.error('UI error:', state.ui.error);
    showErrorNotification(state.ui.error.message);
  }
  
  previousConnectionStatus = connectionStatus;
});
```

### Comprehensive State Handler

Create a comprehensive state change handler:

```typescript
class WalletStateHandler {
  private previousState: SimplifiedWalletMeshState | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(private client: WalletMeshClient) {
    this.setupStateSubscription();
  }

  private setupStateSubscription() {
    this.unsubscribe = this.client.subscribe((state) => {
      this.handleStateChange(state);
    });
  }

  private handleStateChange = (state: SimplifiedWalletMeshState) => {
    // Handle UI state changes
    this.handleUIChanges(state.ui);
    
    // Handle connection state changes
    this.handleConnectionChanges(state.connections);
    
    // Handle transaction state changes
    this.handleTransactionChanges(state.transactions);
    
    this.previousState = state;
  };

  private handleUIChanges(ui: UIState) {
    if (ui.isLoading) {
      this.showLoadingSpinner();
    } else {
      this.hideLoadingSpinner();
    }
    
    if (ui.error) {
      this.showError(ui.error.message);
    }
    
    if (ui.currentView === 'connecting') {
      this.updateStatus('Connecting...');
    } else if (ui.currentView === 'connected') {
      this.updateStatus('Connected');
    }
  }

  private handleConnectionChanges(connections: ConnectionState) {
    const { connectionStatus, activeSessions } = connections;
    
    if (connectionStatus === 'connected' && activeSessions.length > 0) {
      const session = activeSessions[0];
      this.loadUserData(session.address);
      this.updateChainDisplay(session.chain.id);
    } else if (connectionStatus === 'disconnected') {
      this.clearUserData();
    }
  }

  private handleTransactionChanges(transactions: TransactionState) {
    const { pending, confirmed, failed } = transactions;
    
    this.updateTransactionCounts({
      pending: pending.length,
      confirmed: confirmed.length,
      failed: failed.length
    });
  }

  destroy() {
    this.unsubscribe?.();
  }
}
```

### State Filtering

Filter state changes by wallet or chain:

```typescript
// Filter state changes for specific wallet
client.subscribe((state) => {
  const { activeSessions } = state.connections;
  
  // Only handle MetaMask sessions
  const metamaskSession = activeSessions.find(s => s.walletId === 'metamask');
  if (metamaskSession && state.connections.connectionStatus === 'connected') {
    console.log('MetaMask connected');
  }
});

// Filter state changes for specific chain
let previousChainId = null;

client.subscribe((state) => {
  const { activeSessions } = state.connections;
  
  if (activeSessions.length > 0) {
    const currentChainId = activeSessions[0].chain.id;
    
    // Only handle Ethereum mainnet
    if (currentChainId === '1' && currentChainId !== previousChainId) {
      console.log('Switched to Ethereum mainnet');
    }
    
    previousChainId = currentChainId;
  }
});
```

## Error Handling Patterns

### Comprehensive Error Handling

Handle all error scenarios:

```typescript
async function connectWithErrorHandling() {
  try {
    const session = await client.connect();
    return session;
  } catch (error) {
    if (error.code === 'USER_REJECTED_REQUEST') {
      // User cancelled - no action needed
      console.log('User cancelled connection');
      return null;
    }
    
    if (error.category === 'wallet' && error.data?.recoveryHint === 'install_wallet') {
      // Wallet not installed
      showInstallPrompt(error.data.walletId);
      return null;
    }
    
    if (error.category === 'network') {
      // Network issue
      showRetryPrompt('Network error. Please check your connection.');
      return null;
    }
    
    // Unknown error
    console.error('Unexpected error:', error);
    showErrorMessage('An unexpected error occurred. Please try again.');
    return null;
  }
}
```

### Recovery Strategies

Implement automatic recovery:

```typescript
class ConnectionManager {
  private retryCount = 0;
  private maxRetries = 3;
  
  async connectWithRetry(walletId: string): Promise<SessionInfo | null> {
    try {
      this.retryCount = 0;
      return await this.attemptConnection(walletId);
    } catch (error) {
      console.error('All connection attempts failed:', error);
      return null;
    }
  }
  
  private async attemptConnection(walletId: string): Promise<SessionInfo> {
    try {
      return await client.connect(walletId);
    } catch (error) {
      if (!error.fatal && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(`Retrying connection (${this.retryCount}/${this.maxRetries})...`);
        
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, this.retryCount) * 1000)
        );
        
        return this.attemptConnection(walletId);
      }
      throw error;
    }
  }
}
```

## Framework Integration

### React Integration

Create React hooks for WalletMesh:

```typescript
import { useEffect, useState } from 'react';
import { createWalletMeshClient } from '@walletmesh/modal-core';

// Custom hook for wallet connection
export function useWalletMeshClient() {
  const [client] = useState(() => 
    createWalletMeshClient({
      appName: 'My React dApp'
    })
  );
  
  const [session, setSession] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = client.subscribe((state) => {
      const { connectionStatus, activeSessions } = state.connections;
      
      if (connectionStatus === 'connected' && activeSessions.length > 0) {
        const activeSession = activeSessions[0];
        setSession({
          address: activeSession.address,
          chainId: activeSession.chain.id,
          walletId: activeSession.walletId,
          walletName: activeSession.wallet.name
        });
        setIsConnecting(false);
      } else if (connectionStatus === 'disconnected') {
        setSession(null);
        setIsConnecting(false);
      }
      
      // Handle loading states
      setIsConnecting(state.ui.isLoading && state.ui.currentView === 'connecting');
      
      // Handle errors
      setError(state.ui.error);
    });
    
    return () => unsubscribe();
  }, [client]);
  
  const connect = async () => {
    setError(null);
    
    try {
      await client.connect();
    } catch (err) {
      setError(err);
    }
  };
  
  const disconnect = async () => {
    await client.disconnect();
  };
  
  return {
    session,
    isConnecting,
    error,
    connect,
    disconnect,
    client
  };
}

// Usage in component
function WalletButton() {
  const { session, isConnecting, connect, disconnect } = useWalletMeshClient();
  
  if (session) {
    return (
      <button onClick={disconnect}>
        {session.walletName}: {session.address.slice(0, 6)}...{session.address.slice(-4)}
      </button>
    );
  }
  
  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

### Vue Integration

Create Vue composables:

```typescript
import { ref, onMounted, onUnmounted } from 'vue';
import { createWalletMeshClient } from '@walletmesh/modal-core';

export function useWalletMeshClient() {
  const client = createWalletMeshClient({
    appName: 'My Vue dApp'
  });
  
  const session = ref(null);
  const isConnecting = ref(false);
  const error = ref(null);
  
  let unsubscribe = null;
  
  onMounted(() => {
    unsubscribe = client.subscribe((state) => {
      const { connectionStatus, activeSessions } = state.connections;
      
      if (connectionStatus === 'connected' && activeSessions.length > 0) {
        const activeSession = activeSessions[0];
        session.value = {
          address: activeSession.address,
          chainId: activeSession.chain.id,
          walletId: activeSession.walletId,
          walletName: activeSession.wallet.name
        };
      } else if (connectionStatus === 'disconnected') {
        session.value = null;
      }
      
      isConnecting.value = state.ui.isLoading && state.ui.currentView === 'connecting';
      error.value = state.ui.error;
    });
  });
  
  onUnmounted(() => {
    unsubscribe?.();
  });
  
  const connect = async () => {
    error.value = null;
    
    try {
      await client.connect();
    } catch (err) {
      error.value = err;
    }
  };
  
  const disconnect = async () => {
    await client.disconnect();
  };
  
  return {
    session,
    isConnecting,
    error,
    connect,
    disconnect,
    client
  };
}
```

## Advanced Patterns

### Session Management

Manage wallet sessions through the client:

```typescript
class SessionManager {
  private client: WalletMeshClient;
  private currentSession: SessionInfo | null = null;
  
  constructor(client: WalletMeshClient) {
    this.client = client;
    this.setupStateSubscription();
  }
  
  private setupStateSubscription() {
    this.client.subscribe((state) => {
      const { connectionStatus, activeSessions } = state.connections;
      
      if (connectionStatus === 'connected' && activeSessions.length > 0) {
        this.currentSession = activeSessions[0];
        this.onSessionEstablished(this.currentSession);
      } else if (connectionStatus === 'disconnected') {
        if (this.currentSession) {
          this.onSessionEnded(this.currentSession);
        }
        this.currentSession = null;
      }
    });
  }
  
  async connectWallet(walletId?: string): Promise<SessionInfo | null> {
    try {
      const session = await this.client.connect(walletId);
      return session;
    } catch (error) {
      console.error('Connection failed:', error);
      return null;
    }
  }
  
  async disconnectWallet(): Promise<void> {
    if (this.currentSession) {
      await this.client.disconnect();
    }
  }
  
  getCurrentSession(): SessionInfo | null {
    return this.currentSession;
  }
  
  isConnected(): boolean {
    return this.currentSession !== null;
  }
  
  private onSessionEstablished(session: SessionInfo) {
    console.log(`Session established with ${session.wallet.name}`);
    this.persistSession(session);
  }
  
  private onSessionEnded(session: SessionInfo) {
    console.log(`Session ended with ${session.wallet.name}`);
    this.clearPersistedSession();
  }
  
  private persistSession(session: SessionInfo) {
    localStorage.setItem('lastWalletId', session.walletId);
  }
  
  private clearPersistedSession() {
    localStorage.removeItem('lastWalletId');
  }
}
```

### Session Persistence

Persist and restore wallet sessions:

```typescript
class SessionPersistence {
  private readonly STORAGE_KEY = 'walletmesh_session';
  private client: WalletMeshClient;
  
  constructor(client: WalletMeshClient) {
    this.client = client;
    this.setupSessionTracking();
  }
  
  private setupSessionTracking() {
    this.client.subscribe((state) => {
      const { connectionStatus, activeSessions } = state.connections;
      
      if (connectionStatus === 'connected' && activeSessions.length > 0) {
        this.saveSession(activeSessions[0]);
      } else if (connectionStatus === 'disconnected') {
        this.clearSession();
      }
    });
  }
  
  saveSession(session: SessionInfo) {
    const sessionData = {
      walletId: session.walletId,
      chainId: session.chain.id,
      timestamp: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData));
  }
  
  async restoreSession(): Promise<SessionInfo | null> {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const sessionData = JSON.parse(stored);
      
      // Check if session is expired (24 hours)
      if (Date.now() - sessionData.timestamp > 24 * 60 * 60 * 1000) {
        this.clearSession();
        return null;
      }
      
      // Try to reconnect
      return await this.client.connect(sessionData.walletId);
    } catch (error) {
      console.error('Failed to restore session:', error);
      this.clearSession();
      return null;
    }
  }
  
  clearSession() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Usage
const sessionPersistence = new SessionPersistence(client);

// On app load
async function initializeApp() {
  const session = await sessionPersistence.restoreSession();
  if (session) {
    console.log('Session restored:', session.address);
  }
}
```

### Transaction Management

Handle transactions with proper state management:

```typescript
class TransactionManager {
  private pendingTxs = new Map<string, PendingTransaction>();
  private client: WalletMeshClient;
  
  constructor(client: WalletMeshClient) {
    this.client = client;
  }
  
  async sendTransaction(params: TransactionParams): Promise<string> {
    const session = await this.client.getActiveSession();
    if (!session) throw new Error('Not connected');
    
    const txId = this.generateTxId();
    
    // Store pending transaction
    this.pendingTxs.set(txId, {
      id: txId,
      status: 'pending',
      params,
      timestamp: Date.now()
    });
    
    try {
      // Update UI
      this.emitTxUpdate(txId, 'signing');
      
      // Send transaction
      const hash = await session.provider.request({
        method: 'eth_sendTransaction',
        params: [params]
      });
      
      // Update status
      this.emitTxUpdate(txId, 'submitted', hash);
      
      // Wait for confirmation
      this.waitForConfirmation(hash, txId);
      
      return hash;
    } catch (error) {
      this.emitTxUpdate(txId, 'failed', null, error);
      throw error;
    }
  }
  
  private async waitForConfirmation(hash: string, txId: string) {
    // Poll for transaction receipt
    const checkReceipt = setInterval(async () => {
      try {
        const receipt = await this.getTransactionReceipt(hash);
        if (receipt) {
          clearInterval(checkReceipt);
          this.emitTxUpdate(txId, 'confirmed', hash, null, receipt);
          this.pendingTxs.delete(txId);
        }
      } catch (error) {
        console.error('Error checking receipt:', error);
      }
    }, 5000);
  }
}
```

### Custom Wallet Integration

Add support for custom wallets:

```typescript
// Custom wallet integration is handled through the WalletMeshClient configuration
// and the discovery system. The client automatically detects available wallets
// and manages their lifecycle.

// For custom wallet integration, wallets should implement the standard
// wallet provider interface and announce themselves through the discovery protocol.

// Example: Check for custom wallet availability
const availableWallets = await client.getAvailableWallets();
const customWallet = availableWallets.find(w => w.id === 'custom-wallet');

if (customWallet) {
  console.log('Custom wallet is available:', customWallet.name);
  const session = await client.connect('custom-wallet');
} else {
  console.log('Custom wallet is not installed');
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad
const session = await client.connect();

// ✅ Good
try {
  const session = await client.connect();
} catch (error) {
  handleConnectionError(error);
}
```

### 2. Clean Up Subscriptions

```typescript
// ❌ Bad
client.subscribe(handler); // No cleanup

// ✅ Good
const unsubscribe = client.subscribe(handler);
// Later...
unsubscribe();
```

### 3. Check Connection State

```typescript
// ❌ Bad
// (Chain switching through provider without checking connection)
const session = await client.getActiveSession();
await session.provider.request({...});

// ✅ Good
const state = client.getState();
if (state.connections.connectionStatus === 'connected') {
  const session = await client.getActiveSession();
  await session.provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x89' }]
  });
} else {
  console.log('Connect wallet first');
}
```

### 4. Provide User Feedback

```typescript
// ✅ Good
client.subscribe((state) => {
  // Handle loading states
  if (state.ui.isLoading) {
    showLoading();
  } else {
    hideLoading();
  }
  
  // Handle connection success
  if (state.connections.connectionStatus === 'connected') {
    showSuccessMessage('Connected!');
  }
  
  // Handle errors
  if (state.ui.error) {
    showError(state.ui.error.message);
  }
});
```

### 5. Handle Chain Switches

```typescript
// ✅ Good
let previousChainId = null;

client.subscribe(async (state) => {
  const { activeSessions } = state.connections;
  
  if (activeSessions.length > 0) {
    const currentChainId = activeSessions[0].chain.id;
    
    // Check if chain changed
    if (previousChainId && currentChainId !== previousChainId) {
      // Update contract instances
      contracts = await initializeContracts(currentChainId);
      
      // Update UI
      updateChainDisplay(currentChainId);
      
      // Refresh user data
      await loadUserData();
    }
    
    previousChainId = currentChainId;
  }
});
```

## Testing Integration

### Mock WalletMesh for Testing

```typescript
import { createMockClient } from '@walletmesh/modal-core/testing';

describe('MyComponent', () => {
  let mockClient;
  
  beforeEach(() => {
    mockClient = createMockClient();
    mockClient.connect.mockResolvedValue({
      id: 'session-1',
      walletId: 'test-wallet',
      wallet: { name: 'Test Wallet' },
      address: '0x123...',
      chain: { id: '1', name: 'Ethereum', type: 'evm' },
      provider: {},
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    });
  });
  
  it('should connect wallet', async () => {
    const session = await connectWallet(mockClient);
    expect(mockClient.connect).toHaveBeenCalled();
    expect(session.address).toBe('0x123...');
    expect(session.wallet.name).toBe('Test Wallet');
  });
});
```