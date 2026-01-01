[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / CreateSessionParams

# Interface: CreateSessionParams

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:396

Parameters for creating a new session

## Properties

### accountContext?

> `optional` **accountContext**: `Partial`\<[`AccountManagementContext`](AccountManagementContext.md)\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:424

Optional account management context

***

### accounts

> **accounts**: `AccountInfo`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:400

Connected accounts with full information

***

### activeAccountIndex?

> `optional` **activeAccountIndex**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:402

Active account index (defaults to 0)

***

### adapterReconstruction?

> `optional` **adapterReconstruction**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:433

Optional adapter reconstruction data for hydration
This enables the client to recreate the adapter on page refresh

#### adapterType

> **adapterType**: `string`

Adapter type identifier (e.g., 'discovery', 'metamask', 'phantom')

#### blockchainType

> **blockchainType**: `string`

Blockchain technology type (e.g., 'evm', 'solana', 'aztec')

#### transportConfig

> **transportConfig**: `object`

Transport configuration for recreating the transport

##### transportConfig.config

> **config**: `Record`\<`string`, `unknown`\>

Transport-specific configuration

##### transportConfig.type

> **type**: `string`

Transport type

***

### chain

> **chain**: [`ChainSessionInfo`](ChainSessionInfo.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:404

Chain information

***

### expiresAt?

> `optional` **expiresAt**: `number`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:426

Optional session expiration

***

### metadata

> **metadata**: `Omit`\<`SessionStateMetadata`, `"chainSwitches"`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:420

Session metadata

***

### permissions

> **permissions**: [`SessionPermissions`](SessionPermissions.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:418

Initial permissions

***

### provider?

> `optional` **provider**: [`BlockchainProvider`](BlockchainProvider.md)

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:409

Provider instance (optional - can be retrieved from ProviderRegistry by sessionId)
If not provided, must be stored in ProviderRegistry before calling createSession

***

### providerMetadata

> **providerMetadata**: `object`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:411

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

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:428

Optional session ID (for reconnection)

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:398

Wallet ID

***

### walletSessionContext?

> `optional` **walletSessionContext**: `Omit`\<[`WalletSessionContext`](WalletSessionContext.md), `"walletMetadata"`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:422

Optional wallet session context
