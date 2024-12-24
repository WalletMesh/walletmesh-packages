[@walletmesh/jsonrpc - v0.0.5](../README.md) / [Exports](../modules.md) / JSONRPCSerializer

# Interface: JSONRPCSerializer\<P, R\>

Interface for RPC method parameter and result serialization.

## Type parameters

| Name | Description |
| :------ | :------ |
| `P` | The parameters type |
| `R` | The result type |

## Table of contents

### Properties

- [params](JSONRPCSerializer.md#params)
- [result](JSONRPCSerializer.md#result)

## Properties

### params

• **params**: [`Serializer`](Serializer.md)\<`P`\>

Serializer for method parameters

#### Defined in

[packages/jsonrpc/src/types.ts:48](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L48)

___

### result

• `Optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Optional serializer for method result

#### Defined in

[packages/jsonrpc/src/types.ts:53](https://github.com/WalletMesh/wm-core/blob/1dbaf3b1e3393bf13c79604523a2ca2c274ab8a3/packages/jsonrpc/src/types.ts#L53)
