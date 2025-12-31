[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / connectionActions

# Variable: connectionActions

> `const` **connectionActions**: `object`

Connection action functions

## Type Declaration

### addDiscoveredWallet()

> **addDiscoveredWallet**: (`store`, `wallet`) => `void`

Add a discovered wallet to the state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

#### Returns

`void`

### addWallet()

> **addWallet**: (`store`, `wallet`) => `void`

Add a wallet to the state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### wallet

[`WalletInfo`](../interfaces/WalletInfo.md)

#### Returns

`void`

### clearAll()

> **clearAll**: (`store`) => `void`

Clear all connections

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`void`

### createSession()

> **createSession**: (`store`, `params`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](../interfaces/SessionState.md)\>

Create a new session

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### params

[`CreateSessionParams`](../interfaces/CreateSessionParams.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](../interfaces/SessionState.md)\>

### endSession()

> **endSession**: (`store`, `sessionId`, `_options?`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

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

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

### getActiveSession()

> **getActiveSession**: (`store`) => `null` \| [`SessionState`](../interfaces/SessionState.md)

Get active session from state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`null` \| [`SessionState`](../interfaces/SessionState.md)

### getSessionsByWallet()

> **getSessionsByWallet**: (`store`, `walletId`) => [`SessionState`](../interfaces/SessionState.md)[]

Get sessions by wallet ID

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

[`SessionState`](../interfaces/SessionState.md)[]

### getWalletSessions()

> **getWalletSessions**: (`store`, `walletId`) => [`SessionState`](../interfaces/SessionState.md)[]

Get wallet sessions (alias for getSessionsByWallet)

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

[`SessionState`](../interfaces/SessionState.md)[]

### markWalletAvailable()

> **markWalletAvailable**: (`store`, `walletId`) => `void`

Mark a wallet as available

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

`void`

### removeWallet()

> **removeWallet**: (`store`, `walletId`) => `void`

Remove a wallet from the state

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### walletId

`string`

#### Returns

`void`

### switchChain()

> **switchChain**: (`store`, `sessionId`, `chainId`) => [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SessionState`](../interfaces/SessionState.md)\>

Switch chain for a session

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SessionState`](../interfaces/SessionState.md)\>

### switchToSession()

> **switchToSession**: (`store`, `sessionId`) => `void`

Switch to a different active session

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

#### Returns

`void`

### updateSessionChain()

> **updateSessionChain**: (`store`, `sessionId`, `chain`) => `undefined` \| [`SessionState`](../interfaces/SessionState.md)

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

### updateSessionMetadata()

> **updateSessionMetadata**: (`store`, `sessionId`, `metadata`) => `void`

Update session metadata

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### metadata

`Partial`\<[`SessionStateMetadata`](../interfaces/SessionStateMetadata.md)\>

#### Returns

`void`

### updateSessionStatus()

> **updateSessionStatus**: (`store`, `sessionId`, `status`) => `void`

Update session status

#### Parameters

##### store

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

##### sessionId

`string`

##### status

`SessionStatus`

#### Returns

`void`
