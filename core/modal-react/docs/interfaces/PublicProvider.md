[**@walletmesh/modal-react v0.1.3**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / PublicProvider

# Interface: PublicProvider

Defined in: core/modal-core/dist/api/types/providers.d.ts:274

Public provider interface for read-only blockchain operations

Public providers use dApp-specified RPC endpoints for read operations,
allowing applications to control their infrastructure and costs.

## Properties

### chainId

> **chainId**: `string`

Defined in: core/modal-core/dist/api/types/providers.d.ts:285

Get the chain ID this provider is connected to

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: core/modal-core/dist/api/types/providers.d.ts:289

Get the chain type (evm, solana, aztec)

## Methods

### request()

> **request**\<`T`\>(`args`): `Promise`\<`T`\>

Defined in: core/modal-core/dist/api/types/providers.d.ts:278

Make a read-only JSON-RPC request

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### args

###### method

`string`

###### params?

`unknown`[] \| `Record`\<`string`, `unknown`\>

#### Returns

`Promise`\<`T`\>
