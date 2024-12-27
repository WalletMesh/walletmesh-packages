[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCID

# Type Alias: JSONRPCID

> **JSONRPCID**: `undefined` \| `string` \| `number`

Represents a JSON-RPC message identifier.
- `undefined` for notifications (messages that don't require a response)
- `string` or `number` for request/response correlation

## Example

```typescript
const id: JSONRPCID = "request-123"; // String ID
const id: JSONRPCID = 456; // Numeric ID
const id: JSONRPCID = undefined; // Notification (no response expected)
```

## Defined in

[packages/jsonrpc/src/types.ts:13](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L13)
