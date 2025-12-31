[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterEventMap

# Interface: RouterEventMap

Defined in: [core/router/src/types.ts:298](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L298)

Router event map for bi-directional communication.
Defines events that can be emitted by the router for real-time state updates
and session management.

## Extends

- `JSONRPCEventMap`

## Indexable

\[`event`: `string`\]: `unknown`

## Properties

### connection:restored

> **connection:restored**: `object`

Defined in: [core/router/src/types.ts:341](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L341)

Emitted when a session is successfully restored via reconnect

#### permissions

> **permissions**: [`HumanReadableChainPermissions`](../type-aliases/HumanReadableChainPermissions.md)

#### sessionId

> **sessionId**: `string`

***

### wm\_permissionsChanged

> **wm\_permissionsChanged**: `object`

Defined in: [core/router/src/types.ts:321](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L321)

Emitted when a session's permissions are updated

#### permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### sessionId

> **sessionId**: `string`

***

### wm\_sessionTerminated

> **wm\_sessionTerminated**: `object`

Defined in: [core/router/src/types.ts:331](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L331)

Emitted when a session is terminated by the router

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

***

### wm\_walletAvailabilityChanged

> **wm\_walletAvailabilityChanged**: `object`

Defined in: [core/router/src/types.ts:351](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L351)

Emitted when a wallet's availability changes (added or removed)

#### available

> **available**: `boolean`

#### chainId

> **chainId**: `string`

***

### wm\_walletStateChanged

> **wm\_walletStateChanged**: `object`

Defined in: [core/router/src/types.ts:307](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L307)

Emitted when a wallet's state changes (e.g., account changes, network changes)

#### chainId

> **chainId**: `string`

#### changes

> **changes**: `object`

##### Index Signature

\[`key`: `string`\]: `unknown`

##### changes.accounts?

> `optional` **accounts**: `string`[]

##### changes.networkId?

> `optional` **networkId**: `string`
