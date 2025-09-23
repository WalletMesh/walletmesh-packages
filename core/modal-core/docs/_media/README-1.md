# Getting Started with WalletMesh

This guide will help you quickly set up and start using the WalletMesh Modal Core package in your project.

## Quick Start

```typescript
import { createWalletMeshClient } from '@walletmesh/modal-core';

// Create client instance
const client = createWalletMeshClient({
  appName: 'Your dApp',
  appDescription: 'Your dApp description',
  appUrl: 'https://yourdapp.com',
  appIcon: 'https://yourdapp.com/icon.png'
});

// Connect to a wallet
const session = await client.connect();
console.log('Connected:', session.address);
```

## Installation

```bash
# Using npm
npm install @walletmesh/modal-core

# Using yarn
yarn add @walletmesh/modal-core

# Using pnpm
pnpm add @walletmesh/modal-core
```

For framework-specific installations:

```bash
# React
pnpm add @walletmesh/modal-react

# Vue
pnpm add @walletmesh/modal-vue
```

## Prerequisites

- Node.js >= 16
- TypeScript >= 4.7 (for TypeScript projects)
- Modern web browser with ES2019+ support

## Configuration

### Basic Configuration

```typescript
import { createWalletMeshClient, type WalletMeshClientConfig } from '@walletmesh/modal-core';

const config: WalletMeshClientConfig = {
  appName: 'Your dApp',
  appDescription: 'Your dApp description',
  appUrl: 'https://yourdapp.com',
  appIcon: 'https://yourdapp.com/icon.png',
  supportedChains: ['ethereum', 'polygon'],
  theme: 'light'
};

const client = createWalletMeshClient(config);
```

### Advanced Configuration

```typescript
const advancedConfig: WalletMeshClientConfig = {
  appName: 'Your dApp',
  appDescription: 'Your dApp description', 
  appUrl: 'https://yourdapp.com',
  appIcon: 'https://yourdapp.com/icon.png',
  supportedChains: ['ethereum', 'polygon'],
  theme: {
    primary: '#1a73e8',
    background: '#ffffff',
    text: '#000000'
  },
  autoConnect: true,
  logger: {
    debug: true,
    level: 'info'
  }
};

const client = createWalletMeshClient(advancedConfig);
```

## Basic Usage

### 1. Initialize WalletMesh

```typescript
import { createWalletMeshClient } from '@walletmesh/modal-core';

const client = createWalletMeshClient({
  appName: 'Your dApp',
  appDescription: 'Your dApp description',
  appUrl: 'https://yourdapp.com',
  appIcon: 'https://yourdapp.com/icon.png'
});
```

### 2. Connect to Wallet

```typescript
try {
  const session = await client.connect();
  console.log('Connected!', session.address);
  
  // Access the provider
  const provider = session.provider;
  const balance = await provider.getBalance(session.address);
} catch (error) {
  console.error('Connection failed:', error);
}
```

### 3. Handle Events

```typescript
client.on('connect', ({ address, chainId }) => {
  console.log('Connected to address:', address);
});

client.on('disconnect', () => {
  console.log('Disconnected from wallet');
});

client.on('chainChanged', ({ chainId }) => {
  console.log('Switched to chain:', chainId);
});
```

### 4. Send Transactions

```typescript
try {
  const session = await client.getActiveSession();
  const provider = session.provider;
  
  const transaction = {
    to: '0x...',
    value: '0x0',
    data: '0x...'
  };
  
  const hash = await provider.sendTransaction(transaction);
  console.log('Transaction sent:', hash);
} catch (error) {
  console.error('Transaction failed:', error);
}
```

## Error Handling

WalletMesh provides typed errors for better error handling:

```typescript
import { 
  ModalError,
  isModalError 
} from '@walletmesh/modal-core';

try {
  await client.connect();
} catch (error) {
  if (isModalError(error)) {
    console.error('Modal error:', error.message);
    console.error('Category:', error.category);
    console.error('Code:', error.code);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Next Steps

- Learn about the [Architecture](../architecture/README.md)
- Explore [API Guides](../api-guides/README.md)
- Check out [Examples](../examples/README.md)
- Read about [Design Patterns](../patterns/README.md)

## Troubleshooting

### Common Issues

1. **Wallet Not Detected**
   ```typescript
   // Check available wallets
   const wallets = await client.getAvailableWallets();
   console.log('Available wallets:', wallets);
   ```

2. **Network Errors**
   ```typescript
   // Verify current session
   const session = await client.getActiveSession();
   console.log('Current chain:', session.chain.id);
   
   // Switch chains if needed
   await session.provider.request({
     method: 'wallet_switchEthereumChain',
     params: [{ chainId: '0x1' }]
   });
   ```

3. **Event Handling**
   ```typescript
   // Debug events with logging
   client.on('*', (event) => {
     console.log('Event received:', event);
   });
   ```

For more detailed instructions, see:
- [Installation Guide](installation.md)
- [Basic Usage Guide](basic-usage.md)
- [Configuration Guide](configuration.md)
