[**@walletmesh/jsonrpc v0.1.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCParams

# Type Alias: JSONRPCParams

> **JSONRPCParams**: `undefined` \| `unknown`[] \| `Record`\<`string`, `unknown`\>

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

## Defined in

[packages/jsonrpc/src/types.ts:33](https://github.com/WalletMesh/wm-core/blob/808be19fbf7e44796f646f1849d2f2ede9286bc8/packages/jsonrpc/src/types.ts#L33)
