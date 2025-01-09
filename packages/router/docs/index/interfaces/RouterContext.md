[**@walletmesh/router v0.2.7**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterContext

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

[packages/router/src/types.ts:566](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/types.ts#L566)

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Current session data if authenticated

#### Defined in

[packages/router/src/types.ts:568](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/types.ts#L568)
