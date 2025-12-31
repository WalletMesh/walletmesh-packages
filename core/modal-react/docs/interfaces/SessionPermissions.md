[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / SessionPermissions

# Interface: SessionPermissions

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:183

Session permissions structure

## Properties

### autoSign?

> `optional` **autoSign**: `boolean`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:189

Whether auto-sign is permitted

***

### chainSpecific?

> `optional` **chainSpecific**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:193

Custom chain-specific permissions

***

### events

> **events**: `string`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:187

Events the dApp can subscribe to

***

### maxTransactionValue?

> `optional` **maxTransactionValue**: `string`

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:191

Maximum transaction value (if applicable)

***

### methods

> **methods**: `string`[]

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:185

Methods the dApp can call

***

### walletSpecific?

> `optional` **walletSpecific**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/api/types/sessionState.d.ts:195

Wallet-specific permissions
