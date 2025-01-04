[**@walletmesh/router v0.2.1**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionCleanupCallback

# Type Alias: PermissionCleanupCallback()\<C\>

> **PermissionCleanupCallback**\<`C`\>: (`context`, `sessionId`) => `Promise`\<`void`\>

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

## Defined in

[packages/router/src/types.ts:155](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/router/src/types.ts#L155)
