[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializedData

# Type Alias: JSONRPCSerializedData

> **JSONRPCSerializedData**: `object`

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

## Defined in

[packages/jsonrpc/src/types.ts:48](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L48)
