[**@walletmesh/modal-core v0.0.4**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / ChainAddedEvent

# Interface: ChainAddedEvent

New chain was added to wallet

## Properties

### chain

> **chain**: `object`

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

### chainConfig

> **chainConfig**: `object`

#### explorerUrl?

> `optional` **explorerUrl**: `string`

#### name

> **name**: `string`

#### rpcUrl?

> `optional` **rpcUrl**: `string`

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

***

### timestamp

> **timestamp**: `number`

***

### walletId

> **walletId**: `string`
