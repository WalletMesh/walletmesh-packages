[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCID

# Type Alias: JSONRPCID

> **JSONRPCID** = `undefined` \| `string` \| `number` \| `null`

Defined in: [core/jsonrpc/src/types.ts:15](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L15)

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
