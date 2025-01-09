[**@walletmesh/router v0.2.4**](../README.md)

***

[@walletmesh/router](../globals.md) / RouterEventMap

# Interface: RouterEventMap

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

Emitted when a session's permissions are updated

#### permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

#### sessionId

> **sessionId**: `string`

#### Defined in

[packages/router/src/types.ts:333](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L333)

***

### wm\_sessionTerminated

> **wm\_sessionTerminated**: `object`

Emitted when a session is terminated by the router

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

#### Defined in

[packages/router/src/types.ts:343](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L343)

***

### wm\_walletAvailabilityChanged

> **wm\_walletAvailabilityChanged**: `object`

Emitted when a wallet's availability changes (added or removed)

#### available

> **available**: `boolean`

#### chainId

> **chainId**: `string`

#### Defined in

[packages/router/src/types.ts:353](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L353)

***

### wm\_walletStateChanged

> **wm\_walletStateChanged**: `object`

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

#### Defined in

[packages/router/src/types.ts:319](https://github.com/WalletMesh/wm-core/blob/ff7e359ad9b1a95b8c720283541b40d92610b6a1/packages/router/src/types.ts#L319)
