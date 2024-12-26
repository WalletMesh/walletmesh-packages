[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodDef

# Type Alias: JSONRPCMethodDef\<P, R\>

> **JSONRPCMethodDef**\<`P`, `R`\>: `object`

Defines a JSON-RPC method's parameter and result types, with optional serialization.

## Type Parameters

• **P** *extends* [`JSONRPCParams`](JSONRPCParams.md) = [`JSONRPCParams`](JSONRPCParams.md)

• **R** = `unknown`

## Type declaration

### params?

> `optional` **params**: `P`

The parameters of the method.

### result

> **result**: `R`

The result of the method.

### serializer?

> `optional` **serializer**: [`JSONRPCSerializer`](../interfaces/JSONRPCSerializer.md)\<`P`, `R`\>

Optional serializer for parameters and result

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

## Defined in

[packages/jsonrpc/src/types.ts:125](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L125)
