[**@walletmesh/modal-core v0.0.1**](../README.md)

***

[@walletmesh/modal-core](../globals.md) / SessionStore

# Interface: SessionStore

Defined in: [store/sessionStore.ts:13](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/store/sessionStore.ts#L13)

Interface for session store state and actions

## Properties

### clearSessions()

> **clearSessions**: () => `void`

Defined in: [store/sessionStore.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/store/sessionStore.ts#L23)

Clears all sessions

#### Returns

`void`

***

### getSession()

> **getSession**: (`id`) => `undefined` \| [`WalletSession`](WalletSession.md)

Defined in: [store/sessionStore.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/store/sessionStore.ts#L15)

Gets a specific session

#### Parameters

##### id

`string`

#### Returns

`undefined` \| [`WalletSession`](WalletSession.md)

***

### getSessions()

> **getSessions**: () => [`WalletSession`](WalletSession.md)[]

Defined in: [store/sessionStore.ts:17](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/store/sessionStore.ts#L17)

Gets all sessions

#### Returns

[`WalletSession`](WalletSession.md)[]

***

### removeSession()

> **removeSession**: (`id`) => `void`

Defined in: [store/sessionStore.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/store/sessionStore.ts#L21)

Removes a session

#### Parameters

##### id

`string`

#### Returns

`void`

***

### sessions

> `readonly` **sessions**: `Map`\<`string`, [`WalletSession`](WalletSession.md)\>

Defined in: [store/sessionStore.ts:25](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/store/sessionStore.ts#L25)

Internal state

***

### setSession()

> **setSession**: (`id`, `session`) => `void`

Defined in: [store/sessionStore.ts:19](https://github.com/WalletMesh/walletmesh-packages/blob/2d1a51a05e1ce8a2e9b7feb62d8446265ecc1275/core/modal-core/src/store/sessionStore.ts#L19)

Sets a session

#### Parameters

##### id

`string`

##### session

[`WalletSession`](WalletSession.md)

#### Returns

`void`
