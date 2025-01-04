[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCSerializedData

# Function: isJSONRPCSerializedData()

> **isJSONRPCSerializedData**(`value`): `value is JSONRPCSerializedData`

Type guard to check if a value matches the JSONRPCSerializedData format.
Valid serialized data must be an object with a 'serialized' property containing a string.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is JSONRPCSerializedData`

True if the value matches the JSONRPCSerializedData format, false otherwise

## Example

```typescript
isJSONRPCSerializedData({ serialized: "data" });  // true
isJSONRPCSerializedData({ serialized: 123 });     // false
isJSONRPCSerializedData({ data: "string" });      // false
```

## Defined in

[packages/jsonrpc/src/utils.ts:66](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/utils.ts#L66)
