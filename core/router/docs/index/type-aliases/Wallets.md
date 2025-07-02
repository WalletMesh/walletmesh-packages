[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / Wallets

# Type Alias: Wallets

> **Wallets** = `Map`\<[`ChainId`](ChainId.md), `JSONRPCTransport`\>

Defined in: [core/router/src/types.ts:287](https://github.com/WalletMesh/walletmesh-packages/blob/29a725fa4894aa0a113a79e94e05ab0d38faf617/core/router/src/types.ts#L287)

Maps chain IDs to their corresponding transport instances.
The router will create JSONRPCProxy instances for each transport.

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', aztecTransport],
  ['eip155:1', ethereumTransport]
]);
```
