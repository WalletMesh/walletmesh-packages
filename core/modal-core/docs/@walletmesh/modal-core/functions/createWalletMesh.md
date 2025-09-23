[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createWalletMesh

# Function: createWalletMesh()

> **createWalletMesh**(`config`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletMeshClient`](../../../internal/types/typedocExports/interfaces/WalletMeshClient.md)\>

Creates a new WalletMesh client instance for managing wallet connections.

This is the primary entry point for integrating WalletMesh into your dApp.
The client handles wallet discovery, connection management, and provides
a unified interface for interacting with multiple blockchain wallets.

## Parameters

### config

[`WalletMeshConfig`](../interfaces/WalletMeshConfig.md)

Configuration options for the client

### options?

[`CreateWalletMeshOptions`](../interfaces/CreateWalletMeshOptions.md)

Optional creation options

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletMeshClient`](../../../internal/types/typedocExports/interfaces/WalletMeshClient.md)\>

Promise that resolves to a fully initialized [WalletMeshClient](../../../internal/types/typedocExports/interfaces/WalletMeshClient.md) instance with comprehensive wallet management capabilities:
  - **Connection Management**: `connect()`, `disconnect()`, `disconnectAll()`
  - **Chain Management**: `switchChain()` for cross-chain operations
  - **State Observation**: `subscribe()` for reactive state updates
  - **Service Access**: `getServices()` for business logic operations
  - **Modal Control**: `openModal()`, `closeModal()` for UI management

## Throws

If required configuration is missing (e.g., appName)

## Examples

```typescript
// Basic setup with minimal configuration
const client = await createWalletMesh({
  appName: 'My dApp',
  appDescription: 'Decentralized trading platform',
  appUrl: 'https://mydapp.com',
  appIcon: 'https://mydapp.com/icon.png'
});

// Connect to any available wallet
const connection = await client.connect();
console.log('Connected:', connection.walletId, connection.address);
```

```typescript
// Advanced multi-chain setup with wallet filtering
const client = await createWalletMesh({
  appName: 'CrossChain dApp',
  wallets: {
    // Only show specific wallets
    include: ['metamask', 'phantom', 'walletconnect'],
    // Custom display order
    order: ['metamask', 'phantom', 'walletconnect'],
    // Filter by capabilities
    filter: (adapter) => adapter.capabilities.multiChain
  },
  chains: [
    {
      chainId: 'eip155:1',
      chainType: ChainType.Evm,
      name: 'Ethereum',
      required: true,
      interfaces: ['eip-1193', 'eip-6963']
    },
    {
      chainId: 'eip155:137',
      chainType: ChainType.Evm,
      name: 'Polygon',
      required: false
    },
    {
      chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      chainType: ChainType.Solana,
      name: 'Solana',
      required: false,
      interfaces: ['solana-standard-wallet']
    }
  ],
  supportedInterfaces: {
    evm: ['eip-1193', 'eip-6963'],
    solana: ['solana-standard-wallet']
  },
  projectId: 'your-walletconnect-project-id'
});

// Connect to specific wallet
const connection = await client.connect('metamask');

// Switch chains
await client.switchChain('eip155:137'); // Switch to Polygon
```

```typescript
// Server-side rendering with custom storage
const client = await createWalletMesh({
  appName: 'Universal dApp'
}, {
  ssr: true,  // Safe for Next.js, Remix, etc.
  storage: customStorageAdapter  // Persist sessions
});

// State subscription (works in SSR)
const unsubscribe = client.subscribe((state) => {
  console.log('Wallet state:', state.connection);
});
```

```typescript
// Direct wallet specification (bypasses adapter system)
const client = await createWalletMesh({
  appName: 'Custom Wallets',
  wallets: [
    {
      id: 'custom-wallet',
      name: 'My Custom Wallet',
      icon: 'https://example.com/icon.png',
      chains: ['evm', 'solana']
    }
  ]
});
```

```typescript
// Include debug wallet for testing environments
import { DebugWallet } from '@walletmesh/modal-core';

const client = await createWalletMesh({
  appName: 'Test dApp',
  wallets: process.env.NODE_ENV === 'test'
    ? [
        { id: 'metamask', name: 'MetaMask', icon: '...', chains: ['evm'] },
        { id: 'debug-wallet', name: 'Debug Wallet', icon: '...', chains: ['evm', 'solana', 'aztec'] }
      ]
    : undefined  // Use default wallets in production
});

// Or using wallet config with custom adapters
const client = await createWalletMesh({
  appName: 'Test dApp',
  wallets: {
    custom: process.env.NODE_ENV === 'test' ? [new DebugWallet()] : []
  }
});
```

## Remarks

- **Async Initialization**: Client initialization is now fully asynchronous, eliminating race conditions
- **SSR Safety**: Automatically detects server environments and returns safe no-op client
- **Lazy Loading**: Adapters and providers are loaded on-demand to minimize bundle size
- **Type Safety**: Full TypeScript support with discriminated unions for state
- **Extensible**: Register custom adapters and transports as needed
- **React Integration**: Use with `@walletmesh/modal-react` for React applications

## See

 - [WalletMeshConfig](../interfaces/WalletMeshConfig.md) for all configuration options
 - [WalletMeshClient](../../../internal/types/typedocExports/interfaces/WalletMeshClient.md) for available client methods
 - [Integration Guide](https://docs.walletmesh.com/integration) for detailed patterns

## Since

1.0.0
