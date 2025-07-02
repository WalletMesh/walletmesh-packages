[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / PermissionCheckCallback

# Type Alias: PermissionCheckCallback()\<T, C\>

> **PermissionCheckCallback**\<`T`, `C`\> = (`context`, `request`) => `Promise`\<`boolean`\>

Defined in: [core/router/src/types.ts:103](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L103)

Callback for checking if a specific method call is permitted.
Called before each method invocation to verify permissions.

## Type Parameters

### T

`T` *extends* [`RouterMethodMap`](../interfaces/RouterMethodMap.md)

### C

`C` *extends* [`RouterContext`](../interfaces/RouterContext.md)

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
