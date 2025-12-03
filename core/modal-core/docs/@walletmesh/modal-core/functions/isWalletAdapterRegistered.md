[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / isWalletAdapterRegistered

# Function: isWalletAdapterRegistered()

> **isWalletAdapterRegistered**(`name`): `boolean`

Check if a wallet adapter is registered.

## Parameters

### name

`string`

The adapter name to check

## Returns

`boolean`

True if the adapter is registered

## Example

```typescript
import { isWalletAdapterRegistered } from '@walletmesh/modal-core';

if (isWalletAdapterRegistered('MetaMaskAdapter')) {
  console.log('MetaMask adapter is available');
}
```
