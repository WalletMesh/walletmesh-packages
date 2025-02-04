[**@walletmesh/jsonrpc v0.3.0**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCContext

# Type Alias: JSONRPCContext

> **JSONRPCContext**: `Record`\<`string`, `unknown`\>

Defined in: [core/jsonrpc/src/types.ts:432](https://github.com/WalletMesh/walletmesh-packages/blob/8bd3463e6f13efdfce2c89f2c9b61ad3469e2d6a/core/jsonrpc/src/types.ts#L432)

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
