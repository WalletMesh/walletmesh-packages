[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / DiscoveryConfig

# Interface: DiscoveryConfig

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:37

Unified discovery configuration options
Combines all functionality from the previous discovery services

## Properties

### announce?

> `optional` **announce**: `boolean`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:47

Whether to announce this dApp to wallets

***

### capabilities?

> `optional` **capabilities**: `object`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:59

Legacy capability requirements for discovery (backward compatibility)

#### chains?

> `optional` **chains**: `string`[]

#### features?

> `optional` **features**: `string`[]

#### interfaces?

> `optional` **interfaces**: `string`[]

***

### dappInfo?

> `optional` **dappInfo**: `Partial`\<`InitiatorInfo`\>

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:65

DApp information for discovery

***

### enabled?

> `optional` **enabled**: `boolean`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:39

Whether discovery is enabled

***

### endpoints?

> `optional` **endpoints**: `string`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:49

Custom discovery endpoints

***

### maxAttempts?

> `optional` **maxAttempts**: `number`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:45

Maximum number of discovery attempts

***

### retryInterval?

> `optional` **retryInterval**: `number`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:43

Retry interval for periodic discovery

***

### security?

> `optional` **security**: `object`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:67

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

> `optional` **originValidation**: `OriginValidationConfig`

Origin validation config

#### rateLimit?

> `optional` **rateLimit**: `RateLimitConfig`

Rate limit config

#### sessionSecurity?

> `optional` **sessionSecurity**: `SessionSecurityConfig`

Session security config

***

### supportedChainTypes?

> `optional` **supportedChainTypes**: [`ChainType`](../enumerations/ChainType.md)[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:51

Supported chain types for filtering

***

### technologies?

> `optional` **technologies**: `object`[]

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:53

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

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:41

Discovery timeout in milliseconds

***

### transport?

> `optional` **transport**: `object`

Defined in: core/modal-core/dist/client/DiscoveryService.d.ts:82

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
