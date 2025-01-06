[**@walletmesh/jsonrpc v0.2.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCMethodMap

# Interface: JSONRPCMethodMap

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
