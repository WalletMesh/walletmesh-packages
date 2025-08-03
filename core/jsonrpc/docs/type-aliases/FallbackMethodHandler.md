[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / FallbackMethodHandler

# Type Alias: FallbackMethodHandler()\<C\>

> **FallbackMethodHandler**\<`C`\> = (`context`, `method`, `params`) => `Promise`\<[`MethodResponse`](MethodResponse.md)\<`unknown`\>\>

Defined in: [core/jsonrpc/src/types.ts:738](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L738)

Function type for handling unregistered JSON-RPC method calls.
The fallback handler receives the context, method name, and raw parameters,
and can implement custom logic for handling unknown methods.

## Type Parameters

### C

`C` *extends* [`JSONRPCContext`](JSONRPCContext.md)

The context type for method handlers

## Parameters

### context

`C`

### method

`string`

### params

[`JSONRPCParams`](JSONRPCParams.md)

## Returns

`Promise`\<[`MethodResponse`](MethodResponse.md)\<`unknown`\>\>

## Example

```typescript
const fallbackHandler: FallbackMethodHandler<Context> =
  async (context, method, params) => {
    console.log(`Unknown method called: ${method}`);
    return {
      success: false,
      error: {
        code: -32601,
        message: `Method ${method} is not supported`,
        data: { availableMethods: ['add', 'subtract'] }
      }
    };
  };
```
