[@walletmesh/router - v0.0.5](../README.md) / [Exports](../modules.md) / PermissionApprovalContext

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

[packages/router/src/types.ts:48](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L48)

___

### origin

• **origin**: `string`

Origin of the request

#### Defined in

[packages/router/src/types.ts:50](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L50)

___

### requestedPermissions

• **requestedPermissions**: [`ChainPermissions`](../modules.md#chainpermissions)

Requested permissions per chain

#### Defined in

[packages/router/src/types.ts:52](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L52)

___

### session

• `Optional` **session**: [`SessionData`](SessionData.md)

Current session data if available (for updatePermissions)

#### Defined in

[packages/router/src/types.ts:54](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/router/src/types.ts#L54)
