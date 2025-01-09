[**@walletmesh/router v0.2.6**](../../README.md)

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

[packages/router/src/types.ts:314](https://github.com/WalletMesh/wm-core/blob/519bfb4dcad8563598529a3bcc463d74c3222676/packages/router/src/types.ts#L314)
