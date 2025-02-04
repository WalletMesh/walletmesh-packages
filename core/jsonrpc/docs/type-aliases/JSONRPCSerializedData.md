[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializedData

# Type Alias: JSONRPCSerializedData

> **JSONRPCSerializedData**: `object`

Defined in: [core/jsonrpc/src/types.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L48)

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
