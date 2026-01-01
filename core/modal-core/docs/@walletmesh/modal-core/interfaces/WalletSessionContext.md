[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletSessionContext

# Interface: WalletSessionContext

Multi-chain wallet session context

This provides context when a session is part of a larger
multi-chain wallet connection.

## Properties

### activeSessionId

> **activeSessionId**: `string`

Currently active session ID

***

### allSessions

> **allSessions**: [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)\<`string`, `string`\>

All sessions within this wallet connection

***

### switchHistory

> **switchHistory**: `string`[]

Session switch history

***

### walletMetadata

> **walletMetadata**: `object`

Wallet session metadata

#### createdAt

> **createdAt**: `number`

#### lastActiveAt

> **lastActiveAt**: `number`

#### totalChainSwitches

> **totalChainSwitches**: `number`

#### totalSessions

> **totalSessions**: `number`

***

### walletPermissions

> **walletPermissions**: `object`

Wallet-level permissions

#### allowedChains?

> `optional` **allowedChains**: `string`[]

#### maxChains?

> `optional` **maxChains**: `number`

#### restrictedMethods?

> `optional` **restrictedMethods**: `string`[]

***

### walletSessionId

> **walletSessionId**: `string`

ID of the parent wallet session
