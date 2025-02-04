[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializer

# Interface: JSONRPCSerializer\<P, R\>

Defined in: [core/jsonrpc/src/types.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L100)

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

Defined in: [core/jsonrpc/src/types.ts:104](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L104)

Serializer for method parameters

***

### result?

> `optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Defined in: [core/jsonrpc/src/types.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L109)

Optional serializer for method result
