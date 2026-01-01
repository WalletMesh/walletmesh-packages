[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / filterWalletsByChain

# Function: filterWalletsByChain()

> **filterWalletsByChain**(`wallets`, `chainTypes`): [`WalletInfo`](../interfaces/WalletInfo.md)[]

Filter wallets by supported chain types

## Parameters

### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Wallets to filter

### chainTypes

[`ChainType`](../enumerations/ChainType.md)[]

Required chain types

## Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Filtered wallets that support all specified chain types

## Example

```typescript
const evmWallets = filterWalletsByChain(wallets, ['evm']);
const multiChainWallets = filterWalletsByChain(wallets, ['evm', 'solana']);
```
