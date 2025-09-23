[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionState

# Interface: SessionState

Core session state representing a wallet connection

This is the fundamental session unit that tracks a specific
wallet connection to a specific chain at a point in time.
Enhanced with multi-account support for seamless account switching.

## Properties

### accountContext?

> `optional` **accountContext**: [`AccountManagementContext`](AccountManagementContext.md)

Multi-account management context

***

### accounts

> **accounts**: [`AccountInfo`](AccountInfo.md)[]

All available accounts in this session

***

### activeAccount

> **activeAccount**: [`AccountInfo`](AccountInfo.md)

Currently active account (selected for transactions)

***

### chain

> **chain**: [`ChainSessionInfo`](ChainSessionInfo.md)

Connected chain information

***

### lifecycle

> **lifecycle**: [`SessionLifecycle`](SessionLifecycle.md)

Session lifecycle information

***

### metadata

> **metadata**: [`SessionStateMetadata`](SessionStateMetadata.md)

Session metadata and context

***

### permissions

> **permissions**: [`SessionPermissions`](SessionPermissions.md)

Permissions granted in this session

***

### provider

> **provider**: [`SessionProvider`](SessionProvider.md)

Provider instance for this session

***

### sessionId

> **sessionId**: `string`

Unique session identifier

***

### status

> **status**: [`SessionStatus`](../type-aliases/SessionStatus.md)

Session status

***

### walletId

> **walletId**: `string`

ID of the wallet that created this session

***

### walletSession?

> `optional` **walletSession**: [`WalletSessionContext`](WalletSessionContext.md)

Multi-chain session context (if part of wallet session)
