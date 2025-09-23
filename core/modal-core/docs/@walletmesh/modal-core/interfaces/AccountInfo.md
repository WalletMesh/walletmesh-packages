[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AccountInfo

# Interface: AccountInfo

Account information for multi-account support

## Properties

### address

> **address**: `string`

Account address

***

### balance?

> `optional` **balance**: `object`

Account balance (if available)

#### decimals

> **decimals**: `number`

#### formatted

> **formatted**: `string`

#### symbol

> **symbol**: `string`

#### value

> **value**: `string`

***

### derivationPath?

> `optional` **derivationPath**: `string`

Account derivation path (for HD wallets)

***

### index?

> `optional` **index**: `number`

Account index in wallet

***

### isActive?

> `optional` **isActive**: `boolean`

Whether this account is currently active

***

### isDefault?

> `optional` **isDefault**: `boolean`

Whether this account is the default/primary account

***

### metadata?

> `optional` **metadata**: `object`

Account metadata

#### accountType?

> `optional` **accountType**: `string`

Account type (e.g., 'standard', 'multisig', 'contract')

#### discoveredAt

> **discoveredAt**: `number`

When this account was first discovered

#### lastUsedAt

> **lastUsedAt**: `number`

When this account was last used

#### transactionCount?

> `optional` **transactionCount**: `number`

Number of transactions from this account

***

### name?

> `optional` **name**: `string`

Human-readable account name/label
