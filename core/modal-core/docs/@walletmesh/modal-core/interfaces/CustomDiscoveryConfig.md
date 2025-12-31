[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CustomDiscoveryConfig

# Interface: CustomDiscoveryConfig

Custom discovery configuration with additional options

## Extends

- [`DiscoveryConfig`](DiscoveryConfig.md)

## Properties

### announce?

> `optional` **announce**: `boolean`

Whether to announce this dApp to wallets

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`announce`](DiscoveryConfig.md#announce)

***

### capabilities?

> `optional` **capabilities**: `object`

Legacy capability requirements for discovery (backward compatibility)

#### chains?

> `optional` **chains**: `string`[]

#### features?

> `optional` **features**: `string`[]

#### interfaces?

> `optional` **interfaces**: `string`[]

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`capabilities`](DiscoveryConfig.md#capabilities)

***

### customChains?

> `optional` **customChains**: `string`[]

Custom chain IDs (overrides default mappings)

***

### customFeatures?

> `optional` **customFeatures**: `string`[]

Custom features (overrides defaults)

***

### customInterfaces?

> `optional` **customInterfaces**: `string`[]

Custom interfaces (overrides defaults)

***

### dappInfo?

> `optional` **dappInfo**: `Partial`\<[`DAppInfo`](DAppInfo.md)\>

DApp information for discovery

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`dappInfo`](DiscoveryConfig.md#dappinfo)

***

### enabled?

> `optional` **enabled**: `boolean`

Whether discovery is enabled

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`enabled`](DiscoveryConfig.md#enabled)

***

### endpoints?

> `optional` **endpoints**: `string`[]

Custom discovery endpoints

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`endpoints`](DiscoveryConfig.md#endpoints)

***

### maxAttempts?

> `optional` **maxAttempts**: `number`

Maximum number of discovery attempts

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`maxAttempts`](DiscoveryConfig.md#maxattempts)

***

### retryInterval?

> `optional` **retryInterval**: `number`

Retry interval for periodic discovery

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`retryInterval`](DiscoveryConfig.md#retryinterval)

***

### security?

> `optional` **security**: `object`

Security configuration

#### enableOriginValidation?

> `optional` **enableOriginValidation**: `boolean`

Enable origin validation

#### enableRateLimiting?

> `optional` **enableRateLimiting**: `boolean`

Enable rate limiting

#### enableSessionSecurity?

> `optional` **enableSessionSecurity**: `boolean`

Enable session security

#### originValidation?

> `optional` **originValidation**: [`OriginValidationConfig`](OriginValidationConfig.md)

Origin validation config

#### rateLimit?

> `optional` **rateLimit**: [`RateLimitConfig`](RateLimitConfig.md)

Rate limit config

#### sessionSecurity?

> `optional` **sessionSecurity**: [`SessionSecurityConfig`](SessionSecurityConfig.md)

Session security config

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`security`](DiscoveryConfig.md#security)

***

### supportedChainTypes?

> `optional` **supportedChainTypes**: [`ChainType`](../enumerations/ChainType.md)[]

Supported chain types for filtering

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`supportedChainTypes`](DiscoveryConfig.md#supportedchaintypes)

***

### technologies?

> `optional` **technologies**: `object`[]

Technology-based requirements for discovery

#### features?

> `optional` **features**: `string`[]

#### interfaces

> **interfaces**: `string`[]

#### type

> **type**: `"evm"` \| `"solana"` \| `"aztec"`

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`technologies`](DiscoveryConfig.md#technologies)

***

### timeout?

> `optional` **timeout**: `number`

Discovery timeout in milliseconds

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`timeout`](DiscoveryConfig.md#timeout)

***

### transport?

> `optional` **transport**: `object`

Transport and adapter configuration for on-demand adapter creation

#### adapterConfig?

> `optional` **adapterConfig**: `object`

Default adapter configuration (used when adapter is created on-demand)

##### adapterConfig.autoConnect?

> `optional` **autoConnect**: `boolean`

##### adapterConfig.retries?

> `optional` **retries**: `number`

##### adapterConfig.retryDelay?

> `optional` **retryDelay**: `number`

##### adapterConfig.timeout?

> `optional` **timeout**: `number`

#### Inherited from

[`DiscoveryConfig`](DiscoveryConfig.md).[`transport`](DiscoveryConfig.md#transport)
