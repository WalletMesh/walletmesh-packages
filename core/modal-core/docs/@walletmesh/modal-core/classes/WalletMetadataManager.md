[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletMetadataManager

# Class: WalletMetadataManager

Framework-agnostic wallet metadata manager class

Provides utilities for transforming, categorizing, sorting, grouping,
and filtering wallet data consistently across all framework packages.

## Constructors

### Constructor

> **new WalletMetadataManager**(): `WalletMetadataManager`

#### Returns

`WalletMetadataManager`

## Methods

### calculatePopularity()

> **calculatePopularity**(`data`): `number`

Calculate wallet popularity score

#### Parameters

##### data

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)

Wallet display data

#### Returns

`number`

Popularity score (0-100)

***

### categorizeWallet()

> **categorizeWallet**(`data`): `"injected"` \| `"mobile"` \| `"hardware"` \| `"walletconnect"`

Categorize wallet based on its characteristics

#### Parameters

##### data

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)

Wallet display data

#### Returns

`"injected"` \| `"mobile"` \| `"hardware"` \| `"walletconnect"`

Wallet category

***

### filterWallets()

> **filterWallets**(`wallets`, `criteria`): [`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Filter wallets based on criteria

#### Parameters

##### wallets

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Array of wallets to filter

##### criteria

[`WalletFilterCriteria`](../interfaces/WalletFilterCriteria.md)

Filter criteria

#### Returns

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Filtered array of wallets

***

### findWalletById()

> **findWalletById**(`wallets`, `walletId`): `null` \| [`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)

Find wallet by ID

#### Parameters

##### wallets

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Array of wallets to search

##### walletId

`string`

ID of wallet to find

#### Returns

`null` \| [`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)

Found wallet or null

***

### getLastUsedTimestamp()

> **getLastUsedTimestamp**(`wallet`): `null` \| `number`

Get last used timestamp for a wallet

#### Parameters

##### wallet

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)

Wallet to get timestamp for

#### Returns

`null` \| `number`

Timestamp or null

***

### getWalletPriority()

> **getWalletPriority**(`wallet`): `number`

Get wallet priority for display ordering

#### Parameters

##### wallet

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)

Wallet to calculate priority for

#### Returns

`number`

Priority score (higher = more important)

***

### groupWallets()

> **groupWallets**(`wallets`): [`GroupedWallets`](../interfaces/GroupedWallets.md)

Group wallets by various criteria

#### Parameters

##### wallets

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Array of wallets to group

#### Returns

[`GroupedWallets`](../interfaces/GroupedWallets.md)

Grouped wallets object

***

### sortWallets()

> **sortWallets**(`wallets`, `sortBy`): [`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Sort wallets by the specified criteria

#### Parameters

##### wallets

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Array of wallets to sort

##### sortBy

[`WalletSortOption`](../type-aliases/WalletSortOption.md) = `'recommended'`

Sort criteria

#### Returns

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Sorted array (new array)

***

### transformWalletData()

> **transformWalletData**(`data`): [`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)

Transform WalletDisplayData to WalletWithMetadata

#### Parameters

##### data

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)

Raw wallet display data from headless state

#### Returns

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)

Enhanced wallet metadata

***

### transformWalletDataArray()

> **transformWalletDataArray**(`dataArray`): [`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Transform array of WalletDisplayData to WalletWithMetadata

#### Parameters

##### dataArray

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)[]

Array of raw wallet display data

#### Returns

[`WalletWithMetadata`](../interfaces/WalletWithMetadata.md)[]

Array of enhanced wallet metadata
