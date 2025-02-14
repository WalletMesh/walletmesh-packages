[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/adapters/types](../README.md) / BaseAdapterConfig

# Interface: BaseAdapterConfig\<T\>

Defined in: [core/modal/src/lib/adapters/types.ts:227](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L227)

Base configuration for wallet adapters
 BaseAdapterConfig

## Type Parameters

• **T** *extends* [`BaseAdapterOptions`](BaseAdapterOptions.md) = [`BaseAdapterOptions`](BaseAdapterOptions.md)

Type of adapter options extending BaseAdapterOptions

## Properties

### type

> **type**: [`AdapterType`](../enumerations/AdapterType.md)

Defined in: [core/modal/src/lib/adapters/types.ts:228](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L228)

Type of wallet adapter to use

***

### options?

> `optional` **options**: `T`

Defined in: [core/modal/src/lib/adapters/types.ts:229](https://github.com/WalletMesh/walletmesh-packages/blob/f5841069e665bcf8ac8875096f377637e03131d0/core/modal/src/lib/adapters/types.ts#L229)

Configuration options for the adapter
