[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletConfig

# Interface: WalletConfig

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

Custom wallet adapters to register.
These are added to the registry in addition to discovered wallets.
Useful for development/testing wallets.

***

### exclude?

> `optional` **exclude**: `string`[]

Blacklist of wallet IDs to exclude.
These wallets will not be shown.

***

### filter()?

> `optional` **filter**: (`adapter`) => `boolean`

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

Whitelist of wallet IDs to include.
Only these wallets will be shown if specified.

***

### order?

> `optional` **order**: `string`[]

Preferred order of wallets in the UI.
Wallets not in this list appear after ordered ones.
