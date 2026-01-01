[**@walletmesh/modal-core v0.0.4**](../../../README.md)

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

### adapterReconstruction?

> `optional` **adapterReconstruction**: `object`

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

### provider?

> `optional` **provider**: [`BlockchainProvider`](BlockchainProvider.md)

Provider instance (optional - can be retrieved from ProviderRegistry by sessionId)
If not provided, must be stored in ProviderRegistry before calling createSession

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
