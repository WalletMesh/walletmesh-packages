[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / CreateSessionParams

# Interface: CreateSessionParams

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:289

Parameters for creating a new session

## Properties

### accountContext?

> `optional` **accountContext**: `Partial`\<[`AccountManagementContext`](AccountManagementContext.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:314

Optional account management context

***

### accounts

> **accounts**: `AccountInfo`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:293

Connected accounts with full information

***

### activeAccountIndex?

> `optional` **activeAccountIndex**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:295

Active account index (defaults to 0)

***

### chain

> **chain**: [`ChainSessionInfo`](ChainSessionInfo.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:297

Chain information

***

### expiresAt?

> `optional` **expiresAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:316

Optional session expiration

***

### metadata

> **metadata**: `Omit`\<`SessionStateMetadata`, `"chainSwitches"`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:310

Session metadata

***

### permissions

> **permissions**: [`SessionPermissions`](SessionPermissions.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:308

Initial permissions

***

### provider

> **provider**: [`BlockchainProvider`](BlockchainProvider.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:299

Provider instance

***

### providerMetadata

> **providerMetadata**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:301

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:318

Optional session ID (for reconnection)

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:291

Wallet ID

***

### walletSessionContext?

> `optional` **walletSessionContext**: `Omit`\<[`WalletSessionContext`](WalletSessionContext.md), `"walletMetadata"`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:312

Optional wallet session context
