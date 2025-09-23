[**@walletmesh/modal-react v0.1.0**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionPermissions

# Interface: SessionPermissions

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:76

Session permissions structure

## Properties

### autoSign?

> `optional` **autoSign**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:82

Whether auto-sign is permitted

***

### chainSpecific?

> `optional` **chainSpecific**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:86

Custom chain-specific permissions

***

### events

> **events**: `string`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:80

Events the dApp can subscribe to

***

### maxTransactionValue?

> `optional` **maxTransactionValue**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:84

Maximum transaction value (if applicable)

***

### methods

> **methods**: `string`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:78

Methods the dApp can call

***

### walletSpecific?

> `optional` **walletSpecific**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:88

Wallet-specific permissions
