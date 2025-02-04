[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / Serializer

# Interface: Serializer\<T\>

Defined in: [core/jsonrpc/src/types.ts:67](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L67)

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

> **deserialize**(`method`, `value`): `T`

Defined in: [core/jsonrpc/src/types.ts:82](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L82)

Deserializes JSONRPCSerializedData back to the original type

#### Parameters

##### method

`string`

The method name associated with this deserialization

##### value

[`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

The serialized data to deserialize

#### Returns

`T`

The deserialized value

***

### serialize()

> **serialize**(`method`, `value`): [`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

Defined in: [core/jsonrpc/src/types.ts:74](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L74)

Serializes a value to JSONRPCSerializedData

#### Parameters

##### method

`string`

The method name associated with this serialization

##### value

`T`

The value to serialize

#### Returns

[`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

The serialized data
