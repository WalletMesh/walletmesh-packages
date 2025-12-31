[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletRecommendationCriteria

# Interface: WalletRecommendationCriteria

Wallet recommendation criteria

## Properties

### excludeWallets?

> `optional` **excludeWallets**: `string`[]

Exclude specific wallet IDs

***

### maxRecommendations?

> `optional` **maxRecommendations**: `number`

Maximum number of recommendations

***

### preferInstalled?

> `optional` **preferInstalled**: `boolean`

Prefer wallets that are already installed

***

### preferRecent?

> `optional` **preferRecent**: `boolean`

Prefer wallets that were recently used

***

### requiredChains?

> `optional` **requiredChains**: [`ChainType`](../enumerations/ChainType.md)[]

Prefer wallets that support specific chains
