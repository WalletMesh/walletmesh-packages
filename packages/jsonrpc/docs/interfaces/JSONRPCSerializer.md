[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializer

# Interface: JSONRPCSerializer\<P, R\>

Interface for RPC method parameter and result serialization.
Allows defining separate serializers for method parameters and return values.

## Example

```typescript
const methodSerializer: JSONRPCSerializer<{ date: Date }, Date> = {
  params: dateSerializer,
  result: dateSerializer
};
```

## Type Parameters

• **P**

The parameters type

• **R**

The result type

## Properties

### params

> **params**: [`Serializer`](Serializer.md)\<`P`\>

Serializer for method parameters

#### Defined in

[packages/jsonrpc/src/types.ts:97](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L97)

***

### result?

> `optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Optional serializer for method result

#### Defined in

[packages/jsonrpc/src/types.ts:102](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L102)
