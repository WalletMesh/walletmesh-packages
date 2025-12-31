[**@walletmesh/modal-core v0.0.3**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ChainTransactionResult

# Interface: ChainTransactionResult

Transaction result from chain services

## Properties

### blockNumber?

> `optional` **blockNumber**: `number`

Block number (if mined)

***

### chainSpecific?

> `optional` **chainSpecific**: `Record`\<`string`, `unknown`\>

Chain-specific result data

***

### gasUsed?

> `optional` **gasUsed**: `string`

Gas used

***

### hash

> **hash**: `string`

Transaction hash

***

### success

> **success**: `boolean`

Whether transaction was successful
