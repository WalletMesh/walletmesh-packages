[**@walletmesh/jsonrpc v0.2.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCID

# Type Alias: JSONRPCID

> **JSONRPCID**: `undefined` \| `string` \| `number` \| `null`

Represents a JSON-RPC message identifier.
- `undefined` for notifications (messages that don't require a response)
- `string` or `number` for request/response correlation
- `null` for error responses to invalid requests

## Example

```typescript
const id: JSONRPCID = "request-123"; // String ID
const id: JSONRPCID = 456; // Numeric ID
const id: JSONRPCID = undefined; // Notification (no response expected)
const id: JSONRPCID = null; // Error response for invalid request
```

## Defined in

[packages/jsonrpc/src/types.ts:15](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L15)
