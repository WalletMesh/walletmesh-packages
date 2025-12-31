[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionGetCallback

# Type Alias: PermissionGetCallback()\<C\>

> **PermissionGetCallback**\<`C`\> = (`context`, `chainIds?`) => `Promise`\<[`HumanReadableChainPermissions`](HumanReadableChainPermissions.md)\>

Defined in: [core/router/src/types.ts:116](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L116)

Callback for retrieving current permissions.
Used to get the current permission state for display or verification.

## Type Parameters

### C

`C` *extends* [`RouterContext`](../interfaces/RouterContext.md)

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
