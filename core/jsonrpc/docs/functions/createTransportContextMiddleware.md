[**@walletmesh/jsonrpc v0.5.3**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / createTransportContextMiddleware

# Function: createTransportContextMiddleware()

> **createTransportContextMiddleware**\<`C`\>(`transport`): [`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`any`, `C`\>

Defined in: [core/jsonrpc/src/middlewares/transportContext.ts:76](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/middlewares/transportContext.ts#L76)

Creates middleware that extracts context from transports.

This middleware checks if the transport implements `getMessageContext()` and,
if so, extracts trusted context information (like browser-validated origin)
and injects it into the RPC context.

The middleware sets the following context properties:
- `context.origin`: The trusted origin from the transport (if available)
- `context._transportMeta`: Full transport context metadata

## Type Parameters

### C

`C` *extends* [`JSONRPCContext`](../type-aliases/JSONRPCContext.md)

## Parameters

### transport

[`JSONRPCTransport`](../interfaces/JSONRPCTransport.md)

The JSON-RPC transport instance

## Returns

[`JSONRPCMiddleware`](../type-aliases/JSONRPCMiddleware.md)\<`any`, `C`\>

Middleware function that injects transport context

## Examples

```typescript
import { JSONRPCNode } from '@walletmesh/jsonrpc';
import { createTransportContextMiddleware } from '@walletmesh/jsonrpc/middlewares';

// Create transport (e.g., PopupWindowTransport that implements getMessageContext)
const transport = new PopupWindowTransport({...});

// Create JSON-RPC node
const node = new JSONRPCNode(transport, {});

// Add transport context middleware FIRST (before other middleware)
node.addMiddleware(createTransportContextMiddleware(transport));

// Add other middleware that can now access context.origin
node.addMiddleware(async (context, request, next) => {
  console.log('Request from origin:', context.origin); // Browser-validated!
  return next();
});
```

```typescript
// In WalletRouter - automatic origin injection
class WalletRouter {
  constructor(transport, wallets, options) {
    this.node = new JSONRPCNode(transport, {});

    // Add transport context middleware FIRST
    this.node.addMiddleware(createTransportContextMiddleware(transport));

    // Permission middleware can now use context.origin
    this.node.addMiddleware(async (context, request, next) => {
      const origin = context.origin || 'unknown';
      // Validate permissions based on browser-validated origin
      if (!isAllowedOrigin(origin)) {
        throw new Error('Unauthorized origin');
      }
      return next();
    });
  }
}
```
