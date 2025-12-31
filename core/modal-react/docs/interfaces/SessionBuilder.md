[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionBuilder

# Interface: SessionBuilder

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:620

Session builder interface for creating sessions with fluent API

## Methods

### build()

> **build**(): `Promise`\<[`SessionState`](SessionState.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:641

Build the session

#### Returns

`Promise`\<[`SessionState`](SessionState.md)\>

***

### withAddresses()

> **withAddresses**(`addresses`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:624

Set addresses

#### Parameters

##### addresses

`string`[]

#### Returns

`SessionBuilder`

***

### withChain()

> **withChain**(`chain`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:626

Set chain information

#### Parameters

##### chain

[`ChainSessionInfo`](ChainSessionInfo.md)

#### Returns

`SessionBuilder`

***

### withExpiration()

> **withExpiration**(`expiresAt`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:639

Set expiration

#### Parameters

##### expiresAt

`number`

#### Returns

`SessionBuilder`

***

### withMetadata()

> **withMetadata**(`metadata`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:637

Set metadata

#### Parameters

##### metadata

`SessionStateMetadata`

#### Returns

`SessionBuilder`

***

### withPermissions()

> **withPermissions**(`permissions`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:635

Set permissions

#### Parameters

##### permissions

[`SessionPermissions`](SessionPermissions.md)

#### Returns

`SessionBuilder`

***

### withProvider()

> **withProvider**(`provider`, `metadata`): `SessionBuilder`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:628

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:622

Set wallet ID

#### Parameters

##### walletId

`string`

#### Returns

`SessionBuilder`
