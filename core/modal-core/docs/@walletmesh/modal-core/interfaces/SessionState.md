[**@walletmesh/modal-core v0.0.2**](../../../README.md)

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

### adapterReconstruction?

> `optional` **adapterReconstruction**: `object`

Adapter reconstruction data for hydration after page reload

These fields enable the client to recreate the adapter on page refresh
so that connections can be automatically reestablished. This is especially
important for wallets discovered via the discovery protocol.

Enhanced to include complete wallet metadata and responder data, eliminating
the need to re-run discovery on page reload.

#### adapterType

> **adapterType**: `string`

Adapter type identifier (e.g., 'discovery', 'metamask', 'phantom')

#### blockchainType

> **blockchainType**: `string`

Blockchain technology type (e.g., 'evm', 'solana', 'aztec')

#### discoveryData?

> `optional` **discoveryData**: `object`

Discovery adapter-specific reconstruction data

Minimal data needed to recreate a DiscoveryAdapter without the full QualifiedResponder.
This enables lightweight session persistence for discovered wallets.

Only populated for DiscoveryAdapter instances.

##### discoveryData.capabilities

> **capabilities**: `object`

Wallet capabilities

##### discoveryData.capabilities.chains

> **chains**: `object`[]

##### discoveryData.capabilities.features

> **features**: `string`[]

##### discoveryData.id

> **id**: `string`

Wallet identifier

##### discoveryData.metadata

> **metadata**: `object`

Wallet metadata

##### discoveryData.metadata.description?

> `optional` **description**: `string`

##### discoveryData.metadata.homepage?

> `optional` **homepage**: `string`

##### discoveryData.metadata.icon

> **icon**: `string`

##### discoveryData.metadata.name

> **name**: `string`

##### discoveryData.networks?

> `optional` **networks**: `string`[]

Network identifiers

##### discoveryData.transportConfig

> **transportConfig**: `Record`\<`string`, `unknown`\>

Transport configuration

#### ~~qualifiedResponder?~~

> `optional` **qualifiedResponder**: `Record`\<`string`, `unknown`\>

Discovery protocol responder data (for discovered wallets)

##### Deprecated

Use `discoveryData` instead for DiscoveryAdapter instances.
This field is maintained for backward compatibility with older sessions
that were created before the discoveryData field was added.

This is the complete QualifiedResponder object from the discovery protocol.
Only populated for wallets discovered via the discovery protocol.

#### sessionId?

> `optional` **sessionId**: `string`

Session ID for RPC calls

The session ID that should be included in JSON-RPC method calls to the wallet.
This is required for session-aware wallets to properly route and authorize requests.

#### transportConfig

> **transportConfig**: `object`

Transport configuration for recreating the transport

##### transportConfig.config

> **config**: `Record`\<`string`, `unknown`\>

Transport-specific configuration

##### transportConfig.type

> **type**: `string`

Transport type

#### walletMetadata?

> `optional` **walletMetadata**: `object`

Complete wallet metadata for restoration

Stores the wallet's name, icon, description, and other metadata
so it can be displayed in the UI immediately without re-discovery.

Optional for backwards compatibility with sessions created before this feature.

##### Index Signature

\[`key`: `string`\]: `unknown`

Custom wallet properties

##### walletMetadata.description?

> `optional` **description**: `string`

Wallet description (optional)

##### walletMetadata.homepage?

> `optional` **homepage**: `string`

Wallet homepage URL (optional)

##### walletMetadata.icon

> **icon**: `string`

Wallet icon (data URI or URL)

##### walletMetadata.name

> **name**: `string`

Wallet display name

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

> **status**: `SessionStatus`

Session status

***

### walletId

> **walletId**: `string`

ID of the wallet that created this session

***

### walletSession?

> `optional` **walletSession**: [`WalletSessionContext`](WalletSessionContext.md)

Multi-chain session context (if part of wallet session)
