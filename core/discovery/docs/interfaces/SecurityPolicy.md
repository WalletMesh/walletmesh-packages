[**@walletmesh/discovery v0.1.2**](../README.md)

***

[@walletmesh/discovery](../globals.md) / SecurityPolicy

# Interface: SecurityPolicy

Defined in: [core/discovery/src/types/security.ts:21](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L21)

Security policy configuration for origin validation and request filtering.

Defines comprehensive security settings including origin allowlists/blocklists,
HTTPS enforcement, rate limiting, and other protective measures.

## Since

0.1.0

## Properties

### allowedOrigins?

> `optional` **allowedOrigins**: `string`[]

Defined in: [core/discovery/src/types/security.ts:22](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L22)

***

### allowLocalhost?

> `optional` **allowLocalhost**: `boolean`

Defined in: [core/discovery/src/types/security.ts:25](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L25)

***

### blockedOrigins?

> `optional` **blockedOrigins**: `string`[]

Defined in: [core/discovery/src/types/security.ts:23](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L23)

***

### certificateValidation?

> `optional` **certificateValidation**: `boolean`

Defined in: [core/discovery/src/types/security.ts:26](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L26)

***

### contentSecurityPolicy?

> `optional` **contentSecurityPolicy**: `string`

Defined in: [core/discovery/src/types/security.ts:27](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L27)

***

### maxSessionAge?

> `optional` **maxSessionAge**: `number`

Defined in: [core/discovery/src/types/security.ts:28](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L28)

***

### rateLimit?

> `optional` **rateLimit**: `object`

Defined in: [core/discovery/src/types/security.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L29)

#### enabled

> **enabled**: `boolean`

#### maxRequests

> **maxRequests**: `number`

#### windowMs

> **windowMs**: `number`

***

### requireHttps?

> `optional` **requireHttps**: `boolean`

Defined in: [core/discovery/src/types/security.ts:24](https://github.com/WalletMesh/walletmesh-packages/blob/a3808edd1bf54f866b4ce141295e0686b0d7d5bc/core/discovery/src/types/security.ts#L24)
