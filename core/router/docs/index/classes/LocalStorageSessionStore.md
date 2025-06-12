[**@walletmesh/router v0.5.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / LocalStorageSessionStore

# Class: LocalStorageSessionStore

Defined in: [core/router/src/session-store.ts:146](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L146)

LocalStorage-based session storage implementation

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Constructors

### Constructor

> **new LocalStorageSessionStore**(`config`): `LocalStorageSessionStore`

Defined in: [core/router/src/session-store.ts:150](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L150)

#### Parameters

##### config

[`SessionStoreConfig`](../interfaces/SessionStoreConfig.md) = `{}`

#### Returns

`LocalStorageSessionStore`

## Methods

### cleanExpired()

> **cleanExpired**(): `Promise`\<`number`\>

Defined in: [core/router/src/session-store.ts:244](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L244)

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`cleanExpired`](../interfaces/SessionStore.md#cleanexpired)

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:230](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L230)

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`clear`](../interfaces/SessionStore.md#clear)

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:225](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L225)

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

Defined in: [core/router/src/session-store.ts:192](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L192)

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

Defined in: [core/router/src/session-store.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L196)

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`getAll`](../interfaces/SessionStore.md#getall)

***

### set()

> **set**(`sessionId`, `data`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:160](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L160)

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

Defined in: [core/router/src/session-store.ts:169](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/router/src/session-store.ts#L169)

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
