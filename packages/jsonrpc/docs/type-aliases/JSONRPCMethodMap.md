[**@walletmesh/jsonrpc v0.1.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodMap

# Type Alias: JSONRPCMethodMap

> **JSONRPCMethodMap**: `object`

Maps method names to their definitions in a JSON-RPC interface.

## Index Signature

 \[`method`: `string`\]: [`JSONRPCMethodDef`](JSONRPCMethodDef.md)\<[`JSONRPCParams`](JSONRPCParams.md), `unknown`\>

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

## Defined in

[packages/jsonrpc/src/types.ts:151](https://github.com/WalletMesh/wm-core/blob/ca24b7b8f21531f05ecff96e90cf42e8939b1d82/packages/jsonrpc/src/types.ts#L151)
