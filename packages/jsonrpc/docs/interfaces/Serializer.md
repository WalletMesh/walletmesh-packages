[@walletmesh/jsonrpc - v0.1.0](../README.md) / [Exports](../modules.md) / Serializer

# Interface: Serializer\<T\>

Interface for serializing and deserializing values.
Enables custom type conversion for complex objects that need special handling.

**`Example`**

```typescript
const dateSerializer: Serializer<Date> = {
  serialize: (date) => ({ serialized: date.toISOString() }),
  deserialize: (data) => new Date(data.serialized)
};
```

## Type parameters

| Name | Description |
| :------ | :------ |
| `T` | The type of value to serialize/deserialize |

## Table of contents

### Methods

- [deserialize](Serializer.md#deserialize)
- [serialize](Serializer.md#serialize)

## Methods

### deserialize

▸ **deserialize**(`value`): `T`

Deserializes JSONRPCSerializedData back to the original type

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | [`JSONRPCSerializedData`](../modules.md#jsonrpcserializeddata) | The serialized data to deserialize |

#### Returns

`T`

The deserialized value

#### Defined in

[packages/jsonrpc/src/types.ts:75](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L75)

___

### serialize

▸ **serialize**(`value`): [`JSONRPCSerializedData`](../modules.md#jsonrpcserializeddata)

Serializes a value to JSONRPCSerializedData

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `value` | `T` | The value to serialize |

#### Returns

[`JSONRPCSerializedData`](../modules.md#jsonrpcserializeddata)

The serialized data

#### Defined in

[packages/jsonrpc/src/types.ts:68](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L68)
