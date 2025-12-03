[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getRecommendedWallet

# Function: getRecommendedWallet()

> **getRecommendedWallet**(`wallets`, `current?`, `criteria?`): `null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Get recommended wallet based on criteria

Analyzes available wallets and returns the best recommendation based on:
- Installation status
- User preference
- Chain support
- Recent usage

## Parameters

### wallets

[`WalletInfo`](../interfaces/WalletInfo.md)[]

Available wallets to choose from

### current?

Currently selected wallet (if any)

`null` | [`WalletInfo`](../interfaces/WalletInfo.md)

### criteria?

[`WalletRecommendationCriteria`](../interfaces/WalletRecommendationCriteria.md)

Recommendation criteria

## Returns

`null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Recommended wallet or null if none suitable

## Example

```typescript
const recommended = getRecommendedWallet(wallets, null, {
  preferInstalled: true,
  requiredChains: ['evm']
});

if (recommended) {
  console.log('We recommend:', recommended.name);
}
```
