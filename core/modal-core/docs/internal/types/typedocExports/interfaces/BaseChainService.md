[**@walletmesh/modal-core v0.0.1**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / BaseChainService

# Abstract Interface: BaseChainService

Abstract base class for chain-specific service implementations

Each blockchain gets its own implementation that handles the specific
RPC calls, data structures, and behaviors for that chain.

## Properties

### chainType

> `protected` **chainType**: [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

***

### logger

> `protected` **logger**: [`Logger`](../../../../@walletmesh/modal-core/classes/Logger.md)

## Methods

### estimateGas()

> `abstract` **estimateGas**(`provider`, `params`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Estimate gas for a transaction

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### params

[`ChainTransactionParams`](ChainTransactionParams.md)

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### formatBalance()

> `protected` **formatBalance**(`value`, `decimals`): `string`

Format balance for display

#### Parameters

##### value

`bigint`

##### decimals

`number`

#### Returns

`string`

***

### getChainType()

> **getChainType**(): [`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

Get chain type

#### Returns

[`ChainType`](../../../../@walletmesh/modal-core/enumerations/ChainType.md)

***

### getGasPrice()

> `abstract` **getGasPrice**(`provider`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

Get current gas price

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`\>

***

### getNativeBalance()

> `abstract` **getNativeBalance**(`provider`, `address`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

Get native balance for an address

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### address

`string`

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

***

### getTokenBalance()

> `abstract` **getTokenBalance**(`provider`, `address`, `chainId`, `token`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

Get token balance for an address

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### address

`string`

##### chainId

`string`

##### token

[`ChainTokenInfo`](ChainTokenInfo.md)

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainBalanceInfo`](ChainBalanceInfo.md)\>

***

### getTokenMetadata()

> `abstract` **getTokenMetadata**(`provider`, `tokenAddress`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `decimals`: `number`; `name`: `string`; `symbol`: `string`; \}\>

Get token metadata (symbol, decimals, name)

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### tokenAddress

`string`

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\{ `decimals`: `number`; `name`: `string`; `symbol`: `string`; \}\>

***

### getTransactionReceipt()

> `abstract` **getTransactionReceipt**(`provider`, `hash`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`ChainTransactionResult`](ChainTransactionResult.md)\>

Get transaction receipt

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### hash

`string`

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`null` \| [`ChainTransactionResult`](ChainTransactionResult.md)\>

***

### sendTransaction()

> `abstract` **sendTransaction**(`provider`, `params`, `chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainTransactionResult`](ChainTransactionResult.md)\>

Send a transaction

#### Parameters

##### provider

[`BlockchainProvider`](../../../../@walletmesh/modal-core/interfaces/BlockchainProvider.md)

##### params

[`ChainTransactionParams`](ChainTransactionParams.md)

##### chainId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`ChainTransactionResult`](ChainTransactionResult.md)\>

***

### supportsChain()

> `abstract` **supportsChain**(`chainId`): `boolean`

Check if this service supports the given chain

#### Parameters

##### chainId

`string`

#### Returns

`boolean`
