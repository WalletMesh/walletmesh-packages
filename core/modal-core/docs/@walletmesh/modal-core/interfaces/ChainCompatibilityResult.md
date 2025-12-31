[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainCompatibilityResult

# Interface: ChainCompatibilityResult

Result of chain compatibility check

## Example

```ts
const result: ChainCompatibilityResult = {
  isCompatible: false,
  reason: 'Wallet does not support Aztec chains',
  chainId: 'eip155:1',
  walletId: 'metamask',
  missingFeatures: ['wallet_connect']
};
```

## Properties

### chainId?

> `optional` **chainId**: `string`

Chain ID that was checked

***

### isCompatible

> **isCompatible**: `boolean`

Whether the chain is compatible

***

### missingFeatures?

> `optional` **missingFeatures**: `string`[]

Missing features if incompatible

***

### reason?

> `optional` **reason**: `string`

Compatibility reason if incompatible

***

### walletId?

> `optional` **walletId**: `string`

Wallet ID that was checked
