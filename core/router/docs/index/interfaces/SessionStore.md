[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / SessionStore

# Interface: SessionStore

Defined in: [core/router/src/session-store.ts:11](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L11)

Interface for session storage implementations

## Methods

### cleanExpired()

> **cleanExpired**(): `Promise`\<`number`\>

Defined in: [core/router/src/session-store.ts:54](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L54)

Remove all expired sessions

#### Returns

`Promise`\<`number`\>

Promise resolving to number of sessions removed

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:41](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L41)

Clear all sessions

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(`sessionId`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:36](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L36)

Remove a session

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`void`\>

***

### get()

> **get**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Defined in: [core/router/src/session-store.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L24)

Retrieve a session if it exists and has not expired

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Promise resolving to session data if found and valid, undefined otherwise

***

### getAll()

> **getAll**(): `Promise`\<`Map`\<`string`, [`SessionData`](SessionData.md)\>\>

Defined in: [core/router/src/session-store.ts:30](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L30)

Get all non-expired sessions

#### Returns

`Promise`\<`Map`\<`string`, [`SessionData`](SessionData.md)\>\>

Promise resolving to Map of session IDs to session data

***

### set()

> **set**(`sessionId`, `data`): `Promise`\<`void`\>

Defined in: [core/router/src/session-store.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L17)

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

***

### validateAndRefresh()

> **validateAndRefresh**(`sessionId`): `Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Defined in: [core/router/src/session-store.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/session-store.ts#L48)

Validate a session and optionally refresh its expiry

#### Parameters

##### sessionId

`string`

Unique session identifier

#### Returns

`Promise`\<`undefined` \| [`SessionData`](SessionData.md)\>

Promise resolving to session data if valid, undefined if expired or not found
