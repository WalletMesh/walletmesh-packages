[**@walletmesh/jsonrpc v0.2.1**](../README.md)

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

[packages/jsonrpc/src/types.ts:15](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L15)
