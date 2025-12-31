[**@walletmesh/modal-react v0.1.2**](../README.md)

***

[@walletmesh/modal-react](../globals.md) / WalletProviderContext

# Interface: WalletProviderContext

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:28

Context object shared across all JSON-RPC methods for wallet providers

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

\[`key`: `string`\]: `unknown`

## Properties

### accounts

> **accounts**: `string`[]

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:34

Connected accounts

***

### chainId

> **chainId**: `string`

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:32

Chain ID currently connected to

***

### chainType

> **chainType**: [`ChainType`](../enumerations/ChainType.md)

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:30

Chain type this provider handles

***

### isConnected

> **isConnected**: `boolean`

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:36

Whether the provider is connected

***

### providerData?

> `optional` **providerData**: `Record`\<`string`, `unknown`\>

Defined in: core/modal-core/dist/internal/providers/base/BaseWalletProvider.d.ts:38

Additional provider-specific data
