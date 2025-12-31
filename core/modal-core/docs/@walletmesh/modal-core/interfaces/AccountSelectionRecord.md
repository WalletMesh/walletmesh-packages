[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / AccountSelectionRecord

# Interface: AccountSelectionRecord

Account selection record for tracking account switches

## Properties

### error?

> `optional` **error**: `string`

Error if selection failed

***

### fromAccount

> **fromAccount**: `null` \| [`AccountInfo`](AccountInfo.md)

Previous account (null for initial selection)

***

### reason

> **reason**: `"default"` \| `"user_request"` \| `"dapp_request"` \| `"auto_switch"`

Why the selection occurred

***

### selectionId

> **selectionId**: `string`

Unique identifier for this selection

***

### successful

> **successful**: `boolean`

Whether the selection was successful

***

### timestamp

> **timestamp**: `number`

When the selection occurred

***

### toAccount

> **toAccount**: [`AccountInfo`](AccountInfo.md)

New account
