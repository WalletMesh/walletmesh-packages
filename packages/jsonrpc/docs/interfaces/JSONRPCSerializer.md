[**@walletmesh/jsonrpc v0.2.1**](../README.md)

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

[packages/jsonrpc/src/types.ts:104](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L104)

***

### result?

> `optional` **result**: [`Serializer`](Serializer.md)\<`R`\>

Optional serializer for method result

#### Defined in

[packages/jsonrpc/src/types.ts:109](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L109)
