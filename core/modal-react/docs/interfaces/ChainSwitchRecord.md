[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainSwitchRecord

# Interface: ChainSwitchRecord

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:142

Chain switch record for tracking session history

## Properties

### error?

> `optional` **error**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:156

Error if switch failed

***

### fromChain

> **fromChain**: `null` \| [`ChainSessionInfo`](ChainSessionInfo.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:146

Previous chain (null for initial connection)

***

### reason

> **reason**: `"user_request"` \| `"dapp_request"` \| `"auto_switch"` \| `"fallback"`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:152

Why the switch occurred

***

### successful

> **successful**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:154

Whether the switch was successful

***

### switchId

> **switchId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:144

Unique identifier for this switch

***

### timestamp

> **timestamp**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:150

When the switch occurred

***

### toChain

> **toChain**: [`ChainSessionInfo`](ChainSessionInfo.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:148

New chain
