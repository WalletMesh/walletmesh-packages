[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createWalletSelectionManager

# Function: createWalletSelectionManager()

> **createWalletSelectionManager**(): [`WalletSelectionManager`](../interfaces/WalletSelectionManager.md)

Create a wallet selection manager instance

Provides a complete wallet selection management interface with all utilities.

## Returns

[`WalletSelectionManager`](../interfaces/WalletSelectionManager.md)

Wallet selection manager

## Example

```typescript
const manager = createWalletSelectionManager();

// Set preference
manager.setPreferredWallet('metamask');

// Get recommendation
const recommended = manager.getRecommendedWallet(wallets);
```
