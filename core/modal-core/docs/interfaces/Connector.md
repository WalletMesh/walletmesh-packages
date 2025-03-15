[**@walletmesh/modal-core v0.0.1**](../README.md)

***

[@walletmesh/modal-core](../globals.md) / Connector

# Interface: Connector

Defined in: [types.ts:143](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L143)

Wallet connector interface

## Methods

### connect()

> **connect**(`walletInfo`): `Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>

Defined in: [types.ts:147](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L147)

Connects to wallet

#### Parameters

##### walletInfo

[`WalletInfo`](WalletInfo.md)

#### Returns

`Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [types.ts:149](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L149)

Disconnects from wallet

#### Returns

`Promise`\<`void`\>

***

### getProvider()

> **getProvider**(): `Promise`\<[`Provider`](Provider.md)\>

Defined in: [types.ts:145](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L145)

Gets provider instance

#### Returns

`Promise`\<[`Provider`](Provider.md)\>

***

### getState()

> **getState**(): [`ConnectionState`](../enumerations/ConnectionState.md)

Defined in: [types.ts:151](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L151)

Gets connection state

#### Returns

[`ConnectionState`](../enumerations/ConnectionState.md)

***

### resume()

> **resume**(`walletInfo`, `state`): `Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>

Defined in: [types.ts:153](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/types.ts#L153)

Resumes existing connection

#### Parameters

##### walletInfo

[`WalletInfo`](WalletInfo.md)

##### state

[`WalletState`](WalletState.md)

#### Returns

`Promise`\<[`ConnectedWallet`](ConnectedWallet.md)\>
