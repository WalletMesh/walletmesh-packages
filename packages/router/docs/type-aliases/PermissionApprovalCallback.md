[**@walletmesh/router v0.2.0**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionApprovalCallback

# Type Alias: PermissionApprovalCallback()

> **PermissionApprovalCallback**: (`context`, `permissions`) => `Promise`\<[`ChainPermissions`](ChainPermissions.md)\>

Permission approval callback function type

## Parameters

### context

[`RouterContext`](../interfaces/RouterContext.md)

Complete context for the permission approval decision

### permissions

[`ChainPermissions`](ChainPermissions.md)

## Returns

`Promise`\<[`ChainPermissions`](ChainPermissions.md)\>

Promise<ChainPermissions> containing the approved permissions for each chain

## Defined in

[packages/router/src/types.ts:78](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L78)
