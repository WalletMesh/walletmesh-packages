[@walletmesh/router - v0.0.6](../README.md) / [Exports](../modules.md) / SessionData

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

[packages/router/src/types.ts:146](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L146)

___

### origin

• **origin**: `string`

Origin of the session request

#### Defined in

[packages/router/src/types.ts:148](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L148)

___

### permissions

• **permissions**: [`ChainPermissions`](../modules.md#chainpermissions)

Permissions granted to this session per chain

#### Defined in

[packages/router/src/types.ts:150](https://github.com/WalletMesh/wm-core/blob/6bd9984604bb55e33c5298221a47e0360fac08ee/packages/router/src/types.ts#L150)
