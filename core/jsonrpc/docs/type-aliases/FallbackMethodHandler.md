[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / FallbackMethodHandler

# Type Alias: FallbackMethodHandler()\<C\>

> **FallbackMethodHandler**\<`C`\> = (`context`, `method`, `params`) => `Promise`\<[`MethodResponse`](MethodResponse.md)\<`unknown`\>\>

Defined in: [core/jsonrpc/src/types.ts:738](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L738)

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
