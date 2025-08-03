[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializedData

# Type Alias: JSONRPCSerializedData

> **JSONRPCSerializedData** = `object`

Defined in: [core/jsonrpc/src/types.ts:48](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L48)

Represents serialized data in a JSON-RPC message.
Used by serializers to convert complex types to/from JSON-compatible format.

## Example

```typescript
const serialized: JSONRPCSerializedData = {
  serialized: JSON.stringify({ date: new Date().toISOString() })
};
```

## Properties

### method

> **method**: `string`

Defined in: [core/jsonrpc/src/types.ts:50](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L50)

***

### serialized

> **serialized**: `string`

Defined in: [core/jsonrpc/src/types.ts:49](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L49)
