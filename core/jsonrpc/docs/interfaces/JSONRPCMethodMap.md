[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodMap

# Interface: JSONRPCMethodMap

Defined in: [core/jsonrpc/src/types.ts:158](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/jsonrpc/src/types.ts#L158)

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
