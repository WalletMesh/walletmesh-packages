[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ServiceRegistry

# Class: ServiceRegistry

Registry for managing business logic services

Services are stateless and provide pure business logic.
State coordination is handled by the WalletMeshClient.

Refactored architecture (9 focused services):
- ConnectionService: Handles connection/disconnection lifecycle only
- SessionService: Manages sessions and accounts
- HealthService: Monitors health and provides recovery
- UIService: Manages UI state and display logic
- PreferenceService: Handles user preferences
- ChainService: Manages chains and switching
- TransactionService: Handles transactions
- BalanceService: Manages balance queries
- DAppRpcService: Handles dApp RPC communication

## Constructors

### Constructor

> **new ServiceRegistry**(`logger`, `store?`): `ServiceRegistry`

#### Parameters

##### logger

[`Logger`](Logger.md)

##### store?

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

#### Returns

`ServiceRegistry`

## Methods

### dispose()

> **dispose**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Dispose all services and cleanup resources

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### get()

> **get**\<`T`\>(`name`): `T`

Get a service by name

#### Type Parameters

##### T

`T`

#### Parameters

##### name

`string`

#### Returns

`T`

***

### getQueryManager()

> **getQueryManager**(): `undefined` \| [`QueryManager`](QueryManager.md)

Get query manager instance

#### Returns

`undefined` \| [`QueryManager`](QueryManager.md)

***

### getServiceNames()

> **getServiceNames**(): `string`[]

Get all service names

#### Returns

`string`[]

***

### getServices()

> **getServices**(): `object`

Get typed service instances for easy access

#### Returns

`object`

##### balance

> **balance**: [`BalanceService`](BalanceService.md)

##### chain

> **chain**: [`ChainService`](ChainService.md)

##### connection

> **connection**: [`ConnectionService`](ConnectionService.md)

##### dappRpc

> **dappRpc**: [`DAppRpcService`](DAppRpcService.md)

##### health

> **health**: [`HealthService`](HealthService.md)

##### preference

> **preference**: [`WalletPreferenceService`](WalletPreferenceService.md)

##### session

> **session**: [`SessionService`](SessionService.md)

##### transaction

> **transaction**: [`TransactionService`](TransactionService.md)

##### ui

> **ui**: [`UIService`](UIService.md)

***

### getServiceStats()

> **getServiceStats**(): `object`

Get service statistics

#### Returns

`object`

##### initialized

> **initialized**: `boolean`

##### serviceNames

> **serviceNames**: `string`[]

##### totalServices

> **totalServices**: `number`

***

### getStore()

> **getStore**(): `StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

Get the store instance

#### Returns

`StoreApi`\<[`WalletMeshState`](../interfaces/WalletMeshState.md)\>

***

### has()

> **has**(`name`): `boolean`

Check if a service exists

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### initialize()

> **initialize**(`config`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initialize all services with the provided configuration

#### Parameters

##### config

[`ServicesConfig`](../interfaces/ServicesConfig.md) = `{}`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
