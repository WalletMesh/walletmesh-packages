[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SecurityPolicy

# Interface: SecurityPolicy

Defined in: [core/types.ts:1212](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1212)

Security policy configuration for discovery protocol.

Comprehensive security settings including origin validation,
HTTPS enforcement, rate limiting, and session management.
Essential for production deployment security.

## Examples

```typescript
const strictPolicy: SecurityPolicy = {
  allowedOrigins: ['https://mydapp.com'],
  requireHttps: true,
  allowLocalhost: false,
  certificateValidation: true,
  maxSessionAge: 3600000, // 1 hour
  rateLimit: {
    enabled: true,
    maxRequests: 10,
    windowMs: 60000
  }
};
```

```typescript
const devPolicy: SecurityPolicy = {
  requireHttps: false,
  allowLocalhost: true,
  rateLimit: {
    enabled: false,
    maxRequests: 100,
    windowMs: 60000
  }
};
```

## Since

0.1.0

## See

 - [OriginValidator](../classes/OriginValidator.md) for origin validation
 - [RateLimiter](../classes/RateLimiter.md) for rate limiting

## Properties

### allowedOrigins?

> `optional` **allowedOrigins**: `string`[]

Defined in: [core/types.ts:1213](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1213)

***

### allowLocalhost?

> `optional` **allowLocalhost**: `boolean`

Defined in: [core/types.ts:1216](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1216)

***

### blockedOrigins?

> `optional` **blockedOrigins**: `string`[]

Defined in: [core/types.ts:1214](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1214)

***

### certificateValidation?

> `optional` **certificateValidation**: `boolean`

Defined in: [core/types.ts:1217](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1217)

***

### contentSecurityPolicy?

> `optional` **contentSecurityPolicy**: `string`

Defined in: [core/types.ts:1218](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1218)

***

### maxSessionAge?

> `optional` **maxSessionAge**: `number`

Defined in: [core/types.ts:1219](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1219)

***

### rateLimit?

> `optional` **rateLimit**: `object`

Defined in: [core/types.ts:1220](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1220)

#### enabled

> **enabled**: `boolean`

#### maxRequests

> **maxRequests**: `number`

#### windowMs

> **windowMs**: `number`

***

### requireHttps?

> `optional` **requireHttps**: `boolean`

Defined in: [core/types.ts:1215](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L1215)
