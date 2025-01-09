[**@walletmesh/router v0.2.7**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / SessionStore

# Interface: SessionStore

Interface for session storage implementations

## Methods

### cleanExpired()

> **cleanExpired**(): `Promise`\<`number`\>

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

#### Defined in

[packages/router/src/session-store.ts:54](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L54)

***

### clear()

> **clear**(): `Promise`\<`void`\>

Clear all sessions

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/router/src/session-store.ts:41](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L41)

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

#### Defined in

[packages/router/src/session-store.ts:36](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L36)

***

### get()

> **get**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Retrieve a session if it exists and has not expired

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Promise resolving to session data if found and valid, undefined otherwise

#### Defined in

[packages/router/src/session-store.ts:24](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L24)

***

### getAll()

> **getAll**(): `Promise`\<`Map`\<`string`, [`SessionData`](SessionData.md)\>\>

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

#### Defined in

[packages/router/src/session-store.ts:30](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L30)

***

### set()

> **set**(`sessionId`, `data`): `Promise`\<`void`\>

Store a new session

#### Parameters

##### sessionId

`string`

Unique session identifier

##### data

[`SessionData`](SessionData.md)

Session data to store

#### Returns

`Promise`\<`void`\>

#### Defined in

[packages/router/src/session-store.ts:17](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L17)

***

### validateAndRefresh()

> **validateAndRefresh**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Validate a session and optionally refresh its expiry

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Promise resolving to session data if valid, undefined if expired or not found

#### Defined in

[packages/router/src/session-store.ts:48](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/session-store.ts#L48)
