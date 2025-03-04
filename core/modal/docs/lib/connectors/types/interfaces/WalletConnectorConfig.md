[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/connectors/types](../README.md) / WalletConnectorConfig

# Interface: WalletConnectorConfig\<T\>

Defined in: [core/modal/src/lib/connectors/types.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/connectors/types.ts#L101)

Configuration for wallet connectors.
Generic type T allows each connector to define its own options interface.

## Type Parameters

• **T** = `unknown`

## Properties

### type

> **type**: [`ConnectorType`](../enumerations/ConnectorType.md)

Defined in: [core/modal/src/lib/connectors/types.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/connectors/types.ts#L102)

***

### options?

> `optional` **options**: `T`

Defined in: [core/modal/src/lib/connectors/types.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/connectors/types.ts#L103)
