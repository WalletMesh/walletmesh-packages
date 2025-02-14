[**@walletmesh/modal v0.0.5**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / BaseAdapterOptions

# Interface: BaseAdapterOptions

Defined in: [core/modal/src/lib/adapters/types.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L167)

Base configuration options for wallet adapters.

Provides common configuration options that all adapters support,
while allowing for extension with protocol-specific options.

## Example

```typescript
const baseOptions: BaseAdapterOptions = {
  chainId: 'ethereum:1',
  customOption: 'value'
};
```

## Extended by

- [`AztecAdapterOptions`](AztecAdapterOptions.md)

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### chainId?

> `optional` **chainId**: `string`

Defined in: [core/modal/src/lib/adapters/types.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/8a70240d3d3b081a0c4ff9ed453b724a02fa458c/core/modal/src/lib/adapters/types.ts#L169)

Target blockchain network identifier
