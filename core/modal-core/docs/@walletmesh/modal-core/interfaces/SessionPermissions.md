[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / SessionPermissions

# Interface: SessionPermissions

Session permissions structure

## Properties

### autoSign?

> `optional` **autoSign**: `boolean`

Whether auto-sign is permitted

***

### chainSpecific?

> `optional` **chainSpecific**: `Record`\<`string`, `unknown`\>

Custom chain-specific permissions

***

### events

> **events**: `string`[]

Events the dApp can subscribe to

***

### maxTransactionValue?

> `optional` **maxTransactionValue**: `string`

Maximum transaction value (if applicable)

***

### methods

> **methods**: `string`[]

Methods the dApp can call

***

### walletSpecific?

> `optional` **walletSpecific**: `Record`\<`string`, `unknown`\>

Wallet-specific permissions
