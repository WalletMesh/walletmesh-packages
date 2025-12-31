[**@walletmesh/router v0.5.4**](../../README.md)

***

[@walletmesh/router](../../modules.md) / [index](../README.md) / Wallets

# Type Alias: Wallets

> **Wallets** = `Map`\<[`ChainId`](ChainId.md), `JSONRPCTransport`\>

Defined in: [core/router/src/types.ts:291](https://github.com/WalletMesh/walletmesh-packages/blob/12c69c80bd306fd0702c0580f12668e94970ec0a/core/router/src/types.ts#L291)

Maps chain IDs to their corresponding transport instances.
The router will create JSONRPCProxy instances for each transport.

## Example

```typescript
const wallets = new Map([
  ['aztec:testnet', aztecTransport],
  ['eip155:1', ethereumTransport]
]);
```
