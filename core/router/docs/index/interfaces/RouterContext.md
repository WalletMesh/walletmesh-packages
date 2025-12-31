[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterContext

# Interface: RouterContext

Defined in: [core/router/src/types.ts:565](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L565)

Context object passed to router operations.
Contains information about the current request context
including origin and session data.

## Indexable

\[`key`: `string`\]: `unknown`

Additional context properties

## Properties

### origin?

> `optional` **origin**: `string`

Defined in: [core/router/src/types.ts:567](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L567)

Origin of the request (e.g., "https://app.example.com")

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Defined in: [core/router/src/types.ts:569](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L569)

Current session data if authenticated
