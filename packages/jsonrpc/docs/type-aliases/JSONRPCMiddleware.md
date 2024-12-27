[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMiddleware

# Type Alias: JSONRPCMiddleware()\<T, C\>

> **JSONRPCMiddleware**\<`T`, `C`\>: (`context`, `request`, `next`) => `Promise`\<[`JSONRPCResponse`](../interfaces/JSONRPCResponse.md)\<`T`\>\>

Represents a middleware function that can intercept and modify JSON-RPC requests/responses.

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

The RPC method map defining available methods

• **C** *extends* [`JSONRPCContext`](JSONRPCContext.md)

The context type shared between middleware and handlers

## Parameters

### context

`C`

### request

[`JSONRPCRequest`](../interfaces/JSONRPCRequest.md)\<`T`, keyof `T`\>

### next

() => `Promise`\<[`JSONRPCResponse`](../interfaces/JSONRPCResponse.md)\<`T`\>\>

## Returns

`Promise`\<[`JSONRPCResponse`](../interfaces/JSONRPCResponse.md)\<`T`\>\>

## Example

```typescript
const loggingMiddleware: JSONRPCMiddleware<MethodMap, Context> =
  async (context, request, next) => {
    console.log('Request:', request);
    const response = await next();
    console.log('Response:', response);
    return response;
  };

const authMiddleware: JSONRPCMiddleware<MethodMap, Context> =
  async (context, request, next) => {
    if (!context.isAuthorized) {
      throw new JSONRPCError(-32600, 'Unauthorized');
    }
    return next();
  };
```

## Defined in

[packages/jsonrpc/src/types.ts:285](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L285)
