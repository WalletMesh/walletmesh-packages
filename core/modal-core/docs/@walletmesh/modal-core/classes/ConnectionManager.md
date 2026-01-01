[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionManager

# Class: ConnectionManager

Connection Manager class for handling wallet connection lifecycle

## Example

```typescript
const connectionManager = new ConnectionManager(sessionManager, logger);

// Enable auto-reconnection for a wallet
connectionManager.setRecoveryOptions('metamask', {
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 3
});

// Listen for connection events
connectionManager.on('connected', (event) => {
  console.log('Wallet connected:', event.walletId);
});

// Connect with recovery
await connectionManager.connectWithRecovery(adapter, options);
```

## Constructors

### Constructor

> **new ConnectionManager**(`_sessionManager`, `logger`): `ConnectionManager`

#### Parameters

##### \_sessionManager

[`SessionManager`](../interfaces/SessionManager.md)

##### logger

[`Logger`](Logger.md)

#### Returns

`ConnectionManager`

## Methods

### connectWithRecovery()

> **connectWithRecovery**(`adapter`, `options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Connect to a wallet with recovery support

#### Parameters

##### adapter

[`WalletAdapter`](../interfaces/WalletAdapter.md)

Wallet adapter to connect with

##### options

`Record`\<`string`, `unknown`\> = `{}`

Connection options

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`WalletConnection`](../interfaces/WalletConnection.md)\>

Promise resolving to wallet connection

***

### destroy()

> **destroy**(): `void`

Clean up connection manager resources

#### Returns

`void`

***

### disconnect()

> **disconnect**(`walletId`, `adapter`, `reason?`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Disconnect from a wallet

#### Parameters

##### walletId

`string`

ID of the wallet to disconnect

##### adapter

[`WalletAdapter`](../interfaces/WalletAdapter.md)

Wallet adapter instance

##### reason?

`string`

Optional reason for disconnection

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when disconnected

***

### getAllConnectionStates()

> **getAllConnectionStates**(): [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`ConnectionState`](../interfaces/ConnectionState.md)\>

Get all connection states

#### Returns

[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`ConnectionState`](../interfaces/ConnectionState.md)\>

Map of wallet IDs to connection states

***

### getConnectionState()

> **getConnectionState**(`walletId`): `undefined` \| [`ConnectionState`](../interfaces/ConnectionState.md)

Get connection state for a wallet

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| [`ConnectionState`](../interfaces/ConnectionState.md)

Connection state or undefined if not tracked

***

### getRecoveryOptions()

> **getRecoveryOptions**(`walletId`): `undefined` \| [`ConnectionRecoveryOptions`](../interfaces/ConnectionRecoveryOptions.md)

Get recovery options for a wallet

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`undefined` \| [`ConnectionRecoveryOptions`](../interfaces/ConnectionRecoveryOptions.md)

Recovery options or undefined if not set

***

### isConnected()

> **isConnected**(`walletId`): `boolean`

Check if a wallet is connected

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`boolean`

True if wallet is connected

***

### on()

> **on**(`event`, `handler`): () => `void`

Subscribe to connection events

#### Parameters

##### event

Event type

`"disconnected"` | `"connecting"` | `"connected"` | `"error"` | `"disconnecting"` | `"recovery_failed"` | `"recovery_started"` | `"recovery_succeeded"`

##### handler

(`event`) => `void`

Event handler

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### once()

> **once**(`event`, `handler`): () => `void`

Subscribe to connection events once

#### Parameters

##### event

Event type

`"disconnected"` | `"connecting"` | `"connected"` | `"error"` | `"disconnecting"` | `"recovery_failed"` | `"recovery_started"` | `"recovery_succeeded"`

##### handler

(`event`) => `void`

Event handler

#### Returns

Unsubscribe function

> (): `void`

##### Returns

`void`

***

### setRecoveryOptions()

> **setRecoveryOptions**(`walletId`, `options`): `void`

Set recovery options for a wallet

#### Parameters

##### walletId

`string`

ID of the wallet

##### options

[`ConnectionRecoveryOptions`](../interfaces/ConnectionRecoveryOptions.md)

Recovery options

#### Returns

`void`

***

### startManualRecovery()

> **startManualRecovery**(`walletId`, `adapter`, `options`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Start recovery for a wallet manually

#### Parameters

##### walletId

`string`

ID of the wallet

##### adapter

[`WalletAdapter`](../interfaces/WalletAdapter.md)

Wallet adapter instance

##### options

`Record`\<`string`, `unknown`\> = `{}`

Connection options

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### stopRecovery()

> **stopRecovery**(`walletId`): `void`

Stop recovery for a wallet

#### Parameters

##### walletId

`string`

ID of the wallet

#### Returns

`void`
