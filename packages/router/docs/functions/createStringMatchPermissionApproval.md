[**@walletmesh/router v0.1.0**](../README.md)

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

[packages/router/src/permissions.ts:29](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/router/src/permissions.ts#L29)
