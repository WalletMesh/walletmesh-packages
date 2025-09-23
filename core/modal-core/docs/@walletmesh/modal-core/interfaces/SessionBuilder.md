[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionBuilder

# Interface: SessionBuilder

Session builder interface for creating sessions with fluent API

## Methods

### build()

> **build**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

Build the session

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

***

### withAddresses()

> **withAddresses**(`addresses`): `SessionBuilder`

Set addresses

#### Parameters

##### addresses

`string`[]

#### Returns

`SessionBuilder`

***

### withChain()

> **withChain**(`chain`): `SessionBuilder`

Set chain information

#### Parameters

##### chain

[`ChainSessionInfo`](ChainSessionInfo.md)

#### Returns

`SessionBuilder`

***

### withExpiration()

> **withExpiration**(`expiresAt`): `SessionBuilder`

Set expiration

#### Parameters

##### expiresAt

`number`

#### Returns

`SessionBuilder`

***

### withMetadata()

> **withMetadata**(`metadata`): `SessionBuilder`

Set metadata

#### Parameters

##### metadata

[`SessionStateMetadata`](SessionStateMetadata.md)

#### Returns

`SessionBuilder`

***

### withPermissions()

> **withPermissions**(`permissions`): `SessionBuilder`

Set permissions

#### Parameters

##### permissions

[`SessionPermissions`](SessionPermissions.md)

#### Returns

`SessionBuilder`

***

### withProvider()

> **withProvider**(`provider`, `metadata`): `SessionBuilder`

Set provider

#### Parameters

##### provider

[`BlockchainProvider`](BlockchainProvider.md)

##### metadata

###### multiChainCapable

`boolean`

###### supportedMethods

`string`[]

###### type

`string`

###### version

`string`

#### Returns

`SessionBuilder`

***

### withWallet()

> **withWallet**(`walletId`): `SessionBuilder`

Set wallet ID

#### Parameters

##### walletId

`string`

#### Returns

`SessionBuilder`
