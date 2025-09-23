[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ChainServiceRegistry

# Interface: ChainServiceRegistry

Registry for managing chain-specific service implementations

Provides lazy loading, caching, and a unified interface for accessing
blockchain-specific operations across different chains.

## Methods

### clearCache()

> **clearCache**(`chainType?`): `void`

Clear cached services

#### Parameters

##### chainType?

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Cleanup and destroy the registry

#### Returns

`void`

***

### dispose()

> **dispose**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Dispose of all chain services and cleanup resources

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### getChainService()

> **getChainService**(`chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BaseChainService`](BaseChainService.md)\>

Get a chain service for the given chain ID

#### Parameters

##### chainId

`string` | `number`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BaseChainService`](BaseChainService.md)\>

***

### getNativeBalance()

> **getNativeBalance**(`provider`, `address`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

Get native balance using the appropriate chain service

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### address

`string`

##### chainId

`string` | `number`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

***

### getService()

> **getService**(`chainType`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BaseChainService`](BaseChainService.md)\>

Get a chain service by chain type (for testing/compatibility)

#### Parameters

##### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`BaseChainService`](BaseChainService.md)\>

***

### getServiceStatus()

> **getServiceStatus**(`chainType`): [`ChainServiceStatus`](ChainServiceStatus.md)

Get status of a chain service

#### Parameters

##### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

#### Returns

[`ChainServiceStatus`](ChainServiceStatus.md)

***

### getTokenBalance()

> **getTokenBalance**(`provider`, `address`, `chainId`, `token`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

Get token balance using the appropriate chain service

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### address

`string`

##### chainId

`string` | `number`

##### token

[`ChainTokenInfo`](ChainTokenInfo.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

***

### getTransactionReceipt()

> **getTransactionReceipt**(`provider`, `hash`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`ChainTransactionResult`](ChainTransactionResult.md)\>

Get transaction receipt using the appropriate chain service

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### hash

`string`

##### chainId

`string` | `number`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`ChainTransactionResult`](ChainTransactionResult.md)\>

***

### initialize()

> **initialize**(): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Initialize the registry and optionally preload services

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### preloadServices()

> **preloadServices**(`chainTypes`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Preload specific chain services

#### Parameters

##### chainTypes

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)[]

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### registerChainService()

> **registerChainService**(`chainType`, `loader`, `replace`): `void`

Register a custom chain service

#### Parameters

##### chainType

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

##### loader

[`ChainServiceLoader`](../type-aliases/ChainServiceLoader.md)

##### replace

`boolean` = `false`

#### Returns

`void`

***

### sendTransaction()

> **sendTransaction**(`provider`, `params`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainTransactionResult`](ChainTransactionResult.md)\>

Send transaction using the appropriate chain service

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### params

[`ChainTransactionParams`](ChainTransactionParams.md)

##### chainId

`string` | `number`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainTransactionResult`](ChainTransactionResult.md)\>
