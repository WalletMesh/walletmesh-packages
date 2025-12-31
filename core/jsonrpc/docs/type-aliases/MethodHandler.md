[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / MethodHandler

# Type Alias: MethodHandler()\<T, M, C\>

> **MethodHandler**\<`T`, `M`, `C`\> = (`context`, `method`, `params`) => `Promise`\<[`MethodResponse`](MethodResponse.md)\<`T`\[`M`\]\[`"result"`\]\>\>

Defined in: [core/jsonrpc/src/types.ts:201](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L201)

Function type for handling JSON-RPC method calls.
Method handlers receive a context object and typed parameters,
and return a promise that resolves to a MethodResponse containing either
a success result or an error.

## Type Parameters

### T

`T` *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

The RPC method map defining available methods and their types

### M

`M` *extends* keyof `T`

The specific method name being handled (must be a key of T)

### C

`C` *extends* [`JSONRPCContext`](JSONRPCContext.md) = [`JSONRPCContext`](JSONRPCContext.md)

The context type for method handlers (defaults to JSONRPCContext)

## Parameters

### context

`C`

### method

`M`

### params

`T`\[`M`\]\[`"params"`\]

## Returns

`Promise`\<[`MethodResponse`](MethodResponse.md)\<`T`\[`M`\]\[`"result"`\]\>\>

## Example

```typescript
// Simple handler returning success response
const addHandler: MethodHandler<MethodMap, 'add', Context> =
  async (context, method, { a, b }) => ({
    success: true,
    data: a + b
  });

// Handler with error response
const getUserHandler: MethodHandler<MethodMap, 'getUser', Context> =
  async (context, method, { id }) => {
    if (!context.isAuthorized) {
      return {
        success: false,
        error: {
          code: -32600,
          message: 'Unauthorized'
        }
      };
    }
    const user = await db.users.findById(id);
    return {
      success: true,
      data: user
    };
  };
```
