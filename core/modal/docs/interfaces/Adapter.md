[**@walletmesh/modal v0.0.3**](../README.md)

***

[@walletmesh/modal](../globals.md) / Adapter

# Interface: Adapter

Defined in: [core/modal/src/lib/adapters/types.ts:6](https://github.com/WalletMesh/walletmesh-packages/blob/8dd082aca38bf7e9456a440d28fb36f29cf0f5a1/core/modal/src/lib/adapters/types.ts#L6)

Interface for chain-specific adapters

## Methods

### connect()

> **connect**(`walletInfo`): `Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/adapters/types.ts:8](https://github.com/WalletMesh/walletmesh-packages/blob/8dd082aca38bf7e9456a440d28fb36f29cf0f5a1/core/modal/src/lib/adapters/types.ts#L8)

Connects to the wallet and returns connected wallet information

#### Parameters

##### walletInfo

[`WalletInfo`](WalletInfo.md)

#### Returns

`Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/adapters/types.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/8dd082aca38bf7e9456a440d28fb36f29cf0f5a1/core/modal/src/lib/adapters/types.ts#L11)

Disconnects from the wallet and cleans up

#### Returns

`Promise`\<`void`\>

***

### getProvider()

> **getProvider**(): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/adapters/types.ts:14](https://github.com/WalletMesh/walletmesh-packages/blob/8dd082aca38bf7e9456a440d28fb36f29cf0f5a1/core/modal/src/lib/adapters/types.ts#L14)

Retrieves the chain-specific provider instance

#### Returns

`Promise`\<`unknown`\>

***

### handleMessage()

> **handleMessage**(`data`): `void`

Defined in: [core/modal/src/lib/adapters/types.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/8dd082aca38bf7e9456a440d28fb36f29cf0f5a1/core/modal/src/lib/adapters/types.ts#L17)

Handles incoming messages from the transport

#### Parameters

##### data

`unknown`

#### Returns

`void`
