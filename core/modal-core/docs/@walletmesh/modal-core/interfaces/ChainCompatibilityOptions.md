[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainCompatibilityOptions

# Interface: ChainCompatibilityOptions

Options for checking chain compatibility with a wallet

## Example

```ts
const options: ChainCompatibilityOptions = {
  wallet: { id: 'metamask', name: 'MetaMask', chains: ['evm'] },
  includeTestnets: true,
  requireFeatures: ['wallet_connect'],
  minVersion: '1.0.0'
};
```

## Properties

### includeTestnets?

> `optional` **includeTestnets**: `boolean`

Whether to include testnet chains

***

### minVersion?

> `optional` **minVersion**: `string`

Minimum wallet version required

***

### requireFeatures?

> `optional` **requireFeatures**: `string`[]

Required features for compatibility

***

### wallet

> **wallet**: [`WalletInfo`](WalletInfo.md)

Wallet to check compatibility
