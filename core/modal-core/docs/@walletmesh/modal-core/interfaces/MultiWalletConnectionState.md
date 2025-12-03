[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / MultiWalletConnectionState

# Interface: MultiWalletConnectionState

Multi-wallet connection state for individual wallet tracking

 MultiWalletConnectionState

## Properties

### accounts

> **accounts**: `string`[]

List of connected accounts

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

### connectedAt

> **connectedAt**: `number`

Timestamp when connected

***

### lastActiveAt

> **lastActiveAt**: `number`

Timestamp of last activity

***

### provider

> **provider**: `unknown`

Provider instance for this connection

***

### walletId

> **walletId**: `string`

Wallet identifier
