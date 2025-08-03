[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodDef

# Interface: JSONRPCMethodDef\<P, R\>

Defined in: [core/jsonrpc/src/types.ts:132](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L132)

Defines a JSON-RPC method's parameter and result types, with optional serialization.

## Example

```typescript
type AddMethod = JSONRPCMethodDef<
  { a: number; b: number }, // Parameters type
  number                    // Result type
>;

type DateMethod = JSONRPCMethodDef<
  { date: Date },  // Parameters type
  Date,            // Result type
  {
    params: dateSerializer,
    result: dateSerializer
  }
>;
```

## Type Parameters

### P

`P` *extends* [`JSONRPCParams`](../type-aliases/JSONRPCParams.md) = [`JSONRPCParams`](../type-aliases/JSONRPCParams.md)

### R

`R` = `unknown`

## Properties

### params?

> `optional` **params**: `P`

Defined in: [core/jsonrpc/src/types.ts:134](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L134)

The parameters of the method.

***

### result

> **result**: `R`

Defined in: [core/jsonrpc/src/types.ts:136](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L136)

The result of the method.

***

### serializer?

> `optional` **serializer**: [`JSONRPCSerializer`](JSONRPCSerializer.md)\<`P`, `R`\>

Defined in: [core/jsonrpc/src/types.ts:138](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L138)

Optional serializer for parameters and result
