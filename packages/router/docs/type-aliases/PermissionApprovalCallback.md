[**@walletmesh/router v0.1.4**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionApprovalCallback

# Type Alias: PermissionApprovalCallback()

> **PermissionApprovalCallback**: (`context`) => `Promise`\<[`ChainPermissions`](ChainPermissions.md)\>

Permission approval callback function type

## Parameters

### context

[`PermissionApprovalContext`](../interfaces/PermissionApprovalContext.md)

Complete context for the permission approval decision

## Returns

`Promise`\<[`ChainPermissions`](ChainPermissions.md)\>

Promise<ChainPermissions> containing the approved permissions for each chain

## Defined in

[packages/router/src/types.ts:114](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L114)
