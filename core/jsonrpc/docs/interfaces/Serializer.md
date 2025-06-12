[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / Serializer

# Interface: Serializer\<T\>

Defined in: [core/jsonrpc/src/types.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/jsonrpc/src/types.ts#L67)

Interface for serializing and deserializing values.
Enables custom type conversion for complex objects that need special handling.

## Example

```typescript
const dateSerializer: Serializer<Date> = {
  serialize: (date) => ({ serialized: date.toISOString() }),
  deserialize: (data) => new Date(data.serialized)
};
```

## Type Parameters

### T

`T`

The type of value to serialize/deserialize

## Methods

### deserialize()

> **deserialize**(`method`, `value`): `Promise`\<`T`\>

Defined in: [core/jsonrpc/src/types.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/jsonrpc/src/types.ts#L82)

Deserializes JSONRPCSerializedData back to the original type

#### Parameters

##### method

`string`

The method name associated with this deserialization

##### value

[`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

The serialized data to deserialize

#### Returns

`Promise`\<`T`\>

The deserialized value

***

### serialize()

> **serialize**(`method`, `value`): `Promise`\<[`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)\>

Defined in: [core/jsonrpc/src/types.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/cb714b71a23dbdbacd8723a799d14c589fdf51f9/core/jsonrpc/src/types.ts#L74)

Serializes a value to JSONRPCSerializedData

#### Parameters

##### method

`string`

The method name associated with this serialization

##### value

`T`

The value to serialize

#### Returns

`Promise`\<[`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)\>

The serialized data
