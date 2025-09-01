[**@walletmesh/jsonrpc v0.5.2**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCContext

# Type Alias: JSONRPCContext

> **JSONRPCContext** = `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/types.ts:432](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/jsonrpc/src/types.ts#L432)

Base type for context objects shared between middleware and method handlers.
Extend this type to add custom context properties.

## Example

```typescript
type CustomContext = JSONRPCContext & {
  user?: string;
  isAuthorized?: boolean;
  session?: {
    id: string;
    expires: Date;
  };
};
```
