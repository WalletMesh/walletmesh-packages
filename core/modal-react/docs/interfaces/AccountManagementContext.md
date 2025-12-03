[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AccountManagementContext

# Interface: AccountManagementContext

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:358

Account management context for multi-account sessions

## Properties

### accountPermissions

> **accountPermissions**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:375

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:362

Currently selected account index

***

### discoverySettings

> **discoverySettings**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:366

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:364

Account selection history

***

### totalAccounts

> **totalAccounts**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:360

Total number of available accounts
