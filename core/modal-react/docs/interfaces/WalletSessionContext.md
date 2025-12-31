[**@walletmesh/modal-react v0.1.1**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletSessionContext

# Interface: WalletSessionContext

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:271

Multi-chain wallet session context

This provides context when a session is part of a larger
multi-chain wallet connection.

## Properties

### activeSessionId

> **activeSessionId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:277

Currently active session ID

***

### allSessions

> **allSessions**: `Map`\<`string`, `string`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:275

All sessions within this wallet connection

***

### switchHistory

> **switchHistory**: `string`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:279

Session switch history

***

### walletMetadata

> **walletMetadata**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:287

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:281

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:273

ID of the parent wallet session
