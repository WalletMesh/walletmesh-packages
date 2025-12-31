[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / PublicProvider

# Interface: PublicProvider

Public provider interface for read-only blockchain operations

Public providers use dApp-specified RPC endpoints for read operations,
allowing applications to control their infrastructure and costs.

## Properties

### chainId

> **chainId**: `string`

Get the chain ID this provider is connected to

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Get the chain type (evm, solana, aztec)

## Methods

### request()

> **request**\<`T`\>(`args`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

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

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>
