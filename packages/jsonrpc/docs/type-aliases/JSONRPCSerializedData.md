[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializedData

# Type Alias: JSONRPCSerializedData

> **JSONRPCSerializedData**: `object`

Represents serialized data in a JSON-RPC message.
Used by serializers to convert complex types to/from JSON-compatible format.

## Type declaration

### serialized

> **serialized**: `string`

## Example

```typescript
const serialized: JSONRPCSerializedData = {
  serialized: JSON.stringify({ date: new Date().toISOString() })
};
```

## Defined in

[packages/jsonrpc/src/types.ts:46](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L46)
