[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / RateLimitResult

# Interface: RateLimitResult

Rate limit result

## Remarks

Contains the result of a rate limit check including whether the request
is allowed, remaining capacity, and retry information if blocked.

## Example

```typescript
const result = rateLimiter.check('https://example.com', 'connect');
if (!result.allowed) {
  console.log(`Rate limited. Retry after ${result.retryAfterMs}ms`);
}
```

## Properties

### allowed

> **allowed**: `boolean`

Whether the request is allowed

***

### reason?

> `optional` **reason**: `"rate_limit"` \| `"burst_limit"` \| `"penalty"` \| `"blocked"`

Reason if blocked

***

### remaining

> **remaining**: `number`

Remaining requests in window

***

### resetAfterMs

> **resetAfterMs**: `number`

Time until window reset in milliseconds

***

### retryAfterMs?

> `optional` **retryAfterMs**: `number`

Retry after time in milliseconds (if blocked)
