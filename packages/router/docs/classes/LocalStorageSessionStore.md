[**@walletmesh/router v0.1.6**](../README.md)

***

[@walletmesh/router](../globals.md) / LocalStorageSessionStore

# Class: LocalStorageSessionStore

LocalStorage-based session storage implementation

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Constructors

### new LocalStorageSessionStore()

> **new LocalStorageSessionStore**(`config`): [`LocalStorageSessionStore`](LocalStorageSessionStore.md)

#### Parameters

##### config

[`SessionStoreConfig`](../interfaces/SessionStoreConfig.md) = `{}`

#### Returns

[`LocalStorageSessionStore`](LocalStorageSessionStore.md)

#### Defined in

[packages/router/src/session-store.ts:150](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L150)

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

[packages/router/src/session-store.ts:244](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L244)

***

### clear()

> **clear**(): `Promise`\<`void`\>

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`SessionStore`](../interfaces/SessionStore.md).[`clear`](../interfaces/SessionStore.md#clear)

#### Defined in

[packages/router/src/session-store.ts:230](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L230)

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

[packages/router/src/session-store.ts:225](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L225)

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

[packages/router/src/session-store.ts:192](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L192)

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

[packages/router/src/session-store.ts:196](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L196)

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

[packages/router/src/session-store.ts:160](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L160)

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

[packages/router/src/session-store.ts:169](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/session-store.ts#L169)
