[**@walletmesh/router v0.2.4**](../README.md)

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

[packages/router/src/types.ts:480](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L480)

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Current session data if authenticated

#### Defined in

[packages/router/src/types.ts:482](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L482)
