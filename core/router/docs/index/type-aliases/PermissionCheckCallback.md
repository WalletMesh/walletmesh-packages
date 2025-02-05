[**@walletmesh/router v0.4.0**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionCheckCallback

# Type Alias: PermissionCheckCallback()\<T, C\>

> **PermissionCheckCallback**\<`T`, `C`\>: (`context`, `request`) => `Promise`\<`boolean`\>

Defined in: [core/router/src/types.ts:130](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/router/src/types.ts#L130)

Callback for checking if a specific method call is permitted.
Called before each method invocation to verify permissions.

## Type Parameters

• **T** *extends* [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

• **C** *extends* [`RouterContext`](../interfaces/RouterContext.md)

## Parameters

### context

`C`

Router context containing session and origin information

### request

`JSONRPCRequest`\<`T`, keyof `T`\>

The JSON-RPC request being checked

## Returns

`Promise`\<`boolean`\>

Promise resolving to true if the method call is permitted

## Example

```typescript
const checkCallback: PermissionCheckCallback = async (context, request) => {
  return context.session?.permissions?.[request.params.chainId]
    ?.includes(request.params.call.method) ?? false;
};
```
