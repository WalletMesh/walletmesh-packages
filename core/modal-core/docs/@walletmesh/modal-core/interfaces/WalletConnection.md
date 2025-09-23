[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletConnection

# Interface: WalletConnection

Wallet connection details

 WalletConnection

## Properties

### accounts

> **accounts**: `string`[]

Connected accounts

***

### address

> **address**: `string`

Primary connected address

***

### chain

> **chain**: `object`

Connected chain

#### chainId

> **chainId**: `string` = `caip2Schema`

Chain identifier in CAIP-2 format

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md) = `chainTypeSchema`

Type of blockchain this chain belongs to

#### group?

> `optional` **group**: `string`

Grouping identifier for multi-chain scenarios

#### icon?

> `optional` **icon**: `string`

Optional icon URL for the chain

#### interfaces?

> `optional` **interfaces**: `string`[]

List of required provider interfaces for this chain

#### label?

> `optional` **label**: `string`

Display label for the chain (optional override of name)

#### name

> **name**: `string`

Human-readable name of the chain

#### required

> **required**: `boolean`

Whether this chain is required for the dApp to function

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Connected chain type

***

### metadata?

> `optional` **metadata**: `object`

Connection metadata

#### connectedAt

> **connectedAt**: `number`

Connection timestamp

#### lastActiveAt

> **lastActiveAt**: `number`

Last activity timestamp

#### sessionMetadata?

> `optional` **sessionMetadata**: `Record`\<`string`, `unknown`\>

Session-specific metadata from wallet

#### source?

> `optional` **source**: `string`

Connection source

***

### provider

> **provider**: `unknown`

Provider instance

***

### sessionId?

> `optional` **sessionId**: `string`

Session identifier for reconnection

***

### walletId

> **walletId**: `string`

Wallet identifier

***

### walletInfo

> **walletInfo**: [`WalletInfo`](WalletInfo.md)

Wallet info/metadata
