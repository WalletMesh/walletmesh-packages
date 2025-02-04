[**@walletmesh/jsonrpc v0.2.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodDef

# Interface: JSONRPCMethodDef\<P, R\>

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

• **P** *extends* [`JSONRPCParams`](../type-aliases/JSONRPCParams.md) = [`JSONRPCParams`](../type-aliases/JSONRPCParams.md)

• **R** = `unknown`

## Properties

### params?

> `optional` **params**: `P`

The parameters of the method.

#### Defined in

[packages/jsonrpc/src/types.ts:134](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L134)

***

### result

> **result**: `R`

The result of the method.

#### Defined in

[packages/jsonrpc/src/types.ts:136](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L136)

***

### serializer?

> `optional` **serializer**: [`JSONRPCSerializer`](JSONRPCSerializer.md)\<`P`, `R`\>

Optional serializer for parameters and result

#### Defined in

[packages/jsonrpc/src/types.ts:138](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/jsonrpc/src/types.ts#L138)
