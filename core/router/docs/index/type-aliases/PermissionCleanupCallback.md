[**@walletmesh/router v0.3.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionCleanupCallback

# Type Alias: PermissionCleanupCallback()\<C\>

> **PermissionCleanupCallback**\<`C`\>: (`context`, `sessionId`) => `Promise`\<`void`\>

Defined in: [core/router/src/types.ts:155](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/router/src/types.ts#L155)

Callback for cleaning up permissions when a session ends.
Called during session termination to ensure proper permission cleanup.

## Type Parameters

• **C** *extends* [`RouterContext`](../interfaces/RouterContext.md)

## Parameters

### context

`C`

Router context containing session and origin information

### sessionId

`string`

ID of the session being cleaned up

## Returns

`Promise`\<`void`\>
