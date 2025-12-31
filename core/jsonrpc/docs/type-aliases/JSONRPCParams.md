[**@walletmesh/jsonrpc v0.5.4**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCParams

# Type Alias: JSONRPCParams

> **JSONRPCParams** = `undefined` \| `unknown`[] \| `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/types.ts:35](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/jsonrpc/src/types.ts#L35)

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
