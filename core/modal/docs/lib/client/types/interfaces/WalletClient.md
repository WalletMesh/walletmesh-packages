[**@walletmesh/modal v0.0.6**](../../../../README.md)

***

[@walletmesh/modal](../../../../modules.md) / [lib/client/types](../README.md) / WalletClient

# Interface: WalletClient

Defined in: [core/modal/src/lib/client/types.ts:80](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L80)

Core interface for wallet interactions

## Methods

### getDappInfo()

> **getDappInfo**(): `Readonly`\<[`DappInfo`](../../../../index/interfaces/DappInfo.md)\>

Defined in: [core/modal/src/lib/client/types.ts:81](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L81)

#### Returns

`Readonly`\<[`DappInfo`](../../../../index/interfaces/DappInfo.md)\>

***

### initialize()

> **initialize**(): `Promise`\<`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/types.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L82)

#### Returns

`Promise`\<`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

***

### connectWallet()

> **connectWallet**(`walletInfo`, `connector`, `options`?): `Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/types.ts:83](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L83)

#### Parameters

##### walletInfo

[`WalletInfo`](../../../../index/interfaces/WalletInfo.md)

##### connector

[`Connector`](../../../connectors/types/interfaces/Connector.md)

##### options?

###### persist

`boolean`

#### Returns

`Promise`\<[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)\>

***

### disconnectWallet()

> **disconnectWallet**(`walletId`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/client/types.ts:88](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L88)

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`void`\>

***

### getChainProvider()

> **getChainProvider**(`walletId`): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/client/types.ts:89](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L89)

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`unknown`\>

***

### getConnectedWallets()

> **getConnectedWallets**(): [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)[]

Defined in: [core/modal/src/lib/client/types.ts:90](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L90)

#### Returns

[`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)[]

***

### getWalletConnections()

> **getWalletConnections**(`walletId`): `Promise`\<`undefined` \| `Map`\<`number`, [`ChainConnection`](ChainConnection.md)\>\>

Defined in: [core/modal/src/lib/client/types.ts:91](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L91)

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`undefined` \| `Map`\<`number`, [`ChainConnection`](ChainConnection.md)\>\>

***

### getConnectedWallet()

> **getConnectedWallet**(): `null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/types.ts:92](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L92)

#### Returns

`null` \| [`ConnectedWallet`](../../../../index/interfaces/ConnectedWallet.md)

***

### handleWalletError()

> **handleWalletError**(`error`): `void`

Defined in: [core/modal/src/lib/client/types.ts:93](https://github.com/WalletMesh/walletmesh-packages/blob/e3e3b2bcfb125b0418bc540985efd420cfa4d753/core/modal/src/lib/client/types.ts#L93)

#### Parameters

##### error

[`WalletError`](../classes/WalletError.md)

#### Returns

`void`
