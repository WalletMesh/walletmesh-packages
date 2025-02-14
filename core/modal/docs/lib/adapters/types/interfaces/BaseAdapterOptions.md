[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / BaseAdapterOptions

# Interface: BaseAdapterOptions

Defined in: [core/modal/src/lib/adapters/types.ts:167](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L167)

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

Defined in: [core/modal/src/lib/adapters/types.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L169)

Target blockchain network identifier
