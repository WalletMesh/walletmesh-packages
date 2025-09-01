[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RateLimiter

# Class: RateLimiter

Defined in: [security/RateLimiter.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L60)

Rate limiter implementing sliding window algorithm for abuse prevention.

Prevents discovery request abuse by limiting the number of requests per
origin within configurable time windows. Uses a sliding window algorithm
for accurate rate limiting without burst allowance issues common in
fixed window approaches.

Features:
- Per-origin rate limiting with independent windows
- Sliding window algorithm for precise request tracking
- Automatic cleanup of expired request records
- Configurable limits and time windows
- Real-time statistics and monitoring
- Memory-efficient with automatic garbage collection

## Examples

```typescript
const rateLimiter = new RateLimiter({
  maxRequests: 10,        // 10 requests max
  windowMs: 60000,        // per 60 seconds
  enabled: true           // enforce limits
});

// Check if request is allowed
if (rateLimiter.isAllowed('https://example.com')) {
  // Record the request
  rateLimiter.recordRequest('https://example.com');
  // Process the request...
} else {
  console.log('Rate limited');
}
```

```typescript
const devLimiter = new RateLimiter({
  enabled: false    // Disable for development
});

// All requests allowed in development
```

## Since

0.1.0

## See

 - [RateLimitConfig](../interfaces/RateLimitConfig.md) for configuration options
 - [OriginValidator](OriginValidator.md) for origin validation

## Constructors

### Constructor

> **new RateLimiter**(`config`): `RateLimiter`

Defined in: [security/RateLimiter.ts:65](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L65)

#### Parameters

##### config

`Partial`\<[`RateLimitConfig`](../interfaces/RateLimitConfig.md)\> = `{}`

#### Returns

`RateLimiter`

## Methods

### dispose()

> **dispose**(): `void`

Defined in: [security/RateLimiter.ts:282](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L282)

Dispose of the rate limiter and clean up resources.

#### Returns

`void`

***

### getConfig()

> **getConfig**(): [`RateLimitConfig`](../interfaces/RateLimitConfig.md)

Defined in: [security/RateLimiter.ts:196](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L196)

Get current configuration.

#### Returns

[`RateLimitConfig`](../interfaces/RateLimitConfig.md)

***

### getCurrentCount()

> **getCurrentCount**(`origin`, `timestamp`): `number`

Defined in: [security/RateLimiter.ts:124](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L124)

Get the current request count for an origin within the time window.

#### Parameters

##### origin

`string`

##### timestamp

`number` = `...`

#### Returns

`number`

***

### getOriginInfo()

> **getOriginInfo**(`origin`, `timestamp`): `object`

Defined in: [security/RateLimiter.ts:248](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L248)

Get detailed information about a specific origin.

#### Parameters

##### origin

`string`

##### timestamp

`number` = `...`

#### Returns

`object`

##### currentCount

> **currentCount**: `number`

##### isRateLimited

> **isRateLimited**: `boolean`

##### origin

> **origin**: `string`

##### remainingRequests

> **remainingRequests**: `number`

##### requestHistory

> **requestHistory**: `object`[]

##### timeUntilReset

> **timeUntilReset**: `number`

***

### getRemainingRequests()

> **getRemainingRequests**(`origin`, `timestamp`): `number`

Defined in: [security/RateLimiter.ts:141](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L141)

Get the remaining requests allowed for an origin.

#### Parameters

##### origin

`string`

##### timestamp

`number` = `...`

#### Returns

`number`

***

### getStats()

> **getStats**(`timestamp`): `object`

Defined in: [security/RateLimiter.ts:203](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L203)

Get comprehensive statistics about rate limiting activity.

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

### getTimeUntilReset()

> **getTimeUntilReset**(`origin`, `timestamp`): `number`

Defined in: [security/RateLimiter.ts:149](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L149)

Get the time until the next request is allowed (in milliseconds).

#### Parameters

##### origin

`string`

##### timestamp

`number` = `...`

#### Returns

`number`

***

### isAllowed()

> **isAllowed**(`origin`, `timestamp`): `boolean`

Defined in: [security/RateLimiter.ts:79](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L79)

Check if a request is allowed for the given origin.

#### Parameters

##### origin

`string`

##### timestamp

`number` = `...`

#### Returns

`boolean`

***

### recordRequest()

> **recordRequest**(`origin`, `timestamp`): `boolean`

Defined in: [security/RateLimiter.ts:102](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L102)

Record a request for the given origin.

#### Parameters

##### origin

`string`

##### timestamp

`number` = `...`

#### Returns

`boolean`

***

### reset()

> **reset**(`origin`): `void`

Defined in: [security/RateLimiter.ts:172](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L172)

Reset rate limit for a specific origin.

#### Parameters

##### origin

`string`

#### Returns

`void`

***

### resetAll()

> **resetAll**(): `void`

Defined in: [security/RateLimiter.ts:179](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L179)

Reset all rate limits.

#### Returns

`void`

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [security/RateLimiter.ts:186](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/security/RateLimiter.ts#L186)

Update the rate limit configuration.

#### Parameters

##### config

`Partial`\<[`RateLimitConfig`](../interfaces/RateLimitConfig.md)\>

#### Returns

`void`
