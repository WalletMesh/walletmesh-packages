[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / Serializer

# Interface: Serializer\<T\>

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

• **T**

The type of value to serialize/deserialize

## Methods

### deserialize()

> **deserialize**(`value`): `T`

Deserializes JSONRPCSerializedData back to the original type

#### Parameters

##### value

[`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

The serialized data to deserialize

#### Returns

`T`

The deserialized value

#### Defined in

[packages/jsonrpc/src/types.ts:75](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L75)

***

### serialize()

> **serialize**(`value`): [`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

Serializes a value to JSONRPCSerializedData

#### Parameters

##### value

`T`

The value to serialize

#### Returns

[`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

The serialized data

#### Defined in

[packages/jsonrpc/src/types.ts:68](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L68)
