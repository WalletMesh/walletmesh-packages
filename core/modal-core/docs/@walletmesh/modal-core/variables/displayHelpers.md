[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / displayHelpers

# Variable: displayHelpers

> `const` **displayHelpers**: `object`

Helper functions for common UI patterns

## Type Declaration

### getWalletStatusLabel()

> **getWalletStatusLabel**(`wallet`): `string`

Get appropriate status label for a wallet

#### Parameters

##### wallet

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)

#### Returns

`string`

### groupWallets()

> **groupWallets**(`wallets`): [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`WalletDisplayData`](../interfaces/WalletDisplayData.md)[]\>

Group wallets by installation status

#### Parameters

##### wallets

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)[]

#### Returns

[`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, [`WalletDisplayData`](../interfaces/WalletDisplayData.md)[]\>

### sortWallets()

> **sortWallets**(`wallets`): [`WalletDisplayData`](../interfaces/WalletDisplayData.md)[]

Sort wallets by priority (installed -> recent -> recommended -> alphabetical)

#### Parameters

##### wallets

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)[]

#### Returns

[`WalletDisplayData`](../interfaces/WalletDisplayData.md)[]
