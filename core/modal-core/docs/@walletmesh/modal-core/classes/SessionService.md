[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionService

# Class: SessionService

Session management service

Handles session lifecycle, validation, and account management.
Uses the store as the single source of truth.

## Constructors

### Constructor

> **new SessionService**(`dependencies`): `SessionService`

#### Parameters

##### dependencies

[`SessionServiceDependencies`](../interfaces/SessionServiceDependencies.md)

#### Returns

`SessionService`

## Methods

### clearSessions()

> **clearSessions**(): `void`

Clear all sessions

#### Returns

`void`

***

### createSession()

> **createSession**(`context`, `metadata`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SessionInfo`](../interfaces/SessionInfo.md)\>

Create a new session

#### Parameters

##### context

[`SessionCreationContext`](../interfaces/SessionCreationContext.md)

##### metadata

[`SessionMetadata`](../interfaces/SessionMetadata.md) = `{}`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`SessionInfo`](../interfaces/SessionInfo.md)\>

***

### deleteSession()

> **deleteSession**(`sessionId`): `boolean`

Delete session

#### Parameters

##### sessionId

`string`

#### Returns

`boolean`

***

### formatAddress()

> **formatAddress**(`address`, `format`): `string`

Format address for display

#### Parameters

##### address

`string`

##### format

[`AddressFormat`](../type-aliases/AddressFormat.md) = `'short'`

#### Returns

`string`

***

### getAccountDisplayInfo()

> **getAccountDisplayInfo**(`session`): `null` \| [`AccountDisplayInfo`](../interfaces/AccountDisplayInfo.md)

Get account display information

#### Parameters

##### session

[`SessionInfo`](../interfaces/SessionInfo.md)

#### Returns

`null` \| [`AccountDisplayInfo`](../interfaces/AccountDisplayInfo.md)

***

### getActiveSession()

> **getActiveSession**(): `null` \| [`SessionInfo`](../interfaces/SessionInfo.md)

Get active session

#### Returns

`null` \| [`SessionInfo`](../interfaces/SessionInfo.md)

***

### getAllSessions()

> **getAllSessions**(): [`SessionInfo`](../interfaces/SessionInfo.md)[]

Get all sessions

#### Returns

[`SessionInfo`](../interfaces/SessionInfo.md)[]

***

### getSession()

> **getSession**(`sessionId`): `null` \| [`SessionInfo`](../interfaces/SessionInfo.md)

Get session by ID

#### Parameters

##### sessionId

`string`

#### Returns

`null` \| [`SessionInfo`](../interfaces/SessionInfo.md)

***

### getSessionsByWallet()

> **getSessionsByWallet**(`walletId`): [`SessionInfo`](../interfaces/SessionInfo.md)[]

Get sessions by wallet ID

#### Parameters

##### walletId

`string`

#### Returns

[`SessionInfo`](../interfaces/SessionInfo.md)[]

***

### getSessionStats()

> **getSessionStats**(): `object`

Get session statistics

#### Returns

`object`

##### activeSessions

> **activeSessions**: `number`

##### connectedSessions

> **connectedSessions**: `number`

##### inactiveSessions

> **inactiveSessions**: `number`

##### totalSessions

> **totalSessions**: `number`

***

### isValidConnectedSession()

> **isValidConnectedSession**(`session`): `boolean`

Check if session is valid and connected

#### Parameters

##### session

`null` | [`SessionInfo`](../interfaces/SessionInfo.md)

#### Returns

`boolean`

***

### setActiveSession()

> **setActiveSession**(`sessionId`): `boolean`

Set active session

#### Parameters

##### sessionId

`string`

#### Returns

`boolean`

***

### touchSession()

> **touchSession**(`sessionId`): `void`

Update session activity timestamp

#### Parameters

##### sessionId

`string`

#### Returns

`void`

***

### updateSession()

> **updateSession**(`sessionId`, `updates`): `boolean`

Update session

#### Parameters

##### sessionId

`string`

##### updates

`Partial`\<[`SessionInfo`](../interfaces/SessionInfo.md)\>

#### Returns

`boolean`

***

### validateSession()

> **validateSession**(`session`, `maxInactivityMs`): [`SessionValidationResult`](../interfaces/SessionValidationResult.md)

Validate session

#### Parameters

##### session

[`SessionInfo`](../interfaces/SessionInfo.md)

##### maxInactivityMs

`number` = `...`

#### Returns

[`SessionValidationResult`](../interfaces/SessionValidationResult.md)
