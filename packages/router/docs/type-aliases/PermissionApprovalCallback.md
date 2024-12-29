[**@walletmesh/router v0.1.6**](../README.md)

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

[packages/router/src/types.ts:114](https://github.com/WalletMesh/wm-core/blob/55735390cf4c8a0d047a109e33e2c0437d867c8e/packages/router/src/types.ts#L114)
