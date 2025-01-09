[**@walletmesh/router v0.2.5**](../README.md)

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

[packages/router/src/types.ts:303](https://github.com/WalletMesh/wm-core/blob/029833dae03ab213226c249f4b4c3cb073ca5efd/packages/router/src/types.ts#L303)
