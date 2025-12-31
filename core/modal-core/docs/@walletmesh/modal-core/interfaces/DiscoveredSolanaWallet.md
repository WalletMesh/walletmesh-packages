[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveredSolanaWallet

# Interface: DiscoveredSolanaWallet

Discovered Solana Wallet
Wallet information that will be stored in the registry

## Properties

### icon

> **icon**: `string`

Icon data URI or URL

***

### id

> **id**: `string`

Unique wallet identifier

***

### metadata?

> `optional` **metadata**: `object`

Additional metadata

#### chains?

> `optional` **chains**: `string`[]

Supported chains

#### features?

> `optional` **features**: `string`[]

Supported features

#### rdns?

> `optional` **rdns**: `string`

Reverse DNS identifier

#### version?

> `optional` **version**: `string`

Wallet version

***

### name

> **name**: `string`

Display name for the wallet

***

### provider

> **provider**: `unknown`

Provider reference (stored for adapter creation)

***

### type

> **type**: `"injected"` \| `"legacy"` \| `"wallet-standard"`

How the wallet was discovered
