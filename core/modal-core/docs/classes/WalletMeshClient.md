[**@walletmesh/modal-core v0.0.1**](../README.md)

***

[@walletmesh/modal-core](../globals.md) / WalletMeshClient

# Class: WalletMeshClient

Defined in: [client/WalletMeshClient.ts:13](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/client/WalletMeshClient.ts#L13)

Core WalletMesh client implementation

## Constructors

### new WalletMeshClient()

> **new WalletMeshClient**(): [`WalletMeshClient`](WalletMeshClient.md)

#### Returns

[`WalletMeshClient`](WalletMeshClient.md)

## Accessors

### isConnected

#### Get Signature

> **get** **isConnected**(): `boolean`

Defined in: [client/WalletMeshClient.ts:16](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/client/WalletMeshClient.ts#L16)

##### Returns

`boolean`

## Methods

### connect()

> **connect**(`config`): `Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Defined in: [client/WalletMeshClient.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/client/WalletMeshClient.ts#L23)

Connects to a wallet

#### Parameters

##### config

[`WalletConnectorConfig`](../interfaces/WalletConnectorConfig.md)

#### Returns

`Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [client/WalletMeshClient.ts:45](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/client/WalletMeshClient.ts#L45)

Disconnects current wallet

#### Returns

`Promise`\<`void`\>

***

### getState()

> **getState**(): [`ConnectionState`](../enumerations/ConnectionState.md)

Defined in: [client/WalletMeshClient.ts:52](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/client/WalletMeshClient.ts#L52)

Gets current connection state

#### Returns

[`ConnectionState`](../enumerations/ConnectionState.md)
