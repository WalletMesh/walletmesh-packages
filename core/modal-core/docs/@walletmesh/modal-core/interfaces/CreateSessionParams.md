[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / CreateSessionParams

# Interface: CreateSessionParams

Parameters for creating a new session

## Properties

### accountContext?

> `optional` **accountContext**: `Partial`\<[`AccountManagementContext`](AccountManagementContext.md)\>

Optional account management context

***

### accounts

> **accounts**: [`AccountInfo`](AccountInfo.md)[]

Connected accounts with full information

***

### activeAccountIndex?

> `optional` **activeAccountIndex**: `number`

Active account index (defaults to 0)

***

### chain

> **chain**: [`ChainSessionInfo`](ChainSessionInfo.md)

Chain information

***

### expiresAt?

> `optional` **expiresAt**: `number`

Optional session expiration

***

### metadata

> **metadata**: `Omit`\<[`SessionStateMetadata`](SessionStateMetadata.md), `"chainSwitches"`\>

Session metadata

***

### permissions

> **permissions**: [`SessionPermissions`](SessionPermissions.md)

Initial permissions

***

### provider

> **provider**: [`BlockchainProvider`](BlockchainProvider.md)

Provider instance

***

### providerMetadata

> **providerMetadata**: `object`

Provider metadata

#### multiChainCapable

> **multiChainCapable**: `boolean`

#### supportedMethods

> **supportedMethods**: `string`[]

#### type

> **type**: `string`

#### version

> **version**: `string`

***

### sessionId?

> `optional` **sessionId**: `string`

Optional session ID (for reconnection)

***

### walletId

> **walletId**: `string`

Wallet ID

***

### walletSessionContext?

> `optional` **walletSessionContext**: `Omit`\<[`WalletSessionContext`](WalletSessionContext.md), `"walletMetadata"`\>

Optional wallet session context
