[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RateLimiter

# Class: RateLimiter

Defined in: [core/discovery/src/security.ts:364](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L364)

Rate limiter using sliding window algorithm.

## Since

0.1.0

## Constructors

### Constructor

> **new RateLimiter**(`config?`, `_logger?`): `RateLimiter`

Defined in: [core/discovery/src/security.ts:368](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L368)

#### Parameters

##### config?

[`RateLimitConfig`](../interfaces/RateLimitConfig.md)

##### \_logger?

[`Logger`](../interfaces/Logger.md) = `defaultLogger`

#### Returns

`RateLimiter`

## Methods

### getRequestCount()

> **getRequestCount**(`origin`): `number`

Defined in: [core/discovery/src/security.ts:421](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L421)

Get current request count for an origin.

#### Parameters

##### origin

`string`

#### Returns

`number`

***

### getStats()

> **getStats**(`timestamp`): `object`

Defined in: [core/discovery/src/security.ts:449](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L449)

Get statistics about rate limiting.

#### Parameters

##### timestamp

`number` = `...`

#### Returns

`object`

##### activeOrigins

> **activeOrigins**: `number` = `0`

##### averageRequestsPerOrigin

> **averageRequestsPerOrigin**: `number` = `0`

##### memoryUsage

> **memoryUsage**: `object`

###### memoryUsage.requestMaps

> **requestMaps**: `number`

###### memoryUsage.totalRequestEntries

> **totalRequestEntries**: `number` = `0`

##### rateLimitedOrigins

> **rateLimitedOrigins**: `number` = `0`

##### totalOrigins

> **totalOrigins**: `number` = `origins.length`

##### totalRequests

> **totalRequests**: `number` = `0`

***

### isAllowed()

> **isAllowed**(`origin`): `boolean`

Defined in: [core/discovery/src/security.ts:379](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L379)

Check if an origin is allowed to make a request.

#### Parameters

##### origin

`string`

#### Returns

`boolean`

***

### recordRequest()

> **recordRequest**(`origin`): `void`

Defined in: [core/discovery/src/security.ts:407](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L407)

Record a request from an origin.

#### Parameters

##### origin

`string`

#### Returns

`void`

***

### reset()

> **reset**(`origin?`): `void`

Defined in: [core/discovery/src/security.ts:431](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L431)

Reset rate limit for an origin.

#### Parameters

##### origin?

`string`

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [core/discovery/src/security.ts:442](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/security.ts#L442)

Update configuration.

#### Parameters

##### config

[`RateLimitConfig`](../interfaces/RateLimitConfig.md)

#### Returns

`void`
