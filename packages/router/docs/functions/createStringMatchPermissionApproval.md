[**@walletmesh/router v0.1.2**](../README.md)

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

[packages/router/src/permissions.ts:29](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/router/src/permissions.ts#L29)
