[**@walletmesh/jsonrpc v0.5.3**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCSerializedData

# Function: isJSONRPCSerializedData()

> **isJSONRPCSerializedData**(`value`): `value is JSONRPCSerializedData`

Defined in: [core/jsonrpc/src/utils.ts:66](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/utils.ts#L66)

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
