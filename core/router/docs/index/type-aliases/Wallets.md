[**@walletmesh/router v0.5.1**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / Wallets

# Type Alias: Wallets

> **Wallets** = `Map`\<[`ChainId`](ChainId.md), `JSONRPCTransport`\>

Defined in: [core/router/src/types.ts:287](https://github.com/WalletMesh/walletmesh-packages/blob/b4e8275ca7fd630da8805eefb9f46ce3ea47f1dc/core/router/src/types.ts#L287)

Maps chain IDs to their corresponding transport instances.
The router will create JSONRPCProxy instances for each transport.

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', aztecTransport],
  ['eip155:1', ethereumTransport]
]);
```
