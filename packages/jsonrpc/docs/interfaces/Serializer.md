[**@walletmesh/jsonrpc v0.2.1**](../README.md)

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

> **deserialize**(`method`, `value`): `T`

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

#### Defined in

[packages/jsonrpc/src/types.ts:82](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L82)

***

### serialize()

> **serialize**(`method`, `value`): [`JSONRPCSerializedData`](../type-aliases/JSONRPCSerializedData.md)

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

#### Defined in

[packages/jsonrpc/src/types.ts:74](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L74)
