[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionManager

# Interface: SessionManager

Session manager interface for unified session operations

## Methods

### addAccount()

> **addAccount**(`sessionId`, `account`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

Add a new account to a session

#### Parameters

##### sessionId

`string`

##### account

[`AccountInfo`](AccountInfo.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

***

### cleanupExpiredSessions()

> **cleanupExpiredSessions**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Clean up expired sessions

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### compareSessions()

> **compareSessions**(`sessionId1`, `sessionId2`): `null` \| [`SessionComparison`](SessionComparison.md)

Compare two sessions

#### Parameters

##### sessionId1

`string`

##### sessionId2

`string`

#### Returns

`null` \| [`SessionComparison`](SessionComparison.md)

***

### createSession()

> **createSession**(`params`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

Create a new session

#### Parameters

##### params

[`CreateSessionParams`](CreateSessionParams.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

***

### discoverAccounts()

> **discoverAccounts**(`sessionId`, `options?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AccountInfo`](AccountInfo.md)[]\>

Discover additional accounts for a session

#### Parameters

##### sessionId

`string`

##### options?

[`AccountDiscoveryOptions`](AccountDiscoveryOptions.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AccountInfo`](AccountInfo.md)[]\>

***

### endSession()

> **endSession**(`sessionId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

End a session

#### Parameters

##### sessionId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getActiveAccount()

> **getActiveAccount**(`sessionId`): `null` \| [`AccountInfo`](AccountInfo.md)

Get active account for a session

#### Parameters

##### sessionId

`string`

#### Returns

`null` \| [`AccountInfo`](AccountInfo.md)

***

### getActiveSession()

> **getActiveSession**(): `null` \| [`SessionState`](SessionState.md)

Get active session

#### Returns

`null` \| [`SessionState`](SessionState.md)

***

### getSession()

> **getSession**(`sessionId`): `null` \| [`SessionState`](SessionState.md)

Get session by ID

#### Parameters

##### sessionId

`string`

#### Returns

`null` \| [`SessionState`](SessionState.md)

***

### getSessionAccounts()

> **getSessionAccounts**(`sessionId`): [`AccountInfo`](AccountInfo.md)[]

Get all accounts for a session

#### Parameters

##### sessionId

`string`

#### Returns

[`AccountInfo`](AccountInfo.md)[]

***

### getWalletSessions()

> **getWalletSessions**(`walletId`): [`SessionState`](SessionState.md)[]

Get all sessions for a wallet

#### Parameters

##### walletId

`string`

#### Returns

[`SessionState`](SessionState.md)[]

***

### removeAccount()

> **removeAccount**(`sessionId`, `accountAddress`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

Remove an account from a session

#### Parameters

##### sessionId

`string`

##### accountAddress

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

***

### switchAccount()

> **switchAccount**(`sessionId`, `accountAddress`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

Switch active account within a session

#### Parameters

##### sessionId

`string`

##### accountAddress

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

***

### switchChain()

> **switchChain**(`sessionId`, `chain`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

Switch chain within a session (creates new session if needed)

#### Parameters

##### sessionId

`string`

##### chain

###### chainId

`string` = `caip2Schema`

Chain identifier in CAIP-2 format

###### chainType

[`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

###### group?

`string` = `...`

Grouping identifier for multi-chain scenarios

###### icon?

`string` = `...`

Optional icon URL for the chain

###### interfaces?

`string`[] = `...`

List of required provider interfaces for this chain

###### label?

`string` = `...`

Display label for the chain (optional override of name)

###### name

`string` = `...`

Human-readable name of the chain

###### required

`boolean` = `...`

Whether this chain is required for the dApp to function

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`SessionState`](SessionState.md)\>

***

### updateSessionStatus()

> **updateSessionStatus**(`sessionId`, `status`): `void`

Update session status

#### Parameters

##### sessionId

`string`

##### status

[`SessionStatus`](../type-aliases/SessionStatus.md)

#### Returns

`void`
