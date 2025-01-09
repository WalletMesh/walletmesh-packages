[**@walletmesh/router v0.2.6**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [permissions](../README.md) / AskCallback

# Type Alias: AskCallback()\<T, C\>

> **AskCallback**\<`T`, `C`\>: (`context`, `request`) => `boolean`

Callback for handling permission prompts when a method is in ASK state.
This callback is invoked to determine if a method call should be allowed.

## Type Parameters

• **T** *extends* [`RouterMethodMap`](../../index/interfaces/RouterMethodMap.md)

Router method map type for type-safe method handling

• **C** *extends* [`RouterContext`](../../index/interfaces/RouterContext.md)

Router context type for session and origin information

## Parameters

### context

`C`

Router context containing session and origin information

### request

`JSONRPCRequest`\<`T`, keyof `T`\>

The JSON-RPC request being checked

## Returns

`boolean`

boolean indicating if the method call should be allowed

## Example

```typescript
const askCallback: AskCallback = (context, request) => {
  // Show a prompt to the user
  return window.confirm(`Allow ${request.method}?`);
};
```

## Defined in

[packages/router/src/permissions/allowAskDeny.ts:29](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/permissions/allowAskDeny.ts#L29)
