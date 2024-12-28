[**@walletmesh/router v0.1.5**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionApprovalContext

# Interface: PermissionApprovalContext

Permission approval request context

## Properties

### operation

> **operation**: [`OperationType`](../type-aliases/OperationType.md)

Type of operation being performed

#### Defined in

[packages/router/src/types.ts:93](https://github.com/WalletMesh/wm-core/blob/06ce1e7f0406bfb5c73f5b66aebbea66acb5497d/packages/router/src/types.ts#L93)

***

### origin

> **origin**: `string`

Origin of the request

#### Defined in

[packages/router/src/types.ts:95](https://github.com/WalletMesh/wm-core/blob/06ce1e7f0406bfb5c73f5b66aebbea66acb5497d/packages/router/src/types.ts#L95)

***

### requestedPermissions

> **requestedPermissions**: [`ChainPermissions`](../type-aliases/ChainPermissions.md)

Requested permissions per chain

#### Defined in

[packages/router/src/types.ts:97](https://github.com/WalletMesh/wm-core/blob/06ce1e7f0406bfb5c73f5b66aebbea66acb5497d/packages/router/src/types.ts#L97)

***

### session?

> `optional` **session**: [`SessionData`](SessionData.md)

Current session data if available (for updatePermissions)

#### Defined in

[packages/router/src/types.ts:99](https://github.com/WalletMesh/wm-core/blob/06ce1e7f0406bfb5c73f5b66aebbea66acb5497d/packages/router/src/types.ts#L99)
