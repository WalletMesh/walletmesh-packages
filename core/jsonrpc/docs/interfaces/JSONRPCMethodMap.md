[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodMap

# Interface: JSONRPCMethodMap

Defined in: [core/jsonrpc/src/types.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L158)

Maps method names to their definitions in a JSON-RPC interface.

## Example

```typescript
type MethodMap = {
  add: {
    params: { a: number; b: number };
    result: number;
  };
  greet: {
    params: { name: string };
    result: string;
  };
};
```

## Indexable

\[`method`: `string`\]: [`JSONRPCMethodDef`](JSONRPCMethodDef.md)\<[`JSONRPCParams`](../type-aliases/JSONRPCParams.md), `unknown`\>
