[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainSwitchRecord

# Interface: ChainSwitchRecord

Chain switch record for tracking session history

## Properties

### error?

> `optional` **error**: `string`

Error if switch failed

***

### fromChain

> **fromChain**: `null` \| [`ChainSessionInfo`](ChainSessionInfo.md)

Previous chain (null for initial connection)

***

### reason

> **reason**: `"fallback"` \| `"user_request"` \| `"dapp_request"` \| `"auto_switch"`

Why the switch occurred

***

### successful

> **successful**: `boolean`

Whether the switch was successful

***

### switchId

> **switchId**: `string`

Unique identifier for this switch

***

### timestamp

> **timestamp**: `number`

When the switch occurred

***

### toChain

> **toChain**: [`ChainSessionInfo`](ChainSessionInfo.md)

New chain
