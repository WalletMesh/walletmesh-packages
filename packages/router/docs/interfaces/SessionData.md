[**@walletmesh/router v0.2.0**](../README.md)

***

[@walletmesh/router](../globals.md) / SessionData

# Interface: SessionData

Session data
Represents an active wallet connection session with its associated permissions and metadata.
A single session can manage permissions for multiple chains.

## Properties

### id

> **id**: `string`

Unique session identifier

#### Defined in

[packages/router/src/types.ts:113](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L113)

***

### origin

> **origin**: `string`

Origin of the session request

#### Defined in

[packages/router/src/types.ts:115](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L115)

***

### permissions?

> `optional` **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

Permissions for each connected chain

#### Defined in

[packages/router/src/types.ts:117](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L117)
