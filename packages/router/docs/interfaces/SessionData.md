[**@walletmesh/router v0.1.6**](../README.md)

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

[packages/router/src/types.ts:146](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/types.ts#L146)

***

### origin

> **origin**: `string`

Origin of the session request

#### Defined in

[packages/router/src/types.ts:148](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/types.ts#L148)

***

### permissions

> **permissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

Permissions granted to this session per chain

#### Defined in

[packages/router/src/types.ts:150](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/types.ts#L150)
