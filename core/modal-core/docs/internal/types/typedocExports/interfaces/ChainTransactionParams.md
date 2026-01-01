[**@walletmesh/modal-core v0.0.4**](../../../../README.md)

***

[@walletmesh/modal-core](../../../../modules.md) / [internal/types/typedocExports](../README.md) / ChainTransactionParams

# Interface: ChainTransactionParams

Transaction parameters for chain services

## Properties

### chainSpecific?

> `optional` **chainSpecific**: `Record`\<`string`, `unknown`\>

Chain-specific parameters

***

### data?

> `optional` **data**: `string`

Transaction data

***

### from

> **from**: `string`

Sender address

***

### gasLimit?

> `optional` **gasLimit**: `string`

Gas limit

***

### to?

> `optional` **to**: `string`

Recipient address (optional for contract creation)

***

### value?

> `optional` **value**: `string`

Transaction value
