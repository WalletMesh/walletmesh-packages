[**@walletmesh/modal-core v0.0.3**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletCapabilities

# Interface: WalletCapabilities

Defines what a wallet supports

## Properties

### chains

> **chains**: [`ChainDefinition`](ChainDefinition.md)[]

Supported blockchain types and their chain IDs

***

### features

> **features**: [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)\<[`WalletFeature`](../type-aliases/WalletFeature.md)\>

Set of features this wallet supports

***

### permissions?

> `optional` **permissions**: `object`

Permissions this wallet requires/supports

#### events

> **events**: `string`[]

Events the wallet can emit

#### methods

> **methods**: `string`[]

Methods the wallet can execute
