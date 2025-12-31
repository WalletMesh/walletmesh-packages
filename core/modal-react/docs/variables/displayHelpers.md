[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / displayHelpers

# Variable: displayHelpers

> `const` **displayHelpers**: `object`

Defined in: core/modal-core/dist/api/core/headless.d.ts:64

Helper functions for common UI patterns

## Type Declaration

### getWalletStatusLabel()

> **getWalletStatusLabel**(`wallet`): `string`

Get appropriate status label for a wallet

#### Parameters

##### wallet

`WalletDisplayData`

#### Returns

`string`

### groupWallets()

> **groupWallets**(`wallets`): `Map`\<`string`, `WalletDisplayData`[]\>

Group wallets by installation status

#### Parameters

##### wallets

`WalletDisplayData`[]

#### Returns

`Map`\<`string`, `WalletDisplayData`[]\>

### sortWallets()

> **sortWallets**(`wallets`): `WalletDisplayData`[]

Sort wallets by priority (installed -> recent -> recommended -> alphabetical)

#### Parameters

##### wallets

`WalletDisplayData`[]

#### Returns

`WalletDisplayData`[]
