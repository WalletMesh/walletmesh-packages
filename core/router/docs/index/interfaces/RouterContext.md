[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterContext

# Interface: RouterContext

Defined in: [core/router/src/types.ts:564](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L564)

Context object passed to router operations.
Contains information about the current request context
including origin and session data.

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### origin?

> `optional` **origin**: `string`

Defined in: [core/router/src/types.ts:566](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L566)

Origin of the request (e.g., "https://app.example.com")

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Defined in: [core/router/src/types.ts:568](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L568)

Current session data if authenticated
