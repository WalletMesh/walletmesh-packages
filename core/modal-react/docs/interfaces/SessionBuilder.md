[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionBuilder

# Interface: SessionBuilder

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:493

Session builder interface for creating sessions with fluent API

## Methods

### build()

> **build**(): `Promise`\<[`SessionState`](SessionState.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:514

Build the session

#### Returns

`Promise`\<[`SessionState`](SessionState.md)\>

***

### withAddresses()

> **withAddresses**(`addresses`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:497

Set addresses

#### Parameters

##### addresses

`string`[]

#### Returns

`SessionBuilder`

***

### withChain()

> **withChain**(`chain`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:499

Set chain information

#### Parameters

##### chain

[`ChainSessionInfo`](ChainSessionInfo.md)

#### Returns

`SessionBuilder`

***

### withExpiration()

> **withExpiration**(`expiresAt`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:512

Set expiration

#### Parameters

##### expiresAt

`number`

#### Returns

`SessionBuilder`

***

### withMetadata()

> **withMetadata**(`metadata`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:510

Set metadata

#### Parameters

##### metadata

`SessionStateMetadata`

#### Returns

`SessionBuilder`

***

### withPermissions()

> **withPermissions**(`permissions`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:508

Set permissions

#### Parameters

##### permissions

[`SessionPermissions`](SessionPermissions.md)

#### Returns

`SessionBuilder`

***

### withProvider()

> **withProvider**(`provider`, `metadata`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:501

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:495

Set wallet ID

#### Parameters

##### walletId

`string`

#### Returns

`SessionBuilder`
