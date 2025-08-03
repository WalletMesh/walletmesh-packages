[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterContext

# Interface: RouterContext

Defined in: [core/router/src/types.ts:537](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/types.ts#L537)

Context object passed to router operations.
Contains information about the current request context
including origin and session data.

## Indexable

\[`key`: `string`\]: `unknown`

Additional context properties

## Properties

### origin?

> `optional` **origin**: `string`

Defined in: [core/router/src/types.ts:539](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/types.ts#L539)

Origin of the request (e.g., "https://app.example.com")

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Defined in: [core/router/src/types.ts:541](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/types.ts#L541)

Current session data if authenticated
