[**@walletmesh/modal-core v0.0.1**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletProviderFallbackWrapper

# Class: WalletProviderFallbackWrapper

Wallet provider fallback wrapper that restricts access to read-only methods

## Implements

- [`PublicProvider`](../interfaces/PublicProvider.md)

## Constructors

### Constructor

> **new WalletProviderFallbackWrapper**(`walletProvider`, `chainId`, `chainType`): `WalletProviderFallbackWrapper`

Create a new wallet provider fallback wrapper

#### Parameters

##### walletProvider

[`WalletProvider`](../../../internal/types/typedocExports/type-aliases/WalletProvider.md)

The wallet provider to wrap

##### chainId

`string`

Chain ID this provider is for

##### chainType

[`ChainType`](../enumerations/ChainType.md)

Type of blockchain

#### Returns

`WalletProviderFallbackWrapper`

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

Make a read-only JSON-RPC request through the wallet provider

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

If the method is not allowed or the RPC call fails

#### Implementation of

[`PublicProvider`](../interfaces/PublicProvider.md).[`request`](../interfaces/PublicProvider.md#request)
