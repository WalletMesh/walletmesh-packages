[**@walletmesh/router v0.2.5**](../README.md)

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

[packages/router/src/types.ts:484](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L484)

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Current session data if authenticated

#### Defined in

[packages/router/src/types.ts:486](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L486)
