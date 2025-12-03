[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionCleanupCallback

# Type Alias: PermissionCleanupCallback()\<C\>

> **PermissionCleanupCallback**\<`C`\> = (`context`, `sessionId`) => `Promise`\<`void`\>

Defined in: [core/router/src/types.ts:128](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L128)

Callback for cleaning up permissions when a session ends.
Called during session termination to ensure proper permission cleanup.

## Type Parameters

### C

`C` *extends* [`RouterContext`](../interfaces/RouterContext.md)

## Parameters

### context

`C`

Router context containing session and origin information

### sessionId

`string`

ID of the session being cleaned up

## Returns

`Promise`\<`void`\>
