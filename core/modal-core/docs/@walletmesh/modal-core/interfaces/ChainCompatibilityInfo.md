[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainCompatibilityInfo

# Interface: ChainCompatibilityInfo

Detailed chain compatibility information

## Example

```ts
const info: ChainCompatibilityInfo = {
  isSupported: true,
  supportLevel: 'partial',
  missingFeatures: ['EIP-1559', 'ENS']
};
```

## Properties

### isSupported

> **isSupported**: `boolean`

Whether chain is supported

***

### missingFeatures?

> `optional` **missingFeatures**: `string`[]

Missing features

***

### supportLevel

> **supportLevel**: `"none"` \| `"full"` \| `"partial"`

Support level
