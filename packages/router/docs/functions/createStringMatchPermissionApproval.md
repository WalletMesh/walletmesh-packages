[**@walletmesh/router v0.1.4**](../README.md)

***

[@walletmesh/router](../globals.md) / createStringMatchPermissionApproval

# Function: createStringMatchPermissionApproval()

> **createStringMatchPermissionApproval**(`allowedPatterns`): [`PermissionApprovalCallback`](../type-aliases/PermissionApprovalCallback.md)

Creates a permission approval callback that filters requested permissions based on patterns.
Only methods matching the allowed patterns will be approved.

## Parameters

### allowedPatterns

`string`[]

Array of patterns to match against

## Returns

[`PermissionApprovalCallback`](../type-aliases/PermissionApprovalCallback.md)

## Defined in

[packages/router/src/permissions.ts:29](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/permissions.ts#L29)
