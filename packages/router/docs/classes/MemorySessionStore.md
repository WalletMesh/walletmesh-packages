[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / MemorySessionStore

# Class: MemorySessionStore

In-memory session storage implementation

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Table of contents

### Constructors

- [constructor](MemorySessionStore.md#constructor)

### Methods

- [cleanExpired](MemorySessionStore.md#cleanexpired)
- [clear](MemorySessionStore.md#clear)
- [delete](MemorySessionStore.md#delete)
- [get](MemorySessionStore.md#get)
- [getAll](MemorySessionStore.md#getall)
- [set](MemorySessionStore.md#set)
- [validateAndRefresh](MemorySessionStore.md#validateandrefresh)

## Constructors

### constructor

• **new MemorySessionStore**(`config?`): [`MemorySessionStore`](MemorySessionStore.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`SessionStoreConfig`](../interfaces/SessionStoreConfig.md) |

#### Returns

[`MemorySessionStore`](MemorySessionStore.md)

#### Defined in

[packages/router/src/session-store.ts:69](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L69)

## Methods

### cleanExpired

▸ **cleanExpired**(): `Promise`\<`number`\>

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[cleanExpired](../interfaces/SessionStore.md#cleanexpired)

#### Defined in

[packages/router/src/session-store.ts:128](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L128)

___

### clear

▸ **clear**(): `Promise`\<`void`\>

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[clear](../interfaces/SessionStore.md#clear)

#### Defined in

[packages/router/src/session-store.ts:124](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L124)

___

### delete

▸ **delete**(`sessionId`): `Promise`\<`void`\>

Remove a session

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sessionId` | `string` | Unique session identifier |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[delete](../interfaces/SessionStore.md#delete)

#### Defined in

[packages/router/src/session-store.ts:120](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L120)

___

### get

▸ **get**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Retrieve a session if it exists and has not expired

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sessionId` | `string` | Unique session identifier |

#### Returns

`Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Promise resolving to session data if found and valid, undefined otherwise

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[get](../interfaces/SessionStore.md#get)

#### Defined in

[packages/router/src/session-store.ts:97](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L97)

___

### getAll

▸ **getAll**(): `Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](../interfaces/SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[getAll](../interfaces/SessionStore.md#getall)

#### Defined in

[packages/router/src/session-store.ts:101](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L101)

___

### set

▸ **set**(`sessionId`, `data`): `Promise`\<`void`\>

Store a new session

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sessionId` | `string` | Unique session identifier |
| `data` | [`SessionData`](../interfaces/SessionData.md) | Session data to store |

#### Returns

`Promise`\<`void`\>

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[set](../interfaces/SessionStore.md#set)

#### Defined in

[packages/router/src/session-store.ts:73](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L73)

___

### validateAndRefresh

▸ **validateAndRefresh**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Validate a session and optionally refresh its expiry

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sessionId` | `string` | Unique session identifier |

#### Returns

`Promise`\<`undefined` \| [`SessionData`](../interfaces/SessionData.md)\>

Promise resolving to session data if valid, undefined if expired or not found

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[validateAndRefresh](../interfaces/SessionStore.md#validateandrefresh)

#### Defined in

[packages/router/src/session-store.ts:79](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/session-store.ts#L79)
