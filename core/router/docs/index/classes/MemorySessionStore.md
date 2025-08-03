[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MemorySessionStore

# Class: MemorySessionStore

Defined in: [core/router/src/session-store.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L65)

In-memory session storage implementation

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Constructors

### Constructor

> **new MemorySessionStore**(`config`): `MemorySessionStore`

Defined in: [core/router/src/session-store.ts:69](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L69)

#### Parameters

##### config

[`SessionStoreConfig`](../interfaces/SessionStoreConfig.md) = `{}`

#### Returns

`MemorySessionStore`

## Methods

### cleanExpired()

> **cleanExpired**(): `Promise`\<`number`\>

Defined in: [core/router/src/session-store.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L128)

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`cleanExpired`](../interfaces/SessionStore.md#cleanexpired)

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:124](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L124)

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`clear`](../interfaces/SessionStore.md#clear)

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:120](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L120)

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

Defined in: [core/router/src/session-store.ts:97](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L97)

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

Defined in: [core/router/src/session-store.ts:101](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L101)

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`getAll`](../interfaces/SessionStore.md#getall)

***

### set()

> **set**(`sessionId`, `data`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:73](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L73)

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

Defined in: [core/router/src/session-store.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L79)

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
