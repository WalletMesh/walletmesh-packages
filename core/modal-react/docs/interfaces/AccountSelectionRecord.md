[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / AccountSelectionRecord

# Interface: AccountSelectionRecord

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:387

Account selection record for tracking account switches

## Properties

### error?

> `optional` **error**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:401

Error if selection failed

***

### fromAccount

> **fromAccount**: `null` \| `AccountInfo`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:391

Previous account (null for initial selection)

***

### reason

> **reason**: `"user_request"` \| `"dapp_request"` \| `"auto_switch"` \| `"default"`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:397

Why the selection occurred

***

### selectionId

> **selectionId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:389

Unique identifier for this selection

***

### successful

> **successful**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:399

Whether the selection was successful

***

### timestamp

> **timestamp**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:395

When the selection occurred

***

### toAccount

> **toAccount**: `AccountInfo`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:393

New account
