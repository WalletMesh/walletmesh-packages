[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / Serializer

# Interface: Serializer\<T\>

Interface for serializing and deserializing values.

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

[packages/jsonrpc/src/types.ts:36](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L36)

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

[packages/jsonrpc/src/types.ts:29](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L29)
