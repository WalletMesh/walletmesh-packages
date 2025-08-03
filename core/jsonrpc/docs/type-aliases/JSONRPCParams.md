[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCParams

# Type Alias: JSONRPCParams

> **JSONRPCParams** = `undefined` \| `unknown`[] \| `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L35)

Represents JSON-RPC method parameters.
- `undefined` for methods without parameters
- Array for positional parameters
- Object for named parameters

## Example

```typescript
// No parameters
const params: JSONRPCParams = undefined;

// Positional parameters
const params: JSONRPCParams = [1, "hello", true];

// Named parameters
const params: JSONRPCParams = { x: 1, y: 2, message: "hello" };
```
