[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ConnectionStateManager

# Class: ConnectionStateManager

Connection state manager for discovery service

## Constructors

### Constructor

> **new ConnectionStateManager**(`logger`): `ConnectionStateManager`

#### Parameters

##### logger

[`Logger`](Logger.md)

#### Returns

`ConnectionStateManager`

## Methods

### clearAllConnectionStates()

> **clearAllConnectionStates**(): `void`

Clear all connection states

#### Returns

`void`

***

### clearConnectionState()

> **clearConnectionState**(`walletId`): `void`

Clear connection state for a wallet

#### Parameters

##### walletId

`string`

#### Returns

`void`

***

### getAllConnectionStates()

> **getAllConnectionStates**(): [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)\>

Get all connection states

#### Returns

[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)\>

***

### getConnectedWallets()

> **getConnectedWallets**(): [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)[]

Get connected wallets

#### Returns

[`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)[]

***

### getConnectionState()

> **getConnectionState**(`walletId`): `undefined` \| [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)

Get connection state for a wallet

#### Parameters

##### walletId

`string`

#### Returns

`undefined` \| [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)

***

### getRecoverableSessions()

> **getRecoverableSessions**(): `object`[]

Get session recovery information

#### Returns

`object`[]

***

### isConnected()

> **isConnected**(`walletId`): `boolean`

Check if wallet is connected

#### Parameters

##### walletId

`string`

#### Returns

`boolean`

***

### onStateChange()

> **onStateChange**(`callback`): () => `void`

Add connection state change listener

#### Parameters

##### callback

(`event`) => `void`

#### Returns

> (): `void`

##### Returns

`void`

***

### restore()

> **restore**(`states`): `void`

Restore connection states from persistence

#### Parameters

##### states

`Record`\<`string`, [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)\>

#### Returns

`void`

***

### serialize()

> **serialize**(): `Record`\<`string`, [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)\>

Serialize connection states for persistence

#### Returns

`Record`\<`string`, [`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)\>

***

### updateConnectionState()

> **updateConnectionState**(`walletId`, `updates`): `void`

Update connection state

#### Parameters

##### walletId

`string`

##### updates

`Partial`\<[`DiscoveryConnectionState`](../interfaces/DiscoveryConnectionState.md)\>

#### Returns

`void`
