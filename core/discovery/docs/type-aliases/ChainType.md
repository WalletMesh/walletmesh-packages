[**@walletmesh/discovery v0.1.1**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ChainType

# Type Alias: ChainType

> **ChainType** = *typeof* [`CHAIN_TYPES`](../variables/CHAIN_TYPES.md)\[keyof *typeof* [`CHAIN_TYPES`](../variables/CHAIN_TYPES.md)\]

Defined in: [core/types.ts:484](https://github.com/WalletMesh/walletmesh-packages/blob/934e9a1d3ee68619aca30a75a8aa0f0254f44ba7/core/discovery/src/core/types.ts#L484)

Chain type classification for blockchain networks.

Categorizes blockchains by their fundamental architecture and
transaction models to enable appropriate wallet integration.

## Example

```typescript
const chainType: ChainType = 'evm'; // Ethereum Virtual Machine
const chainType: ChainType = 'account'; // Account-based (Solana, Aztec)
```

## Since

0.1.0

## See

[CHAIN\_TYPES](../variables/CHAIN_TYPES.md) for available values
