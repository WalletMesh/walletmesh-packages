[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / PublicProviderWrapper

# Class: PublicProviderWrapper

Public provider wrapper that routes read operations through dApp RPC

## Implements

- [`PublicProvider`](../interfaces/PublicProvider.md)

## Constructors

### Constructor

> **new PublicProviderWrapper**(`dappRpcService`, `chainId`, `chainType`): `PublicProviderWrapper`

Create a new public provider

#### Parameters

##### dappRpcService

[`DAppRpcService`](DAppRpcService.md)

The dApp RPC service instance

##### chainId

`string`

Chain ID this provider is for

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain

#### Returns

`PublicProviderWrapper`

## Properties

### chainId

> `readonly` **chainId**: `string`

Chain ID this provider is for

#### Implementation of

[`PublicProvider`](../interfaces/PublicProvider.md).[`chainId`](../interfaces/PublicProvider.md#chainid)

***

### chainType

> `readonly` **chainType**: [`ChainType`](../enumerations/ChainType.md)

Type of blockchain

#### Implementation of

[`PublicProvider`](../interfaces/PublicProvider.md).[`chainType`](../interfaces/PublicProvider.md#chaintype)

## Methods

### request()

> **request**\<`T`\>(`args`): [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

Make a read-only JSON-RPC request through dApp infrastructure

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### args

RPC method and parameters

###### method

`string`

###### params?

`unknown`[] \| `Record`\<`string`, `unknown`\>

#### Returns

[`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`T`\>

The RPC response

#### Throws

If the RPC call fails

#### Implementation of

[`PublicProvider`](../interfaces/PublicProvider.md).[`request`](../interfaces/PublicProvider.md#request)
