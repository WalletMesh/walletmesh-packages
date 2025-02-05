[**@walletmesh/jsonrpc v0.4.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializedData

# Type Alias: JSONRPCSerializedData

> **JSONRPCSerializedData**: `object`

Defined in: [core/jsonrpc/src/types.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/937a416f9c444488735f94f0d3eb35a7feadda3e/core/jsonrpc/src/types.ts#L48)

Represents serialized data in a JSON-RPC message.
Used by serializers to convert complex types to/from JSON-compatible format.

## Type declaration

### method

> **method**: `string`

### serialized

> **serialized**: `string`

## Example

```typescript
const serialized: JSONRPCSerializedData = {
  serialized: JSON.stringify({ date: new Date().toISOString() })
};
```
