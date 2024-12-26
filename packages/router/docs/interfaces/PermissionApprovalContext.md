[@walletmesh/router - v0.1.0](../README.md) / [Exports](../modules.md) / PermissionApprovalContext

# Interface: PermissionApprovalContext

Permission approval request context

## Table of contents

### Properties

- [operation](PermissionApprovalContext.md#operation)
- [origin](PermissionApprovalContext.md#origin)
- [requestedPermissions](PermissionApprovalContext.md#requestedpermissions)
- [session](PermissionApprovalContext.md#session)

## Properties

### operation

• **operation**: [`OperationType`](../modules.md#operationtype)

Type of operation being performed

#### Defined in

[packages/router/src/types.ts:93](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L93)

___

### origin

• **origin**: `string`

Origin of the request

#### Defined in

[packages/router/src/types.ts:95](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L95)

___

### requestedPermissions

• **requestedPermissions**: [`ChainPermissions`](../modules.md#chainpermissions)

Requested permissions per chain

#### Defined in

[packages/router/src/types.ts:97](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L97)

___

### session

• `Optional` **session**: [`SessionData`](SessionData.md)

Current session data if available (for updatePermissions)

#### Defined in

[packages/router/src/types.ts:99](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/router/src/types.ts#L99)
