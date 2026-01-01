[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getRegisteredWalletAdapters

# Function: getRegisteredWalletAdapters()

> **getRegisteredWalletAdapters**(): `string`[]

Get all registered wallet adapter names.

## Returns

`string`[]

Array of registered adapter names

## Example

```typescript
import { getRegisteredWalletAdapters } from '@walletmesh/modal-core';

const adapters = getRegisteredWalletAdapters();
console.log('Available adapters:', adapters);
// Output: ['MetaMaskAdapter', 'PhantomAdapter', ...]
```
