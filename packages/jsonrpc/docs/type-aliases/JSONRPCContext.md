[**@walletmesh/jsonrpc v0.2.1**](../README.md)

***

[@walletmesh/jsonrpc](../globals.md) / JSONRPCContext

# Type Alias: JSONRPCContext

> **JSONRPCContext**: `Record`\<`string`, `unknown`\>

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

## Defined in

[packages/jsonrpc/src/types.ts:432](https://github.com/WalletMesh/wm-core/blob/a9df9bbf5472f2e76d37a4177ff0bdcc90012260/packages/jsonrpc/src/types.ts#L432)
