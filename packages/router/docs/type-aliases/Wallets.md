[**@walletmesh/router v0.2.2**](../README.md)

***

[@walletmesh/router](../globals.md) / Wallets

# Type Alias: Wallets

> **Wallets**: `Map`\<[`ChainId`](ChainId.md), [`WalletClient`](../interfaces/WalletClient.md)\>

Maps chain IDs to their corresponding wallet client instances.
Used by the router to maintain connections to multiple chains.

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', new MyWalletClient(...)],
  ['eip155:1', new JSONRPCWalletClient(...)]
]);
```

## Defined in

[packages/router/src/types.ts:297](https://github.com/WalletMesh/wm-core/blob/e2f83503fa9ae7df056049cc70c5ae8c9a3bae87/packages/router/src/types.ts#L297)
