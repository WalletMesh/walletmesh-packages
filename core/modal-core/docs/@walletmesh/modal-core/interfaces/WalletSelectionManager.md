[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletSelectionManager

# Interface: WalletSelectionManager

Wallet selection manager interface

## Extended by

- [`EnhancedWalletSelectionManager`](EnhancedWalletSelectionManager.md)

## Methods

### clearPreference()

> **clearPreference**(`storageKey?`): `void`

#### Parameters

##### storageKey?

`string`

#### Returns

`void`

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

***

### getInstallUrl()

> **getInstallUrl**(`walletId`): `null` \| `string`

#### Parameters

##### walletId

`string`

#### Returns

`null` \| `string`

***

### getPreferredWallet()

> **getPreferredWallet**(`storageKey?`): `null` \| `string`

#### Parameters

##### storageKey?

`string`

#### Returns

`null` \| `string`

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

***

### isWalletInstalled()

> **isWalletInstalled**(`wallet`): `boolean`

#### Parameters

##### wallet

[`WalletInfo`](WalletInfo.md)

#### Returns

`boolean`

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
