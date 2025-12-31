[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / RateLimiter

# Class: RateLimiter

Rate limiter implementation

## Remarks

Implements time-window based rate limiting with the following features:
- Configurable request limits per time window
- Burst protection to handle sudden traffic spikes
- Progressive penalties for repeated violations
- Automatic blocking after threshold violations
- Per-origin and per-operation tracking
- Automatic cleanup of expired entries

## Example

```typescript
const limiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000,
  burstSize: 3
}, logger);

const result = limiter.check('https://example.com', 'sign');
if (!result.allowed) {
  throw new Error(`Rate limited: ${result.reason}`);
}
```

## Constructors

### Constructor

> **new RateLimiter**(`config`, `logger`): `RateLimiter`

#### Parameters

##### config

[`RateLimitConfig`](../interfaces/RateLimitConfig.md)

##### logger

[`Logger`](Logger.md)

#### Returns

`RateLimiter`

## Methods

### check()

> **check**(`origin`, `operation?`): [`RateLimitResult`](../interfaces/RateLimitResult.md)

Check if request is allowed

#### Parameters

##### origin

`string`

The origin making the request

##### operation?

`string`

Optional operation identifier for per-operation limiting

#### Returns

[`RateLimitResult`](../interfaces/RateLimitResult.md)

Rate limit result with allowed status and metadata

#### Remarks

Checks if a request from the given origin for the specified operation
is allowed under the current rate limit policy. Updates internal state
and applies penalties or blocks as necessary.

#### Example

```typescript
const result = limiter.check('https://app.com', 'transaction');
if (result.allowed) {
  console.log(`${result.remaining} requests remaining`);
} else {
  console.log(`Blocked: ${result.reason}`);
}
```

***

### clear()

> **clear**(): `void`

Clear all entries

#### Returns

`void`

#### Remarks

Removes all rate limit tracking data. Use with caution as this
effectively resets all rate limits for all origins and operations.

#### Example

```typescript
// Clear all rate limits during maintenance
limiter.clear();
```

***

### destroy()

> **destroy**(): `void`

Destroy rate limiter

#### Returns

`void`

#### Remarks

Cleans up all resources including timers and tracking data.
Call this when the rate limiter is no longer needed.

#### Example

```typescript
// Clean up on application shutdown
limiter.destroy();
```

***

### getAllEntries()

> **getAllEntries**(): [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`RateLimitEntry`](../interfaces/RateLimitEntry.md)\>

Get all entries for debugging

#### Returns

[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`RateLimitEntry`](../interfaces/RateLimitEntry.md)\>

Map of all rate limit entries keyed by origin/operation

#### Remarks

Returns a copy of all rate limit entries. Useful for monitoring
and debugging the overall rate limit state.

#### Example

```typescript
const entries = limiter.getAllEntries();
console.log(`Tracking ${entries.size} origins/operations`);
```

***

### getState()

> **getState**(`origin`, `operation?`): `undefined` \| [`RateLimitEntry`](../interfaces/RateLimitEntry.md)

Get current state for debugging

#### Parameters

##### origin

`string`

The origin to query

##### operation?

`string`

Optional operation identifier

#### Returns

`undefined` \| [`RateLimitEntry`](../interfaces/RateLimitEntry.md)

The rate limit entry or undefined if not found

#### Remarks

Retrieves the internal rate limit entry for a specific origin/operation.
Useful for debugging and monitoring rate limit state.

#### Example

```typescript
const state = limiter.getState('https://app.com');
if (state) {
  console.log(`Requests: ${state.requests}, Violations: ${state.violations}`);
}
```

***

### reset()

> **reset**(`origin`, `operation?`): `void`

Reset rate limit for a key

#### Parameters

##### origin

`string`

The origin to reset

##### operation?

`string`

Optional operation identifier

#### Returns

`void`

#### Remarks

Clears the rate limit state for a specific origin/operation combination.
Useful for administrative actions or after successful authentication.

#### Example

```typescript
// Reset after successful authentication
limiter.reset('https://app.com', 'auth');
```
