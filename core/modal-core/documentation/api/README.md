# WalletMesh API Guides

This section provides practical guidance for working with the WalletMesh API. Rather than duplicating the TypeDoc API reference, these guides focus on common usage patterns, best practices, and real-world examples.

## Overview

```mermaid
flowchart TD
    A[API Surface] --> B[Core APIs]
    A --> C[Provider APIs]
    A --> D[Transport APIs]
    
    B --> B1[Modal Control]
    B --> B2[State Management]
    B --> B3[Event System]
    
    C --> C1[Wallet Integration]
    C --> C2[Chain Management]
    C --> C3[Transaction Handling]
    
    D --> D1[Communication]
    D --> D2[Protocol Support]
    D --> D3[Error Handling]
```

## Core Concepts

### WalletMesh Client

The WalletMesh Client is the primary interface for interacting with wallets:

```typescript
import { createWalletMesh } from '@walletmesh/modal-core';

const { client, modal } = createWalletMesh({
  projectId: 'your-project-id',
  chains: ['ethereum']
});

// Client lifecycle
const connection = await client.connect();
await client.disconnect();

// Modal control (for UI)
await modal.open();
await modal.close();
```

### State Management

WalletMesh uses a reactive state system:

```typescript
// Subscribe to state changes
client.subscribe((state) => {
  console.log('Connection status:', state.status);
  console.log('Active address:', state.address);
  console.log('Current chain:', state.chainId);
});

// Access current state
const currentState = client.getState();
```

### Event Handling

```typescript
// Listen for specific events
client.on('connect', ({ address, chainId }) => {
  console.log('Connected address:', address);
});

client.on('chainChanged', ({ chainId }) => {
  console.log('New chain:', chainId);
});

// Remove listeners
client.off('connect', handleConnect);
```

## Common Patterns

### Connection Management

```mermaid
sequenceDiagram
    participant App
    participant Modal
    participant Provider
    participant Wallet

    App->>Client: connect()
    Client->>Provider: initialize()
    Provider->>Wallet: request connection
    Wallet-->>Provider: approve connection
    Provider-->>Client: connection established
    Client-->>App: connection object
```

Example implementation:

```typescript
// Initialize connection with auto-reconnect
const initializeWallet = async () => {
  try {
    const connection = await client.connect({ autoReconnect: true });
    
    client.on('disconnect', async () => {
      try {
        await client.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    });
  } catch (error) {
    console.error('Initial connection failed:', error);
  }
};
```

### Chain Management

```typescript
// Switch chains
const switchToPolygon = async () => {
  try {
    const connection = await client.getConnection();
    await connection.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }]
    });
  } catch (error) {
    if (error.code === 4902) { // Chain not added
      await connection.provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x89',
          chainName: 'Polygon',
          // ... chain configuration
        }]
      });
    }
  }
};
```

### Transaction Workflow

```typescript
// Send transaction with confirmation
const sendWithConfirmation = async (transaction) => {
  try {
    const connection = await client.getConnection();
    const provider = connection.provider;
    
    const hash = await provider.sendTransaction(transaction);
    
    // Wait for transaction confirmation
    const receipt = await provider.waitForTransaction(hash);
    
    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
```

## Integration Scenarios

### Basic Web Application

```typescript
// Initialize once at app startup
const { client, modal } = createWalletMesh({
  projectId: 'your-project-id',
  chains: ['ethereum']
});

// Connect button handler
const connectButton = document.getElementById('connect');
connectButton.onclick = async () => {
  try {
    const connection = await client.connect();
    updateUI(connection);
  } catch (error) {
    showError(error);
  }
};
```

### React Integration

```typescript
import { WalletProvider, useWallet } from '@walletmesh/modal-react';

function App() {
  return (
    <WalletProvider
      projectId="your-project-id"
      chains={['ethereum']}
    >
      <WalletConnection />
    </WalletProvider>
  );
}

function WalletConnection() {
  const { connect, disconnect, status } = useWallet();
  
  return (
    <button onClick={status === 'connected' ? disconnect : connect}>
      {status === 'connected' ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}
```

### Vue Integration

```typescript
import { useWallet } from '@walletmesh/modal-vue';

export default {
  setup() {
    const { connect, disconnect, status } = useWallet();
    
    return {
      connect,
      disconnect,
      status
    };
  }
};
```

## Error Handling Best Practices

```typescript
import {
  WalletError,
  ConnectionError,
  ChainError,
  TransactionError
} from '@walletmesh/modal-core';

// Comprehensive error handling
const handleWalletOperation = async () => {
  try {
    await modal.connect();
  } catch (error) {
    if (error instanceof ConnectionError) {
      // Handle connection-specific errors
      handleConnectionError(error);
    } else if (error instanceof ChainError) {
      // Handle chain-related errors
      handleChainError(error);
    } else if (error instanceof WalletError) {
      // Handle general wallet errors
      handleWalletError(error);
    } else {
      // Handle unknown errors
      handleUnknownError(error);
    }
  }
};
```

## Security Considerations

### Provider Validation

```typescript
// Validate provider before use
const validateProvider = async (provider) => {
  if (!provider.isConnected) {
    throw new Error('Provider not connected');
  }
  
  const accounts = await provider.request({
    method: 'eth_accounts'
  });
  
  if (!accounts.length) {
    throw new Error('No accounts available');
  }
  
  return true;
};
```

### Transaction Security

```typescript
// Secure transaction handling
const sendSecureTransaction = async (transaction) => {
  // Validate transaction
  if (!transaction.to || !ethers.isAddress(transaction.to)) {
    throw new Error('Invalid recipient address');
  }
  
  // Verify chain
  const chain = await modal.getChain();
  if (chain !== transaction.chainId) {
    throw new Error('Chain mismatch');
  }
  
  // Send with confirmation
  return modal.sendTransaction(transaction);
};
```

## Further Reading

- [TypeDoc API Reference](/docs/README.md)
- [Architecture Overview](../architecture/README.md)
- [Design Patterns](../patterns/README.md)
- [Error Handling Guide](../guides/error-handling.md)
