[**@walletmesh/jsonrpc v0.2.2**](../README.md)

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

[packages/jsonrpc/src/types.ts:104](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L104)

***

### result?

> `optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Optional serializer for method result

#### Defined in

[packages/jsonrpc/src/types.ts:109](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L109)
