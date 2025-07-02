[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterContext

# Interface: RouterContext

Defined in: [core/router/src/types.ts:537](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L537)

Context object passed to router operations.
Contains information about the current request context
including origin and session data.

## Indexable

\[`key`: `string`\]: `unknown`

Additional context properties

## Properties

### origin?

> `optional` **origin**: `string`

Defined in: [core/router/src/types.ts:539](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L539)

Origin of the request (e.g., "https://app.example.com")

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Defined in: [core/router/src/types.ts:541](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L541)

Current session data if authenticated
