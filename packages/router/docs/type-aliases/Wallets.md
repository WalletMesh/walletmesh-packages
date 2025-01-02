[**@walletmesh/router v0.2.0**](../README.md)

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

[packages/router/src/types.ts:170](https://github.com/WalletMesh/wm-core/blob/24d804c0c8aae98a58c266d296afc1e3185903b9/packages/router/src/types.ts#L170)
