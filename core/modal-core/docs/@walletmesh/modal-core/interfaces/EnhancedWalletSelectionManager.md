[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / EnhancedWalletSelectionManager

# Interface: EnhancedWalletSelectionManager

Enhanced wallet selection manager that integrates with WalletPreferenceService

## Extends

- [`WalletSelectionManager`](WalletSelectionManager.md)

## Methods

### clearPreference()

> **clearPreference**(`storageKey?`): `void`

#### Parameters

##### storageKey?

`string`

#### Returns

`void`

#### Inherited from

[`WalletSelectionManager`](WalletSelectionManager.md).[`clearPreference`](WalletSelectionManager.md#clearpreference)

***

### filterWalletsByChain()

> **filterWalletsByChain**(`wallets`, `chainTypes`): [`WalletInfo`](WalletInfo.md)[]

#### Parameters

##### wallets

[`WalletInfo`](WalletInfo.md)[]

##### chainTypes

[`ChainType`](../enumerations/ChainType.md)[]

#### Returns

[`WalletInfo`](WalletInfo.md)[]

#### Inherited from

[`WalletSelectionManager`](WalletSelectionManager.md).[`filterWalletsByChain`](WalletSelectionManager.md#filterwalletsbychain)

***

### getInstallUrl()

> **getInstallUrl**(`walletId`): `null` \| `string`

#### Parameters

##### walletId

`string`

#### Returns

`null` \| `string`

#### Inherited from

[`WalletSelectionManager`](WalletSelectionManager.md).[`getInstallUrl`](WalletSelectionManager.md#getinstallurl)

***

### getPreferredWallet()

> **getPreferredWallet**(`storageKey?`): `null` \| `string`

#### Parameters

##### storageKey?

`string`

#### Returns

`null` \| `string`

#### Inherited from

[`WalletSelectionManager`](WalletSelectionManager.md).[`getPreferredWallet`](WalletSelectionManager.md#getpreferredwallet)

***

### getRecommendedWallet()

> **getRecommendedWallet**(`wallets`, `current?`): `null` \| [`WalletInfo`](WalletInfo.md)

#### Parameters

##### wallets

[`WalletInfo`](WalletInfo.md)[]

##### current?

`null` | [`WalletInfo`](WalletInfo.md)

#### Returns

`null` \| [`WalletInfo`](WalletInfo.md)

#### Inherited from

[`WalletSelectionManager`](WalletSelectionManager.md).[`getRecommendedWallet`](WalletSelectionManager.md#getrecommendedwallet)

***

### getRecommendedWalletWithHistory()

> **getRecommendedWalletWithHistory**(`wallets`, `current?`, `criteria?`): `null` \| [`WalletInfo`](WalletInfo.md)

#### Parameters

##### wallets

[`WalletInfo`](WalletInfo.md)[]

##### current?

`null` | [`WalletInfo`](WalletInfo.md)

##### criteria?

[`WalletRecommendationCriteria`](WalletRecommendationCriteria.md)

#### Returns

`null` \| [`WalletInfo`](WalletInfo.md)

***

### getWalletsByUsageFrequency()

> **getWalletsByUsageFrequency**(`wallets`): [`WalletInfo`](WalletInfo.md)[]

#### Parameters

##### wallets

[`WalletInfo`](WalletInfo.md)[]

#### Returns

[`WalletInfo`](WalletInfo.md)[]

***

### isWalletInstalled()

> **isWalletInstalled**(`wallet`): `boolean`

#### Parameters

##### wallet

[`WalletInfo`](WalletInfo.md)

#### Returns

`boolean`

#### Inherited from

[`WalletSelectionManager`](WalletSelectionManager.md).[`isWalletInstalled`](WalletSelectionManager.md#iswalletinstalled)

***

### recordWalletSelection()

> **recordWalletSelection**(`walletId`, `wallet?`): `void`

#### Parameters

##### walletId

`string`

##### wallet?

[`WalletInfo`](WalletInfo.md)

#### Returns

`void`

***

### setAutoConnect()

> **setAutoConnect**(`walletId`, `enabled`): `void`

#### Parameters

##### walletId

`string`

##### enabled

`boolean`

#### Returns

`void`

***

### setPreferredWallet()

> **setPreferredWallet**(`walletId`, `storageKey?`): `void`

#### Parameters

##### walletId

`null` | `string`

##### storageKey?

`string`

#### Returns

`void`

#### Inherited from

[`WalletSelectionManager`](WalletSelectionManager.md).[`setPreferredWallet`](WalletSelectionManager.md#setpreferredwallet)

***

### shouldAutoConnect()

> **shouldAutoConnect**(`walletId`): `boolean`

#### Parameters

##### walletId

`string`

#### Returns

`boolean`
