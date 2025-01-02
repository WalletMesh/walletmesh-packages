[**@walletmesh/jsonrpc v0.2.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / applyToMethods

# Function: applyToMethods()

> **applyToMethods**\<`T`, `C`\>(`methods`, `middleware`): [`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

Helper function to apply middleware only to specific methods.
Creates a new middleware that only executes for the specified methods,
passing through all other requests unchanged.

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

• **C** *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

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

## Defined in

[packages/jsonrpc/src/utils.ts:99](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/jsonrpc/src/utils.ts#L99)
