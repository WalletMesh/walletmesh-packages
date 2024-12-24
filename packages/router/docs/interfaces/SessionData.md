[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / SessionData

# Interface: SessionData

Session data
Represents an active wallet connection session with its associated permissions and metadata.
A single session can manage permissions for multiple chains.

## Table of contents

### Properties

- [id](SessionData.md#id)
- [origin](SessionData.md#origin)
- [permissions](SessionData.md#permissions)

## Properties

### id

• **id**: `string`

Unique session identifier

#### Defined in

[packages/router/src/types.ts:101](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L101)

___

### origin

• **origin**: `string`

Origin of the session request

#### Defined in

[packages/router/src/types.ts:103](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L103)

___

### permissions

• **permissions**: [`ChainPermissions`](../modules.md#chainpermissions)

Permissions granted to this session per chain

#### Defined in

[packages/router/src/types.ts:105](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L105)
