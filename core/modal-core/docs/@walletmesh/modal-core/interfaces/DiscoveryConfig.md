[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveryConfig

# Interface: DiscoveryConfig

Unified discovery configuration options
Combines all functionality from the previous discovery services

## Extended by

- [`CustomDiscoveryConfig`](CustomDiscoveryConfig.md)

## Properties

### announce?

> `optional` **announce**: `boolean`

Whether to announce this dApp to wallets

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

***

### dappInfo?

> `optional` **dappInfo**: `Partial`\<[`DAppInfo`](DAppInfo.md)\>

DApp information for discovery

***

### enabled?

> `optional` **enabled**: `boolean`

Whether discovery is enabled

***

### endpoints?

> `optional` **endpoints**: `string`[]

Custom discovery endpoints

***

### maxAttempts?

> `optional` **maxAttempts**: `number`

Maximum number of discovery attempts

***

### retryInterval?

> `optional` **retryInterval**: `number`

Retry interval for periodic discovery

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

***

### supportedChainTypes?

> `optional` **supportedChainTypes**: [`ChainType`](../enumerations/ChainType.md)[]

Supported chain types for filtering

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

***

### timeout?

> `optional` **timeout**: `number`

Discovery timeout in milliseconds

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
