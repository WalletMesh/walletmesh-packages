[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createWalletMeshAccount

# Function: createWalletMeshAccount()

> **createWalletMeshAccount**(`client`, `chainId?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`NemiAccount`](../interfaces/NemiAccount.md)\>

Create nemi SDK compatible Account from WalletMesh connection

This factory function creates an Account instance that implements
the @nemi-fi/wallet-sdk/eip1193 Account interface, allowing dApps
to use nemi SDK's Contract patterns with WalletMesh wallet connections.

## Parameters

### client

[`WalletMeshClient`](../interfaces/WalletMeshClient.md)

WalletMesh client instance

### chainId?

`string`

Optional chain ID (uses active chain if omitted)

## Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`NemiAccount`](../interfaces/NemiAccount.md)\>

Promise resolving to nemi-compatible Account

## Throws

If not connected or no chain ID available

## Examples

```typescript
import { createWalletMeshClient } from '@walletmesh/modal-core';
import { createWalletMeshAccount } from '@walletmesh/modal-core/providers/nemi-account';

const client = createWalletMeshClient({ appName: 'My dApp' });
await client.initialize();
await client.connect(); // Shows WalletMesh modal

// Create account from active connection
const account = await createWalletMeshAccount(client);
```

```typescript
// Specify a particular chain
const account = await createWalletMeshAccount(client, '31337');
```
