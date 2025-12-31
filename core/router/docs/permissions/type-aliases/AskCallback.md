[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [permissions](../README.md) / AskCallback

# Type Alias: AskCallback()\<T, C\>

> **AskCallback**\<`T`, `C`\> = (`context`, `request`) => `Promise`\<`boolean`\>

Defined in: [core/router/src/permissions/allowAskDeny.ts:29](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/permissions/allowAskDeny.ts#L29)

Callback for handling permission prompts when a method is in ASK state.
This callback is invoked to determine if a method call should be allowed.

## Type Parameters

### T

`T` *extends* [`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md)

Router method map type for type-safe method handling

### C

`C` *extends* [`RouterContext`](../../index/interfaces/RouterContext.md)

Router context type for session and origin information

## Parameters

### context

`C`

Router context containing session and origin information

### request

`JSONRPCRequest`\<`T`, keyof `T`\>

The JSON-RPC request being checked

## Returns

`Promise`\<`boolean`\>

Promise resolving to boolean indicating if the method call should be allowed

## Example

```typescript
const askCallback: AskCallback = async (context, request) => {
  // Show a prompt to the user
  return await showPermissionDialog(`Allow ${request.method}?`);
};
```
