[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / TransactionContext

# Interface: TransactionContext

Defined in: core/modal-core/dist/api/types/transaction.d.ts:9

Transaction context that explicitly specifies the target wallet and chain
This prevents accidental transactions on the wrong wallet or chain

## Properties

### autoSwitchChain?

> `optional` **autoSwitchChain**: `boolean`

Defined in: core/modal-core/dist/api/types/transaction.d.ts:17

Whether to auto-switch chains if needed

***

### chain

> **chain**: `object`

Defined in: core/modal-core/dist/api/types/transaction.d.ts:13

The chain where the transaction should be executed

#### chainId

> **chainId**: `string`

#### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

#### group?

> `optional` **group**: `string`

#### icon?

> `optional` **icon**: `string`

#### interfaces?

> `optional` **interfaces**: `string`[]

#### label?

> `optional` **label**: `string`

#### name

> **name**: `string`

#### required

> **required**: `boolean`

***

### chainType?

> `optional` **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: core/modal-core/dist/api/types/transaction.d.ts:15

Optional chain type for additional validation

***

### walletId

> **walletId**: `string`

Defined in: core/modal-core/dist/api/types/transaction.d.ts:11

The wallet ID to use for this transaction
