[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / LocalStorageSessionStore

# Class: LocalStorageSessionStore

Defined in: [core/router/src/session-store.ts:113](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L113)

LocalStorage-based session storage implementation

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Constructors

### Constructor

> **new LocalStorageSessionStore**(): `LocalStorageSessionStore`

#### Returns

`LocalStorageSessionStore`

## Methods

### cleanExpired()

> **cleanExpired**(): `Promise`\<`number`\>

Defined in: [core/router/src/session-store.ts:185](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L185)

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`cleanExpired`](../interfaces/SessionStore.md#cleanexpired)

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:171](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L171)

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`clear`](../interfaces/SessionStore.md#clear)

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:166](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L166)

Remove a session

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`delete`](../interfaces/SessionStore.md#delete)

***

### get()

> **get**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Defined in: [core/router/src/session-store.ts:142](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L142)

Retrieve a session if it exists and has not expired

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Promise resolving to session data if found and valid, undefined otherwise

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`get`](../interfaces/SessionStore.md#get)

***

### getAll()

> **getAll**(): `Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Defined in: [core/router/src/session-store.ts:146](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L146)

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`getAll`](../interfaces/SessionStore.md#getall)

***

### set()

> **set**(`sessionId`, `data`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:122](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L122)

Store a new session

#### Parameters

##### sessionId

`string`

Unique session identifier

##### data

[`SessionData`](../interfaces/SessionData.md)

Session data to store

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`set`](../interfaces/SessionStore.md#set)

***

### validateAndRefresh()

> **validateAndRefresh**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Defined in: [core/router/src/session-store.ts:130](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/session-store.ts#L130)

Validate a session and optionally refresh its expiry

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Promise resolving to session data if valid, undefined if expired or not found

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`validateAndRefresh`](../interfaces/SessionStore.md#validateandrefresh)
