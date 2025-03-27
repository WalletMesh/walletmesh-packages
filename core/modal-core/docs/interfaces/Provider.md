[**@walletmesh/modal-core v0.0.1**](../README.md)

***

[@walletmesh/modal-core](../globals.md) / Provider

# Interface: Provider

Defined in: [types.ts:115](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L115)

Provider interface

## Methods

### connect()

> **connect**(): `Promise`\<`void`\>

Defined in: [types.ts:119](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L119)

Connect to provider

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [types.ts:121](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L121)

Disconnect from provider

#### Returns

`Promise`\<`void`\>

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [types.ts:123](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L123)

Check if provider is connected

#### Returns

`boolean`

***

### request()

> **request**\<`T`\>(`method`, `params`?): `Promise`\<`T`\>

Defined in: [types.ts:117](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L117)

Sends a request to the provider

#### Type Parameters

• **T** = `unknown`

#### Parameters

##### method

`string`

##### params?

`unknown`[]

#### Returns

`Promise`\<`T`\>
