[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / TransactionContext

# Interface: TransactionContext

Transaction context that explicitly specifies the target wallet and chain
This prevents accidental transactions on the wrong wallet or chain

## Properties

### autoSwitchChain?

> `optional` **autoSwitchChain**: `boolean`

Whether to auto-switch chains if needed

***

### chain

> **chain**: `object`

The chain where the transaction should be executed

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

### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

Optional chain type for additional validation

***

### walletId

> **walletId**: `string`

The wallet ID to use for this transaction
