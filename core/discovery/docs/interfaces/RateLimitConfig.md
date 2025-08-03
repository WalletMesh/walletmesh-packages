[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / RateLimitConfig

# Interface: RateLimitConfig

Defined in: [core/types.ts:1350](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1350)

Rate limiting configuration for request throttling.

Prevents abuse and denial-of-service attacks by limiting the number
of requests from a single origin within a time window.

## Examples

```typescript
const rateLimit: RateLimitConfig = {
  enabled: true,
  maxRequests: 10,
  windowMs: 60000  // 10 requests per minute
};
```

```typescript
const strictRateLimit: RateLimitConfig = {
  enabled: true,
  maxRequests: 5,
  windowMs: 60000  // 5 requests per minute
};
```

```typescript
const devRateLimit: RateLimitConfig = {
  enabled: false,
  maxRequests: 1000,
  windowMs: 60000
};
```

## Since

0.1.0

## See

[SecurityPolicy](SecurityPolicy.md) for rate limit integration

## Properties

### enabled

> **enabled**: `boolean`

Defined in: [core/types.ts:1353](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1353)

***

### maxRequests

> **maxRequests**: `number`

Defined in: [core/types.ts:1351](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1351)

***

### windowMs

> **windowMs**: `number`

Defined in: [core/types.ts:1352](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L1352)
