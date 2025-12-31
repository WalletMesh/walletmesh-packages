[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletConfig

# Interface: WalletConfig

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:733

Configuration options for wallet filtering and ordering.

## Example

```typescript
const walletConfig: WalletConfig = {
  order: ['metamask', 'walletconnect', 'coinbase'],
  exclude: ['phantom'],
  filter: (adapter) => adapter.capabilities.supportsTestnets
};
```

## Properties

### custom?

> `optional` **custom**: [`WalletAdapter`](WalletAdapter.md)[]

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:759

Custom wallet adapters to register.
These are added to the registry in addition to discovered wallets.
Useful for development/testing wallets.

***

### exclude?

> `optional` **exclude**: `string`[]

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:753

Blacklist of wallet IDs to exclude.
These wallets will not be shown.

***

### filter()?

> `optional` **filter**: (`adapter`) => `boolean`

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:743

Custom filter function for wallet adapters.
Return true to include the wallet.

#### Parameters

##### adapter

[`WalletAdapter`](WalletAdapter.md)

#### Returns

`boolean`

***

### include?

> `optional` **include**: `string`[]

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:748

Whitelist of wallet IDs to include.
Only these wallets will be shown if specified.

***

### order?

> `optional` **order**: `string`[]

Defined in: core/modal-core/dist/internal/client/WalletMeshClient.d.ts:738

Preferred order of wallets in the UI.
Wallets not in this list appear after ordered ones.
