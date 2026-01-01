[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AccountManagementContext

# Interface: AccountManagementContext

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:485

Account management context for multi-account sessions

## Properties

### accountPermissions

> **accountPermissions**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:502

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:489

Currently selected account index

***

### discoverySettings

> **discoverySettings**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:493

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:491

Account selection history

***

### totalAccounts

> **totalAccounts**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:487

Total number of available accounts
