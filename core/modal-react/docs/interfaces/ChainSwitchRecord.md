[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / ChainSwitchRecord

# Interface: ChainSwitchRecord

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:249

Chain switch record for tracking session history

## Properties

### error?

> `optional` **error**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:263

Error if switch failed

***

### fromChain

> **fromChain**: `null` \| [`ChainSessionInfo`](ChainSessionInfo.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:253

Previous chain (null for initial connection)

***

### reason

> **reason**: `"user_request"` \| `"dapp_request"` \| `"auto_switch"` \| `"fallback"`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:259

Why the switch occurred

***

### successful

> **successful**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:261

Whether the switch was successful

***

### switchId

> **switchId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:251

Unique identifier for this switch

***

### timestamp

> **timestamp**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:257

When the switch occurred

***

### toChain

> **toChain**: [`ChainSessionInfo`](ChainSessionInfo.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:255

New chain
