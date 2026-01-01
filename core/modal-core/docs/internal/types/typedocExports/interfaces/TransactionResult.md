[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / TransactionResult

# Interface: TransactionResult\<T\>

Result of a context-aware transaction

## Type Parameters

### T

`T` = `unknown`

## Properties

### chainSwitched

> **chainSwitched**: `boolean`

Whether a chain switch occurred

***

### context

> **context**: [`TransactionContext`](../../../../@walletmesh/modal-core/interfaces/TransactionContext.md)

The context that was used

***

### providerVersion

> **providerVersion**: `number`

The provider version at time of execution

***

### result

> **result**: `T`

The result from the blockchain
