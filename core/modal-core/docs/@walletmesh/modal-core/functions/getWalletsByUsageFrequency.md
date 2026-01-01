[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getWalletsByUsageFrequency

# Function: getWalletsByUsageFrequency()

> **getWalletsByUsageFrequency**(`wallets`, `preferenceService?`): [`WalletInfo`](../interfaces/WalletInfo.md)[]

Get wallets sorted by usage frequency

Sorts available wallets by their usage frequency using preference service data.
Most frequently used wallets appear first.

## Parameters

### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Available wallets to sort

### preferenceService?

[`WalletPreferenceService`](../classes/WalletPreferenceService.md)

Preference service for usage data

## Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Wallets sorted by usage frequency

## Example

```typescript
const sortedWallets = getWalletsByUsageFrequency(wallets, preferenceService);
// Most used wallets appear first
```

## Since

3.0.0
