[**@walletmesh/router v0.5.2**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / Wallets

# Type Alias: Wallets

> **Wallets** = `Map`\<[`ChainId`](ChainId.md), `JSONRPCTransport`\>

Defined in: [core/router/src/types.ts:287](https://github.com/WalletMesh/walletmesh-packages/blob/c94d361eeb2b51b24d2b03a1f35e414d76e00d1a/core/router/src/types.ts#L287)

Maps chain IDs to their corresponding transport instances.
The router will create JSONRPCProxy instances for each transport.

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', aztecTransport],
  ['eip155:1', ethereumTransport]
]);
```
