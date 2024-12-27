[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / isJSONRPCSerializedData

# Function: isJSONRPCSerializedData()

> **isJSONRPCSerializedData**(`value`): `value is JSONRPCSerializedData`

Type guard for validating JSON-RPC serialized data.
Checks if a value matches the JSONRPCSerializedData structure.

## Parameters

### value

`unknown`

The value to check

## Returns

`value is JSONRPCSerializedData`

True if the value is valid serialized data

## Example

```typescript
if (isJSONRPCSerializedData(response.result)) {
  // Handle serialized data
  const result = deserializer.deserialize(response.result);
} else {
  // Handle raw data
  const result = response.result;
}
```

## Defined in

[packages/jsonrpc/src/utils.ts:104](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/utils.ts#L104)
