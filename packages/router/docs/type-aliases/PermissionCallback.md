[**@walletmesh/router v0.2.0**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionCallback

# Type Alias: PermissionCallback()

> **PermissionCallback**: (`context`, `request`) => `Promise`\<`boolean`\>

Permission callback function type

## Parameters

### context

[`RouterContext`](../interfaces/RouterContext.md)

Complete context for the permission decision

### request

`JSONRPCRequest`\<[`RouterMethodMap`](../interfaces/RouterMethodMap.md), keyof [`RouterMethodMap`](../interfaces/RouterMethodMap.md)\>

## Returns

`Promise`\<`boolean`\>

Promise<boolean> indicating if the operation should be permitted

## Defined in

[packages/router/src/types.ts:68](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L68)
