[**@walletmesh/jsonrpc v0.2.0**](../README.md)

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

[packages/jsonrpc/src/types.ts:35](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/jsonrpc/src/types.ts#L35)
