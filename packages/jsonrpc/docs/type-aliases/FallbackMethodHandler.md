[**@walletmesh/jsonrpc v0.2.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / FallbackMethodHandler

# Type Alias: FallbackMethodHandler()\<C\>

> **FallbackMethodHandler**\<`C`\>: (`context`, `method`, `params`) => `Promise`\<[`MethodResponse`](MethodResponse.md)\<`unknown`\>\>

Function type for handling unregistered JSON-RPC method calls.
The fallback handler receives the context, method name, and raw parameters,
and can implement custom logic for handling unknown methods.

## Type Parameters

• **C** *extends* [`JSONRPCContext`](JSONRPCContext.md)

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

## Defined in

[packages/jsonrpc/src/types.ts:710](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/jsonrpc/src/types.ts#L710)
