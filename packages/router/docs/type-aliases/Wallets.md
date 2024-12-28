[**@walletmesh/router v0.1.4**](../README.md)

***

[@walletmesh/router](../globals.md) / Wallets

# Type Alias: Wallets

> **Wallets**: `Map`\<[`ChainId`](ChainId.md), [`WalletClient`](../interfaces/WalletClient.md)\>

Maps chain IDs to their corresponding wallet client instances

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', new MyWalletClient(...)],
  ['eip155:1', new JSONRPCWalletClient(...)]
]);
```

## Defined in

[packages/router/src/types.ts:203](https://github.com/WalletMesh/wm-core/blob/40d9ac703a60d56bcb0a355b02e8bd000f79ddc3/packages/router/src/types.ts#L203)
