[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / SerializedSession

# Interface: SerializedSession

Defined in: [core/modal/src/lib/client/types.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L66)

Serialized format of session data for storage

## Properties

### id

> **id**: `string`

Defined in: [core/modal/src/lib/client/types.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L67)

***

### createdAt

> **createdAt**: `number`

Defined in: [core/modal/src/lib/client/types.ts:68](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L68)

***

### walletInfo

> **walletInfo**: [`WalletInfo`](../../../../index/interfaces/WalletInfo.md)

Defined in: [core/modal/src/lib/client/types.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L69)

***

### wallet

> **wallet**: [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/types.ts:70](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L70)

***

### chainConnections

> **chainConnections**: \[`number`, [`ChainConnection`](ChainConnection.md)\][]

Defined in: [core/modal/src/lib/client/types.ts:71](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L71)

***

### sessionToken

> **sessionToken**: [`SessionToken`](SessionToken.md)

Defined in: [core/modal/src/lib/client/types.ts:72](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L72)

***

### status

> **status**: [`ConnectionStatus`](../../../../index/enumerations/ConnectionStatus.md)

Defined in: [core/modal/src/lib/client/types.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L73)

***

### lastConnectionError?

> `optional` **lastConnectionError**: `Error`

Defined in: [core/modal/src/lib/client/types.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L74)
