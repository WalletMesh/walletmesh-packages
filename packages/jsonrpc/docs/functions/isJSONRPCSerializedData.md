[**@walletmesh/jsonrpc v0.1.0**](../README.md)

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

[packages/jsonrpc/src/utils.ts:104](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/utils.ts#L104)
