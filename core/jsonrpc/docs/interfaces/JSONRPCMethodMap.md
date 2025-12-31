[**@walletmesh/jsonrpc v0.5.3**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodMap

# Interface: JSONRPCMethodMap

Defined in: [core/jsonrpc/src/types.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/jsonrpc/src/types.ts#L158)

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
