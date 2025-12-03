[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionState

# Interface: SessionState

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:21

Core session state representing a wallet connection

This is the fundamental session unit that tracks a specific
wallet connection to a specific chain at a point in time.
Enhanced with multi-account support for seamless account switching.

## Properties

### accountContext?

> `optional` **accountContext**: [`AccountManagementContext`](AccountManagementContext.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:45

Multi-account management context

***

### accounts

> **accounts**: `AccountInfo`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:29

All available accounts in this session

***

### activeAccount

> **activeAccount**: `AccountInfo`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:31

Currently active account (selected for transactions)

***

### chain

> **chain**: [`ChainSessionInfo`](ChainSessionInfo.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:33

Connected chain information

***

### lifecycle

> **lifecycle**: [`SessionLifecycle`](SessionLifecycle.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:41

Session lifecycle information

***

### metadata

> **metadata**: `SessionStateMetadata`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:39

Session metadata and context

***

### permissions

> **permissions**: [`SessionPermissions`](SessionPermissions.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:37

Permissions granted in this session

***

### provider

> **provider**: [`SessionProvider`](SessionProvider.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:35

Provider instance for this session

***

### sessionId

> **sessionId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:23

Unique session identifier

***

### status

> **status**: [`SessionStatus`](../type-aliases/SessionStatus.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:27

Session status

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:25

ID of the wallet that created this session

***

### walletSession?

> `optional` **walletSession**: [`WalletSessionContext`](WalletSessionContext.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:43

Multi-chain session context (if part of wallet session)
