[**@walletmesh/router v0.2.2**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionGetCallback

# Type Alias: PermissionGetCallback()\<C\>

> **PermissionGetCallback**\<`C`\>: (`context`, `chainIds`?) => `Promise`\<[`HumanReadableChainPermissions`](HumanReadableChainPermissions.md)\>

Callback for retrieving current permissions.
Used to get the current permission state for display or verification.

## Type Parameters

• **C** *extends* [`RouterContext`](../interfaces/RouterContext.md)

## Parameters

### context

`C`

Router context containing session and origin information

### chainIds?

[`ChainId`](ChainId.md)[]

Optional array of chain IDs to filter permissions by

## Returns

`Promise`\<[`HumanReadableChainPermissions`](HumanReadableChainPermissions.md)\>

Promise resolving to current permissions in human-readable format

## Defined in

[packages/router/src/types.ts:143](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L143)
