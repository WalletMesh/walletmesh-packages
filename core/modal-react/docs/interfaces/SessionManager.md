[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionManager

# Interface: SessionManager

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:314

Session manager interface for unified session operations

## Methods

### addAccount()

> **addAccount**(`sessionId`, `account`): `Promise`\<[`SessionState`](SessionState.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:350

Add a new account to a session

#### Parameters

##### sessionId

`string`

##### account

`AccountInfo`

#### Returns

`Promise`\<[`SessionState`](SessionState.md)\>

***

### cleanupExpiredSessions()

> **cleanupExpiredSessions**(): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:374

Clean up expired sessions

#### Returns

`Promise`\<`void`\>

***

### compareSessions()

> **compareSessions**(`sessionId1`, `sessionId2`): `null` \| [`SessionComparison`](SessionComparison.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:370

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

> **createSession**(`params`): `Promise`\<[`SessionState`](SessionState.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:318

Create a new session

#### Parameters

##### params

[`CreateSessionParams`](CreateSessionParams.md)

#### Returns

`Promise`\<[`SessionState`](SessionState.md)\>

***

### discoverAccounts()

> **discoverAccounts**(`sessionId`, `options?`): `Promise`\<`AccountInfo`[]\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:346

Discover additional accounts for a session

#### Parameters

##### sessionId

`string`

##### options?

[`AccountDiscoveryOptions`](AccountDiscoveryOptions.md)

#### Returns

`Promise`\<`AccountInfo`[]\>

***

### endSession()

> **endSession**(`sessionId`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:366

End a session

#### Parameters

##### sessionId

`string`

#### Returns

`Promise`\<`void`\>

***

### getActiveAccount()

> **getActiveAccount**(`sessionId`): `null` \| `AccountInfo`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:362

Get active account for a session

#### Parameters

##### sessionId

`string`

#### Returns

`null` \| `AccountInfo`

***

### getActiveSession()

> **getActiveSession**(): `null` \| [`SessionState`](SessionState.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:326

Get active session

#### Returns

`null` \| [`SessionState`](SessionState.md)

***

### getSession()

> **getSession**(`sessionId`): `null` \| [`SessionState`](SessionState.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:322

Get session by ID

#### Parameters

##### sessionId

`string`

#### Returns

`null` \| [`SessionState`](SessionState.md)

***

### getSessionAccounts()

> **getSessionAccounts**(`sessionId`): `AccountInfo`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:358

Get all accounts for a session

#### Parameters

##### sessionId

`string`

#### Returns

`AccountInfo`[]

***

### getWalletSessions()

> **getWalletSessions**(`walletId`): [`SessionState`](SessionState.md)[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:330

Get all sessions for a wallet

#### Parameters

##### walletId

`string`

#### Returns

[`SessionState`](SessionState.md)[]

***

### removeAccount()

> **removeAccount**(`sessionId`, `accountAddress`): `Promise`\<[`SessionState`](SessionState.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:354

Remove an account from a session

#### Parameters

##### sessionId

`string`

##### accountAddress

`string`

#### Returns

`Promise`\<[`SessionState`](SessionState.md)\>

***

### switchAccount()

> **switchAccount**(`sessionId`, `accountAddress`): `Promise`\<[`SessionState`](SessionState.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:342

Switch active account within a session

#### Parameters

##### sessionId

`string`

##### accountAddress

`string`

#### Returns

`Promise`\<[`SessionState`](SessionState.md)\>

***

### switchChain()

> **switchChain**(`sessionId`, `chain`): `Promise`\<[`SessionState`](SessionState.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:338

Switch chain within a session (creates new session if needed)

#### Parameters

##### sessionId

`string`

##### chain

###### chainId

`string`

###### chainType

[`ChainType`](../enumerations/ChainType.md)

###### group?

`string`

###### icon?

`string`

###### interfaces?

`string`[]

###### label?

`string`

###### name

`string`

###### required

`boolean`

#### Returns

`Promise`\<[`SessionState`](SessionState.md)\>

***

### updateSessionStatus()

> **updateSessionStatus**(`sessionId`, `status`): `void`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:334

Update session status

#### Parameters

##### sessionId

`string`

##### status

`SessionStatus`

#### Returns

`void`
