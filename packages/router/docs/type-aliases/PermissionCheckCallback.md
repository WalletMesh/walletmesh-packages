[**@walletmesh/router v0.2.1**](../README.md)

***

[@walletmesh/router](../globals.md) / PermissionCheckCallback

# Type Alias: PermissionCheckCallback()\<T, C\>

> **PermissionCheckCallback**\<`T`, `C`\>: (`context`, `request`) => `Promise`\<`boolean`\>

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

## Defined in

[packages/router/src/types.ts:130](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/router/src/types.ts#L130)
