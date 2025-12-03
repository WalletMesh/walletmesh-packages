[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / connectionActions

# Type Alias: connectionActions

> **connectionActions** = `object`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:13

Connection action functions

## Properties

### addDiscoveredWallet()

> **addDiscoveredWallet**: (`store`, `wallet`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:63

Add a discovered wallet to the state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

#### Returns

`void`

***

### addWallet()

> **addWallet**: (`store`, `wallet`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:51

Add a wallet to the state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

#### Returns

`void`

***

### clearAll()

> **clearAll**: (`store`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:75

Clear all connections

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

***

### createSession()

> **createSession**: (`store`, `params`) => `Promise`\<[`SessionState`](../interfaces/SessionState.md)\>

Defined in: core/modal-core/dist/state/actions/connections.d.ts:17

Create a new session

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### params

[`CreateSessionParams`](../interfaces/CreateSessionParams.md)

#### Returns

`Promise`\<[`SessionState`](../interfaces/SessionState.md)\>

***

### endSession()

> **endSession**: (`store`, `sessionId`, `_options?`) => `Promise`\<`void`\>

Defined in: core/modal-core/dist/state/actions/connections.d.ts:21

End a session

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### \_options?

###### isDisconnect?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### getActiveSession()

> **getActiveSession**: (`store`) => `null` \| [`SessionState`](../interfaces/SessionState.md)

Defined in: core/modal-core/dist/state/actions/connections.d.ts:35

Get active session from state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`null` \| [`SessionState`](../interfaces/SessionState.md)

***

### getSessionsByWallet()

> **getSessionsByWallet**: (`store`, `walletId`) => [`SessionState`](../interfaces/SessionState.md)[]

Defined in: core/modal-core/dist/state/actions/connections.d.ts:39

Get sessions by wallet ID

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

[`SessionState`](../interfaces/SessionState.md)[]

***

### getWalletSessions()

> **getWalletSessions**: (`store`, `walletId`) => [`SessionState`](../interfaces/SessionState.md)[]

Defined in: core/modal-core/dist/state/actions/connections.d.ts:43

Get wallet sessions (alias for getSessionsByWallet)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

[`SessionState`](../interfaces/SessionState.md)[]

***

### markWalletAvailable()

> **markWalletAvailable**: (`store`, `walletId`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:71

Mark a wallet as available

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

`void`

***

### removeWallet()

> **removeWallet**: (`store`, `walletId`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:67

Remove a wallet from the state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

`void`

***

### switchChain()

> **switchChain**: (`store`, `sessionId`, `chainId`) => `Promise`\<`null` \| [`SessionState`](../interfaces/SessionState.md)\>

Defined in: core/modal-core/dist/state/actions/connections.d.ts:47

Switch chain for a session

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### chainId

`string`

#### Returns

`Promise`\<`null` \| [`SessionState`](../interfaces/SessionState.md)\>

***

### switchToSession()

> **switchToSession**: (`store`, `sessionId`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:27

Switch to a different active session

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

#### Returns

`void`

***

### updateSessionChain()

> **updateSessionChain**: (`store`, `sessionId`, `chain`) => `undefined` \| [`SessionState`](../interfaces/SessionState.md)

Defined in: core/modal-core/dist/state/actions/connections.d.ts:59

Update session chain

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### chain

`Partial`\<[`ChainSessionInfo`](../interfaces/ChainSessionInfo.md)\>

#### Returns

`undefined` \| [`SessionState`](../interfaces/SessionState.md)

***

### updateSessionMetadata()

> **updateSessionMetadata**: (`store`, `sessionId`, `metadata`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:55

Update session metadata

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### metadata

`Partial`\<`SessionStateMetadata`\>

#### Returns

`void`

***

### updateSessionStatus()

> **updateSessionStatus**: (`store`, `sessionId`, `status`) => `void`

Defined in: core/modal-core/dist/state/actions/connections.d.ts:31

Update session status

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### status

[`SessionStatus`](SessionStatus.md)

#### Returns

`void`
