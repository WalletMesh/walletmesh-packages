[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCID

# Type Alias: JSONRPCID

> **JSONRPCID**: `undefined` \| `string` \| `number` \| `null`

Defined in: [core/jsonrpc/src/types.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L15)

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
