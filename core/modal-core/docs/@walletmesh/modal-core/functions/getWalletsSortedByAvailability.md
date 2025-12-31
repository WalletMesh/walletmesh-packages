[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getWalletsSortedByAvailability

# Function: getWalletsSortedByAvailability()

> **getWalletsSortedByAvailability**(`wallets`): [`WalletInfo`](../interfaces/WalletInfo.md)[]

Get wallets sorted by availability

Sorts wallets with installed ones first, then by name.

## Parameters

### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Wallets to sort

## Returns

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Sorted wallet array

## Example

```typescript
const sorted = getWalletsSortedByAvailability(wallets);
// Installed wallets appear first
```
