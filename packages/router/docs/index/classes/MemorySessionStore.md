[**@walletmesh/router v0.2.6**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / MemorySessionStore

# Class: MemorySessionStore

In-memory session storage implementation

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Constructors

### new MemorySessionStore()

> **new MemorySessionStore**(`config`): [`MemorySessionStore`](MemorySessionStore.md)

#### Parameters

##### config

[`SessionStoreConfig`](../interfaces/SessionStoreConfig.md) = `{}`

#### Returns

[`MemorySessionStore`](MemorySessionStore.md)

#### Defined in

[packages/router/src/session-store.ts:69](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L69)

## Methods

### cleanExpired()

> **cleanExpired**(): `Promise`\<`number`\>

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`cleanExpired`](../interfaces/SessionStore.md#cleanexpired)

#### Defined in

[packages/router/src/session-store.ts:128](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L128)

***

### clear()

> **clear**(): `Promise`\<`void`\>

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`clear`](../interfaces/SessionStore.md#clear)

#### Defined in

[packages/router/src/session-store.ts:124](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L124)

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Remove a session

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`delete`](../interfaces/SessionStore.md#delete)

#### Defined in

[packages/router/src/session-store.ts:120](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L120)

***

### get()

> **get**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

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

#### Defined in

[packages/router/src/session-store.ts:97](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L97)

***

### getAll()

> **getAll**(): `Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`getAll`](../interfaces/SessionStore.md#getall)

#### Defined in

[packages/router/src/session-store.ts:101](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L101)

***

### set()

> **set**(`sessionId`, `data`): `Promise`\<`void`\>

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

#### Defined in

[packages/router/src/session-store.ts:73](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L73)

***

### validateAndRefresh()

> **validateAndRefresh**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

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

#### Defined in

[packages/router/src/session-store.ts:79](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/session-store.ts#L79)
