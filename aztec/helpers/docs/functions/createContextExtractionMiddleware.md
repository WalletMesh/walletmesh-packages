[**@walletmesh/aztec-helpers v0.5.6**](../README.md)

***

[@walletmesh/aztec-helpers](../globals.md) / createContextExtractionMiddleware

# Function: createContextExtractionMiddleware()

> **createContextExtractionMiddleware**(): `JSONRPCMiddleware`\<`any`, `any`\>

Defined in: [middlewares/contextExtractionMiddleware.ts:60](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/aztec/helpers/src/middlewares/contextExtractionMiddleware.ts#L60)

Creates middleware that extracts forwarded context from requests.

This middleware checks if the request contains a `_context` field (added by the router
when forwarding requests) and extracts it into the RPC context. This makes the origin
and other context information available to method handlers and other middleware.

The middleware sets the following context properties:
- `context.origin`: The dApp origin forwarded from the router
- `context.sessionId`: The session ID if included in forwarded context

**Important**: This middleware should be added BEFORE permission middleware so that
permission checks have access to the correct origin.

## Returns

`JSONRPCMiddleware`\<`any`, `any`\>

Middleware function that extracts context from requests

## Examples

```typescript
import { JSONRPCNode } from '@walletmesh/jsonrpc';
import { createContextExtractionMiddleware } from '@walletmesh/aztec/helpers';

// Create Aztec wallet node
const walletNode = createAztecWalletNode(wallet, pxe, transport);

// Add context extraction middleware BEFORE permission middleware
walletNode.addMiddleware(createContextExtractionMiddleware());

// Permission middleware can now use context.origin
walletNode.addMiddleware(async (context, request, next) => {
  const origin = context.origin || 'unknown';
  console.log('Request from:', origin); // Correctly shows dApp origin
  return next();
});
```

```typescript
// In Wallet.tsx - apply before permission middleware
const aztecWalletNode = createAztecWalletNode(wallet, pxe, walletTransport);

// Add context extraction middleware FIRST
aztecWalletNode.addMiddleware(createContextExtractionMiddleware());

// Then add permission middleware (which needs origin)
aztecWalletNode.addMiddleware(permissionMiddleware);
```
