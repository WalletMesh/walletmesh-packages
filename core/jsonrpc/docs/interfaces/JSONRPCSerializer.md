[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializer

# Interface: JSONRPCSerializer\<P, R\>

Defined in: [core/jsonrpc/src/types.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L100)

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

### P

`P`

The parameters type

### R

`R`

The result type

## Properties

### params

> **params**: [`Serializer`](Serializer.md)\<`P`\>

Defined in: [core/jsonrpc/src/types.ts:104](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L104)

Serializer for method parameters

***

### result?

> `optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Defined in: [core/jsonrpc/src/types.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L109)

Optional serializer for method result
