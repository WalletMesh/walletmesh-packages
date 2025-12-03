[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / RouterEventMap

# Interface: RouterEventMap

Defined in: [core/router/src/types.ts:294](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L294)

Router event map for bi-directional communication.
Defines events that can be emitted by the router for real-time state updates
and session management.

## Extends

- `JSONRPCEventMap`

## Indexable

\[`event`: `string`\]: `unknown`

## Properties

### wm\_permissionsChanged

> **wm\_permissionsChanged**: `object`

Defined in: [core/router/src/types.ts:317](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L317)

Emitted when a session's permissions are updated

#### permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### sessionId

> **sessionId**: `string`

***

### wm\_sessionTerminated

> **wm\_sessionTerminated**: `object`

Defined in: [core/router/src/types.ts:327](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L327)

Emitted when a session is terminated by the router

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

***

### wm\_walletAvailabilityChanged

> **wm\_walletAvailabilityChanged**: `object`

Defined in: [core/router/src/types.ts:337](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L337)

Emitted when a wallet's availability changes (added or removed)

#### available

> **available**: `boolean`

#### chainId

> **chainId**: `string`

***

### wm\_walletStateChanged

> **wm\_walletStateChanged**: `object`

Defined in: [core/router/src/types.ts:303](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L303)

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
