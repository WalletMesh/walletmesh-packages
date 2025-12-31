[**@walletmesh/router v0.5.3**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / Wallets

# Type Alias: Wallets

> **Wallets** = `Map`\<[`ChainId`](ChainId.md), `JSONRPCTransport`\>

Defined in: [core/router/src/types.ts:291](https://github.com/WalletMesh/walletmesh-packages/blob/446dec432cc153439780754190143ccaef5b7157/core/router/src/types.ts#L291)

Maps chain IDs to their corresponding transport instances.
The router will create JSONRPCProxy instances for each transport.

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', aztecTransport],
  ['eip155:1', ethereumTransport]
]);
```
