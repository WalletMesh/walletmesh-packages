[**@walletmesh/jsonrpc v0.2.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMiddleware

# Type Alias: JSONRPCMiddleware()\<T, C\>

> **JSONRPCMiddleware**\<`T`, `C`\>: (`context`, `request`, `next`) => `Promise`\<[`JSONRPCResponse`](../interfaces/JSONRPCResponse.md)\<`T`\>\>

Represents a middleware function that can intercept and modify JSON-RPC requests/responses.
Middleware functions are executed in order before and after method handlers,
allowing for cross-cutting concerns like logging, authentication, and error handling.

## Type Parameters

• **T** *extends* [`JSONRPCMethodMap`](../interfaces/JSONRPCMethodMap.md)

The RPC method map defining available methods and their types

• **C** *extends* [`JSONRPCContext`](JSONRPCContext.md)

The context type shared between middleware and handlers (defaults to JSONRPCContext)

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
// Logging middleware with timing
const loggingMiddleware: JSONRPCMiddleware<MethodMap, Context> =
  async (context, request, next) => {
    const startTime = Date.now();
    console.log(`[${startTime}] Request:`, request);

    try {
      const response = await next();
      console.log(`[${Date.now()}] Response (${Date.now() - startTime}ms):`, response);
      return response;
    } catch (error) {
      console.error(`[${Date.now()}] Error (${Date.now() - startTime}ms):`, error);
      throw error;
    }
  };

// Authentication middleware with role checking
const authMiddleware: JSONRPCMiddleware<MethodMap, Context> =
  async (context, request, next) => {
    if (!context.isAuthorized) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Unauthorized',
          data: { requiredRole: 'admin' }
        },
        id: request.id
      };
    }
    return next();
  };

// Rate limiting middleware
const rateLimitMiddleware: JSONRPCMiddleware<MethodMap, Context> =
  async (context, request, next) => {
    const { ip } = context;
    const limit = await rateLimit.check(ip);
    if (!limit.success) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Rate limit exceeded',
          data: {
            retryAfter: limit.resetTime,
            limit: limit.max,
            remaining: limit.remaining
          }
        },
        id: request.id
      };
    }
    return next();
  };
```

## Defined in

[packages/jsonrpc/src/types.ts:410](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/jsonrpc/src/types.ts#L410)
