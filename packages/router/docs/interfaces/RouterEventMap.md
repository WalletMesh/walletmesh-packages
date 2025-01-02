[**@walletmesh/router v0.2.0**](../README.md)

***

[@walletmesh/router](../globals.md) / RouterEventMap

# Interface: RouterEventMap

Router event map for bi-directional communication
Defines events that can be emitted by the router

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

[packages/router/src/types.ts:192](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L192)

***

### wm\_sessionTerminated

> **wm\_sessionTerminated**: `object`

Emitted when a session is terminated by the router

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

#### Defined in

[packages/router/src/types.ts:200](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L200)

***

### wm\_walletAvailabilityChanged

> **wm\_walletAvailabilityChanged**: `object`

Emitted when a wallet's availability changes (added or removed)

#### available

> **available**: `boolean`

#### chainId

> **chainId**: `string`

#### Defined in

[packages/router/src/types.ts:208](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L208)

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

[packages/router/src/types.ts:180](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L180)
