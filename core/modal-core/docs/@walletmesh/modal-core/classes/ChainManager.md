[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainManager

# Class: ChainManager

Framework-agnostic chain management utilities

Provides utilities for switching chains, adding new chains,
and validating chain configurations consistently across
all framework packages.

## Constructors

### Constructor

> **new ChainManager**(`provider`, `supportedChains`): `ChainManager`

#### Parameters

##### provider

`unknown`

##### supportedChains

`string`[] = `[]`

#### Returns

`ChainManager`

## Methods

### addChain()

> **addChain**(`chainInfo`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Add a new blockchain network to the wallet

#### Parameters

##### chainInfo

[`ChainManagerConfig`](../interfaces/ChainManagerConfig.md)

Chain configuration information

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Throws

Error if provider doesn't support adding chains

***

### isChainSupported()

> **isChainSupported**(`chainId`): `boolean`

Check if a chain is supported by this instance

#### Parameters

##### chainId

`string`

The chain ID to check (CAIP-2 format)

#### Returns

`boolean`

True if the chain is supported

***

### switchChain()

> **switchChain**(`chainId`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Switch to a different blockchain network

#### Parameters

##### chainId

`string`

The chain ID to switch to

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

#### Throws

Error if provider doesn't support switching or chain is not supported

***

### getAllChainConfigs()

> `static` **getAllChainConfigs**(): [`ChainManagerConfig`](../interfaces/ChainManagerConfig.md)[]

Get all available chain configurations

#### Returns

[`ChainManagerConfig`](../interfaces/ChainManagerConfig.md)[]

Array of all chain configurations

***

### getChainConfig()

> `static` **getChainConfig**(`chainId`): `null` \| [`ChainManagerConfig`](../interfaces/ChainManagerConfig.md)

Get chain configuration by ID

#### Parameters

##### chainId

`string`

The chain ID to get configuration for

#### Returns

`null` \| [`ChainManagerConfig`](../interfaces/ChainManagerConfig.md)

Chain configuration or null if not found
