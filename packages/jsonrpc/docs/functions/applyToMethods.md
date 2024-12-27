[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / applyToMethods

# Function: applyToMethods()

> **applyToMethods**\<`T`, `C`\>(`methods`, `middleware`): [`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

Creates a middleware that only applies to specific JSON-RPC methods.
This is useful for applying middleware selectively, such as authentication
for sensitive operations or logging for specific methods.

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

The RPC method map defining available methods

• **C** *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

The context type shared between middleware and handlers

## Parameters

### methods

keyof `T`[]

Array of method names to apply the middleware to

### middleware

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

The middleware to apply to the specified methods

## Returns

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`T`, `C`\>

A new middleware function that only executes for the specified methods

## Example

```typescript
// Apply authentication only to sensitive methods
peer.addMiddleware(
  applyToMethods(['transferFunds', 'updateProfile'],
    async (context, request, next) => {
      if (!context.isAuthenticated) {
        throw new JSONRPCError(-32600, 'Authentication required');
      }
      return next();
    }
  )
);
```

## Defined in

[packages/jsonrpc/src/utils.ts:36](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/utils.ts#L36)
