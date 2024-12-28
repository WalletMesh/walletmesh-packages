[**@walletmesh/router v0.1.5**](../README.md)

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

[packages/router/src/types.ts:114](https://github.com/WalletMesh/wm-core/blob/06ce1e7f0406bfb5c73f5b66aebbea66acb5497d/packages/router/src/types.ts#L114)
