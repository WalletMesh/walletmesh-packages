[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / applyToMethods

# Function: applyToMethods()

> **applyToMethods**\<`T`, `C`\>(`methods`, `middleware`): [`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

Defined in: [core/jsonrpc/src/utils.ts:99](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/utils.ts#L99)

Helper function to apply middleware only to specific methods.
Creates a new middleware that only executes for the specified methods,
passing through all other requests unchanged.

## Type Parameters

### T

`T` *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

### C

`C` *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

## Parameters

### methods

keyof `T`[]

Array of method names to apply the middleware to

### middleware

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

The middleware function to apply

## Returns

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

A new middleware function that only applies to specified methods

## Example

```typescript
// Create logging middleware only for 'add' and 'subtract' methods
const loggerMiddleware = applyToMethods(['add', 'subtract'],
  async (context, request, next) => {
    console.log(`Calling ${request.method}`);
    const result = await next();
    console.log(`${request.method} returned:`, result);
    return result;
  }
);
```
