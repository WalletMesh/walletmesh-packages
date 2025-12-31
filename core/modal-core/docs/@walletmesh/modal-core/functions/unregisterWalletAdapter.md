[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / unregisterWalletAdapter

# Function: unregisterWalletAdapter()

> **unregisterWalletAdapter**(`name`): `boolean`

Unregister a wallet adapter.

## Parameters

### name

`string`

The adapter name to unregister

## Returns

`boolean`

True if the adapter was unregistered, false if not found

## Example

```typescript
import { unregisterWalletAdapter } from '@walletmesh/modal-core';

// Remove a previously registered adapter
const removed = unregisterWalletAdapter('MetaMaskAdapter');
console.log('Adapter removed:', removed);
```
