[**@walletmesh/discovery v0.1.0**](../README.md)

***

[@walletmesh/discovery](../globals.md) / ChainType

# Type Alias: ChainType

> **ChainType** = *typeof* [`CHAIN_TYPES`](../variables/CHAIN_TYPES.md)\[keyof *typeof* [`CHAIN_TYPES`](../variables/CHAIN_TYPES.md)\]

Defined in: [core/types.ts:484](https://github.com/WalletMesh/walletmesh-packages/blob/fc3310ff0ec44933a1b4c165e68e42e82ba44c03/core/discovery/src/core/types.ts#L484)

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
