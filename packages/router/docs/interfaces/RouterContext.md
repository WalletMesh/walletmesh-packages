[**@walletmesh/router v0.2.2**](../README.md)

***

[@walletmesh/router](../globals.md) / RouterContext

# Interface: RouterContext

Context object passed to router operations.
Contains information about the current request context
including origin and session data.

## Indexable

 \[`key`: `string`\]: `unknown`

## Properties

### origin?

> `optional` **origin**: `string`

Origin of the request (e.g., "https://app.example.com")

#### Defined in

[packages/router/src/types.ts:474](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L474)

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Current session data if authenticated

#### Defined in

[packages/router/src/types.ts:476](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L476)
