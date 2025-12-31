[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / createEnhancedWalletSelectionManager

# Function: createEnhancedWalletSelectionManager()

> **createEnhancedWalletSelectionManager**(`preferenceService`): [`EnhancedWalletSelectionManager`](../interfaces/EnhancedWalletSelectionManager.md)

Create an enhanced wallet selection manager with preference service integration

Provides an enhanced wallet selection management interface that integrates
with WalletPreferenceService for intelligent recommendations based on usage history.

## Parameters

### preferenceService

[`WalletPreferenceService`](../classes/WalletPreferenceService.md)

Preference service for enhanced features

## Returns

[`EnhancedWalletSelectionManager`](../interfaces/EnhancedWalletSelectionManager.md)

Enhanced wallet selection manager

## Example

```typescript
const enhancedManager = createEnhancedWalletSelectionManager(preferenceService);

// Record wallet selection for history
enhancedManager.recordWalletSelection('metamask', walletInfo);

// Get intelligent recommendation with history
const recommended = enhancedManager.getRecommendedWalletWithHistory(wallets);

// Set auto-connect preference
enhancedManager.setAutoConnect('metamask', true);
```

## Since

3.0.0
