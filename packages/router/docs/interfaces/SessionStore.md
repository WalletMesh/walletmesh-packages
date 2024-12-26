[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / SessionStore

# Interface: SessionStore

Interface for session storage implementations

## Implemented by

- [`LocalStorageSessionStore`](../classes/LocalStorageSessionStore.md)
- [`MemorySessionStore`](../classes/MemorySessionStore.md)

## Table of contents

### Methods

- [cleanExpired](SessionStore.md#cleanexpired)
- [clear](SessionStore.md#clear)
- [delete](SessionStore.md#delete)
- [get](SessionStore.md#get)
- [getAll](SessionStore.md#getall)
- [set](SessionStore.md#set)
- [validateAndRefresh](SessionStore.md#validateandrefresh)

## Methods

### cleanExpired

▸ **cleanExpired**(): `Promise`\<`number`\>

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

#### Defined in

[packages/router/src/session-store.ts:54](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L54)

___

### clear

▸ **clear**(): `Promise`\<`void`\>

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/router/src/session-store.ts:41](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L41)

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

#### Defined in

[packages/router/src/session-store.ts:36](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L36)

___

### get

▸ **get**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Retrieve a session if it exists and has not expired

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sessionId` | `string` | Unique session identifier |

#### Returns

`Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Promise resolving to session data if found and valid, undefined otherwise

#### Defined in

[packages/router/src/session-store.ts:24](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L24)

___

### getAll

▸ **getAll**(): `Promise`\<`Map`\<`string`, [`SessionData`](SessionData.md)\>\>

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

#### Defined in

[packages/router/src/session-store.ts:30](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L30)

___

### set

▸ **set**(`sessionId`, `data`): `Promise`\<`void`\>

Store a new session

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sessionId` | `string` | Unique session identifier |
| `data` | [`SessionData`](SessionData.md) | Session data to store |

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/router/src/session-store.ts:17](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L17)

___

### validateAndRefresh

▸ **validateAndRefresh**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Validate a session and optionally refresh its expiry

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `sessionId` | `string` | Unique session identifier |

#### Returns

`Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Promise resolving to session data if valid, undefined if expired or not found

#### Defined in

[packages/router/src/session-store.ts:48](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L48)
