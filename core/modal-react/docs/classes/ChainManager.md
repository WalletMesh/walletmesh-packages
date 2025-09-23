[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainManager

# Class: ChainManager

Defined in: core/modal-core/dist/internal/utils/chainManager.d.ts:46

Framework-agnostic chain management utilities

Provides utilities for switching chains, adding new chains,
and validating chain configurations consistently across
all framework packages.

## Constructors

### Constructor

> **new ChainManager**(`provider`, `supportedChains?`): `ChainManager`

Defined in: core/modal-core/dist/internal/utils/chainManager.d.ts:49

#### Parameters

##### provider

`unknown`

##### supportedChains?

`string`[]

#### Returns

`ChainManager`

## Methods

### addChain()

> **addChain**(`chainInfo`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/utils/chainManager.d.ts:61

Add a new blockchain network to the wallet

#### Parameters

##### chainInfo

`ChainManagerConfig`

Chain configuration information

#### Returns

`Promise`\<`void`\>

#### Throws

Error if provider doesn't support adding chains

***

### isChainSupported()

> **isChainSupported**(`chainId`): `boolean`

Defined in: core/modal-core/dist/internal/utils/chainManager.d.ts:67

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

> **switchChain**(`chainId`): `Promise`\<`void`\>

Defined in: core/modal-core/dist/internal/utils/chainManager.d.ts:55

Switch to a different blockchain network

#### Parameters

##### chainId

`string`

The chain ID to switch to

#### Returns

`Promise`\<`void`\>

#### Throws

Error if provider doesn't support switching or chain is not supported

***

### getAllChainConfigs()

> `static` **getAllChainConfigs**(): `ChainManagerConfig`[]

Defined in: core/modal-core/dist/internal/utils/chainManager.d.ts:78

Get all available chain configurations

#### Returns

`ChainManagerConfig`[]

Array of all chain configurations

***

### getChainConfig()

> `static` **getChainConfig**(`chainId`): `null` \| `ChainManagerConfig`

Defined in: core/modal-core/dist/internal/utils/chainManager.d.ts:73

Get chain configuration by ID

#### Parameters

##### chainId

`string`

The chain ID to get configuration for

#### Returns

`null` \| `ChainManagerConfig`

Chain configuration or null if not found
