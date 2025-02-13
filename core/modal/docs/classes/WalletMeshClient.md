[**@walletmesh/modal v0.0.4**](../README.md)

***

[@walletmesh/modal](../globals.md) / WalletMeshClient

# Class: WalletMeshClient

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L11)

Main client for managing wallet connections

## Implements

- `WalletClient`

## Constructors

### new WalletMeshClient()

> **new WalletMeshClient**(`options`): [`WalletMeshClient`](WalletMeshClient.md)

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:14](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L14)

#### Parameters

##### options

`SessionOptions` = `{}`

#### Returns

[`WalletMeshClient`](WalletMeshClient.md)

## Methods

### connectWallet()

> **connectWallet**(`walletInfo`, `transport`, `adapter`, `options`): `Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:63](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L63)

Connects to a wallet

#### Parameters

##### walletInfo

[`WalletInfo`](../interfaces/WalletInfo.md)

##### transport

`Transport`

##### adapter

[`Adapter`](../interfaces/Adapter.md)

##### options

###### persist

`boolean`

#### Returns

`Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

#### Implementation of

`WalletClient.connectWallet`

***

### disconnectAll()

> **disconnectAll**(): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:149](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L149)

Disconnects all wallets

#### Returns

`Promise`\<`void`\>

***

### disconnectWallet()

> **disconnectWallet**(`walletId`): `Promise`\<`void`\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:110](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L110)

Disconnects a specific wallet

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

`WalletClient.disconnectWallet`

***

### getConnectedWallet()

> **getConnectedWallet**(): `null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:177](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L177)

Gets current connected wallet

#### Returns

`null` \| [`ConnectedWallet`](../interfaces/ConnectedWallet.md)

#### Implementation of

`WalletClient.getConnectedWallet`

***

### getConnectedWallets()

> **getConnectedWallets**(): [`ConnectedWallet`](../interfaces/ConnectedWallet.md)[]

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:139](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L139)

Lists all connected wallets

#### Returns

[`ConnectedWallet`](../interfaces/ConnectedWallet.md)[]

***

### getConnectionStatus()

> **getConnectionStatus**(): [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:165](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L165)

Gets current connection status

#### Returns

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

#### Implementation of

`WalletClient.getConnectionStatus`

***

### getProvider()

> **getProvider**(`walletId`): `Promise`\<`unknown`\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L128)

Gets provider for a specific wallet

#### Parameters

##### walletId

`string`

#### Returns

`Promise`\<`unknown`\>

#### Implementation of

`WalletClient.getProvider`

***

### handleError()

> **handleError**(`error`): `void`

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:186](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L186)

Handles wallet errors

#### Parameters

##### error

`WalletError`

#### Returns

`void`

#### Implementation of

`WalletClient.handleError`

***

### resumeWallet()

> **resumeWallet**(`walletInfo`, `_walletState`, `transport`, `adapter`): `Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

Defined in: [core/modal/src/lib/client/WalletMeshClient.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/a9bfa87e2829899b652cd49c4226ad0eb6f68ff0/core/modal/src/lib/client/WalletMeshClient.ts#L21)

Resumes a previously connected wallet session

#### Parameters

##### walletInfo

[`WalletInfo`](../interfaces/WalletInfo.md)

##### \_walletState

[`WalletState`](../interfaces/WalletState.md)

##### transport

`Transport`

##### adapter

[`Adapter`](../interfaces/Adapter.md)

#### Returns

`Promise`\<[`ConnectedWallet`](../interfaces/ConnectedWallet.md)\>

#### Implementation of

`WalletClient.resumeWallet`
