[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AccountManagementContext

# Interface: AccountManagementContext

Account management context for multi-account sessions

## Properties

### accountPermissions

> **accountPermissions**: `object`

Account access permissions

#### allowedAccountIndices?

> `optional` **allowedAccountIndices**: `number`[]

Allowed account indices (if restricted)

#### canAddAccounts

> **canAddAccounts**: `boolean`

Whether the user can add new accounts

#### canSwitchAccounts

> **canSwitchAccounts**: `boolean`

Whether the user can switch between accounts

***

### activeAccountIndex

> **activeAccountIndex**: `number`

Currently selected account index

***

### discoverySettings

> **discoverySettings**: `object`

Account discovery settings

#### autoDiscover?

> `optional` **autoDiscover**: `boolean`

Whether to automatically discover new accounts

#### gapLimit?

> `optional` **gapLimit**: `number`

Discovery gap limit (for HD wallets)

#### maxAccounts?

> `optional` **maxAccounts**: `number`

Maximum number of accounts to discover

***

### selectionHistory

> **selectionHistory**: [`AccountSelectionRecord`](AccountSelectionRecord.md)[]

Account selection history

***

### totalAccounts

> **totalAccounts**: `number`

Total number of available accounts
