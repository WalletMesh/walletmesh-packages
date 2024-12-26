[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / LocalStorageSessionStore

# Class: LocalStorageSessionStore

LocalStorage-based session storage implementation

## Implements

- [`SessionStore`](../interfaces/SessionStore.md)

## Table of contents

### Constructors

- [constructor](LocalStorageSessionStore.md#constructor)

### Methods

- [cleanExpired](LocalStorageSessionStore.md#cleanexpired)
- [clear](LocalStorageSessionStore.md#clear)
- [delete](LocalStorageSessionStore.md#delete)
- [get](LocalStorageSessionStore.md#get)
- [getAll](LocalStorageSessionStore.md#getall)
- [set](LocalStorageSessionStore.md#set)
- [validateAndRefresh](LocalStorageSessionStore.md#validateandrefresh)

## Constructors

### constructor

• **new LocalStorageSessionStore**(`config?`): [`LocalStorageSessionStore`](LocalStorageSessionStore.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | [`SessionStoreConfig`](../interfaces/SessionStoreConfig.md) |

#### Returns

[`LocalStorageSessionStore`](LocalStorageSessionStore.md)

#### Defined in

[packages/router/src/session-store.ts:150](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L150)

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

[packages/router/src/session-store.ts:244](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L244)

___

### clear

▸ **clear**(): `Promise`\<`void`\>

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Implementation of

[SessionStore](../interfaces/SessionStore.md).[clear](../interfaces/SessionStore.md#clear)

#### Defined in

[packages/router/src/session-store.ts:230](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L230)

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

[packages/router/src/session-store.ts:225](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L225)

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

[packages/router/src/session-store.ts:192](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L192)

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

[packages/router/src/session-store.ts:196](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L196)

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

[packages/router/src/session-store.ts:160](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L160)

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

[packages/router/src/session-store.ts:169](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/session-store.ts#L169)
