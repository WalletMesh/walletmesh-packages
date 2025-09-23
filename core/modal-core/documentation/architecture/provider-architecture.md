# Provider Architecture Guide

This guide explains the new provider architecture in @walletmesh/modal-core that provides type-safe JSON-RPC communication between dApps and wallets.

## Overview

The provider architecture introduces a clean separation between:
- **Transports**: Handle communication (popups, extensions, WebSocket, etc.)
- **Providers**: Implement blockchain-specific APIs with full type safety
- **Adapters**: Bridge wallets to the modal-core system

## Key Components

### 1. Type-Safe Method and Event Maps

```typescript
// Fully typed method definitions
interface WalletMethodMap {
  eth_accounts: { params: undefined; result: string[] };
  eth_sendTransaction: { params: [EvmTransaction]; result: string };
  // ... all methods typed
}

// Fully typed event definitions  
interface WalletEventMap {
  accountsChanged: { accounts: string[] };
  chainChanged: { chainId: string };
  // ... all events typed
}
```

### 2. Provider Classes

Each blockchain has its own provider class that uses JSONRPCNode:

```typescript
// EVM Provider
const provider = new EvmProvider(ChainType.Evm, transport, chainId);
const accounts = await provider.request({ method: 'eth_accounts' });

// Solana Provider
const provider = new SolanaProvider(ChainType.Solana, transport);
const signature = await provider.request({ 
  method: 'solana_signMessage',
  params: [message, address]
});
```

### 3. Transport Abstraction

Wallets can choose how to integrate:

**Option A: Use TransportToJSONRPCAdapter**
```typescript
class MyAdapter extends AbstractWalletAdapter {
  getJSONRPCTransport(chainType: ChainType): JSONRPCTransport {
    const modalTransport = new PopupTransport({ url: '...' });
    return new TransportToJSONRPCAdapter(modalTransport);
  }
}
```

**Option B: Custom JSON-RPC Transport**
```typescript
class MyAdapter extends AbstractWalletAdapter {
  getJSONRPCTransport(chainType: ChainType): JSONRPCTransport {
    return new CustomJSONRPCTransport(this.walletApi);
  }
}
```

## Migration Guide

### Minimal Migration (5 minutes)

For existing adapters, the simplest migration:

```typescript
// Before
class MyAdapter implements WalletAdapter {
  // ... your implementation
}

// After  
class MyAdapter extends AbstractWalletAdapter {
  // ... same implementation
  // AbstractWalletAdapter provides required properties
}
```

### Full Migration (30 minutes)

To support the new provider architecture:

```typescript
import { AbstractWalletAdapter } from '@walletmesh/modal-core';
import { EvmProvider, SolanaProvider } from '@walletmesh/modal-core/providers/evm';
import { TransportToJSONRPCAdapter } from '@walletmesh/modal-core';

class MyAdapter extends AbstractWalletAdapter {
  // 1. Declare supported providers
  readonly supportedProviders = {
    [ChainType.Evm]: EvmProvider,
    [ChainType.Solana]: SolanaProvider
  };

  // 2. Implement getJSONRPCTransport
  getJSONRPCTransport(chainType: ChainType): JSONRPCTransport | undefined {
    const transport = this.createTransportForChain(chainType);
    if (transport) {
      return new TransportToJSONRPCAdapter(transport);
    }
    return undefined;
  }
}
```

## Usage Examples

### For dApp Developers

```typescript
import { createWalletMesh, ChainType } from '@walletmesh/modal-core';

// Create client
const client = createWalletMesh({
  appName: 'My dApp'
});

// Connect to wallet
await client.connect('metamask');

// Get type-safe provider
const provider = client.getProvider(ChainType.Evm);

// Use with full IntelliSense
const balance = await provider.request({
  method: 'eth_getBalance',
  params: [address, 'latest']
});
```

### For Wallet Developers

See the examples directory for complete implementations:
- `ExampleTransportAdapter.ts` - Using TransportToJSONRPCAdapter
- `ExampleCustomJsonRpcAdapter.ts` - Custom JSON-RPC integration
- `MigrationExample.ts` - Migrating existing adapters

## Provider Entry Points

To avoid loading unnecessary dependencies, providers are split into separate entry points:

```typescript
// Only load what you need
import { EvmProvider } from '@walletmesh/modal-core/providers/evm';
import { SolanaProvider } from '@walletmesh/modal-core/providers/solana';

// Lazy load heavy providers
import { registerAztecProvider } from '@walletmesh/modal-core/providers/aztec';
registerAztecProvider(); // Loaded on first use
```

## Architecture Benefits

1. **Type Safety**: Full IntelliSense for all blockchain methods
2. **Transport Agnostic**: Use any communication mechanism
3. **Lazy Loading**: Load providers only when needed
4. **Extensible**: Easy to add new blockchains
5. **Backward Compatible**: Existing adapters continue to work

## Provider Registry

The provider registry manages provider classes and supports lazy loading:

```typescript
import { ProviderRegistry } from '@walletmesh/modal-core/providers/aztec';

// Register a custom provider
ProviderRegistry.getInstance().registerProvider(
  ChainType.Custom,
  CustomProvider
);

// Register with lazy loading
ProviderRegistry.getInstance().registerProviderLoader(
  ChainType.Heavy,
  async () => {
    const { HeavyProvider } = await import('./HeavyProvider');
    return HeavyProvider;
  }
);
```

## Best Practices

### For Adapter Developers

1. **Extend AbstractWalletAdapter** for automatic compatibility
2. **Cache transports** per chain type to avoid recreating
3. **Use ErrorFactory** for consistent error handling
4. **Clean up transports** in the uninstall method

### For dApp Developers

1. **Import only needed providers** to minimize bundle size
2. **Handle provider unavailability** gracefully
3. **Use proper chain types** when calling getProvider
4. **Cache provider instances** if making multiple calls

## Testing

The MockAdapter is updated to support the new architecture:

```typescript
import { MockAdapter } from '@walletmesh/modal-core';

const adapter = new MockAdapter({
  chains: [ChainType.Evm, ChainType.Solana],
  connectionDelay: 1000,
  rejectionRate: 0.1
});
```

## Troubleshooting

### "Provider not available" error
- Check if the wallet adapter supports the requested chain type
- Verify the adapter implements getJSONRPCTransport for JSON-RPC support
- Ensure the provider class is registered for the chain type

### Type errors with methods
- Update to the latest @walletmesh/modal-core version
- Import types from the correct provider entry point
- Check method names against the WalletMethodMap interface

### Migration issues
- Start with minimal migration (extend AbstractWalletAdapter)
- Test existing functionality before adding provider support
- Refer to examples for implementation patterns

## Further Resources

- [Example Implementations](./src/examples/index.ts)
- [Provider Type Definitions](./src/types/providers.ts)
- [Migration Examples](./src/examples/MigrationExample.ts)
- [Architecture Decision Record](./PROVIDER_INTERFACE_TYPE_SAFETY_PLAN.md)