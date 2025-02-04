[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodMap

# Interface: JSONRPCMethodMap

Defined in: [core/jsonrpc/src/types.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L158)

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

\[`method`: `string`\]: [`JSONRPCMethodDef`](JSONRPCMethodDef.md)
