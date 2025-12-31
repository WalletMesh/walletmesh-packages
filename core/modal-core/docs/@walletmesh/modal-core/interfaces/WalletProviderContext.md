[**@walletmesh/modal-core v0.0.2**](../../../README.md)

***

[@walletmesh/modal-core](../../../modules.md) / [@walletmesh/modal-core](../README.md) / WalletProviderContext

# Interface: WalletProviderContext

Context object shared across all JSON-RPC methods for wallet providers

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### accounts

> **accounts**: `string`[]

Connected accounts

***

### chainId

> **chainId**: `string`

Chain ID currently connected to

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Chain type this provider handles

***

### isConnected

> **isConnected**: `boolean`

Whether the provider is connected

***

### providerData?

> `optional` **providerData**: `Record`\<`string`, `unknown`\>

Additional provider-specific data
