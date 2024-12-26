[**@walletmesh/router v0.1.0**](../README.md)

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

[packages/router/src/types.ts:225](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L225)

***

### wm\_sessionTerminated

> **wm\_sessionTerminated**: `object`

Emitted when a session is terminated by the router

#### reason

> **reason**: `string`

#### sessionId

> **sessionId**: `string`

#### Defined in

[packages/router/src/types.ts:233](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L233)

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

[packages/router/src/types.ts:213](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/types.ts#L213)
