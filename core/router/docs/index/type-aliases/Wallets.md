[**@walletmesh/router v0.2.7**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / Wallets

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

[packages/router/src/types.ts:314](https://github.com/WalletMesh/wm-core/blob/a301044367e6b9b3eb697a31c54886b183ad9507/packages/router/src/types.ts#L314)
