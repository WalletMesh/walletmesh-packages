[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / DiscoveredEVMWallet

# Interface: DiscoveredEVMWallet

Discovered EVM Wallet
Wallet information that will be stored in the registry

## Properties

### icon

> **icon**: `string`

Icon data URI or URL

***

### id

> **id**: `string`

Unique wallet identifier (rdns or generated)

***

### metadata?

> `optional` **metadata**: `object`

Additional metadata

#### rdns?

> `optional` **rdns**: `string`

Reverse DNS identifier

#### uuid?

> `optional` **uuid**: `string`

EIP-6963 UUID

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

> **type**: `"eip1193"` \| `"eip6963"` \| `"ethereumProviders"`

How the wallet was discovered
