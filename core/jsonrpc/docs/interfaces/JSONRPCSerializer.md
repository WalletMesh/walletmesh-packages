[**@walletmesh/jsonrpc v0.5.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCSerializer

# Interface: JSONRPCSerializer\<P, R\>

Defined in: [core/jsonrpc/src/types.ts:100](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L100)

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

Defined in: [core/jsonrpc/src/types.ts:104](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L104)

Serializer for method parameters

***

### result?

> `optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Defined in: [core/jsonrpc/src/types.ts:109](https://github.com/WalletMesh/walletmesh-packages/blob/1ba2b5f7f0a07efa447112a7f91ed78eba6c2cd7/core/jsonrpc/src/types.ts#L109)

Optional serializer for method result
