[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / RateLimitConfig

# Interface: RateLimitConfig

Rate limit configuration

## Remarks

Configures the rate limiting security module with time-window based limiting,
burst protection, progressive penalties, and per-origin/per-operation tracking.

## Example

```typescript
const config: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 60000, // 1 minute
  burstSize: 20,
  penaltyMultiplier: 2,
  perOrigin: true,
  perOperation: true
};
```

## Properties

### blockDurationMs?

> `optional` **blockDurationMs**: `number`

Block duration for repeated violations in milliseconds

***

### burstSize?

> `optional` **burstSize**: `number`

Maximum burst size (requests allowed immediately)

***

### keyGenerator()?

> `optional` **keyGenerator**: (`origin`, `operation?`) => `string`

Custom key generator for tracking

#### Parameters

##### origin

`string`

##### operation?

`string`

#### Returns

`string`

***

### logEvents?

> `optional` **logEvents**: `boolean`

Log rate limit events

***

### maxPenaltyMs?

> `optional` **maxPenaltyMs**: `number`

Maximum penalty duration in milliseconds

***

### maxRequests

> **maxRequests**: `number`

Maximum requests per time window

***

### penaltyMultiplier?

> `optional` **penaltyMultiplier**: `number`

Progressive penalty multiplier for violations

***

### perOperation?

> `optional` **perOperation**: `boolean`

Enable per-operation tracking

***

### perOrigin?

> `optional` **perOrigin**: `boolean`

Enable per-origin tracking

***

### violationsBeforeBlock?

> `optional` **violationsBeforeBlock**: `number`

Number of violations before blocking

***

### windowMs

> **windowMs**: `number`

Time window in milliseconds
