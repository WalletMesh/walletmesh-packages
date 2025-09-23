[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionService

# Class: ConnectionService

Connection service for managing wallet connections

Handles the connection lifecycle and coordinates with other services.

## Constructors

### Constructor

> **new ConnectionService**(`dependencies`, `config`): `ConnectionService`

#### Parameters

##### dependencies

[`ConnectionServiceDependencies`](../interfaces/ConnectionServiceDependencies.md)

##### config

[`ConnectionConfig`](../interfaces/ConnectionConfig.md) = `{}`

#### Returns

`ConnectionService`

## Methods

### autoConnect()

> **autoConnect**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

Auto-connect to preferred wallet

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

***

### calculateRetryDelay()

> **calculateRetryDelay**(`attempt`, `baseDelay`, `maxDelay`): `number`

Calculate retry delay with exponential backoff

#### Parameters

##### attempt

`number`

##### baseDelay

`number` = `1000`

##### maxDelay

`number` = `30000`

#### Returns

`number`

***

### connect()

> **connect**(`options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

Connect to a wallet

#### Parameters

##### options

[`ConnectOptions`](../interfaces/ConnectOptions.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

***

### disconnect()

> **disconnect**(`options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

Disconnect from wallet

#### Parameters

##### options

[`DisconnectOptions`](../interfaces/DisconnectOptions.md) = `{}`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

***

### extractConnectionVariables()

> **extractConnectionVariables**(`isConnecting`, `walletId`, `chainId?`): `undefined` \| \{ `chain?`: `string`; `walletId`: `string`; \}

Extract connection variables for UI

#### Parameters

##### isConnecting

`boolean`

##### walletId

`null` | `string`

##### chainId?

`string`

#### Returns

`undefined` \| \{ `chain?`: `string`; `walletId`: `string`; \}

***

### generateConnectionProgress()

> **generateConnectionProgress**(`step`, `walletId?`, `details?`): `object`

Generate connection progress information

#### Parameters

##### step

`string`

##### walletId?

`string`

##### details?

`string`

#### Returns

`object`

##### details?

> `optional` **details**: `string`

##### progress

> **progress**: `number`

##### step

> **step**: `string`

***

### generateDisconnectionReason()

> **generateDisconnectionReason**(`type`, `details?`): `string`

Generate disconnection reason

#### Parameters

##### type

`string`

##### details?

`string`

#### Returns

`string`

***

### getActiveSession()

> **getActiveSession**(): `null` \| [`SessionInfo`](../interfaces/SessionInfo.md)

Get active session

#### Returns

`null` \| [`SessionInfo`](../interfaces/SessionInfo.md)

***

### getConnectionStatus()

> **getConnectionStatus**(): [`ConnectionStatus`](../enumerations/ConnectionStatus.md)

Get connection status

#### Returns

[`ConnectionStatus`](../enumerations/ConnectionStatus.md)

***

### isConnected()

> **isConnected**(): `boolean`

Check if connected

#### Returns

`boolean`

***

### reconnect()

> **reconnect**(`options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

Reconnect to wallet

#### Parameters

##### options

`Partial`\<[`ConnectOptions`](../interfaces/ConnectOptions.md)\> = `{}`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

***

### switchAccount()

> **switchAccount**(`account`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

Switch account

#### Parameters

##### account

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ConnectionServiceResult`](../interfaces/ConnectionServiceResult.md)\>

***

### validateConnectionEstablished()

> **validateConnectionEstablished**(`result`, `expectedWalletId?`): `object`

Validate connection establishment result

#### Parameters

##### result

`unknown`

##### expectedWalletId?

`string`

#### Returns

`object`

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

***

### validateConnectionParams()

> **validateConnectionParams**(`walletId?`, `options?`): `object`

Validate connection parameters (test-compatible version)

#### Parameters

##### walletId?

`string`

##### options?

[`ConnectOptions`](../interfaces/ConnectOptions.md) & `object`

#### Returns

`object`

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

***

### validateDisconnectionSafety()

> **validateDisconnectionSafety**(`sessions`, `targetWalletId?`, `options?`): `object`

Validate disconnection safety

#### Parameters

##### sessions

[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`SessionInfo`](../interfaces/SessionInfo.md)\>

##### targetWalletId?

`string`

##### options?

###### force?

`boolean`

#### Returns

`object`

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

##### pendingTransactions?

> `optional` **pendingTransactions**: `number`

***

### validateRetryConditions()

> **validateRetryConditions**(`error`, `attemptCount`, `maxAttempts`): `object`

Validate retry conditions

#### Parameters

##### error

`Error`

##### attemptCount

`number`

##### maxAttempts

`number` = `3`

#### Returns

`object`

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`

***

### validateWalletAvailability()

> **validateWalletAvailability**(`walletId`, `wallets`): `object`

Validate wallet availability

#### Parameters

##### walletId

`string`

##### wallets

[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `unknown`\>

#### Returns

`object`

##### error?

> `optional` **error**: `string`

##### isValid

> **isValid**: `boolean`
