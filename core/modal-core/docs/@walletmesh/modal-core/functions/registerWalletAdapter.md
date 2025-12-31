[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / registerWalletAdapter

# Function: registerWalletAdapter()

> **registerWalletAdapter**(`name`, `adapter`, `options?`): `void`

Register a custom wallet adapter implementation.

This allows wallets discovered through the discovery protocol to use
custom adapter implementations instead of the generic DiscoveryAdapter.

## Parameters

### name

`string`

The adapter name (as specified in discovery transportConfig.walletAdapter)

### adapter

[`WalletAdapterConstructor`](../type-aliases/WalletAdapterConstructor.md)

The adapter constructor class

### options?

Optional registration options

#### description?

`string`

#### validateConfig?

(`config`) => `boolean`

## Returns

`void`

## Example

```typescript
import { registerWalletAdapter } from '@walletmesh/modal-core';
import { MetaMaskAdapter } from './adapters/MetaMaskAdapter.js';

// Register a custom adapter
registerWalletAdapter('MetaMaskAdapter', MetaMaskAdapter);

// Register with validation
registerWalletAdapter('PhantomAdapter', PhantomAdapter, {
  validateConfig: (config) => {
    return config && typeof config === 'object' && 'network' in config;
  },
  description: 'Phantom wallet adapter with Solana support'
});
```
