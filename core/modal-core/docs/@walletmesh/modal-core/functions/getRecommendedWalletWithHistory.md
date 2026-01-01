[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / getRecommendedWalletWithHistory

# Function: getRecommendedWalletWithHistory()

> **getRecommendedWalletWithHistory**(`wallets`, `current?`, `criteria?`, `preferenceService?`): `null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Get recommended wallet with history integration

Enhanced recommendation algorithm that uses WalletPreferenceService data
to provide more intelligent wallet recommendations based on:
- Auto-connect preferences
- Usage frequency and recency
- Installation status
- Chain compatibility

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

### preferenceService?

[`WalletPreferenceService`](../classes/WalletPreferenceService.md)

Optional preference service for enhanced recommendations

## Returns

`null` \| [`WalletInfo`](../interfaces/WalletInfo.md)

Recommended wallet or null if none suitable

## Example

```typescript
const recommended = getRecommendedWalletWithHistory(
  wallets,
  null,
  { preferInstalled: true },
  preferenceService
);

if (recommended) {
  console.log('Enhanced recommendation:', recommended.name);
}
```

## Since

3.0.0
