[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletSession

# Interface: WalletSession

Defined in: [core/modal/src/lib/client/types.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L52)

Represents an active wallet session

## Properties

### id

> **id**: `string`

Defined in: [core/modal/src/lib/client/types.ts:53](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L53)

***

### createdAt

> **createdAt**: `number`

Defined in: [core/modal/src/lib/client/types.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L54)

***

### connector?

> `optional` **connector**: [`Connector`](../../../connectors/types/interfaces/Connector.md)

Defined in: [core/modal/src/lib/client/types.ts:55](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L55)

***

### wallet

> **wallet**: [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/types.ts:56](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L56)

***

### chainConnections

> **chainConnections**: `Map`\<`number`, [`ChainConnection`](ChainConnection.md)\>

Defined in: [core/modal/src/lib/client/types.ts:57](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L57)

***

### sessionToken

> **sessionToken**: [`SessionToken`](SessionToken.md)

Defined in: [core/modal/src/lib/client/types.ts:58](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L58)

***

### status

> **status**: [`ConnectionStatus`](../../../../index/enumerations/ConnectionStatus.md)

Defined in: [core/modal/src/lib/client/types.ts:59](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L59)

***

### lastConnectionError?

> `optional` **lastConnectionError**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L60)
