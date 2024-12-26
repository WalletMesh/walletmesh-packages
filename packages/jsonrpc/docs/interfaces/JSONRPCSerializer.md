[@walletmesh/jsonrpc - v0.1.0](../README.md) / [Exports](../modules.md) / JSONRPCSerializer

# Interface: JSONRPCSerializer\<P, R\>

Interface for RPC method parameter and result serialization.
Allows defining separate serializers for method parameters and return values.

**`Example`**

```typescript
const methodSerializer: JSONRPCSerializer<{ date: Date }, Date> = {
  params: dateSerializer,
  result: dateSerializer
};
```

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

[packages/jsonrpc/src/types.ts:97](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L97)

___

### result

• `Optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Optional serializer for method result

#### Defined in

[packages/jsonrpc/src/types.ts:102](https://github.com/WalletMesh/wm-core/blob/351ac0992a6d17e5eaa6dfdd01d65d52a269e856/packages/jsonrpc/src/types.ts#L102)
